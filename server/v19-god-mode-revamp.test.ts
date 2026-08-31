import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dashboard = readFileSync("client/src/components/AdminHomeDashboard.tsx", "utf8");

describe("V19 God Mode dashboard revamp", () => {
  it("dùng hero SaaS-native có trạng thái Pilot OS và glow độc lập", () => {
    for (const token of ["Pilot OS · God Mode", "Trung Tâm Điều Hành Vĩ Mô", "bg-indigo-500", "blur-[100px]", "bg-emerald-500", "mix-blend-screen"]) expect(dashboard).toContain(token);
  });

  it("gắn sparkline SVG riêng trên bốn nhịp mà không giả dữ liệu chỉ số", () => {
    for (const token of ["sparklinePaths", "Xu hướng trực quan của", "viewBox=\"0 0 100 30\"", "Đường nét là tín hiệu xu hướng trực quan", "philosophy.recoveryRate", "philosophy.timeToInterventionHours", "philosophy.closedPolicies30d", "philosophy.peerGifts30d"]) expect(dashboard).toContain(token);
  });

  it("tích hợp App Health thật và giữ CMS Content/Question Bank", () => {
    for (const token of ["fetchAdminHomeTelemetry", "appHealth.dailyActiveRate", "appHealth.topFeature", "Nhịp hoạt động 7 ngày", "Hệ Sinh Thái Nội Dung", "Ngân Hàng Nạp Não", "Cấu Hình Cột Mốc Chuỗi"]) expect(dashboard).toContain(token);
    expect(dashboard).not.toContain("78%");
  });
});
