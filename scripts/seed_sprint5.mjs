import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const required = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

const source = JSON.parse(await readFile(new URL("../data/sprint5_seed.json", import.meta.url), "utf8"));
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const tables = ["playbook_cards", "empathy_dictionary", "leadership_compass", "marketing_templates"];
const expected = { playbook_cards: 13, empathy_dictionary: 4, leadership_compass: 6, marketing_templates: 9 };

for (const table of tables) {
  const rows = source[table];
  const { error } = await client.from(table).upsert(rows, { onConflict: "code" });
  if (error) throw new Error(`${table}: ${error.message}`);
}

const results = {};
for (const table of tables) {
  const { count, error } = await client.from(table).select("code", { count: "exact", head: true });
  if (error) throw new Error(`${table} verification: ${error.message}`);
  results[table] = { expected: expected[table], actual: count };
  if (count !== expected[table]) throw new Error(`${table} verification failed: expected ${expected[table]}, got ${count}`);
}

console.log(JSON.stringify({ success: true, results }, null, 2));
