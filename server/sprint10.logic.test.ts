import { describe, expect, it } from "vitest";
import { calculateIncomeMeetingPlan } from "../client/src/lib/sprint10Logic";

describe("Sprint 10 income meeting formula", () => {
  it("quy đổi thu nhập theo hoa hồng và size hợp đồng thay vì phễu cố định", () => {
    expect(calculateIncomeMeetingPlan({ targetIncome: 30_000_000, commissionRatePercent: 40, averageContractSize: 25_000_000 })).toEqual({ expectedCommissionPerContract: 10_000_000, requiredContracts: 3, requiredMeetings: 9 });
    expect(calculateIncomeMeetingPlan({ targetIncome: 40_000_000, commissionRatePercent: 40, averageContractSize: 25_000_000 })).toEqual({ expectedCommissionPerContract: 10_000_000, requiredContracts: 4, requiredMeetings: 12 });
  });

  it("không tạo số cuộc gặp khi chưa có đủ dữ liệu đầu vào", () => {
    expect(calculateIncomeMeetingPlan({ targetIncome: 30_000_000, commissionRatePercent: 0, averageContractSize: 25_000_000 }).requiredMeetings).toBe(0);
    expect(calculateIncomeMeetingPlan({ targetIncome: 0, commissionRatePercent: 40, averageContractSize: 25_000_000 }).requiredContracts).toBe(0);
  });
});
