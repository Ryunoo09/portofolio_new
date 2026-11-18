# AGENTS.md

Baca penuh di awal setiap sesi. Sumber kebenaran requirement: `docs/prd/PRD_PORTFOLIO_WEBSITE.md`. Bila konflik, PRD menang; bila PRD kurang, tanya owner, jangan berasumsi.

## 1. Tech Stack

Website portofolio satu halaman untuk recruiter, konten **Bahasa Inggris**. Next.js (App Router) + React + TypeScript `strict`, Tailwind CSS, Supabase (PostgreSQL + Storage, RLS read-only). Render statis (SSG/ISR `revalidate = 300`) dengan fallback ke `content/*.json`. Deploy: Docker + Caddy di VPS, Cloudflare di depan, CI GitHub Actions. Package manager: pnpm. Fitur khas: preloader, animasi scroll, music player.

**TBD (tanya owner, jangan putuskan sendiri):** library animasi (Motion *atau* GSAP, satu saja), analytics, domain, versi Next.js/Node yang di-pin.

## 2. Struktur Folder

```
portfolio/
├─ AGENTS.md
├─ docs/            # PRD_PORTFOLIO_WEBSITE.md, ASSETS.md (lisensi aset)
├─ content/         # seed JSON = data fallback
├─ scripts/         # seed.ts, export.ts
├─ docker/          # Dockerfile, docker-compose.yml, Caddyfile
├─ tests/e2e/       # Playwright
├─ public/
└─ src/
   ├─ app/          # layout, page, projects/[slug], sitemap, robots,
   │                # opengraph-image, api/health, api/revalidate, not-found
   ├─ features/     # hero about experience projects skills contact
   │                # preloader music-player motion
   │                # (tiap fitur: components/ hooks/ index.ts)
   ├─ components/ui/  # komponen bersama (dipakai >= 2 tempat)
   ├─ data/         # repository (getProfile, getProjects, ...) + fallback
   ├─ lib/          # supabase, seo, env, format
   ├─ styles/       # tokens.css, globals.css
   └─ types/
```

## 3. Konvensi Kode

**Naming**
- File dan folder: `kebab-case`. Komponen: `PascalCase`. Hook: `useXxx`. Konstanta: `UPPER_SNAKE_CASE`.
- Tabel dan kolom DB: `snake_case`. Env var klien: `NEXT_PUBLIC_*`.

**Style**
- Maks **250 baris per file** (ESLint `max-lines` = error). Satu komponen utama per file.
- TypeScript `strict`; dilarang `any` (pakai `unknown` + narrowing).
- Server Component by default; `"use client"` hanya untuk interaksi (preloader, music player, motion).
- Fitur baru = folder baru di `features/`; komponen dipakai >= 2 tempat pindah ke `components/ui/`.
- Env divalidasi di `lib/env.ts`; jangan baca `process.env` langsung di komponen.

**Pola wajib**
- Akses data hanya lewat `src/data/` (Supabase, fallback ke `content/`). Tidak ada query DB per request pengunjung.
- Animasi hanya `transform` dan `opacity`; hormati `prefers-reduced-motion` (preloader dilewati, animasi dinonaktifkan atau fade <= 150 ms).
- Preloader: tampil sekali per sesi (`sessionStorage`), 0,8-2,0 dtk, konten tetap ada di HTML server-render.
- Music player: tidak pernah autoplay, `preload="none"`, kontrol keyboard-accessible.
- Gambar via `next/image` dengan dimensi dan `alt`. Email di-obfuscate. Satu `h1` per halaman.
- Tiap rute punya metadata (title, description, OG); homepage punya JSON-LD `Person`.
- Budget: JS awal `/` <= 250 KB gzip; audio <= 3 MB; CV <= 500 KB. Cek budget sebelum menambah dependency.
- Aset baru (gambar, font, audio) dicatat sumber dan lisensinya di `docs/ASSETS.md`.

## 4. Perintah

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm lint
pnpm typecheck
pnpm test           # Vitest
pnpm test:e2e       # Playwright + axe
pnpm build          # production build
pnpm start          # jalankan hasil build
pnpm lhci           # Lighthouse CI (budget + KPI)
pnpm db:seed        # content/*.json -> Supabase (service role, lokal/CI saja)
pnpm db:export      # Supabase -> content/*.json
```

Skrip dibuat di Phase 0 dengan nama persis di atas. **Sebelum commit:** `pnpm lint && pnpm typecheck && pnpm test` harus hijau. Deploy hanya lewat CI, bukan manual dari VPS.

## 5. Yang TIDAK Boleh Dilakukan

Dari Non-Goals PRD (NG-01 s/d NG-09):
- Membuat blog atau sistem tag/topik (v2.0).
- Membuat dashboard admin, halaman login, atau UI CRUD (v1.1). Konten MVP diedit lewat Supabase Studio.
- Membuat form kontak yang menyimpan pesan ke server (v1.1). Kontak = `mailto:` + link sosial.
- Menambah i18n atau menulis copy selain Bahasa Inggris.
- Menambah toggle light/dark (MVP satu tema gelap).
- Menambah akun pengguna, komentar, e-commerce, aplikasi native, atau fitur AI (chatbot dll).
- Memakai WebGL/3D berat.
- **Menyalin kode, teks, gambar, aset desain, atau musik dari kidixdev.logiclab.id.** Referensi hanya untuk pola struktur dan interaksi.

Dari batasan teknis dan keamanan PRD:
- Memakai dua library animasi sekaligus.
- Menganimasikan properti layout (`width`, `height`, `top`, `left`, dst).
- Autoplay audio, atau memuat file audio sebelum klik play pertama.
- Menaruh `SUPABASE_SERVICE_ROLE_KEY` di kode klien, prefix `NEXT_PUBLIC_`, atau repo. Dilarang commit secret apa pun.
- Memberi akses tulis untuk role `anon` di Supabase (RLS tetap read-only).
- Mempublikasikan NIK, alamat rumah, tanggal lahir, atau nomor telepon (juga di CV PDF) tanpa persetujuan eksplisit owner.
- Mempublikasikan detail proyek yang rahasia (perusahaan/klien); pakai label "Private build".
- Memakai audio/gambar/font tanpa lisensi jelas.
- Membuat file > 250 baris atau menambah dependency yang melanggar budget JS.
- Menambah fitur di luar PRD tanpa memperbarui PRD dan persetujuan owner.

## Skill & Subagent Wajib

Panggil skill/subagent yang relevan **sebelum dan selama** mengerjakan tugas. Jangan tunggu diminta.

**Semua percakapan dan tugas koding (wajib selalu):**
- `caveman`, `karpathy-guidelines`

**Saat menulis / mengubah kode:**
- `ponytail`, `clean-code`, `code-reviewer`, `ponytail-review`

**Backend:**
- Subagent: `backend-architect`, `database-architect`, `architect-review`
- Skill: `senior-backend`

**Frontend:**
- Subagent: `frontend-developer`
- Skill: `senior-frontend`, `frontend-design`

**Desain:**
- Skill: `impeccable`, `emil-design-eng`, `design-taste-frontend`, `ui-design-system`, `ui-ux-pro-max`
- Subagent: `ui-ux-designer`

**Keamanan dan pengujian:**
- Skill: `senior-security`, `security-audit`, `webapp-testing`
- Subagent: `test-engineer`, `security-auditor`

**Database:**
- Subagent: `database-architect`

**Commit dan push ke GitHub:**
- Skill: `git-commit-helper`

**Skill baru:**
- `find-skills`: pakai bila tugas tidak tercakup skill di atas.
- `modern-web-guidance`: pakai saat menulis atau mengubah kode web/frontend.
