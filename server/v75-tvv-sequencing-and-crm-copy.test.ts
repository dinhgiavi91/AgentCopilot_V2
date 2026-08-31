import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { stripCrmSuggestionPrefix } from "../client/src/components/Sprint11CrmModules";

const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const crm = readFileSync(new URL("../client/src/components/Sprint11CrmModules.tsx", import.meta.url), "utf8");

describe("V75 TVV sequencing và CRM copy", () => {
  it("chờ lời chào hoàn tất rồi kích hoạt Daily Push cho TVV và Leader sau 4 giây", () => {
    expect(home).toContain('const quizPlayer = pilotSession?.profile.role === "advisor" || pilotSession?.profile.role === "leader"');
    expect(home).toContain("&& !welcomeOpen");
    expect(home).toContain("window.setTimeout(() => setDailyPushOpen(true), 4000");
    expect(home).toContain("return () => window.clearTimeout(timer);");
    expect(home).toContain("const completedQuizToday = lastQuizDate === todayDateKey");
    expect(home).not.toContain("const shownKey = `agent-copilot-daily-push-");
  });

  it("giữ chuỗi và đóng Nạp Não chỉ sau khi persisted completion thành công", () => {
    expect(home).toContain("setLastQuizDate(todayDateKey);");
    expect(home).toContain("setAdvisorProgress((current) => ({ total_xp: reward.totalXp, current_streak: reward.currentStreak");
    expect(home).toContain("if (!reward) {");
    expect(home).toContain("setQuizDone(false);");
  });

  it("tái sử dụng Hành Trình cho Leader và lưu Result Card DISC cho TVV", () => {
    expect(home).toContain('(pilotSession?.profile.role === "advisor" || pilotSession?.profile.role === "leader")');
    expect(home).toContain("Hành Trình Của Tôi");
    expect(home).toContain("discBadge\n                ? `Hồ sơ hiện tại: Nhóm ${discBadge}`");
  });

  it("loại prefix đã có sẵn để nhãn Gợi ý thấu cảm chỉ xuất hiện một lần", () => {
    expect(stripCrmSuggestionPrefix("Chạm cảm xúc: hỏi thăm sự chuẩn bị.", "emotional")).toBe("hỏi thăm sự chuẩn bị.");
    expect(stripCrmSuggestionPrefix("Hành động/Thuyết phục: gửi checklist ngắn.", "action")).toBe("gửi checklist ngắn.");
    expect(stripCrmSuggestionPrefix("Lưu ý dài hạn: hẹn chạm lại sau 7 ngày.", "longTerm")).toBe("hẹn chạm lại sau 7 ngày.");
    expect(stripCrmSuggestionPrefix("Nội dung chưa có nhãn", "emotional")).toBe("Nội dung chưa có nhãn");
    expect(crm).toContain('stripCrmSuggestionPrefix(scenario.emotionalTouch, "emotional")');
    expect(crm).toContain('stripCrmSuggestionPrefix(scenario.actionPersuasion, "action")');
    expect(crm).toContain('stripCrmSuggestionPrefix(scenario.longTermNote, "longTerm")');
  });
});
