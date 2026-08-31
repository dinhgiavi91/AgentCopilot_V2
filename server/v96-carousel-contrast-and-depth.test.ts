import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/bhnt-learning-hub-research";
const source = readFileSync("/home/ubuntu/upload/pasted_content_187.txt", "utf8").replace(/\r\n/g, "\n");
const start = source.indexOf("[\n  {");
const end = source.lastIndexOf("\n]");
if (start < 0 || end < start) throw new Error("Không trích xuất được payload V96.");
const principles = JSON.parse(source.slice(start, end + 2)) as Array<{ prefix: string; situations: Array<{ options: string[]; correct_index: number }>; summary: { title: string; content: string; homework: string } }>;
const seed = readFileSync(`${root}/supabase/seeds/20260827046000_v96_expanded_learning_carousel_seed.sql`, "utf8");
const compass = readFileSync(`${root}/client/src/components/Sprint11LeaderModules.tsx`, "utf8");

describe("V96 Carousel contrast and scenario depth", () => {
  it("xác thực nguyên tắc 02–04 đều có bốn tình huống và summary", () => {
    expect(principles.map((item) => item.prefix)).toEqual(["02", "03", "04"]);
    expect(principles.map((item) => item.situations.length)).toEqual([4, 4, 4]);
    expect(principles.every((item) => item.situations.every((situation) => situation.options.length === 2 && situation.correct_index >= 0 && situation.correct_index < 2) && Boolean(item.summary.title && item.summary.content && item.summary.homework))).toBe(true);
  });

  it("chỉ cập nhật nguyên tắc 02–04, không chạm nguyên tắc 01 hay coaching", () => {
    expect(seed).toContain("Expand principles 02–04 only");
    expect(seed).toContain("Principle 01 and all coaching scripts remain untouched.");
    expect(seed).toContain("prefix = '02'");
    expect(seed).toContain("prefix = '04'");
    expect(seed).not.toContain("prefix = '01'");
  });

  it("render selected state và explanation với nền nhạt cùng chữ tối, summary Navy/Gold", () => {
    expect(compass).toContain("border-green-500 bg-green-50 text-green-900");
    expect(compass).toContain("border-amber-500 bg-amber-50 text-amber-900");
    expect(compass).toContain("border-green-200 bg-green-50 text-green-800");
    expect(compass).toContain("border-amber-200 bg-amber-50 text-amber-800");
    expect(compass).toContain('className={correct ? "text-green-900" : "text-amber-900"}');
    expect(compass).toContain("bg-[#1A365D]");
    expect(compass).toContain("text-yellow-400");
  });
});
