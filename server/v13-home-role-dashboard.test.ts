import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/20260824191500_v13_home_role_dashboard.sql", "utf8");
const quizRpc = readFileSync("supabase/migrations/20260824192500_v13_daily_quiz_publish_rpc.sql", "utf8");
const privilegeFix = readFileSync("supabase/migrations/20260824193500_v13_rpc_revoke_anon.sql", "utf8");
const content = readFileSync("client/src/lib/supabaseContent.ts", "utf8");
const home = readFileSync("client/src/pages/Home.tsx", "utf8");
const adminHome = readFileSync("client/src/components/AdminHomeDashboard.tsx", "utf8");
const targetModal = readFileSync("client/src/components/Sprint11TargetModal.tsx", "utf8");
const streakModal = readFileSync("client/src/components/AgentStreakDetailsModal.tsx", "utf8");

describe("V13 Home theo vai trò", () => {
  it("lưu milestones và Team Defaults dưới RLS, không lưu PII khách hàng", () => {
    for (const token of ["CREATE TABLE IF NOT EXISTS public.streak_milestones", "CREATE TABLE IF NOT EXISTS public.team_goal_defaults", "streak_milestones_super_admin_manage", "team_goal_defaults_team_read", "CREATE OR REPLACE FUNCTION public.upsert_team_goal_defaults_v1", "private.is_super_admin()", "updated_by uuid REFERENCES public.profiles(id)"]) expect(migration).toContain(token);
    expect(migration).not.toContain("customer_name");
    expect(migration).not.toContain("policy_number");
  });

  it("khóa RPC Quiz/Team Defaults cho authenticated và chặn anon", () => {
    for (const token of ["CREATE OR REPLACE FUNCTION public.publish_daily_quiz_v1", "Only Super Admin may publish Daily Quiz", "Invalid Daily Quiz payload", "REVOKE ALL ON FUNCTION public.publish_daily_quiz_v1", "GRANT EXECUTE ON FUNCTION public.publish_daily_quiz_v1"]) expect(quizRpc).toContain(token);
    expect(privilegeFix).toContain("FROM anon");
    expect(privilegeFix).toContain("TO authenticated");
  });

  it("gắn dữ liệu động vào Agent Home và thay Super Admin bằng God Mode", () => {
    for (const token of ["fetchStreakMilestones", "fetchCurrentTeamGoalDefaults", "teamDefaults={teamGoalDefaults}", "milestones={streakMilestones}", "pilotSession?.profile.role === \"super_admin\" ? <AdminHomeDashboard", "pilotSession?.profile.role !== \"super_admin\" && <button"]) expect(home).toContain(token);
    expect(targetModal).toContain("Điền tự động theo trung bình Team");
    expect(streakModal).toContain("milestones: dynamicMilestones");
  });

  it("giữ CMS Quiz và benchmark Team khi telemetry God Mode tiến hóa", () => {
    for (const token of ["fetchAppPhilosophyMetrics", "fetchAdminTeamGoalDefaults", "addAdminDailyQuizToBank", "upsertAdminTeamGoalDefaults", "Ngân Hàng Nạp Não", "Cấu hình Vĩ Mô Team", "Không dùng tên, email hoặc số điện thoại"]) expect(adminHome).toContain(token);
    for (const token of ["fetchStreakMilestones", "fetchCurrentTeamGoalDefaults", "fetchAppPhilosophyMetrics", "add_daily_quiz_to_bank_v1", "upsert_team_goal_defaults_v1"]) expect(content).toContain(token);
  });
});
