import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const migrationPath = new URL("../supabase/migrations/20260818165000_pilot_step3_signal_engine_v1.sql", import.meta.url);

describe("Pilot Step 3 — Signal Engine V1 migration", () => {
  it("cấu hình hai rule V1 bằng database settings và có default an toàn", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("signal_engine_rule_configs");
    expect(sql).toContain("'activity_drop', true, 168");
    expect(sql).toContain("'followup_gap', true, 24");
    expect(sql).toContain("evaluation_window_hours between 1 and 8760");
  });

  it("chạy engine trong Postgres, giữ caller identity qua RLS và không để browser tự tạo Signal", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("create or replace function public.run_signal_engine_v1");
    expect(sql).toContain("security invoker");
    expect(sql).toContain("if not private.is_super_admin()");
    expect(sql).toContain("signal_engine_runs_super_admin_insert");
    expect(sql).toContain("revoke execute on function public.run_signal_engine_v1(boolean) from anon");
    expect(sql).toContain("grant execute on function public.run_signal_engine_v1(boolean) to authenticated");
  });

  it("áp dụng activity_drop và followup_gap với metadata, dry-run và idempotency unresolved", async () => {
    const sql = await readFile(migrationPath, "utf8");
    for (const required of [
      "'low_activity'::public.pilot_signal_type",
      "'followup_overdue'::public.pilot_signal_type",
      "p_dry_run",
      "evaluation_window_hours",
      "s.status in ('new'::public.pilot_signal_status, 'reviewed'::public.pilot_signal_status)",
      "signal_engine_runs",
    ]) expect(sql).toContain(required);
  });
});
