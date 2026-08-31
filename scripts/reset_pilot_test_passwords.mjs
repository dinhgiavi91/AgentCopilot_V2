import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY;
const password = process.env.PILOT_TEST_PASSWORD;

if (!url || !serviceRoleKey || !password) {
  throw new Error("SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY và PILOT_TEST_PASSWORD là bắt buộc.");
}

const accounts = [
  { role: "super_admin", email: "pilot.super-admin@agentcopilot.test" },
  { role: "leader", email: "pilot.leader@agentcopilot.test" },
  { role: "advisor", email: "pilot.advisor-01@agentcopilot.test" },
  { role: "advisor", email: "pilot.advisor-02@agentcopilot.test" },
  { role: "advisor", email: "pilot.advisor-03@agentcopilot.test" },
];

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: listed, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) throw listError;

const usersByEmail = new Map(listed.users.map((user) => [user.email, user]));
const missing = accounts.filter((account) => !usersByEmail.has(account.email));
if (missing.length) {
  throw new Error(`Thiếu tài khoản Pilot: ${missing.map((account) => account.email).join(", ")}`);
}

const results = [];
for (const account of accounts) {
  const user = usersByEmail.get(account.email);
  const { data, error } = await admin.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
  });
  if (error) throw error;
  results.push({ role: account.role, email: account.email, user_id: data.user.id, password_updated: true });
}

console.log(JSON.stringify({ updated_count: results.length, accounts: results }, null, 2));
