// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LeaderCommandCenter from "../client/src/components/LeaderCommandCenter";
import { drawSmartTarotCard, fetchExecutivePerformanceReport, fetchLeaderGoalRadarSnapshot, fetchLeaderTeamReport, fetchPilotSignals, fetchTeamGiftRecipients, fetchTeamRecoveryWatchlist } from "../client/src/lib/supabaseContent";

vi.mock("../client/src/lib/supabaseContent", () => ({
  fetchLeaderTeamReport: vi.fn(),
  fetchLeaderGoalRadarSnapshot: vi.fn(),
  fetchPilotSignals: vi.fn(),
  fetchTeamGiftRecipients: vi.fn(),
  fetchTeamRecoveryWatchlist: vi.fn(),
  fetchExecutivePerformanceReport: vi.fn(),
  drawSmartTarotCard: vi.fn(),
}));

vi.mock("../client/src/components/PilotStep2Modules", () => ({
  SignalInterventionModal: ({ signal, onClose }: { signal: { advisor_display_name: string }; onClose: () => void }) => (
    <div role="dialog"><span>COPILOT RECOMMENDATION · {signal.advisor_display_name}</span><button onClick={onClose}>Đóng intervention</button></div>
  ),
}));

const leaderSession = {
  userId: "leader-1",
  profile: { role: "leader", display_name: "Leader", xp_balance: 0 },
} as any;

const report = {
  activeAdvisors: 4,
  touchesThisWeek: 24,
  completedFollowupsThisWeek: 8,
  openFollowups: 3,
  newSignals: 3,
  actedOnSignals: 1,
  interventionsThisWeek: 5,
  weeklyTouches: [],
};

const signal = {
  id: "signal-1",
  user_id: "advisor-1",
  team_id: "team-1",
  advisor_display_name: "TVV A",
  signal_type: "low_activity",
  window_days: 7,
  threshold_version: "v1",
  severity: "high",
  summary: "Nhịp hoạt động đang giảm trong kỳ theo dõi.",
  detected_at: new Date().toISOString(),
  status: "new",
  metadata: { activity_count: 2 },
  created_at: new Date().toISOString(),
};

afterEach(() => cleanup());

describe("LeaderCommandCenter", () => {
  beforeEach(() => {
    vi.mocked(fetchLeaderTeamReport).mockResolvedValue(report);
    vi.mocked(fetchLeaderGoalRadarSnapshot).mockResolvedValue({ monthStart: "2026-08-01", monthEnd: "2026-08-31", goals: { personalIncome: 0, recruitmentOutreach: 0, activeRatePercent: 0, coachingSessions: 10 }, actuals: { personalIncome: 0, recruitmentOutreach: 0, activeRatePercent: 0, activeAdvisors: 4, activeAdvisorsActual: 4, coachingSessions: 2 }, openSignals: [{ metricKey: "coaching_sessions", severity: "high", summary: "Low Coaching: đã hoàn tất 2/10 ca Coaching 1:1.", actual: 2, goal: 10 }] });
    vi.mocked(fetchPilotSignals).mockResolvedValue([signal] as any);
    vi.mocked(fetchTeamGiftRecipients).mockResolvedValue([
      { id: "advisor-1", displayName: "TVV A", role: "advisor" },
      { id: "advisor-2", displayName: "TVV B", role: "advisor" },
      { id: "advisor-3", displayName: "TVV C", role: "advisor" },
      { id: "advisor-4", displayName: "TVV D", role: "advisor" },
    ] as any);
    vi.mocked(fetchExecutivePerformanceReport).mockResolvedValue({ teamName: "Team Pilot", rangeStart: new Date().toISOString(), rangeEnd: new Date().toISOString(), totalActivity: 4, leaderInterventions: 1, totalSelfReportedRevenue: 0, teamMoraleScore: 0, rows: [] });
    vi.mocked(fetchTeamRecoveryWatchlist).mockResolvedValue({ totalInterventions: 1, recoveredCount: 0, measurableOutcomes: 0, recoveryRate: null, items: [{ id: "intervention-1", memberName: "TVV A", signalType: "low_activity", signalSummary: "Nhịp hoạt động giảm", interventionType: "coaching_1on1", actionStatus: "planned", actionDate: "2026-08-20", recoveryStatus: "monitoring", measuredAt: null }] });
    vi.mocked(drawSmartTarotCard).mockResolvedValue({ signalTrigger: "team_slow", reusedThisWeek: false, card: { id: "card-1", signalTrigger: "team_slow", cardTitle: "HỎA LONG XUẤT TRẬN", crypticQuote: "Tín hiệu tích cực.", actionableAdvice: "Giữ nhịp chăm sóc Team.", createdAt: new Date().toISOString() } } as any);
  });

  it("hiển thị Control Bar, Vital Signs, Matrix, Watchlist và Action Radar bằng dữ liệu Team", async () => {
    render(<LeaderCommandCenter session={leaderSession} onToast={vi.fn()} />);
    expect(await screen.findByText("Radar Thấu Cảm & Hiệu Suất")).toBeTruthy();
    expect(screen.getByText("Năng lượng Team")).toBeTruthy();
    expect(screen.getByText("Chỉ số Động lực")).toBeTruthy();
    expect(screen.getByText("Cần Thấu Cảm")).toBeTruthy();
    expect(screen.getByText("Kết quả Team")).toBeTruthy();
    expect(screen.getByText("Ngân sách Động viên")).toBeTruthy();
    expect(screen.getByText("Ma Trận Hiệu Suất")).toBeTruthy();
    expect(screen.getByText("Tín Hiệu Radar")).toBeTruthy();
    expect(screen.getByText("Tiến Độ Mục Tiêu Quản Trị")).toBeTruthy();
    expect(screen.getAllByText("TVV A").length).toBeGreaterThan(0);
    expect(screen.getByText("Tiến độ Phục hồi (Watchlist)")).toBeTruthy();
    expect(screen.getByText("4/4")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Hỗ trợ TVV này/ })).toBeTruthy();
  });

  it("mở Intervention Playbook và Executive Report từ Action Radar", async () => {
    render(<LeaderCommandCenter session={leaderSession} onToast={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: /Hỗ trợ TVV này/ }));
    expect((await screen.findByRole("dialog")).textContent).toContain("COPILOT RECOMMENDATION · TVV A");
    fireEvent.click(screen.getByRole("button", { name: /Xuất Báo Cáo/ }));
    expect(await screen.findByRole("dialog", { name: "Báo cáo Hiệu suất Cấp cao" })).toBeTruthy();
  });

  it("mở Từ điển Tham mưu từ nút info và deep-link tới đúng chỉ số", async () => {
    render(<LeaderCommandCenter session={leaderSession} onToast={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Giải thích Năng lượng Team" }));
    expect(await screen.findByRole("dialog", { name: "Từ điển Tham mưu" })).toBeTruthy();
    expect(screen.getAllByText("Năng lượng Team").length).toBeGreaterThan(0);
    expect(screen.getByText(/Tỷ lệ TVV có phát sinh nhịp hoạt động/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Đóng Từ điển Tham mưu" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Từ điển Tham mưu" })).toBeNull());
  });

  it("mở Weekly Oracle, rút thẻ và trả về tham mưu theo tín hiệu Team", async () => {
    render(<LeaderCommandCenter session={leaderSession} onToast={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Mở Leader Weekly Oracle" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    const drawCard = screen.getByRole("button", { name: "Rút thẻ Oracle số 2" });
    expect(drawCard.parentElement?.className).toContain("w-full");
    expect(drawCard.parentElement?.className).toContain("flex-col");
    expect(drawCard.parentElement?.className).toContain("md:flex-row");
    expect(drawCard.parentElement?.className).toContain("items-center");
    expect(drawCard.parentElement?.className).toContain("justify-center");

    await waitFor(() => expect(drawCard.hasAttribute("disabled")).toBe(false));
    fireEvent.click(drawCard);
    expect(await screen.findByText(/HỎA LONG XUẤT TRẬN|RÙA BỌC THÉP|SAO THỦY NGHỊCH HÀNH/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Giải mã quẻ" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Giải mã quẻ" }));
    expect(screen.getByText(/GỢI Ý TỪ COPILOT/i)).toBeTruthy();
    const teamPrompt = screen.getByText("Gợi ý hành động Team");
    expect(teamPrompt.parentElement?.className).toContain("max-md:mb-6");
    const oracleCard = teamPrompt.closest("article")?.parentElement?.parentElement;
    for (const token of ["w-[340px]", "max-md:h-[600px]", "md:w-[380px]", "md:h-[580px]"]) expect(oracleCard?.className).toContain(token);
    const downloadButton = screen.getByRole("button", { name: "Tải Ảnh Chia Sẻ" });
    expect(downloadButton.className).toContain("py-4");
    expect(downloadButton.className).toContain("text-[12px]");
    fireEvent.click(downloadButton);
    expect(await screen.findByRole("dialog", { name: "Ảnh Quẻ đã sẵn sàng" })).toBeTruthy();
    expect(screen.getByText(/Mẹo: Nhấn giữ/i)).toBeTruthy();
    const downloadLink = screen.getByRole("link", { name: "Tải PNG về máy" });
    expect(downloadLink.getAttribute("download")).toBe("Que-Boi.png");
    fireEvent.click(screen.getByRole("button", { name: "Đóng ảnh quẻ" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Ảnh Quẻ đã sẵn sàng" })).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "Đóng quẻ Oracle" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
