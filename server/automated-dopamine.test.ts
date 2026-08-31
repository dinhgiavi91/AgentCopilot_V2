import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/bhnt-learning-hub-research";
const migration = readFileSync(`${root}/supabase/migrations/20260819143000_automated_dopamine_reward_engine.sql`, "utf8");
const logicMigration = readFileSync(`${root}/supabase/migrations/20260819151000_reward_logic_realtime.sql`, "utf8");
const discMigration = readFileSync(`${root}/supabase/migrations/20260819162000_disc_confetti_reward.sql`, "utf8");
const redemptionMigration = readFileSync(`${root}/supabase/migrations/20260819170000_redemption_gift_quota_sync.sql`, "utf8");
const dataLayer = readFileSync(`${root}/client/src/lib/supabaseContent.ts`, "utf8");
const rewardContext = readFileSync(`${root}/client/src/contexts/XpRewardContext.tsx`, "utf8");
const home = readFileSync(`${root}/client/src/pages/Home.tsx`, "utf8");
const training = readFileSync(`${root}/client/src/components/Sprint10VideoModules.tsx`, "utf8");

describe("Automated Dopamine Reward Engine", () => {
  it("khóa idempotency XP tự động theo TVV, nguồn hành động và source key", () => {
    expect(migration).toContain("xp_ledger_auto_reward_idempotency_idx");
    expect(migration).toContain("on conflict (user_id, auto_source, auto_source_key)");
    expect(migration).toContain("private.current_profile_role() <> 'advisor'");
  });

  it("định nghĩa đúng reward matrix Quiz, Nhịp đập, Cộng đồng và Training", () => {
    expect(migration).toContain("when 'daily_quiz_correct' then v_amount := 15");
    expect(migration).toContain("when 'daily_quiz_incorrect' then v_amount := 10");
    expect(migration).toContain("when 'customer_pulse_l1' then v_amount := 5");
    expect(migration).toContain("when 'customer_pulse_l2_plus' then v_amount := 10");
    expect(migration).toContain("when 'community_post' then v_amount := 5");
    expect(migration).toContain("when 'community_comment' then v_amount := 1");
    expect(migration).toContain("when 'training_roleplay' then v_amount := 10");
    expect(migration).toContain("when 'training_video' then v_amount := 5");
  });

  it("ghi ledger qua RPC có mô tả rõ nghĩa và client không tự ghi XP", () => {
    expect(migration).toContain("insert into public.xp_ledger (user_id, xp_amount, reason, description, auto_source, auto_source_key)");
    expect(dataLayer).toContain('rpc("award_advisor_auto_xp_v1"');
    expect(dataLayer).toContain("AUTO_XP_SOURCES");
  });

  it("hiển thị Confetti XP toàn cục qua Portal và gắn đủ các hành động thực", () => {
    expect(rewardContext).toContain("createPortal");
    expect(rewardContext).toContain("agent-copilot-auto-xp-confetti");
    expect(rewardContext).toContain("agent-copilot-confetti-6");
    expect(rewardContext).toContain('data-testid="auto-xp-confetti"');
    expect(home).toContain('"daily_quiz_correct"');
    expect(home).toContain('"customer_pulse_l1"');
    expect(home).toContain('"community_comment"');
    expect(home).toContain('"training_roleplay"');
    expect(training).toContain("onCompleted");
    expect(training).toContain("onWatch");
  });

  it("sửa đổi quà, khấu trừ quỹ TVV và thưởng thiết lập mục tiêu theo tháng", () => {
    expect(home).toContain("Number(xpTotal) >= Number(reward.xp_cost)");
    expect(home).toContain("redeemXpReward(reward.code)");
    expect(redemptionMigration).toContain("create table if not exists public.reward_redemptions");
    expect(redemptionMigration).toContain("set total_xp = total_xp - v_cost");
    expect(redemptionMigration).toContain("values (v_user_id, -v_cost, 'manual_adjustment'");
    expect(redemptionMigration).toContain("v_role = 'advisor'::public.pilot_role");
    expect(redemptionMigration).toContain("set total_xp = total_xp - p_amount");
    expect(home).toContain('"monthly_target_set"');
    expect(logicMigration).toContain("when 'monthly_target_set' then v_amount := 5");
    expect(logicMigration).toContain("update public.profiles set xp_balance = xp_balance - p_amount");
    expect(logicMigration).toContain("and xp_balance >= p_amount returning xp_balance into v_remaining");
  });

  it("đăng ký Realtime toàn cục trên đúng XP ledger người nhận và phát toast Gift XP", () => {
    expect(logicMigration).toContain("alter publication supabase_realtime add table public.xp_ledger");
    expect(dataLayer).toContain("subscribeXpLedgerNotifications");
    expect(dataLayer).toContain("filter: `user_id=eq.${userId}`");
    expect(dataLayer).toContain("isGift: Boolean(row.source_gift_id)");
    expect(home).toContain("Bạn vừa được tặng ${entry.xpAmount} XP từ đồng đội!");
    expect(home).toContain("refreshXpState");
    expect(home).toContain("ledgerTotal");
  });

  it("thưởng +20 XP cho assessment DISC đã lưu và không cấp trùng", () => {
    expect(dataLayer).toContain('source === "disc_assessment"');
    expect(home).toContain('awardAdvisorAction("disc_assessment", persisted)');
    expect(discMigration).toContain("values (v_user_id, 20, 'manual_adjustment'");
    expect(discMigration).toContain("from public.disc_assessments where assessment_id = p_assessment_id and user_id = v_user_id");
    expect(discMigration).toContain("on conflict (user_id, auto_source, auto_source_key)");
  });
});
