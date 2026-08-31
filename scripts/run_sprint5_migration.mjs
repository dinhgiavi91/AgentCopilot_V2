import { readFile } from "node:fs/promises";

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const pat = process.env.SUPABASE_MANAGEMENT_PAT;
if (!projectUrl || !pat) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_MANAGEMENT_PAT.");

const projectRef = new URL(projectUrl).hostname.split(".")[0];
const query = await readFile(new URL("../supabase/migrations/20260813_sprint5_content_library.sql", import.meta.url), "utf8");
const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${pat}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query, read_only: false }),
});

if (!response.ok) {
  throw new Error(`Management API migration failed (${response.status}): ${await response.text()}`);
}

console.log(JSON.stringify({ success: true, projectRef, status: response.status }, null, 2));
