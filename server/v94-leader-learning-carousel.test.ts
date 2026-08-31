import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/bhnt-learning-hub-research";
const source = readFileSync("/home/ubuntu/upload/pasted_content_185.txt", "utf8").replace(/\r\n/g, "\n");
const start = source.indexOf("[\n  {");
const end = source.indexOf("\n]\n*(AI Note:", start);
if (start < 0 || end < 0) throw new Error("Không trích xuất được payload V94.");
const [maxwell] = JSON.parse(source.slice(start, end + 2)) as Array<{ situations: Array<{ options: string[]; correct_index: number }>; summary: { title: string; content: string; homework: string } }>;
const migration = readFileSync(`${root}/supabase/migrations/20260827044000_v94_leader_learning_carousel.sql`, "utf8");
const seed = readFileSync(`${root}/supabase/seeds/20260827044100_v94_leader_learning_carousel_seed.sql`, "utf8");
const content = readFileSync(`${root}/client/src/lib/supabaseContent.ts`, "utf8");
const compass = readFileSync(`${root}/client/src/components/Sprint11LeaderModules.tsx`, "utf8");

describe("V94 Leader Learning Carousel", () => {
  it("xác thực năm tình huống Maxwell và summary đầy đủ", () => {
    expect(maxwell.situations).toHaveLength(5);
    expect(maxwell.situations.every((entry) => entry.options.length === 2 && entry.correct_index >= 0 && entry.correct_index < 2)).toBe(true);
    expect(maxwell.summary.title).toContain("TỔNG KẾT");
    expect(maxwell.summary.homework).toContain("BÀI TẬP");
  });

  it("lưu carousel có contract JSONB và chỉ cập nhật principle", () => {
    expect(migration).toContain("add column if not exists learning_carousel jsonb");
    expect(migration).toContain("non-rewarded summary/homework state");
    expect(seed).toContain("coaching scripts remain untouched");
    expect(seed).not.toContain("where type = 'coaching_script'");
    expect(content).toContain("learning_carousel?: LeadershipLearningCarousel | null");
    expect(content).toContain("mini_quiz, learning_carousel, created_at");
  });

  it("render từng bước, phản hồi tương phản cao, nút tiếp tục và summary homework", () => {
    expect(compass).toContain("const [activeStep, setActiveStep] = useState(0)");
    expect(compass).toContain("Tình huống {activeStep + 1}/{situations.length}");
    expect(compass).toContain("border-green-500 bg-green-50 text-green-900");
    expect(compass).toContain("border-amber-500 bg-amber-50 text-amber-900");
    expect(compass).toContain("Tiếp tục →");
    expect(compass).toContain("activeStep === situations.length");
    expect(compass).toContain("bg-[#1A365D]");
    expect(compass).toContain("summary.homework");
  });
});
