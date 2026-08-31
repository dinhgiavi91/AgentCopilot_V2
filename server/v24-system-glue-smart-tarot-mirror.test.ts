import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(`${root}/${path}`, "utf8");

describe("V24 System Glue, Smart Tarot and Agent Mirror", () => {
  const baseMigration = read("supabase/migrations/20260825120500_v24_system_glue_smart_tarot_mirror.sql");
  const strictMigration = read("supabase/migrations/20260825120700_v24_smart_tarot_no_repeat_strict.sql");
  const dataLayer = read("client/src/lib/supabaseContent.ts");
  const mirror = read("client/src/components/AgentMirrorModal.tsx");
  const oracle = read("client/src/components/LeaderWeeklyOracle.tsx");
  const accountCms = read("client/src/components/PilotStep5BusinessModules.tsx");

  it("aggregates only this week's substantive daily logs for the advisor's own Mirror", () => {
    expect(baseMigration).toContain("from public.daily_logs d");
    expect(baseMigration).toContain("not in ('dời lịch', 'hủy')");
    expect(baseMigration).toContain("customer_meetings");
    expect(baseMigration).toContain("v_customer_meetings > 5 and v_closed_deals = 0");
    expect(baseMigration).toContain("Bảo Bối: Xử lý từ chối");
    expect(dataLayer).toContain("customerMeetings: Number(raw.customer_meetings ?? 0)");
  });

  it("renders the dynamic meeting stat and recommendation returned by the self-scoped RPC", () => {
    expect(mirror).toContain("Users size={20}");
    expect(mirror).toContain("mirror.customerMeetings");
    expect(mirror).toContain("Cuộc gặp KH tuần này");
    expect(mirror).toContain("mirror.nextTip");
  });

  it("draws one Team-scoped Tarot card from the current signal and never repeats last week", () => {
    expect(strictMigration).toContain("team_tarot_draw_history");
    expect(strictMigration).toContain("v_week_start - 7");
    expect(strictMigration).toContain("c.id <> v_previous_card_id");
    expect(strictMigration).toContain("Kho Tarot cho tín hiệu này cần ít nhất hai lá bài");
    expect(strictMigration).toContain("v_role <> 'leader'");
    expect(strictMigration).toContain("from public.signals s");
    expect(strictMigration).toContain("revoke all on function public.draw_smart_tarot_v1(text, uuid) from public, anon");
  });

  it("uses the database-side Smart Tarot draw in the Leader Oracle instead of browser randomization", () => {
    expect(dataLayer).toContain('client.rpc("draw_smart_tarot_v1", { p_team_signal: null, p_last_card_id: null })');
    expect(oracle).toContain("drawSmartTarotCard");
    expect(oracle).toContain("const draw = await drawSmartTarotCard()");
    expect(oracle).not.toContain("fetchCosmicTarotCards");
    expect(oracle).not.toContain("Math.random() * oracleCards.length");
  });

  it("makes Director selectable and labels the selected Team as the GA Team for that role", () => {
    expect(accountCms).toContain("Director (Giám đốc GA)");
    expect(accountCms).toContain('directorOption.value = "director"');
    expect(accountCms).toContain('form.role === "director" ? "GA Team của Director" : "Team"');
  });
});
