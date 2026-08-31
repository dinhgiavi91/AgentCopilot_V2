import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/bhnt-learning-hub-research";
const migration = readFileSync(`${root}/supabase/migrations/20260818190000_pilot_step5_business_measurement.sql`, "utf8");
const giftLedgerMigration = readFileSync(`${root}/supabase/migrations/20260819131000_gift_xp_ledger_note_and_onboarding_delay.sql`, "utf8");
const dataLayer = readFileSync(`${root}/client/src/lib/supabaseContent.ts`, "utf8");
const server = readFileSync(`${root}/server/production.mjs`, "utf8");
const pilotUserApi = readFileSync(`${root}/server/pilotUserApi.mjs`, "utf8");
const ui = readFileSync(`${root}/client/src/components/PilotStep5BusinessModules.tsx`, "utf8");

describe("Pilot Step 5 — Business & Measurement Layer", () => {
  it("cấp quỹ XP trên profiles và đặt default Leader 5000 XP", () => {
    expect(migration).toContain("add column if not exists xp_balance integer not null default 0");
    expect(migration).toContain("set xp_balance = 5000");
    expect(migration).toContain("where role = 'leader' and xp_balance = 0");
  });

  it("Gift XP toàn Team dùng quỹ, có idempotency và đăng Community tùy chọn", () => {
    expect(migration).toContain("gift_team_xp_v2");
    expect(migration).toContain("security definer");
    expect(migration).toContain("xp_balance = xp_balance - p_amount");
    expect(migration).toContain("p_publish_to_community boolean default false");
    expect(migration).toContain("xp_gifts_giver_idempotency_idx");
    expect(migration).toContain("private.user_belongs_to_team(p_recipient_id, v_team_id)");
  });

  it("ghi ledger chỉ cho người nhận và không trừ XP thành tích của người tặng", () => {
    expect(migration).toContain("insert into public.xp_ledger (user_id, xp_amount, reason, source_gift_id)");
    expect(migration).toContain("values (p_recipient_id, p_amount, 'manual_adjustment', v_gift_id)");
    expect(migration).not.toContain("set total_xp = total_xp - p_amount");
  });

  it("lưu lời vinh danh của Gift XP ở description để TVV đọc được thay vì reason kỹ thuật", () => {
    expect(giftLedgerMigration).toContain("add column if not exists description text");
    expect(giftLedgerMigration).toContain("set description = g.note");
    expect(giftLedgerMigration).toContain("insert into public.xp_ledger (user_id, xp_amount, reason, description, source_gift_id)");
    expect(giftLedgerMigration).toContain("values (p_recipient_id, p_amount, 'manual_adjustment', trim(p_note), v_gift_id)");
    expect(dataLayer).toContain('"transaction_id, xp_amount, reason, description, created_at"');
  });

  it("Scorecard đo Signal, Action, TTI, Recovery D7 và hành trình không định danh", () => {
    expect(migration).toContain("get_pilot_measurement_scorecard_v1");
    expect(migration).toContain("'intervention_rate'");
    expect(migration).toContain("'time_to_intervention_hours'");
    expect(migration).toContain("checkpoint_day = 'd7'");
    expect(migration).toContain("'journeys'");
  });

  it("onboarding chỉ được Advisor tự hoàn tất qua RPC giới hạn quyền", () => {
    expect(migration).toContain("complete_advisor_onboarding_v1");
    expect(migration).toContain("private.current_profile_role() <> 'advisor'");
    expect(migration).toContain("onboarding_completed_at = coalesce(onboarding_completed_at, now())");
  });

  it("User Management API luôn kiểm tra JWT Super Admin trên server trước Admin API", () => {
    expect(pilotUserApi).toContain("async function requireSuperAdmin(req)");
    expect(pilotUserApi).toContain("profiles[0]?.role !== \"super_admin\"");
    expect(server).toContain('pathname === "/api/pilot/users"');
    expect(pilotUserApi).toContain("/auth/v1/admin/users");
    expect(pilotUserApi).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("client chỉ gọi RPC/endpoint an toàn và không chứa service-role key", () => {
    expect(dataLayer).toContain("gift_team_xp_v2");
    expect(dataLayer).toContain("get_pilot_measurement_scorecard_v1");
    expect(dataLayer).toContain('fetch("/api/pilot/users"');
    expect(dataLayer).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("UI có Gift XP riêng tư, User Management, Scorecard và hướng dẫn Advisor", () => {
    expect(ui).toContain("GlobalGiftXpModal");
    expect(ui).toContain("Ghi nhận riêng tư trong Team");
    expect(ui).toContain("giftTeamXp(recipientId, xp, note, false)");
    expect(ui).toContain("QUẢN LÝ TÀI KHOẢN");
    expect(ui).toContain("Detection → Action →");
    expect(ui).toContain("AdvisorQuickGuide");
  });
});
