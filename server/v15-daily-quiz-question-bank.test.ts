import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), "utf8");

describe("V15 Daily Quiz Question Bank", () => {
  it("xoay vòng một câu theo UTC, sort_order và modulo thay vì ghi đè câu active", () => {
    const migration = read("supabase/migrations/20260824201000_v15_daily_quiz_question_bank.sql");
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.get_today_daily_quiz_v1()");
    expect(migration).toContain("current_date - DATE '2026-01-01'");
    expect(migration).toContain("v_days_since_epoch % v_total_questions");
    expect(migration).toContain("ORDER BY q.sort_order ASC, q.code ASC");
    expect(migration).toContain("OFFSET v_offset");
    expect(migration).not.toContain("UPDATE public.daily_quizzes SET is_active = false");
  });

  it("bảo vệ RPC Question Bank và chặn dữ liệu liên hệ trong câu mới", () => {
    const migration = read("supabase/migrations/20260824201000_v15_daily_quiz_question_bank.sql");
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.add_daily_quiz_to_bank_v1");
    expect(migration).toContain("private.is_super_admin()");
    expect(migration).toContain("combined_content");
    expect(migration).toContain("Invalid Daily Quiz payload");
    expect(migration).toContain("REVOKE ALL ON FUNCTION public.get_today_daily_quiz_v1() FROM anon");
    expect(migration).toContain("GRANT EXECUTE ON FUNCTION public.add_daily_quiz_to_bank_v1");
  });

  it("nối RPC vào Agent Home và CMS thêm câu hỏi có bộ đếm kho", () => {
    const content = read("client/src/lib/supabaseContent.ts");
    const home = read("client/src/pages/Home.tsx");
    const admin = read("client/src/components/AdminHomeDashboard.tsx");
    expect(content).toContain('supabase.rpc("get_today_daily_quiz_v1")');
    expect(content).toContain('client.rpc("add_daily_quiz_to_bank_v1"');
    expect(content).toContain("fetchAdminDailyQuizBankCount");
    expect(home).toContain("onQuizBankChanged");
    expect(home).toContain("fetchTodayDailyQuiz()");
    expect(admin).toContain("Ngân Hàng Nạp Não");
    expect(admin).toContain("Trong kho");
    expect(admin).toContain("+ Thêm vào Ngân Hàng");
    expect(admin).not.toContain("Câu mới sẽ thay câu đang hoạt động");
  });
});
