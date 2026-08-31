import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for the Pilot seed.");
}

const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const teamId = "e1000000-0000-4000-8000-000000000001";
const seedUsers = [
  { key: "super_admin", email: "pilot.super-admin@agentcopilot.test", displayName: "Pilot Super Admin", role: "super_admin" },
  { key: "leader", email: "pilot.leader@agentcopilot.test", displayName: "Pilot Leader", role: "leader" },
  { key: "advisor_01", email: "pilot.advisor-01@agentcopilot.test", displayName: "TVV Pilot 01", role: "advisor" },
  { key: "advisor_02", email: "pilot.advisor-02@agentcopilot.test", displayName: "TVV Pilot 02", role: "advisor" },
  { key: "advisor_03", email: "pilot.advisor-03@agentcopilot.test", displayName: "TVV Pilot 03", role: "advisor" },
];

async function ensureUser(seedUser) {
  const { data: listed, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw listError;
  const existing = listed.users.find((user) => user.email === seedUser.email);
  if (existing) return existing.id;

  const { data, error } = await admin.auth.admin.createUser({
    email: seedUser.email,
    password: `${randomUUID()}Aa1!`,
    email_confirm: true,
    user_metadata: { display_name: seedUser.displayName, pilot_seed: true },
  });
  if (error) throw error;
  return data.user.id;
}

async function upsert(table, rows) {
  const { error } = await admin.from(table).upsert(rows, { onConflict: "id" });
  if (error) throw error;
}

const userIds = Object.fromEntries(await Promise.all(seedUsers.map(async (seedUser) => [seedUser.key, await ensureUser(seedUser)])));
const today = new Date().toISOString().slice(0, 10);
const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

await upsert("teams", [{ id: teamId, name: "Pilot Pod — Agent Copilot", status: "active" }]);
await upsert("profiles", seedUsers.map((seedUser) => ({
  id: userIds[seedUser.key],
  email: seedUser.email,
  display_name: seedUser.displayName,
  role: seedUser.role,
  primary_team_id: teamId,
  is_active: true,
})));

await upsert("activity_events", [
  { id: "e2000000-0000-4000-8000-000000000001", user_id: userIds.advisor_01, team_id: teamId, event_type: "meeting_completed", event_date: today, quantity: 2, metadata: { seed: true, source: "pilot_step1" } },
  { id: "e2000000-0000-4000-8000-000000000002", user_id: userIds.advisor_01, team_id: teamId, event_type: "daily_checkin", event_date: today, quantity: 1, metadata: { seed: true, source: "pilot_step1" } },
  { id: "e2000000-0000-4000-8000-000000000003", user_id: userIds.advisor_02, team_id: teamId, event_type: "policy_closed", event_date: yesterday, quantity: 1, metadata: { seed: true, source: "pilot_step1" } },
  { id: "e2000000-0000-4000-8000-000000000004", user_id: userIds.advisor_03, team_id: teamId, event_type: "follow_up_completed", event_date: twoDaysAgo, quantity: 1, metadata: { seed: true, source: "pilot_step1" } },
]);

await upsert("followups", [
  { id: "e3000000-0000-4000-8000-000000000001", user_id: userIds.advisor_01, team_id: teamId, alias_label: "Hồ sơ A-17", service_stage: "proposal", due_date: tomorrow, status: "open" },
  { id: "e3000000-0000-4000-8000-000000000002", user_id: userIds.advisor_02, team_id: teamId, alias_label: "Hồ sơ B-04", service_stage: "underwriting", due_date: twoDaysAgo, status: "overdue" },
  { id: "e3000000-0000-4000-8000-000000000003", user_id: userIds.advisor_03, team_id: teamId, alias_label: "Hồ sơ C-09", service_stage: "after_sales", due_date: yesterday, completed_at: new Date().toISOString(), status: "done" },
]);

await upsert("signals", [
  { id: "e4000000-0000-4000-8000-000000000001", user_id: userIds.advisor_02, team_id: teamId, signal_type: "followup_overdue", window_days: 7, threshold_version: "pilot-v1", severity: "high", summary: "Có follow-up quá hạn trong cửa sổ 7 ngày.", status: "new", metadata: { seed: true, source: "pilot_step1" } },
  { id: "e4000000-0000-4000-8000-000000000002", user_id: userIds.advisor_03, team_id: teamId, signal_type: "low_activity", window_days: 7, threshold_version: "pilot-v1", severity: "medium", summary: "Nhịp hoạt động thấp hơn ngưỡng pilot 7 ngày.", status: "reviewed", metadata: { seed: true, source: "pilot_step1" } },
]);

await upsert("signal_reviews", [
  { id: "e5000000-0000-4000-8000-000000000001", signal_id: "e4000000-0000-4000-8000-000000000002", reviewer_id: userIds.leader, review_outcome: "relevant", note: "Hẹn check-in ngắn để xác nhận trở ngại và hỗ trợ nhịp hành động." },
]);

await upsert("interventions", [
  { id: "e6000000-0000-4000-8000-000000000001", signal_id: "e4000000-0000-4000-8000-000000000002", user_id: userIds.advisor_03, team_id: teamId, leader_id: userIds.leader, intervention_type: "coaching_1on1", action_status: "done", action_date: yesterday, rationale: "Khôi phục nhịp hoạt động sau tín hiệu low_activity.", note: "Seed Pilot: nội dung không định danh." },
]);

await upsert("intervention_outcomes", [
  { id: "e7000000-0000-4000-8000-000000000001", intervention_id: "e6000000-0000-4000-8000-000000000001", checkpoint_day: "d7", recovery_status: "insufficient_data", note: "Chưa đủ cửa sổ đo lường ở thời điểm seed." },
]);

const counts = {};
for (const table of ["teams", "profiles", "activity_events", "followups", "signals", "signal_reviews", "interventions", "intervention_outcomes"]) {
  const { count, error } = await admin.from(table).select("id", { count: "exact", head: true });
  if (error) throw error;
  counts[table] = count ?? 0;
}
console.log(JSON.stringify({ team_id: teamId, user_count: seedUsers.length, counts }, null, 2));
