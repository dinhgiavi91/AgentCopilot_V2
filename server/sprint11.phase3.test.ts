import { describe, expect, it } from "vitest";
import { getNurtureSuggestion, nurtureContexts, validateCustomerJournalEntry } from "../client/src/lib/sprint9Logic";

describe("Sprint 11 Phase 3 CRM Zero-PII", () => {
  it("có bối cảnh Khác và gợi ý chạm an toàn không thúc ép bán", () => {
    expect(nurtureContexts.other).toContain("Khác");
    const suggestion = getNurtureSuggestion("pre_sale", "other");
    expect(suggestion.action).toContain("không định danh");
    expect(suggestion.cadence).toContain("7 ngày");
  });

  it("tiếp tục chặn email và số điện thoại khỏi nhật ký CRM", () => {
    expect(validateCustomerJournalEntry("Đã gửi note cho khach@example.com")).toContain("email");
    expect(validateCustomerJournalEntry("Đã gọi số 0901234567 để nhắc lịch")).toContain("số điện thoại");
  });
});
