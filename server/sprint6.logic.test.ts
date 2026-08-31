import { describe, expect, it } from "vitest";
import { buildAdvisorProgress, calculateDiscResult, containsPotentialContactPii, didClaimDailyQuizToday, getUtcDayStartIso, resolveSprint6Route, SPRINT6_ROUTE_IDS, sumXp, validateZeroPiiFeedback } from "../client/src/lib/sprint6Logic";

describe("Sprint 6 operational logic", () => {
  it("công bố đủ 13 màn hình điều hướng và luôn có fallback Hồ Sơ", () => {
    expect(SPRINT6_ROUTE_IDS).toHaveLength(13);
    expect(resolveSprint6Route("#disc")).toBe("disc");
    expect(resolveSprint6Route("#cover")).toBe("cover");
    expect(resolveSprint6Route("#community")).toBe("community");
    expect(resolveSprint6Route("#customer_journal")).toBe("customer_journal");
    expect(resolveSprint6Route("#heartbeat")).toBe("heartbeat");
    expect(resolveSprint6Route("#not-a-page")).toBe("profile");
  });

  it("tính DISC cơ bản và phân giải hòa điểm thành nhóm Hybrid", () => {
    expect(calculateDiscResult(["I", "I", "D", "S", "C"])).toBe("I");
    expect(calculateDiscResult(["D", "D", "I", "I", "S"])).toBe("DI");
    expect(calculateDiscResult(["D", "D", "C", "C", "I"])).toBe("DC");
    expect(calculateDiscResult(["I", "I", "S", "S", "D"])).toBe("IS");
    expect(calculateDiscResult(["S", "S", "C", "C", "I"])).toBe("SC");
    expect(calculateDiscResult(["D", "I", "S", "C"])).toBe("CHAMELEON");
    expect(calculateDiscResult([])).toBeNull();
  });

  it("cộng/trừ XP từ ledger thật, không áp một số XP mock", () => {
    expect(sumXp([{ xp_amount: 250 }, { xp_amount: 50 }, { xp_amount: -10 }])).toBe(290);
    expect(sumXp([])).toBe(0);
  });

  it("khôi phục trạng thái Quiz/XP/Streak từ Profile và daily_quiz ledger sau refresh", () => {
    expect(buildAdvisorProgress({ total_xp: 1_250, current_streak: 8, coin_balance: 75 }, 1)).toEqual({ total_xp: 1_250, current_streak: 8, coin_balance: 75, completed_quiz_today: true });
    expect(buildAdvisorProgress({ total_xp: null, current_streak: null }, 0)).toEqual({ total_xp: 0, current_streak: 0, coin_balance: 0, completed_quiz_today: false });
    expect(buildAdvisorProgress(null, 2).completed_quiz_today).toBe(true);
  });

  it("chỉ đánh dấu Daily Quiz hoàn tất khi ledger được tạo trong ngày UTC hiện tại", () => {
    const now = new Date("2026-08-13T17:35:00.000Z");
    expect(getUtcDayStartIso(now)).toBe("2026-08-13T00:00:00.000Z");
    expect(didClaimDailyQuizToday([{ reason: "daily_quiz", created_at: "2026-08-13T00:00:00.000Z" }], now)).toBe(true);
    expect(didClaimDailyQuizToday([{ reason: "daily_quiz", created_at: "2026-08-12T23:59:59.999Z" }], now)).toBe(false);
    expect(didClaimDailyQuizToday([{ reason: "daily_log", created_at: "2026-08-13T14:00:00.000Z" }], now)).toBe(false);
  });

  it("chặn thông tin liên hệ trong Góc Lắng Nghe để hỗ trợ Zero-PII", () => {
    expect(containsPotentialContactPii("Liên hệ 0901 234 567")).toBe(true);
    expect(containsPotentialContactPii("Email khach@example.com")).toBe(true);
    expect(validateZeroPiiFeedback("Bảo Bối", "Thêm bộ lọc theo cấp độ")).toBeNull();
    expect(validateZeroPiiFeedback("Bảo Bối", "Gọi 0901 234 567 để hỏi thêm")).toContain("Không thể gửi");
  });
});
