import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const enumMigration = fs.readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260818172000_pilot_step3c_outcome_checkpoint_enum.sql"), "utf8");
const engineMigration = fs.readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260818172500_pilot_step3c_outcome_evaluator_v1.sql"), "utf8");

describe("Pilot Step 3C — Outcome Checkpoint Engine V1", () => {
  it("mở checkpoint D1 và định nghĩa RPC Outcome Evaluator chạy bằng caller identity", () => {
    expect(enumMigration).toContain("add value if not exists 'd1'");
    expect(engineMigration).toContain("run_outcome_evaluator_v1");
    expect(engineMigration).toContain("security invoker");
    expect(engineMigration).toContain("Outcome Evaluator chỉ dành cho Super Admin Pilot.");
    expect(engineMigration).toContain("revoke execute on function public.run_outcome_evaluator_v1");
  });

  it("đánh giá recovery chỉ từ hoạt động hoặc Follow-up hoàn tất xảy ra nghiêm ngặt sau action_date", () => {
    expect(engineMigration).toContain("e.event_timestamp > v_action_at");
    expect(engineMigration).toContain("f.completed_at > v_action_at");
    expect(engineMigration).toContain("v_has_activity or v_has_completed_followup");
    expect(engineMigration).toContain("'not_recovered'::public.pilot_recovery_status");
  });

  it("ghi outcome và audit run idempotent theo intervention/checkpoint", () => {
    expect(engineMigration).toContain("not exists (");
    expect(engineMigration).toContain("o.intervention_id = i.id");
    expect(engineMigration).toContain("o.checkpoint_day = p_checkpoint_day");
    expect(engineMigration).toContain("on conflict (intervention_id, checkpoint_day) do nothing");
    expect(engineMigration).toContain("outcome_evaluator_runs");
  });
});
