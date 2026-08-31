import { readFile } from "node:fs/promises";

const [migrationPath] = process.argv.slice(2);
const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const pat = process.env.SUPABASE_MANAGEMENT_PAT;
if (!migrationPath || !projectUrl || !pat) {
  throw new Error("Usage: node scripts/run_management_sql.mjs <migration.sql> (requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_MANAGEMENT_PAT)");
}

const projectRef = new URL(projectUrl).hostname.split(".")[0];
const query = await readFile(migrationPath, "utf8");
const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${pat}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query, read_only: false }),
});

if (!response.ok) throw new Error(`Management API failed (${response.status}): ${await response.text()}`);
console.log(JSON.stringify({ success: true, projectRef, migrationPath, status: response.status }, null, 2));
