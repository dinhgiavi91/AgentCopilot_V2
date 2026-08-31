import { describe, expect, it } from "vitest";
import { calculateAdvisorTargetPlan, calculateLeaderTargetPlan, getDailyMotivation } from "../client/src/lib/sprint11Logic";

describe("Sprint 11 target logic", () => {
  it("tách công thức BHNT và PNT theo hoa hồng, size hợp đồng riêng", () => {
    const plan = calculateAdvisorTargetPlan(
      { incomeTarget: 30_000_000, commissionRate: 40, averageContractSize: 25_000_000 },
      { incomeTarget: 10_000_000, commissionRate: 15, averageContractSize: 8_000_000 },
    );
    expect(plan.bhntContracts).toBe(3);
    expect(plan.pntContracts).toBe(9);
    expect(plan.requiredContracts).toBe(12);
    expect(plan.requiredMeetings).toBe(36);
  });

  it("dùng KPI đội thay vì thu nhập cá nhân ở vai trò Leader", () => {
    const plan = calculateLeaderTargetPlan({ bhntRevenue: 500_000_000, pntRevenue: 120_000_000, activeAdvisorTarget: 12, recruitTarget: 3 });
    expect(plan.totalRevenue).toBe(620_000_000);
    expect(plan.priority).toContain("12 TVV active");
    expect(plan.recruitTarget).toBe(3);
  });

  it("tạo câu động lực có tên Team mà không chứa dữ liệu khách hàng", () => {
    expect(getDailyMotivation("MDRT Alpha", 2)).toMatch(/^MDRT Alpha:/);
  });
});
