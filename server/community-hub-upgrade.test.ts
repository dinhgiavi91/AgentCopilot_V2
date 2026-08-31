import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/20260824180500_community_hub_upgrade.sql", "utf8");
const content = readFileSync("client/src/lib/supabaseContent.ts", "utf8");
const social = readFileSync("client/src/components/PilotStep4SocialModules.tsx", "utf8");
const home = readFileSync("client/src/pages/Home.tsx", "utf8");
const giftModal = readFileSync("client/src/components/PilotStep5BusinessModules.tsx", "utf8");

describe("Community Hub upgrade", () => {
  it("mở rộng Community schema mà không tạo bảng XP mới", () => {
    for (const token of [
      "ADD COLUMN IF NOT EXISTS image_urls text[]",
      "ADD COLUMN IF NOT EXISTS post_type text",
      "community_posts_post_type_check",
      "parent_comment_id uuid",
      "REFERENCES public.community_comments(id) ON DELETE CASCADE",
      "community_posts_team_type_created_idx",
      "community_comments_post_parent_created_idx",
      "CREATE OR REPLACE FUNCTION public.get_weekly_leaderboard_v1(p_team_id uuid)",
      "FROM public.xp_ledger AS ledger",
      "AND p_team_id = private.current_team_id()",
      "REVOKE ALL ON FUNCTION public.get_weekly_leaderboard_v1(uuid) FROM anon",
      "GRANT EXECUTE ON FUNCTION public.get_weekly_leaderboard_v1(uuid) TO authenticated",
    ]) expect(migration).toContain(token);
    expect(migration).not.toContain("CREATE TABLE public.xp_");
  });

  it("giữ contract Global XP RPC và bổ sung Category/Reply/Top 5 trong Community", () => {
    for (const token of [
      'export type CommunityPostType = "WIN" | "SOS" | "TIP" | "GENERAL"',
      "parentCommentId: string | null",
      "fetchWeeklyTeamLeaderboard",
      'client.rpc("get_weekly_leaderboard_v1"',
      "parent_comment_id: parentCommentId",
      "post_type: safePostType",
    ]) expect(content).toContain(token);
    for (const token of ["postTypeOptions", "WeeklyLeaderboard", "CommentThread", "Khoe Deal", "Góc Cứu Viện", "Mẹo Hay", "parentCommentId"]) expect(social).toContain(token);
    expect(home).toContain("leaderboard={communityLeaderboard}");
    expect(home).toContain("fetchWeeklyTeamLeaderboard()");
    expect(giftModal).toContain("giftTeamXp(recipientId, xp, note, false)");
    expect(giftModal).not.toContain("setPublish(");
  });
});
