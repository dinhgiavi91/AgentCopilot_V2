const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const pat = process.env.SUPABASE_MANAGEMENT_PAT;
const projectRef = new URL(projectUrl).hostname.split(".")[0];
const query = "select table_name from information_schema.tables where table_schema = 'public' order by table_name;";
const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${pat}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query, read_only: true }),
});
if (!response.ok) throw new Error(await response.text());
console.log(JSON.stringify(await response.json(), null, 2));
