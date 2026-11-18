// Measures first-load JS for a route against the PRD 4.5 budget (250 KB gzip).
// Usage: node scripts/bundle-size.mjs [url] [budgetKb]
const url = process.argv[2] ?? "http://localhost:3000";
const budgetKb = Number(process.argv[3] ?? 250);

const html = await (await fetch(url)).text();
const srcs = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((m) => m[1]))];

if (srcs.length === 0) {
  console.error(`No scripts found in ${url}. Is the server running a production build?`);
  process.exit(1);
}

const { gzipSync } = await import("node:zlib");
let total = 0;

for (const src of srcs) {
  const res = await fetch(new URL(src, url));
  if (!res.ok) throw new Error(`${src} -> ${res.status}`);
  total += gzipSync(Buffer.from(await res.arrayBuffer())).length;
}

const kb = total / 1024;
console.log(`${srcs.length} scripts · ${kb.toFixed(1)} KB gzip · budget ${budgetKb} KB`);

if (kb > budgetKb) {
  console.error("Over budget.");
  process.exit(1);
}
