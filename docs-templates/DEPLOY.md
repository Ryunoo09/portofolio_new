# Deploy to the VPS (Nginx Proxy Manager in front)

The VPS already runs Nginx Proxy Manager (NPM) in Docker. This app is a second
container on NPM's network; NPM terminates TLS and adds the security headers.
CI builds the image and pushes it to GHCR, so the VPS only pulls.

```
Browser → Cloudflare/DNS → NPM (80/443, TLS, headers) → web:3000 (Next.js)
```

## 1. One-time VPS setup

```sh
# Firewall: 22, 80, 443 only.
sudo ufw allow 22 && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable

# Swap, so a small VPS survives a pull + restart.
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Pull the image CI pushed. Needs a PAT with read:packages.
echo "$GHCR_PAT" | docker login ghcr.io -u <github-user> --password-stdin
```

Clone the repo once (it carries the compose files and scripts):

```sh
git clone https://github.com/Ryunoo09/portofolio_new.git && cd portofolio_new
cp .env.example .env      # then fill in the real values
```

`.env` on the VPS needs at least:

| Key                             | Value                                                          |
| ------------------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://<project>.supabase.co`                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key (read-only through RLS)                               |
| `NEXT_PUBLIC_SITE_URL`          | `https://<domain>`                                             |
| `REVALIDATE_SECRET`             | `openssl rand -hex 32`                                         |
| `PROXY_NETWORK`                 | NPM's network, see `docker network ls` (usually `npm_default`) |

`SUPABASE_SERVICE_ROLE_KEY` is only needed for `pnpm db:seed` / `pnpm db:export`.

## 2. Nginx Proxy Manager

1. **Hosts → Proxy Host → Add Proxy Host**
   - Domain Names: `<domain>` (and `www.<domain>` if DNS has it)
   - Scheme `http`, Forward Hostname `web`, Forward Port `3000` (container name comes from compose)
     — if the container name does not resolve, use the compose service name `portofolio_new-web-1`
     or attach NPM and this stack to the same network first.
   - Websockets Support: on · Block Common Exploits: on
2. **SSL**: Request a new Let's Encrypt certificate, Force SSL, HTTP/2, HSTS.
3. **Advanced**: paste `docker/npm.conf` (CSP, nosniff, Referrer-Policy, Permissions-Policy).

Verify the headers after the certificate is issued:

```sh
curl -sI https://<domain> | grep -Ei 'content-security-policy|strict-transport|x-content-type|referrer-policy|permissions-policy'
```

## 3. Deploy

```sh
./scripts/deploy.sh            # latest image
TAG=<commit-sha> ./scripts/deploy.sh   # pin a specific build
```

The script pulls, recreates the container, and waits for `/api/health`.

## 4. Rollback

Every push to `main` publishes `<sha>` as a tag, so a rollback is one command:

```sh
TAG=<previous-sha> ./scripts/deploy.sh
```

If the image itself is broken, `git revert` on `main` makes CI publish a fixed
`latest`; nothing is built on the VPS.

## 5. Smoke checks

```sh
curl -s https://<domain>/api/health          # {"status":"ok"}
curl -sI https://<domain> | head -n 20        # 200, HSTS, CSP
curl -s https://<domain> | grep -o '<h1[^>]*>[^<]*</h1>'
docker compose -f docker-compose.yml -f docker-compose.deploy.yml logs --tail 50 web
```

Lighthouse against production (from a laptop, after install):

```sh
pnpm dlx @lhci/cli@0.16 collect --url=https://<domain> --numberOfRuns=1
```
