import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const input = JSON.parse(readFileSync("/home/ubuntu/upload/pasted_content_174.txt", "utf8"));
const seed = readFileSync(new URL("../supabase/seeds/20260827000000_v76_playbook_curriculum.sql", import.meta.url), "utf8");
const prepare = readFileSync("/home/ubuntu/v76-prepare-playbook-seed.mjs", "utf8");

describe("V76 Playbook curriculum injection", () => {
  it("xác thực toàn bộ năm scenario với category, level và Iceberg năm bước hợp lệ", () => {
    const categories = new Set(["Kiến thức Y Khoa & Pháp lý", "Nghệ thuật Khai vấn", "Xử lý Từ chối & Chốt Sales", "Tiêu chuẩn CSKH", "Kỹ năng Thực chiến"]);
    const levels = new Set(["Rookie", "Pro", "Master", "Leader"]);
    const stepKeys = ["step_1_tinh_huong", "step_2_insight", "step_3_goc_nhin", "step_4_logic", "step_5_kich_ban"];
    expect(input).toHaveLength(5);
    for (const row of input) {
      expect(categories.has(row.category)).toBe(true);
      expect(levels.has(row.level)).toBe(true);
      expect(row.title.trim()).not.toBe("");
      expect(row.dinh_tam.trim()).not.toBe("");
      expect(row.roleplay_prompt.trim()).not.toBe("");
      for (const step of stepKeys) expect(row.iceberg_steps[step].trim()).not.toBe("");
    }
  });

  it("map Iceberg vào contract Playbook hiện hữu và giữ prompt trong JSONB", () => {
    for (const token of ["skill_system", "required_level", "situation", "customer_insight", "mindset", "core_logic", "coaching_prompts", "ai_evaluation_rules"]) expect(seed).toContain(token);
    expect(seed).toContain("roleplay_prompt");
    expect(seed).toContain("iceberg_steps");
    expect(seed).toContain("on conflict (code) do update set");
    expect(seed).toContain("v76-playbook-01");
    expect(seed).toContain("v76-playbook-05");
    expect(prepare).toContain("allowedCategories");
    expect(prepare).toContain("allowedLevels");
  });

  it("chỉ tạo seed/data tooling, không yêu cầu thay đổi UI Playbook", () => {
    expect(seed).not.toMatch(/alter table|create table|drop table/i);
  });
});
