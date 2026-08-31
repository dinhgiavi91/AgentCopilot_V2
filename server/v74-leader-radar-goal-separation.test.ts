import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const commandCenter = readFileSync(new URL("../client/src/components/LeaderCommandCenter.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");

describe("V74 tách Goal Progress khỏi Team Radar", () => {
  it("lọc Radar theo TVV cấp dưới, loại self signal và leader goal signal", () => {
    expect(commandCenter).toContain('const advisorIds = new Set(teamMembers.filter((member) => member.role === "advisor")');
    expect(commandCenter).toContain("signal.user_id !== session?.userId");
    expect(commandCenter).toContain('signal.metadata?.rule_key !== "leader_goal_pace_v70"');
    expect(commandCenter).toContain("const prioritizedSignals = useMemo(() => teamSignals");
    expect(commandCenter).toContain("for (const signal of teamSignals)");
  });

  it("hiển thị TVV và CTA hỗ trợ theo SignalInterventionModal, không dùng CTA cũ", () => {
    expect(commandCenter).toContain('aria-label={`Avatar ${signal.advisor_display_name}`}');
    expect(commandCenter).toContain("Hỗ trợ TVV này 🤝");
    expect(commandCenter).not.toContain("Hỗ trợ ngay 🤝");
    expect(commandCenter).toContain("setSelectedSignal(signal)");
    expect(commandCenter).toContain("<SignalInterventionModal signal={selectedSignal}");
  });

  it("đưa bốn chỉ số cá nhân sang Goal Tracker cùng trạng thái, thanh tiến độ và không có nút hỗ trợ", () => {
    expect(commandCenter).toContain("function GoalProgressTracker");
    expect(commandCenter).toContain("Tiến Độ Mục Tiêu Quản Trị");
    for (const label of ["Thu nhập làm gương", "Tuyển dụng", "Active Rate", "Ca Coaching"]) expect(commandCenter).toContain(label);
    expect(commandCenter).toContain('status === "Đang chậm nhịp"');
    expect(commandCenter).toContain('status === "Đúng tiến độ"');
    const tracker = commandCenter.slice(commandCenter.indexOf("function GoalProgressTracker"), commandCenter.indexOf("export default function LeaderCommandCenter"));
    expect(tracker).not.toContain("Hỗ trợ TVV này");
    expect(commandCenter).toContain("<GoalProgressTracker snapshot={goalRadar} onOpenGoalSettings={onOpenGoalSettings} />");
  });

  it("nối nút điều chỉnh tracker với đúng modal mục tiêu Leader hiện hữu", () => {
    expect(commandCenter).toContain("onOpenGoalSettings?: () => void");
    expect(commandCenter).toContain("onClick={onOpenGoalSettings}");
    expect(home).toContain("<LeaderCommandCenter session={pilotSession} onToast={toast.success} onOpenGoalSettings={openSprint11Target}");
  });
});
