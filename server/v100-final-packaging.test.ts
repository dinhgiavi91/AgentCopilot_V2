import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const streak = readFileSync(new URL("../client/src/components/AgentStreakWidget.tsx", import.meta.url), "utf8");
const community = readFileSync(new URL("../client/src/components/PilotStep4SocialModules.tsx", import.meta.url), "utf8");

describe("V100 final packaging lite", () => {
  it("giữ Daily Push theo ngày cho TVV và Leader, chỉ đóng sau persisted completion", () => {
    expect(home).toContain('const quizPlayer = pilotSession?.profile.role === "advisor" || pilotSession?.profile.role === "leader"');
    expect(home).toContain("const todayDateKey = new Date().toISOString().slice(0, 10);");
    expect(home).toContain("const completedQuizToday = lastQuizDate === todayDateKey");
    expect(home).toContain("window.setTimeout(() => setDailyPushOpen(true), 4000");
    expect(home).toContain("<Modal onClose={() => setDailyPushOpen(false)}>");
    expect(home).toContain('aria-label="Đóng Nạp Não Mỗi Sáng"');
    expect(home).toContain("Bỏ qua hôm nay");
    expect(home).toContain('toast.success("Đã ghi nhận câu trả lời.")');
    expect(home).toContain("claimDailyQuizXp");
    expect(home).toContain("const hasCompletedDisc = Boolean(discBadge);");
    expect(home).toContain("border-green-200 bg-green-50 p-4 text-green-800");
    expect(home).toContain("border-orange-200 bg-orange-50 p-4 text-orange-800");
    expect(home).toContain("border-blue-200 bg-blue-50 p-4 text-blue-900");
  });

  it("hiển thị nhắc streak khi Daily Push hôm nay còn thiếu", () => {
    expect(streak).toContain("dailyQuizPending?: boolean;");
    expect(streak).toContain("Bạn đang có chuỗi {progress.currentStreak} ngày!");
    expect(home).toContain("dailyQuizPending={dailyQuizNeedsCompletion}");
  });

  it("tái sử dụng Journey cho Leader và có đủ CTA Community", () => {
    expect(home).toContain('(pilotSession?.profile.role === "advisor" || pilotSession?.profile.role === "leader")');
    expect(home).toContain("Hành Trình Của Tôi");
    expect(community).toContain('aria-label="❤️ Thích"');
    expect(community).toContain('aria-label="💬 Bình luận"');
    expect(community).toContain('aria-label="📤 Chia sẻ"');
    expect(community).toContain("hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg px-4 py-2 font-semibold");
    expect(community).toContain("bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 mb-6 overflow-hidden");
    expect(community).toContain("ring-2 ring-blue-500 ring-offset-2");
    expect(community).toContain("bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold px-3 py-1 rounded-full text-xs");
    expect(community).toContain("bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 font-bold");
    expect(community).toContain("bg-gray-100 rounded-full px-4 py-2 border-none focus:ring-2 focus:ring-blue-500");
    expect(community).toContain("bg-blue-600 text-white rounded-full p-2");
  });
});
