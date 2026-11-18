# Portfolio — Rakha Yuda Wicaksono

Website portofolio satu halaman berbahasa Inggris untuk recruiter: hero, about, experience, projects, skills, contact, plus halaman detail proyek. Konten dibaca dari Supabase saat build/ISR, dengan fallback ke `content/*.json`.

Status: **Phase 0 — belum diinisialisasi.** Repo masih berisi dokumen; kode dimulai di Langkah 2 rencana.

## Tech stack

| Layer | Pilihan |
|---|---|
| Framework | Next.js (App Router) + React + TypeScript `strict` |
| Styling | Tailwind CSS + CSS variables (`src/styles/tokens.css`) |
| Animasi | Satu library (Motion **atau** GSAP) — Q3, belum diputuskan |
| Data | Supabase PostgreSQL + Storage, RLS read-only, fallback JSON |
| Deploy | Docker + Caddy di VPS, Cloudflare di depan, CI GitHub Actions |
| Tooling | pnpm, ESLint, Prettier, Vitest, Playwright + axe, Lighthouse CI |

## Perintah

```bash
pnpm install        # install dependency
pnpm dev            # dev server http://localhost:3000
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
pnpm test           # Vitest
pnpm test:e2e       # Playwright + axe
pnpm build          # production build
pnpm start          # jalankan hasil build
pnpm lhci           # Lighthouse CI (budget + KPI)
pnpm db:seed        # content/*.json -> Supabase (service role, lokal/CI saja)
pnpm db:export      # Supabase -> content/*.json
```

Skrip dibuat di Langkah 2. Sebelum commit: `pnpm lint && pnpm typecheck && pnpm test` harus hijau.

## Dokumentasi

| File | Isi |
|---|---|
| `AGENTS.md` | Aturan kerja, konvensi kode, larangan |
| `docs/prd/PRD_PORTFOLIO_WEBSITE.md` | Sumber kebenaran requirement |
| `docs/plan/IMPLEMENTATION_PLAN.md` | Rencana 30 langkah + dependency + risiko |
| `docs/DECISIONS.md` | Log keputusan (Q1–Q9) |
| `docs/ASSETS.md` | Sumber + lisensi aset |

## Struktur folder

```text
docs/            PRD, rencana, keputusan, lisensi aset
content/         seed JSON = data fallback
scripts/         seed.ts, export.ts
docker/          Dockerfile, docker-compose.yml, Caddyfile
tests/e2e/       Playwright
src/app/         layout, page, projects/[slug], sitemap, robots,
                 opengraph-image, api/health, api/revalidate, not-found
src/features/    hero about experience projects skills contact
                 preloader music-player motion
src/components/ui/  komponen bersama (dipakai >= 2 tempat)
src/data/        repository + fallback
src/lib/         supabase, seo, env, format
src/styles/      tokens.css, globals.css
src/types/
```

## Aturan singkat

- Maks 250 baris per file (ESLint error), TypeScript `strict`, tanpa `any`.
- Server Component default; `"use client"` hanya untuk interaksi.
- Animasi hanya `transform` + `opacity`; hormati `prefers-reduced-motion`.
- Music player tidak pernah autoplay; email di-obfuscate.
- Tidak ada secret di repo; `SUPABASE_SERVICE_ROLE_KEY` hanya server/script.
- Konten Bahasa Inggris, satu tema gelap, tanpa blog/admin/form kontak di MVP.

Detail lengkap di `AGENTS.md` dan PRD.
