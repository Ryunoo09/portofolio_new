// Seeds Supabase from content/*.json. Idempotent: fixed ids + upsert.
// Usage: pnpm db:seed   (needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(".env");
} catch {
  // .env is optional; CI may inject real environment variables.
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

const read = async (name) =>
  JSON.parse(await readFile(new URL(`../content/${name}.json`, import.meta.url), "utf8"));

const tables = [
  ["profile", "profile"],
  ["social_links", "social-links"],
  ["experiences", "experiences"],
  ["projects", "projects"],
  ["project_media", "project-media"],
  ["skills", "skills"],
  ["certificates", "certificates"],
];

let failed = false;

for (const [table, file] of tables) {
  const data = await read(file);
  const rows = Array.isArray(data) ? data : [data];

  if (rows.length === 0) {
    console.log(`${table}: 0 rows`);
    continue;
  }

  const { error } = await db.from(table).upsert(rows, { onConflict: "id" });

  if (error) {
    console.error(`${table}: ${error.message}`);
    failed = true;
  } else {
    console.log(`${table}: ${rows.length} rows upserted`);
  }
}

const settings = await read("site-settings");
const settingsRows = Object.entries(settings).map(([key, value]) => ({ key, value }));
const { error: settingsError } = await db
  .from("site_settings")
  .upsert(settingsRows, { onConflict: "key" });

if (settingsError) {
  console.error(`site_settings: ${settingsError.message}`);
  failed = true;
} else {
  console.log(`site_settings: ${settingsRows.length} rows upserted`);
}

process.exit(failed ? 1 : 0);
