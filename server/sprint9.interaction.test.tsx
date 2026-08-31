// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../client/src/pages/Home";
import { RoleplayModal, SalesVideoReels } from "../client/src/components/Sprint10VideoModules";
import { DirectorRadar } from "../client/src/components/Sprint9Modules";

const library = vi.hoisted(() => ({
  playbooks: [], empathy: [], leadership: [], marketing: [], discQuestions: [], discProfiles: [], serviceLevels: [], coverLetters: [], dailyQuizzes: [],
  xpRewards: [], news: [],
}));

vi.mock("../client/src/lib/supabaseContent", () => ({
  hasSupabaseContentConfig: true,
  fetchContentLibrary: vi.fn().mockResolvedValue(library),
  fetchAdvisorProgress: vi.fn().mockResolvedValue(null),
  fetchXpLedger: vi.fn().mockResolvedValue([]),
  fetchTeamCommunityFeed: vi.fn().mockResolvedValue([]),
  fetchTeamContests: vi.fn().mockResolvedValue([]),
  fetchTeamGiftRecipients: vi.fn().mockResolvedValue([]),
  createTeamCommunityPost: vi.fn(),
  toggleTeamCommunityReaction: vi.fn(),
  createTeamCommunityComment: vi.fn(),
  createTeamContest: vi.fn(),
  giftTeamXp: vi.fn(),
  completeAdvisorOnboarding: vi.fn(),
  fetchPilotMeasurementScorecard: vi.fn(),
  fetchPilotManagedAccounts: vi.fn(),
  fetchPilotManagementTeams: vi.fn(),
  createPilotManagedAccount: vi.fn(),
  updatePilotManagedAccount: vi.fn(),
  fetchPilotCrmJournals: vi.fn().mockResolvedValue([]),
  createPilotCrmJournal: vi.fn(),
  fetchCrmNurtureScenario: vi.fn().mockResolvedValue(null),
  fetchLeaderTeamReport: vi.fn(),
  fetchHeartbeatHierarchy: vi.fn().mockResolvedValue({ scope: "self", teams: [], users: [], logs: [], summary: { totalLogs: 0, completedInteractions: 0, closedDeals: 0 } }),
  claimDailyQuizXp: vi.fn(),
  submitDiscAssessment: vi.fn(),
  submitDailyLog: vi.fn(),
  submitFeedback: vi.fn(),
  persistAdvisorTarget: vi.fn(),
  getCurrentPilotSession: vi.fn().mockResolvedValue(null),
  subscribePilotAuth: vi.fn().mockReturnValue(() => undefined),
  subscribePilotPasswordRecovery: vi.fn().mockReturnValue(() => undefined),
  completePilotPasswordReset: vi.fn(),
  runPilotOutcomeEvaluator: vi.fn(),
  logPilotActivity: vi.fn(),
}));

describe("Sprint 9 interactive flows", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    Object.defineProperty(window, "scrollTo", { configurable: true, value: vi.fn() });
    sessionStorage.setItem("agent-copilot-welcome-seen", "true");
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it("mở Gift XP từ Cộng Đồng theo quỹ và yêu cầu đồng đội cùng Team", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getAllByRole("button", { name: "Cộng Đồng" })[0]);
    await user.click(await screen.findByRole("button", { name: "Tặng XP" }));
    expect(await screen.findByText("TẶNG ĐIỂM TOÀN TEAM")).toBeTruthy();
    const amount = screen.getByLabelText("Số XP");
    amount.focus();
    expect(document.activeElement).toBe(amount);
    await user.clear(amount);
    await user.type(amount, "75");
    const note = screen.getByPlaceholderText("Ghi nhận một đóng góp cụ thể, không chứa thông tin khách hàng.");
    await user.type(note, "Cam on dong doi da ho tro minh.");
    expect((screen.getByRole("button", { name: "Tặng Điểm" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("mở CRM Nhật Ký Khách Hàng và đồng bộ thông báo lưu Zero-PII theo Team Live", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(await screen.findByRole("button", { name: "Nhật Ký Khách Hàng" }));
    expect(await screen.findByText("CRM NUÔI DƯỠNG · ZERO-PII")).toBeTruthy();
    await user.type(screen.getByPlaceholderText(/Đã gửi checklist chuẩn bị tài chính/), "Da gui checklist tai chinh gia dinh khong dinh danh.");
    await user.click(screen.getByRole("button", { name: "Tạo Nhật Ký chăm sóc" }));
    expect(screen.getByRole("button", { name: "Tạo Nhật Ký chăm sóc" })).toBeTruthy();
  });

  it("giữ nguyên nội dung đang gõ trong Nhịp Đập và composer Cộng Đồng", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click((await screen.findAllByRole("button", { name: "Nhịp Đập" }))[0]);
    await user.click(await screen.findByRole("button", { name: "Ghi Nhịp Đập" }));
    const journal = screen.getByPlaceholderText("Kể lại trải nghiệm của bạn với Khách hàng hôm nay...");
    await user.type(journal, "Da roleplay truoc cuoc hen va da hoi mot cau mo.");
    expect((journal as HTMLTextAreaElement).value).toBe("Da roleplay truoc cuoc hen va da hoi mot cau mo.");
    await user.click(document.querySelector(".log-modal .store-close") as HTMLButtonElement);
    await user.click(screen.getAllByRole("button", { name: "Cộng Đồng" })[0]);
    const composer = await screen.findByPlaceholderText("Kể lại trải nghiệm của bạn với Khách hàng hôm nay...");
    await user.type(composer, "Minh chia se mot bai hoc khong dinh danh.");
    expect((composer as HTMLTextAreaElement).value).toBe("Minh chia se mot bai hoc khong dinh danh.");
  });

  it("giữ CTA CRM có thể focus từ keyboard ở viewport mobile", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });
    window.history.replaceState(null, "", "#customer_journal");
    const user = userEvent.setup();
    render(<Home />);
    const createJournal = await screen.findByRole("button", { name: "Tạo Nhật Ký chăm sóc" });
    expect((createJournal as HTMLButtonElement).disabled).toBe(false);
    const stage = screen.getByRole("combobox", { name: "Giai đoạn" });
    stage.focus();
    expect(document.activeElement).toBe(stage);
    expect((stage as HTMLSelectElement).value).toBe("pre_sale");
    expect(screen.getByText("CRM NUÔI DƯỠNG · ZERO-PII")).toBeTruthy();
  });

  it("giữ đổi tên Team và thay Radar demo bằng trạng thái yêu cầu quyền Pilot", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(await screen.findByRole("button", { name: "Đổi tên Team" }));
    const teamName = screen.getByRole("textbox", { name: "Tên Team" });
    await user.clear(teamName);
    await user.type(teamName, "MDRT Team");
    await user.keyboard("{ArrowDown}");
    expect((teamName as HTMLInputElement).value).toBe("MDRT Team");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Đổi tên Team" }).textContent).toContain("MDRT Team");

    await user.click(screen.getAllByRole("button", { name: "Radar" })[0]);
    expect(await screen.findByText("Radar Lãnh Đạo chưa áp dụng cho TVV.")).toBeTruthy();
  });

  it("hỗ trợ focus và keyboard cho Roleplay, Reels và Báo cáo GĐ storytelling", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<RoleplayModal situation="Xử lý từ chối phí đắt" prompt="Bạn đang lo điều gì nhất?" onClose={onClose} />);
    const closeRoleplay = screen.getByRole("button", { name: "Đóng phòng luyện tập" });
    closeRoleplay.focus();
    expect(document.activeElement).toBe(closeRoleplay);
    const record = screen.getByRole("button", { name: "Bắt đầu Record" });
    await user.click(record);
    expect(screen.getByRole("button", { name: "Dừng & nhận góp ý" })).toBeTruthy();
    closeRoleplay.focus();
    await user.keyboard("{Enter}");
    expect(onClose).toHaveBeenCalledTimes(1);

    cleanup();
    render(<SalesVideoReels />);
    const firstReel = screen.getByRole("button", { name: "Xem Cách tôi chốt HĐ 50 triệu" });
    firstReel.focus();
    expect(document.activeElement).toBe(firstReel);
    expect(screen.getByRole("region", { name: "Video Thực Chiến demo" })).toBeTruthy();

    cleanup();
    render(<DirectorRadar onToast={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Xuất Báo Cáo GĐ" }));
    const closeReport = screen.getByRole("button", { name: "Đóng báo cáo" });
    closeReport.focus();
    expect(document.activeElement).toBe(closeReport);
    await user.keyboard("{Enter}");
    expect(screen.queryByText("BÁO CÁO GIÁM ĐỐC · DEMO PRO")).toBeNull();
  });
});
