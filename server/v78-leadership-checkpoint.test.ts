import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { calculateLeadershipTraitResult, isLeadershipTrait } from "../client/src/lib/leadershipTestLogic";

const seed = JSON.parse(readFileSync("/home/ubuntu/upload/pasted_content_176.txt", "utf8"));
const migration = readFileSync(new URL("../supabase/migrations/20260827020000_v78_leadership_checkpoint.sql", import.meta.url), "utf8");
const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");

describe("V78 Leadership Checkpoint", () => {
  it("giữ đúng contract JSON gồm disclaimer, ba câu hỏi và bốn phong cách", () => {
    expect(seed.intro_disclaimer.title).toBe("Khám Phá Phong Cách Lãnh Đạo Nội Tại");
    expect(seed.questions).toHaveLength(3);
    expect(Object.keys(seed.results).sort()).toEqual(["Architect", "Coach", "Nurturer", "Visionary"]);
    expect(seed.questions.every((question: { options: unknown[] }) => question.options.length === 4)).toBe(true);
  });

  it("tính kết quả theo trait có tally cao nhất và tie-break xác định", () => {
    expect(calculateLeadershipTraitResult(["Coach", "Architect", "Coach"])).toBe("Coach");
    expect(calculateLeadershipTraitResult(["Visionary", "Architect"])).toBe("Visionary");
    expect(calculateLeadershipTraitResult([])).toBeNull();
    expect(isLeadershipTrait("Nurturer")).toBe(true);
    expect(isLeadershipTrait("D")).toBe(false);
  });

  it("giữ source, RLS và RPC checkpoint dành riêng cho leader/super_admin", () => {
    expect(migration).toContain("create table if not exists public.leadership_tests");
    expect(migration).toContain("add column if not exists leadership_style text");
    expect(migration).toContain("profiles.role in ('leader', 'super_admin')");
    expect(migration).toContain("complete_my_leadership_checkpoint_v1");
    expect(migration).toContain("v_role not in ('leader', 'super_admin')");
  });

  it("chuyển Hero, disclaimer và wizard theo role mà bảo toàn nhánh DISC", () => {
    expect(home).toContain('const usesLeadershipCheckpoint = pilotManager');
    expect(home).toContain('Dẫn dắt đúng.');
    expect(home).toContain('Khám phá phong cách quản trị đội ngũ của bạn.');
    expect(home).toContain('leadershipTest.intro_disclaimer.title');
    expect(home).toContain('chooseLeadershipAnswer(option.trait)');
    expect(home).toContain('completeLeadershipCheckpoint(result)');
    expect(home).toContain('calculateDiscResult(Object.values(answers))');
  });
});
