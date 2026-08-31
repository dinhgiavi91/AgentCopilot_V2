import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), "utf8");

describe("V14 dynamic streak milestones", () => {
  it("migrates XP rewards, idempotent claims, ledger credit, and authenticated-only RPCs", () => {
    const sql = read("supabase/migrations/20260824194500_v14_dynamic_streak_claims.sql");
    expect(sql).toContain("ADD COLUMN IF NOT EXISTS xp_reward");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.streak_milestone_claims");
    expect(sql).toContain("UNIQUE (user_id, milestone_id)");
    expect(sql).toContain("ON CONFLICT (user_id, milestone_id) DO NOTHING");
    expect(sql).toContain("'streak_milestone'");
    expect(sql).toContain("UPDATE public.users_profile SET total_xp");
    expect(sql).toContain("UPDATE public.profiles SET xp_balance");
    expect(sql).toContain("REVOKE ALL ON FUNCTION public.claim_streak_milestone_v1(uuid) FROM anon");
    expect(sql).toContain("GRANT EXECUTE ON FUNCTION public.claim_streak_milestone_v1(uuid) TO authenticated");
  });

  it("keeps progress data-driven and exposes a claim helper instead of fixed N1-N7 UI", () => {
    const widget = read("client/src/components/AgentStreakWidget.tsx");
    const progress = read("client/src/lib/streakProgress.ts");
    const data = read("client/src/lib/supabaseContent.ts");
    expect(widget).toContain("calculateStreakProgress");
    expect(widget).toContain("Nhận ${rewardText} XP");
    expect(widget).not.toContain("targetStreak");
    expect(widget).not.toContain("Array.from({ length:");
    expect(progress).toContain("previousMilestoneDay");
    expect(progress).toContain("nextMilestoneDay");
    expect(progress).toContain("((current - previous) / distance) * 100");
    expect(data).toContain("fetchMyStreakMilestoneClaims");
    expect(data).toContain('client.rpc("claim_streak_milestone_v1"');
  });

  it("keeps milestone configuration Super Admin-only and transparently Global", () => {
    const admin = read("client/src/components/AdminHomeDashboard.tsx");
    const data = read("client/src/lib/supabaseContent.ts");
    const home = read("client/src/pages/Home.tsx");
    expect(admin).toContain("Cấu Hình Cột Mốc Chuỗi");
    expect(admin).toContain("Global, áp dụng cho mọi Team");
    expect(admin).toContain("createAdminStreakMilestone");
    expect(data).toContain('client.rpc("create_streak_milestone_v1"');
    expect(data).toContain('session.profile.role !== "super_admin"');
    expect(home).toContain("handleClaimStreakMilestone");
    expect(home).toContain("fetchXpLedger()");
  });
});
