import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/bhnt-learning-hub-research";
const rawSource = readFileSync("/home/ubuntu/upload/pasted_content_186.txt", "utf8").replace(/\r\n/g, "\n");
const start = rawSource.indexOf("[\n  {");
const end = rawSource.indexOf("\n]\n\n2. RENDER", start);
if (start < 0 || end < 0) throw new Error("Không trích xuất được JSON V95.");
const source = rawSource.slice(start, end + 2).replace(
  '["A. Vậy em phải đổi sang bán thẻ sức khỏe rẻ hơn\', B. Theo em, vì sao khách lại cảm thấy số tiền đó là đắt?"]',
  '["A. Vậy em phải đổi sang bán thẻ sức khỏe rẻ hơn", "B. Theo em, vì sao khách lại cảm thấy số tiền đó là đắt?"]',
);
const principles = JSON.parse(source) as Array<{ type: string; prefix: string; situations: Array<{ options: string[]; correct_index: number }>; summary: { title: string; content: string; homework: string } }>;
const seed = readFileSync(`${root}/supabase/seeds/20260827045000_v95_full_learning_carousel_seed.sql`, "utf8");
const compass = readFileSync(`${root}/client/src/components/Sprint11LeaderModules.tsx`, "utf8");

describe("V95 Full-scale Learning Hub Carousel", () => {
  it("xác thực bốn nguyên tắc cùng situations và summary đầy đủ", () => {
    expect(principles).toHaveLength(4);
    expect(principles.map((item) => item.prefix)).toEqual(["01", "02", "03", "04"]);
    expect(principles.map((item) => item.situations.length)).toEqual([5, 2, 2, 2]);
    expect(principles.every((item) => item.type === "principle" && item.situations.every((situation) => situation.options.length === 2 && situation.correct_index >= 0 && situation.correct_index < 2) && Boolean(item.summary.title && item.summary.content && item.summary.homework))).toBe(true);
  });

  it("thay thế toàn bộ nguyên tắc nhưng bảo toàn coaching script", () => {
    expect(seed).toContain("delete from public.leader_playbook where type = 'principle';");
    expect(seed).toContain("Coaching scripts remain untouched.");
    expect(seed).toContain("v95-leader-principle-04");
    expect(seed).not.toContain("'coaching_script'");
  });

  it("gắn Carousel theo từng principle bằng renderer dùng dữ liệu động, không giới hạn riêng Maxwell", () => {
    expect(compass).toContain("principlesList.map((item, index)");
    expect(compass).toContain("const carousel = item.learning_carousel");
    expect(compass).toContain("const situations = carousel?.situations ?? []");
    expect(compass).toContain("Tình huống {activeStep + 1}/{situations.length}");
    expect(compass).toContain("activeStep === situations.length");
    expect(compass).toContain("summary.homework");
  });
});
