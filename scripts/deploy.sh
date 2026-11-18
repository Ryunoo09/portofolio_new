#!/bin/sh
# Pulls the image CI built and recreates the container behind Nginx Proxy Manager.
# Usage (on the VPS, repo cloned once):
#   ./scripts/deploy.sh
# Env: IMAGE (default ghcr.io/ryunoo09/portofolio_new), TAG (default latest).
set -eu

IMAGE="${IMAGE:-ghcr.io/ryunoo09/portofolio_new}"
TAG="${TAG:-latest}"
COMPOSE_FILES="-f docker-compose.yml"
COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.deploy.yml"

if [ ! -f .env ]; then
  echo "Missing .env. Copy .env.example and fill in the real values first." >&2
  exit 1
fi

if ! grep -q '^REVALIDATE_SECRET=.\{32,\}' .env; then
  echo "REVALIDATE_SECRET must be set to at least 32 random characters (openssl rand -hex 32)." >&2
  exit 1
fi

for key in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY NEXT_PUBLIC_SITE_URL; do
  if ! grep -q "^${key}=.\{1,\}" .env; then
    echo "Missing ${key} in .env." >&2
    exit 1
  fi
done

echo "Pulling ${IMAGE}:${TAG} ..."
docker pull "${IMAGE}:${TAG}"

echo "Recreating container ..."
IMAGE="${IMAGE}" TAG="${TAG}" docker compose $COMPOSE_FILES up -d --remove-orphans

echo "Waiting for /api/health ..."
attempt=0
until docker compose $COMPOSE_FILES exec -T web wget -qO- http://127.0.0.1:3000/api/health >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "Health check failed. Recent logs:" >&2
    docker compose $COMPOSE_FILES logs --tail 50 web >&2
    exit 1
  fi
  sleep 2
done

echo "OK. Service is healthy."
docker image prune -f --filter "until=168h" >/dev/null 2>&1 || true
