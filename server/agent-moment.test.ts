import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/bhnt-learning-hub-research";
const home = readFileSync(`${root}/client/src/pages/Home.tsx`, "utf8");
const app = readFileSync(`${root}/client/src/App.tsx`, "utf8");
const card = readFileSync(`${root}/client/src/components/AgentMomentCard.tsx`, "utf8");
const leaderMomentCreator = readFileSync(`${root}/client/src/components/LeaderMomentCreator.tsx`, "utf8");
const shareScreen = readFileSync(`${root}/client/src/components/MomentShareScreen.tsx`, "utf8");
const profileSettings = readFileSync(`${root}/client/src/components/AgentProfileSettings.tsx`, "utf8");
const pilotStep2 = readFileSync(`${root}/client/src/components/PilotStep2Modules.tsx`, "utf8");

describe("Kho Quà strict Tailwind recovery", () => {
  it("giới hạn Toast ở đúng một thông báo tự đóng", () => {
    expect(app).toContain('<Toaster position="top-right" duration={3000} closeButton={true} visibleToasts={1} />');
  });

  it("render Pure Card qua Moment Share Screen thay vì JSX card inline", () => {
    expect(home).toContain('import { MomentShareScreen } from "../components/MomentShareScreen"');
    expect(home).toContain("<MomentShareScreen");
    expect(home).toContain("teamName,");
    for (const token of ["export type MomentTheme", "theme?: MomentTheme", "heroTitleGold?: string", "heroTitleBottom?: string", "agentAvatar?: string", "recognitionType?: RecognitionType", "teamName?: string", "rewardImage?: string", "Hành trình cá nhân", "Leader tiếp lửa", "Team ${displayTeamName}", "LAUREL_WREATH_IMAGE", "laurel-wreath-3d-gold_eb5fed57.png", "Recognition Seal", "text-slate-600", "text-[9.5px]", "whitespace-nowrap", "max-w-[70px]", "sm:max-w-[110px]", "themeAssetMap", "trophyMoment", "growthMoment", "heartMoment", "const heroAssetUrl", "avatarFailed", "Avatar TVV", "OFFICIAL_LOGO", "max-w-[460px]", "h-[240px] bg-slate-50 sm:h-[260px]", "h-[280px]", "backgroundPosition: isRecognition ? \"center right\" : \"center\"", "from-white/90 via-white/10 to-transparent", "from-[#0B1431] via-[#0B1431]/80 to-transparent", "border-emerald-100 bg-white/90 text-emerald-700", "border-amber-500/30 bg-amber-500/20 text-amber-400", "text-[#0B1431]", "text-slate-700", "#047857, #064E3B, #0F766E", "w-[65%] sm:w-[60%]", "pt-2 pb-1 text-[22px]", "leading-[1.2]", "backgroundClip: \"text\"", "color: \"transparent\"", "-mt-4 rounded-t-[24px] pt-6", "!isRecognition &&", "w-full", "px-6 sm:px-8", "flex flex-col gap-4", "sm:gap-5", "-mt-10", "h-20 w-20", "system-ui, -apple-system, sans-serif", "text-amber-500/40", "bg-gradient-to-br from-amber-50/80 to-orange-50/40", "animate-pulse", "grayscale opacity-70", "Trợ Lý Đội Ngũ"]) expect(card).toContain(token);
    expect(card).not.toContain("CalendarClock");
    expect(card).not.toContain("<button");
    expect(card).not.toContain("CỘT MỐC ĐÁNG NHỚ");
  });

  it("truyền nền Heart Emerald sáng vào Live Preview của Leader", () => {
    expect(leaderMomentCreator).toContain("BRIGHT_HEART_ASSET");
    expect(leaderMomentCreator).toContain("heart-emerald-bright-3d_6d6779c0.png");
    expect(leaderMomentCreator).toContain("bgAssetUrl={BRIGHT_HEART_ASSET}");
  });

  it("giữ Privacy by Choice trong Share Screen ngoài vùng capture", () => {
    expect(home).toContain('const [rewardShareMode, setRewardShareMode] = useState<"team" | "leader" | "hidden">("team")');
    expect(home).toContain("onRewardShareModeChange={setRewardShareMode}");
    expect(home).toContain("recognitionType = rewardShareMode === \"hidden\"");
    for (const token of ["Tùy chỉnh hiển thị", 'rewardShareMode === mode', "Không hiển thị"]) expect(shareScreen).toContain(token);
    expect(home).toContain("teamName,");
  });

  it("capture đúng Universal Master Card bằng toPng", () => {
    for (const token of ["import { toPng } from \"html-to-image\"", "const cardId = `agent-moment-${redemption.id}`", "downloadAgentMoment(cardId, redemption.rewardName)", "document.getElementById(elementId)", "data-export-decoration='true'", "className.startsWith(\"backdrop-blur-\")", "className.startsWith(\"shadow-\")", "removedEffectClasses", "toPng(element", "cacheBust: true", "pixelRatio: Math.min", "position: \"relative\"", "boxShadow: \"none\"", "link.click()", "AgentMoment_"]) expect(home).toContain(token);
    expect(shareScreen).toContain("TẢI ẢNH KHOE THÀNH TÍCH");
    expect(card).toContain('id="gift-icon-overlay"');
    expect(card).toContain("data-export-ignore");
    expect(card).not.toContain("data-capture-exclude");
    expect(home).toContain("data-export-ignore");
  });

  it("có caption định sẵn, copy Sonner và CTA chia sẻ cộng đồng", () => {
    for (const token of ["Không phải ngày nào cũng dễ dàng", "#HanhTrinhPhatTrien", "navigator.clipboard?.writeText", "toast.success", "LAN TỎA VÀO CỘNG ĐỒNG", "copyCaptionToClipboard"]) expect(shareScreen).toContain(token);
  });

  it("đưa Visual DNA profile vào Header, Greeting và Agent Moment mà không thêm nút vào ảnh tải", () => {
    for (const token of ["AgentProfileSettings", "AgentDashboardGreeting", "LeaderCommandCenter", "agent-copilot-profile-preferences-", "agentDisplayName", "agentAvatar: agentProfile.avatarUrl", "userName={agentDisplayName}", "companionName={CORE_CAST_AVATARS.find", "onOpenProfileSettings"]) expect(home).toContain(token);
    for (const token of ["CORE_CAST_AVATARS", "Navigator", "Nurturer", "Wise Copilot", "Loyal Guardian", "Tải ảnh thật", "Lưu lựa chọn", "MAX_LOCAL_AVATAR_BYTES"]) expect(profileSettings).toContain(token);
    for (const token of ["HeaderProfileWidget", "userAvatar", "onOpenSettings={onOpenProfileSettings", "onLogout={() => void logout()}"]) expect(pilotStep2).toContain(token);
    expect(card).not.toContain("<button");
  });

  it("phục hồi Streak Widget trong body Dashboard để thúc đẩy retention", () => {
    expect(home).toContain('import AgentStreakWidget from "../components/AgentStreakWidget"');
    expect(home).toContain("<AgentStreakWidget");
  });

  it("đặt Streak Widget dưới lời chào và kết nối CTA Chi tiết với modal root", () => {
    for (const token of [
      'import AgentStreakWidget from "../components/AgentStreakWidget"',
      'import AgentStreakDetailsModal from "../components/AgentStreakDetailsModal"',
      "const [streakDetailsOpen, setStreakDetailsOpen] = useState(false)",
      "currentStreak={currentStreakDays}",
      "onDetails={() => setStreakDetailsOpen(true)}",
      "<AgentStreakDetailsModal",
      "isOpen={streakDetailsOpen}",
      "onClose={() => setStreakDetailsOpen(false)}",
    ]) expect(home).toContain(token);
    expect(home.indexOf("<AgentDashboardGreeting")).toBeLessThan(home.indexOf("<AgentStreakWidget"));
  });

  it("giữ Floating Dock chỉ cho XP và Xu, không còn phân tán Streak", () => {
    for (const token of [
      'import FloatingGamificationDock from "../components/FloatingGamificationDock"',
      "<FloatingGamificationDock",
      "xp={xpTotal}",
      "onHonorClick={showLedger}",
      "setRewardStoreTab(\"catalog\")",
      "setXpStoreOpen(true)",
    ]) expect(home).toContain(token);
    expect(home).not.toContain("onOpenStreakModal={() => setStreakDetailsOpen(true)}");
    expect(home).not.toContain('import HeaderGamificationBar from "../components/HeaderGamificationBar"');
    expect(home).not.toContain("<HeaderGamificationBar");
  });

  it("thay Radar Leader cũ bằng Leader Command Center", () => {
    expect(home).toContain('import LeaderCommandCenter from "../components/LeaderCommandCenter"');
    expect(home).toContain("<LeaderCommandCenter");
    expect(home).not.toContain("<PilotRadar session={pilotSession}");
    expect(home).not.toContain("<LeaderTargetOverview />");
  });

  it("loại bỏ CTA Ghi hoạt động trùng lặp trong thẻ Pilot", () => {
    expect(home).toContain("<PilotAdvisorDailyStart session={pilotSession} />");
    expect(pilotStep2).not.toContain("Ghi hoạt động");
  });
});
