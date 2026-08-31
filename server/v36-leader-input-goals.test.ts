import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const migration = readFileSync(`${root}/supabase/migrations/20260826080000_v36_leader_input_goals.sql`, "utf8");
const modal = readFileSync(`${root}/client/src/components/Sprint11TargetModal.tsx`, "utf8");
const dataLayer = readFileSync(`${root}/client/src/lib/supabaseContent.ts`, "utf8");
const home = readFileSync(`${root}/client/src/pages/Home.tsx`, "utf8");

describe("V36 Leader Input Goals", () => {
  it("presents the four practical Leader pillars without changing Advisor goal flow", () => {
    for (const marker of [
      "Copilot theo dõi",
      "1. Cá nhân (Làm gương)",
      "2. Tuyển dụng (Mở rộng)",
      "3. Kích hoạt Đội ngũ (Active)",
      "4. Hỗ trợ & Giữ người (Coaching)",
      "Ứng viên tiếp cận / phỏng vấn",
      "Tỷ lệ Active mục tiêu",
      "Số ca Coaching gỡ rối",
      "Ngân sách thưởng",
      'role === "advisor"',
    ]) expect(modal).toContain(marker);
  });

  it("persists recruitment and Active Rate only through the Leader/Director self-scoped RPC", () => {
    for (const marker of [
      "recruitment_outreach_target",
      "active_rate_target_percent",
      "v_role not in ('leader', 'director')",
      "security definer",
      "get_my_player_coach_goal_v2",
      "upsert_my_player_coach_goal_v2",
      "from public, anon",
      "to authenticated",
    ]) expect(migration).toContain(marker);
    expect(migration).not.toMatch(/customer_name|phone|email|policy_number/i);
    expect(dataLayer).toContain('client.rpc("get_my_player_coach_goal_v2")');
    expect(dataLayer).toContain('p_active_rate_target_percent');
  });

  it("passes the expanded saved goal through Home for both Leader and Director", () => {
    for (const marker of ["recruitmentOutreach", "activeRatePercent", "persistPlayerCoachGoal(value)", "bốn trụ cột Leader"]) expect(home).toContain(marker);
  });
});
