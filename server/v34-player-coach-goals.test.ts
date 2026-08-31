import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const migration = readFileSync(`${root}/supabase/migrations/20260826070000_v34_player_coach_goals.sql`, "utf8");
const modal = readFileSync(`${root}/client/src/components/Sprint11TargetModal.tsx`, "utf8");
const dataLayer = readFileSync(`${root}/client/src/lib/supabaseContent.ts`, "utf8");
const home = readFileSync(`${root}/client/src/pages/Home.tsx`, "utf8");

describe("V34 Player-Coach input-focused goals", () => {
  it("keeps advisor product-income goals separate from Leader and Director input goals", () => {
    expect(modal).toContain('const isPlayerCoach = role === "leader" || role === "director"');
    expect(modal).toContain("LeaderGoalForm");
    expect(modal).toContain("Số ca Coaching gỡ rối");
    expect(modal).toContain("Ngân sách thưởng");
    expect(modal).toContain('role === "advisor"');
  });

  it("persists only the Player-Coach input goals through authenticated, role-gated RPCs", () => {
    for (const token of [
      "create table if not exists public.player_coach_goals",
      "personal_income",
      "coaching_1on1_target",
      "xp_budget_target",
      "team_streak_7d_members_target",
      "v_role not in ('leader', 'director')",
      "security definer",
      "get_my_player_coach_goal_v1",
      "upsert_my_player_coach_goal_v1",
      "from public, anon",
      "to authenticated",
    ]) expect(migration).toContain(token);
    expect(migration).not.toMatch(/customer_name|phone|email|policy_number/i);
    expect(dataLayer).toContain('client.rpc("get_my_player_coach_goal_v2")');
    expect(dataLayer).toContain('client.rpc("upsert_my_player_coach_goal_v2"');
  });

  it("opens the Player-Coach form from every goal CTA for Leader and Director", () => {
    const resolver = 'role === "leader" || role === "director" ? role : managerMode ? "leader" : "advisor"';
    expect(home).toContain(resolver);
    expect(home.split(resolver).length - 1).toBe(2);
    expect(home).toContain("fetchMyPlayerCoachGoal");
    expect(home).toContain("persistPlayerCoachGoal");
  });
});
