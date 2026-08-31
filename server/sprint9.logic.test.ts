import { describe, expect, it } from "vitest";
import { buildDirectorSummary, calculateFlexibleTarget, getEmpathySuggestion, getNurtureSuggestion, nextNurtureStreak, validateCustomerJournalEntry, validateJournalEntry } from "../client/src/lib/sprint9Logic";
import { resolveSprint6Route } from "../client/src/lib/sprint6Logic";

describe("Sprint 9 flexible core and empathy logic", () => {
  it("quy đổi mục tiêu BHNT/PNT theo đúng cấp bậc", () => {
    const newbie = calculateFlexibleTarget(10_000_000, 5_000_000, "newbie");
    const specialist = calculateFlexibleTarget(10_000_000, 5_000_000, "specialist");
    expect(newbie.totalIncome).toBe(15_000_000);
    expect(newbie.requiredMeetings).toBeGreaterThan(specialist.requiredMeetings);
    expect(specialist.rankLabel).toBe("Chuyên viên 1 năm");
  });

  it("giữ Nhật Ký Zero-PII trước khi đưa vào Community Feed", () => {
    expect(validateJournalEntry("Hôm nay mình đã kiên nhẫn lắng nghe nhu cầu bảo vệ.")).toBeNull();
    expect(validateJournalEntry("Gọi khách qua 0901234567 để nhắc lịch.")).toContain("số điện thoại");
  });

  it("trả về gợi ý Radar thấu cảm và tổng kết cho GĐ", () => {
    expect(getEmpathySuggestion("rejection").action).toContain("thực chiến");
    expect(buildDirectorSummary([{ type: "rejection" }, { type: "streak" }])).toContain("kỹ năng chuyển đổi");
  });

  it("giữ CRM Nhật Ký Khách Hàng ở dạng Zero-PII và gợi ý đúng bối cảnh", () => {
    expect(validateCustomerJournalEntry("Đã gửi checklist chuẩn bị tài chính cho gia đình.")).toBeNull();
    expect(validateCustomerJournalEntry("Nhắn tin theo số 0901234567 để nhắc khách.")).toContain("số điện thoại");
    expect(getNurtureSuggestion("pre_sale", "expecting").action).toContain("Cẩm nang đi sinh");
  });

  it("tăng chuỗi nuôi dưỡng khi TVV hoàn thành một chạm", () => {
    expect(nextNurtureStreak(3, true)).toBe(4);
    expect(nextNurtureStreak(0, true)).toBe(1);
    expect(nextNurtureStreak(5, false)).toBe(5);
  });

  it("mở đúng CRM từ direct hash route", () => {
    expect(resolveSprint6Route("#customer_journal")).toBe("customer_journal");
    expect(resolveSprint6Route("#community")).toBe("community");
  });
});
