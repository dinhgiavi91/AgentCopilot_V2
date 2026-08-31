import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dataLayer = readFileSync(new URL("../client/src/lib/supabaseContent.ts", import.meta.url), "utf8");
const commandCenter = readFileSync(new URL("../client/src/components/LeaderCommandCenter.tsx", import.meta.url), "utf8");
const executiveReport = readFileSync(new URL("../client/src/components/LeaderExecutiveReport.tsx", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20260827090000_v70_leader_goal_radar.sql", import.meta.url), "utf8");

describe("V70 Leader goals linked to Radar", () => {
  it("đánh giá đúng bốn trụ cột từ dữ liệu vận hành tháng hiện tại", () => {
    expect(migration).toContain("create or replace function public.evaluate_my_leader_goal_radar_v1()");
    expect(migration).toContain("v_metric_key in array array['personal_income', 'recruitment_outreach', 'active_rate', 'coaching_sessions']");
    expect(migration).toContain("from public.daily_logs dl");
    expect(migration).toContain("from public.activity_events ae");
    expect(migration).toContain("from public.interventions i");
    expect(migration).toContain("i.intervention_type = 'coaching_1on1'::public.pilot_intervention_type");
    expect(migration).toContain("i.action_status = 'done'::public.pilot_intervention_status");
    expect(migration).toContain("Low Coaching: đã hoàn tất");
  });

  it("giữ scope theo auth.uid, chỉ materialize tín hiệu thiếu mục tiêu đang mở và lưu metadata truy vết", () => {
    expect(migration).toContain("v_actor_id uuid := auth.uid()");
    expect(migration).toContain("v_role not in ('leader', 'director')");
    expect(migration).toContain("'rule_key', 'leader_goal_pace_v70'");
    expect(migration).toContain("'scope', 'team_goal'");
    expect(migration).toContain("s.status in ('new'::public.pilot_signal_status, 'reviewed'::public.pilot_signal_status)");
    expect(migration).toContain("set status = 'dismissed'::public.pilot_signal_status");
  });

  it("gọi RPC mục tiêu trước khi đọc Radar và map nhãn V70 vào state hiện hữu", () => {
    expect(dataLayer).toContain('client.rpc("evaluate_my_leader_goal_radar_v1")');
    expect(dataLayer).toContain("export async function fetchLeaderGoalRadarSnapshot");
    expect(dataLayer).toContain("fetchPilotSignals(options: { evaluateGoals?: boolean } = {})");
    expect(commandCenter).toContain("await fetchLeaderGoalRadarSnapshot()");
    expect(commandCenter).toContain("fetchPilotSignals({ evaluateGoals: false })");
    expect(commandCenter).toContain('if (metric === "coaching_sessions") return "Low Coaching"');
  });

  it("đưa mọi signal đang mở trong kỳ vào Báo Cáo Hiệu Suất Cấp Cao", () => {
    expect(executiveReport).toContain("fetchPilotSignals()");
    expect(executiveReport).toContain("const radarAlerts = useMemo<CopilotAlert[]>");
    expect(executiveReport).toContain("const reportAlerts = useMemo(() => [...radarAlerts, ...copilotInsights.alerts]");
    expect(executiveReport).toContain("reportAlerts.length ? reportAlerts.map");
  });
});
