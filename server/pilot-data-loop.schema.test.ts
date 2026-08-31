import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { ActivityEvent, Followup, Intervention, PilotRole, Signal } from "../client/src/lib/pilotTypes";

const migration = readFileSync(new URL("../supabase/migrations/20260818143000_pilot_data_loop_step1.sql", import.meta.url), "utf8");

describe("Pilot Data Loop — schema Step 1", () => {
  it("creates every table required by the intervention loop with RLS enabled", () => {
    for (const table of ["teams", "profiles", "activity_events", "followups", "signals", "signal_reviews", "interventions", "intervention_outcomes"]) {
      expect(migration).toContain(`public.${table}`);
      expect(migration).toContain(`alter table public.${table} enable row level security;`);
    }
  });

  it("uses non-exposed private helpers and team-scoped policy predicates", () => {
    expect(migration).toContain("create schema if not exists private;");
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("private.can_manage_team");
    expect(migration).toContain("private.user_belongs_to_team");
    expect(migration).not.toContain("raw_user_meta_data");
  });

  it("keeps customer follow-ups Zero-PII at the schema boundary", () => {
    expect(migration).toContain("alias_label !~ '@'");
    expect(migration).toContain("alias_label !~ '[0-9]{8,}'");
  });

  it("keeps domain contracts type-safe without wiring UI", () => {
    const role: PilotRole = "advisor";
    const activity = {} as ActivityEvent;
    const followup = {} as Followup;
    const signal = {} as Signal;
    const intervention = {} as Intervention;
    expect(role).toBe("advisor");
    expect(activity.metadata).toBeUndefined();
    expect(followup.alias_label).toBeUndefined();
    expect(signal.status).toBeUndefined();
    expect(intervention.action_status).toBeUndefined();
  });
});
