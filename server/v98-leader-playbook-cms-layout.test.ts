import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/bhnt-learning-hub-research";
const cms = readFileSync(`${root}/client/src/components/AdminLeaderPlaybook.tsx`, "utf8");
const compass = readFileSync(`${root}/client/src/components/Sprint11LeaderModules.tsx`, "utf8");

describe("V98 Leader Playbook CMS layout and summary contrast", () => {
  it("mở rộng modal và tách desktop thành dashboard 12 cột có hai vùng cuộn độc lập", () => {
    expect(cms).toContain('w-[95vw] !max-w-7xl min-h-[85vh] overflow-hidden');
    expect(cms).toContain("h-[92vh]");
    expect(cms).toContain("lg:grid-cols-12");
    expect(cms).toContain("lg:col-span-4");
    expect(cms).toContain("lg:col-span-8");
    expect(cms).toContain("lg:max-h-[80vh]");
    expect(cms).toContain("overflow-y-auto");
  });

  it("đặt mỗi tình huống trong card có khoảng cách, label và CTA thêm toàn chiều rộng", () => {
    expect(cms).toContain("space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4");
    for (const field of ["Câu hỏi", "Lựa chọn A", "Lựa chọn B", "Giải thích khi đúng", "Giải thích khi sai"]) expect(cms).toContain(field);
    expect(cms).toContain("min-h-11 w-full items-center justify-center");
    expect(cms).toContain("Thêm tình huống");
  });

  it("cưỡng chế nội dung Summary thành trắng/vàng, kể cả homework", () => {
    expect(compass).toContain("!text-white");
    expect(compass).toContain("!text-yellow-400");
    expect(compass).toContain("!text-gray-50");
    expect(compass).toContain("!text-yellow-100");
  });
});
