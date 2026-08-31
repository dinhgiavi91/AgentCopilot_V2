// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../client/src/pages/Home";

const library = vi.hoisted(() => ({
  playbooks: [], empathy: [], leadership: [], marketing: [], discQuestions: [], discProfiles: [], serviceLevels: [], coverLetters: [],
  dailyQuizzes: [],
  xpRewards: [
    { code: "Q001", name: "Bùa Cứu Chuỗi (Streak Freeze)", reward_type: "Bùa", xp_cost: 50, status: "Hoạt động", sort_order: 1 },
    { code: "Q002", name: "Cốc Cafe Starbucks từ Sếp", reward_type: "Cafe", xp_cost: 150, status: "Hoạt động", sort_order: 2 },
    { code: "Q003", name: "Yêu cầu Sếp đi chốt sale cùng 1 ca", reward_type: "Coaching", xp_cost: 500, status: "Hoạt động", sort_order: 3 },
  ],
  news: [
    { code: "N001", kind: "news", category: "Tin vĩ mô", title: "Tin thử", summary: "Tóm tắt", field_takeaway: "Bài học", published_at: null, sort_order: 1 },
    { code: "C001", kind: "case", category: "Case Study", title: "Ca thử", summary: "Tóm tắt case", field_takeaway: "Bài học case", published_at: null, sort_order: 2 },
  ],
}));

vi.mock("../client/src/lib/supabaseContent", () => ({
  hasSupabaseContentConfig: true,
  fetchContentLibrary: vi.fn().mockResolvedValue(library),
  fetchAdvisorProgress: vi.fn().mockResolvedValue(null),
  fetchXpLedger: vi.fn().mockResolvedValue([]),
  fetchTeamCommunityFeed: vi.fn().mockResolvedValue([]),
  fetchTeamContests: vi.fn().mockResolvedValue([]),
  createTeamCommunityPost: vi.fn(),
  toggleTeamCommunityReaction: vi.fn(),
  createTeamCommunityComment: vi.fn(),
  createTeamContest: vi.fn(),
  giftTeamXp: vi.fn(),
  fetchPilotCrmJournals: vi.fn().mockResolvedValue([]),
  createPilotCrmJournal: vi.fn(),
  fetchLeaderTeamReport: vi.fn(),
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

describe("Sprint 8 keyboard accessibility", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    Object.defineProperty(window, "scrollTo", { configurable: true, value: vi.fn() });
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1280 });
    sessionStorage.setItem("agent-copilot-welcome-seen", "true");
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it("giữ luồng keyboard cho Radar yêu cầu quyền Pilot và XP Store", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const radarButton = screen.getAllByRole("button", { name: "Radar" })[0];
    radarButton.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByText("Radar Lãnh Đạo chưa áp dụng cho TVV.")).toBeTruthy();

    const ledgerButton = screen.getByRole("button", { name: /XP Ledger/ });
    ledgerButton.focus();
    await user.keyboard("{Enter}");
    const storeButton = await screen.findByRole("button", { name: /Trạm Tiếp Năng Lượng/ });
    storeButton.focus();
    await user.keyboard("{Enter}");
    const rewardCtas = await screen.findAllByRole("button", { name: "Đổi quà" });
    const rewardCta = rewardCtas.find((button) => button.classList.contains("copy-button"));
    expect(rewardCta).toBeTruthy();
    rewardCta!.focus();
    await user.keyboard("{Enter}");
    expect(rewardCta).toBeTruthy();

  });

  it("cho phép lọc Case Study Thực Chiến bằng Enter", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const newsEntry = screen.getByRole("button", { name: "Bản Tin 90s" });
    await user.click(newsEntry);
    await screen.findByText("Đọc nhanh.");
    const caseFilter = document.querySelector<HTMLButtonElement>(".news-filter button:last-child");
    expect(caseFilter).toBeTruthy();
    caseFilter!.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByText("Ca thử")).toBeTruthy());
  });

  it("giữ luồng keyboard quan trọng ở viewport mobile 375px", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });
    const user = userEvent.setup();
    render(<Home />);

    const managerToggle = await screen.findByRole("button", { name: "Chế Độ Quản Lý (PRO)" });
    managerToggle.focus();
    await user.keyboard("{Enter}");
    expect(managerToggle.getAttribute("aria-pressed")).toBe("true");

    const mobileRadar = screen.getAllByRole("button", { name: "Radar" })[0];
    expect(mobileRadar).toBeTruthy();
    mobileRadar!.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByText("Radar Lãnh Đạo chưa áp dụng cho TVV.")).toBeTruthy();

    const ledgerButton = screen.getByRole("button", { name: /XP Ledger/ });
    ledgerButton.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("button", { name: /Trạm Tiếp Năng Lượng/ })).toBeTruthy();
  });
});
