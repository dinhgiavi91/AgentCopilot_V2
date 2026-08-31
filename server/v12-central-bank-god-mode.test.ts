import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/20260824184500_v12_team_rewards_central_bank.sql", "utf8");
const content = readFileSync("client/src/lib/supabaseContent.ts", "utf8");
const social = readFileSync("client/src/components/PilotStep4SocialModules.tsx", "utf8");
const admin = readFileSync("client/src/components/PilotStep5BusinessModules.tsx", "utf8");
const home = readFileSync("client/src/pages/Home.tsx", "utf8");

describe("V12 Central Bank và God Mode", () => {
  it("dùng XP Ledger hiện hữu, scope rewards theo Team và khóa quyền RPC", () => {
    for (const token of [
      "ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.teams(id)",
      "xp_rewards_team_status_sort_idx",
      "xp_rewards_global_read",
      "xp_rewards_authenticated_global_or_team_read",
      "xp_rewards_super_admin_write",
      "CREATE OR REPLACE FUNCTION public.admin_fund_leader_v1(",
      "private.is_super_admin()",
      "role = 'leader'::public.pilot_role",
      "INSERT INTO public.xp_ledger",
      "'admin_funding'",
      "REVOKE ALL ON FUNCTION public.admin_fund_leader_v1(uuid, integer, text) FROM anon",
      "GRANT EXECUTE ON FUNCTION public.admin_fund_leader_v1(uuid, integer, text) TO authenticated",
    ]) expect(migration).toContain(token);
    expect(migration).not.toContain("CREATE TABLE public.xp_");
  });

  it("gọi Central Bank, tạo phần thưởng Team và không rò quyền God Mode", () => {
    for (const token of ["adminFundLeader", "admin_fund_leader_v1", "fetchAdminTeamRewards", "createAdminTeamReward", "team_id: input.teamId", "deleteTeamCommunityPost"]) expect(content).toContain(token);
    for (const token of ["CentralBankAndRewards", "Cấp ngân sách cho Leader", "Thêm quà theo workspace"]) expect(admin).toContain(token);
    expect(social).toContain("isSuperAdmin = false");
    expect(social).toContain("God Mode: xóa bài");
    expect(social).toContain("window.confirm");
    expect(home).toContain('isSuperAdmin={pilotSession?.profile.role === "super_admin"}');
    expect(home).toContain("deleteTeamCommunityPost(postId)");
    expect(home).not.toContain("<AdminDashboard />");
  });
});
