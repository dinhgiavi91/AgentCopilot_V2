import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(new URL("../supabase/migrations/20260822100000_recognition_realtime.sql", import.meta.url), "utf8");
const fulfillmentMigration = readFileSync(new URL("../supabase/migrations/20260822110000_recognition_reward_fulfillment.sql", import.meta.url), "utf8");
const content = readFileSync(new URL("../client/src/lib/supabaseContent.ts", import.meta.url), "utf8");
const leaderCenter = readFileSync(new URL("../client/src/components/LeaderCommandCenter.tsx", import.meta.url), "utf8");

describe("Recognition Realtime contract", () => {
  it("lưu Recognition Team-scoped với RLS receiver claim và publication Realtime", () => {
    for (const token of ["create table public.recognitions", "team_id uuid not null", "recognitions_leader_team_insert", "recognitions_receiver_claim", "alter publication supabase_realtime add table public.recognitions", "Customer names, phone numbers and emails are prohibited."]) {
      expect(migration).toContain(token);
    }
  });

  it("tạo, mở Mailbox, subscribe và claim Recognition qua RPC fulfillment", () => {
    for (const token of ["export async function createTeamRecognition", "Chỉ Leader hoặc Super Admin có thể gửi Thẻ Vinh Danh.", "export function subscribeIncomingRecognitions", "receiver_id=eq.${userId}", "export async function fetchLatestPendingRecognition", ".eq(\"is_claimed\", false)", ".order(\"created_at\", { ascending: false })", "export async function claimRecognition", "claim_recognition_reward_v1"]) {
      expect(content).toContain(token);
    }
  });

  it("fulfill nguyên tử phần thưởng Recognition theo XP, Xu hoặc inventory", () => {
    for (const token of ["create table if not exists public.recognition_reward_fulfillments", "create table if not exists public.agent_reward_inventory", "coin_balance", "create or replace function public.claim_recognition_reward_v1", "v_reward_name ~* 'xp'", "v_reward_name ilike '%xu%'", "source_recognition_id", "revoke update on public.recognitions from authenticated", "idempotent"]) {
      expect(fulfillmentMigration).toContain(token);
    }
  });

  it("truyền profile id của TVV từ Radar sang Leader Moment", () => {
    expect(leaderCenter).toContain("onCreateMoment?: (agent: { id: string; displayName: string }) => void");
    expect(leaderCenter).toContain("onCreateMoment({ id: signal.user_id, displayName: signal.advisor_display_name })");
  });
});
