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
  ["certificates", "certificates", "sort_order"],
];

// jsonb does not preserve key order, so sort keys to keep export diffs stable.
const stable = (value) => {
  if (Array.isArray(value)) return value.map(stable);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stable(value[key])]),
  );
};

import { format } from "prettier";

const write = async (name, value) =>
  writeFile(
    new URL(`../content/${name}.json`, import.meta.url),
    await format(JSON.stringify(stable(value), null, 2), { parser: "json" }),
  );

let failed = false;

// Server-managed timestamps would make every export look like a content change.
const withoutTimestamps = (rows) =>
  rows.map((row) => {
    const copy = { ...row };
    delete copy.updated_at;
    return copy;
  });

for (const [table, file, order] of tables) {
  const { data, error } = await db.from(table).select("*").order(order);

  if (error) {
    console.error(`${table}: ${error.message}`);
    failed = true;
    continue;
  }

  const rows = withoutTimestamps(data);
  await write(file, table === "profile" ? (rows[0] ?? {}) : rows);
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
