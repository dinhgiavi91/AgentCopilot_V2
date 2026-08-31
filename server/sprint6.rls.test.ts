import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const expected = {
  disc_questions: 5,
  disc_profiles: 9,
  service_levels: 6,
  xp_rewards: 3,
  daily_quizzes: 1,
  cover_letters: 4,
  news_case_studies: 3,
} as const;

describe("Sprint 6 Operational Library RLS", () => {
  it("cho phép Anon Key chỉ đọc các kho nội dung công khai với đúng số bản ghi đã seed", async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(url).toBeTruthy();
    expect(anonKey).toBeTruthy();

    const client = createClient(url!, anonKey!, { auth: { persistSession: false } });
    const results = await Promise.all(Object.entries(expected).map(async ([table, expectedCount]) => ({
      table,
      expectedCount,
      result: await client.from(table).select("*", { count: "exact", head: true }),
    })));
    for (const { expectedCount, result } of results) {
      const { count, error } = result;
      expect(error).toBeNull();
      expect(count).toBe(expectedCount);
    }
  }, 15_000);

  it("đọc đúng ba phần thưởng Trạm Tiếp Năng Lượng từ sheet 7", async () => {
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
    const { data, error } = await client.from("xp_rewards").select("code, name, xp_cost").order("xp_cost");
    expect(error).toBeNull();
    expect(data).toEqual([
      { code: "Q001", name: "Bùa Cứu Chuỗi (Streak Freeze)", xp_cost: 50 },
      { code: "Q002", name: "Cốc Cafe Starbucks từ Sếp", xp_cost: 150 },
      { code: "Q003", name: "Yêu cầu Sếp đi chốt sale cùng 1 ca", xp_cost: 500 },
    ]);
  });
});
