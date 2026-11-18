// Exports Supabase content back to content/*.json (backup + reviewable diffs).
// Usage: pnpm db:export   (needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)
import { writeFile } from "node:fs/promises";
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

const tables = [
  ["profile", "profile", "updated_at"],
  ["social_links", "social-links", "sort_order"],
  ["experiences", "experiences", "sort_order"],
  ["projects", "projects", "sort_order"],
  ["project_media", "project-media", "sort_order"],
  ["skills", "skills", "sort_order"],
];

const write = async (name, value) =>
  writeFile(
    new URL(`../content/${name}.json`, import.meta.url),
    `${JSON.stringify(value, null, 2)}\n`,
  );

let failed = false;

for (const [table, file, order] of tables) {
  const { data, error } = await db.from(table).select("*").order(order);

  if (error) {
    console.error(`${table}: ${error.message}`);
    failed = true;
    continue;
  }

  await write(file, table === "profile" ? (data[0] ?? {}) : data);
  console.log(`${table}: ${data.length} rows exported`);
}

const { data: settings, error: settingsError } = await db.from("site_settings").select("*");

if (settingsError) {
  console.error(`site_settings: ${settingsError.message}`);
  failed = true;
} else {
  await write("site-settings", Object.fromEntries(settings.map((row) => [row.key, row.value])));
  console.log(`site_settings: ${settings.length} keys exported`);
}

process.exit(failed ? 1 : 0);
