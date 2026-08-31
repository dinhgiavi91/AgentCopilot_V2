import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const migration = readFileSync(`${root}/supabase/migrations/20260826034000_v32_inactivity_signal_detector.sql`, "utf8");
const dataLayer = readFileSync(`${root}/client/src/lib/supabaseContent.ts`, "utf8");
const radar = readFileSync(`${root}/client/src/components/LeaderCommandCenter.tsx`, "utf8");

describe("V32 Inactivity Signal Detector", () => {
  it("persists a high-priority Zero-PII signal for zero streak or zero 24-hour activity", () => {
    expect(migration).toContain("coalesce(up.current_streak, 0)::integer as current_streak");
    expect(migration).toContain("public.activity_events");
    expect(migration).toContain("public.daily_logs");
    expect(migration).toContain("interval '24 hours'");
    expect(migration).toContain("candidate.current_streak = 0 or (candidate.activity_events_24h = 0 and candidate.daily_logs_24h = 0)");
    expect(migration).toContain("'v32-inactivity-24h'");
    expect(migration).toContain("'high'::public.pilot_signal_severity");
    expect(migration).not.toMatch(/email|phone|customer_name/i);
  });

  it("avoids duplicate unresolved inactivity warnings and leaves a real Signal for intervention", () => {
    expect(migration).toContain("existing.signal_type in ('low_activity'::public.pilot_signal_type, 'streak_break'::public.pilot_signal_type)");
    expect(migration).toContain("existing.status in ('new'::public.pilot_signal_status, 'reviewed'::public.pilot_signal_status)");
    expect(migration).toContain("insert into public.signals");
    expect(migration).toContain("get_leader_radar_signals_v2");
  });

  it("loads the persisted detector output into Leader Radar and retains the intervention CTA", () => {
    expect(dataLayer).toContain('client.rpc("get_leader_radar_signals_v2")');
    expect(radar).toContain("onClick={() => setSelectedSignal(signal)}");
    expect(radar).toContain("<SignalInterventionModal signal={selectedSignal}");
    expect(radar).toContain("Hỗ trợ TVV này 🤝");
  });

  it("keeps the detector RPC authenticated-only", () => {
    expect(migration).toContain("revoke all on function public.get_leader_radar_signals_v2() from public, anon");
    expect(migration).toContain("grant execute on function public.get_leader_radar_signals_v2() to authenticated");
  });
});
