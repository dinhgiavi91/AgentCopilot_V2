import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/bhnt-learning-hub-research";
const source = readFileSync("/home/ubuntu/upload/pasted_content_184.txt", "utf8").replace(/\r\n/g, "\n");
const jsonStart = source.indexOf("[\n  {");
const jsonEnd = source.indexOf("\n]\n\nPART 3:", jsonStart);
if (jsonStart < 0 || jsonEnd < 0) throw new Error("Không trích xuất được dữ liệu V92.");
const principles = JSON.parse(source.slice(jsonStart, jsonEnd + 2)) as Array<{ type: string; prefix: string; mini_quiz: { options: string[]; correct_index: number } }>;
const migration = readFileSync(`${root}/supabase/migrations/20260827043000_v92_leader_principle_mini_quiz.sql`, "utf8");
const seed = readFileSync(`${root}/supabase/seeds/20260827043100_v92_leader_principle_mini_quiz_seed.sql`, "utf8");
const content = readFileSync(`${root}/client/src/lib/supabaseContent.ts`, "utf8");
const compass = readFileSync(`${root}/client/src/components/Sprint11LeaderModules.tsx`, "utf8");

describe("V92 Leader principle mini-quiz", () => {
  it("giữ đúng năm nguyên tắc, mỗi nguyên tắc có hai lựa chọn và đáp án hợp lệ", () => {
    expect(principles).toHaveLength(5);
    expect(principles.every((item) => item.type === "principle" && item.mini_quiz.options.length === 2 && item.mini_quiz.correct_index >= 0 && item.mini_quiz.correct_index < 2)).toBe(true);
    expect(principles.map((item) => item.prefix)).toEqual(["01", "02", "03", "04", "05"]);
  });

  it("lưu mini-quiz có contract JSONB và seed chỉ cập nhật/append principle", () => {
    expect(migration).toContain("add column if not exists mini_quiz jsonb");
    expect(migration).toContain("feedback only, never grants XP, coin, or reward");
    expect(seed).toContain("-- V92: Update only Leader principles. Coaching scripts remain untouched.");
    expect(seed).not.toContain("'coaching_script'");
    expect(seed).toContain("v92-leader-principle-03");
    expect(content).toContain("mini_quiz?: LeadershipMiniQuiz | null");
    expect(content).toContain("mini_quiz, learning_carousel, created_at");
  });

  it("giữ mô tả xuống dòng, không hiển thị Gửi Team và không gắn thưởng", () => {
    expect(compass).toContain('className="whitespace-pre-wrap"');
    expect(compass).not.toContain("Gửi Team");
    expect(compass).not.toContain("XP");
    expect(compass).not.toContain("coin");
  });
});
