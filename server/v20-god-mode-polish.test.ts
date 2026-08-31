import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dashboard = readFileSync("client/src/components/AdminHomeDashboard.tsx", "utf8");

describe("V20 God Mode polish", () => {
  it("dùng tiêu đề điều hành vĩ mô với tương phản cao", () => {
    for (const token of ["Trung Tâm Điều Hành Vĩ Mô", "text-white", "drop-shadow-md", "bốn trụ cột"]) expect(dashboard).toContain(token);
    expect(dashboard).not.toContain(">Tổ Chức Sinh Học<");
  });

  it("có tooltip trợ năng diễn giải cách tính cho cả bốn nhịp", () => {
    for (const token of ["MetricInfo", "role=\"tooltip\"", "Time-to-Intervention", "Prep-to-Win", "ghi nhận tự nguyện"]) expect(dashboard).toContain(token);
  });

  it("làm sparkline co giãn đúng khu vực đáy card", () => {
    for (const token of ["preserveAspectRatio=\"none\"", "h-12", "overflow-hidden", "rounded-b-2xl", "viewBox=\"0 0 100 30\""]) expect(dashboard).toContain(token);
  });
});
