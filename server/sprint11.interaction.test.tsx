// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../client/src/pages/Home";
import { Sprint11TargetModal } from "../client/src/components/Sprint11TargetModal";

const library = vi.hoisted(() => ({
  playbooks: [], empathy: [], leadership: [], marketing: [], coverLetters: [], serviceLevels: [], xpRewards: [], news: [],
  discQuestions: [
    { code: "D1", question: "1. Khi cần bắt đầu một việc mới, bạn thường?", option_d: "Làm ngay", option_i: "Rủ người cùng làm", option_s: "Hỏi thêm ý kiến", option_c: "Lên kế hoạch" },
    { code: "I1", question: "2. Khi có ý tưởng, bạn thường?", option_d: "Chốt nhanh", option_i: "Chia sẻ", option_s: "Lắng nghe", option_c: "Phân tích" },
  ],
  discProfiles: [], dailyQuizzes: [],
}));

vi.mock("../client/src/lib/supabaseContent", () => ({
  hasSupabaseContentConfig: true,
  fetchContentLibrary: vi.fn().mockResolvedValue(library),
  fetchAdvisorProgress: vi.fn().mockResolvedValue(null),
  fetchXpLedger: vi.fn().mockResolvedValue([]),
  claimDailyQuizXp: vi.fn(), submitDiscAssessment: vi.fn(), completeDiscCheckpoint: vi.fn(), submitDailyLog: vi.fn(), submitFeedback: vi.fn(), persistAdvisorTarget: vi.fn(), fetchCrmNurtureScenario: vi.fn().mockResolvedValue(null),
  getCurrentPilotSession: vi.fn().mockResolvedValue(null), subscribePilotAuth: vi.fn().mockReturnValue(() => undefined), subscribePilotPasswordRecovery: vi.fn().mockReturnValue(() => undefined), completePilotPasswordReset: vi.fn(), logPilotActivity: vi.fn(),
}));

describe("Sprint 11 Phase 1–2 interaction stability", () => {
  beforeEach(() => { window.history.replaceState(null, "", "/"); sessionStorage.setItem("agent-copilot-welcome-seen", "true"); Object.defineProperty(window, "scrollTo", { configurable: true, value: vi.fn() }); });
  afterEach(() => { cleanup(); sessionStorage.clear(); localStorage.clear(); });

  it("giữ input Nhật Ký KH ổn định khi nhập ở viewport mobile", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });
    window.history.replaceState(null, "", "#customer_journal");
    const user = userEvent.setup();
    render(<Home />);
    const note = await screen.findByPlaceholderText(/Đã gửi checklist chuẩn bị tài chính/);
    note.focus();
    await user.type(note, "Da gui checklist khong dinh danh.");
    expect((note as HTMLTextAreaElement).value).toBe("Da gui checklist khong dinh danh.");
  });

  it("chuyển câu DISC sau click mà không làm lỗi luồng trắc nghiệm", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });
    const user = userEvent.setup();
    render(<Home />);
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    await user.click(await screen.findByRole("button", { name: /Làm DISC 5 câu/ }));
    const answer = await screen.findByRole("button", { name: /D.*Làm ngay/ });
    answer.focus();
    expect(document.activeElement).toBe(answer);
    await user.keyboard("{Enter}");
    expect(await screen.findByText(/Khi có ý tưởng/)).toBeTruthy();
  });

  it("phân tách keyboard target modal TVV và Player-Coach", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });
    const user = userEvent.setup();
    const props = { initialAdvisor: { bhntIncome: 0, pntIncome: 0, bhntCommission: 40, pntCommission: 15, bhntContractSize: 25_000_000, pntContractSize: 8_000_000 }, initialLeader: { personalIncome: 0, recruitmentOutreach: 0, activeRatePercent: 0, coachingSessions: 0, xpBudget: 0, teamStreak7dMembers: 0 }, onClose: vi.fn(), onSave: vi.fn() };
    const { rerender } = render(<Sprint11TargetModal {...props} role="advisor" />);
    const advisorDialog = await screen.findByRole("dialog", { name: /Tháng này/ });
    expect(advisorDialog.getAttribute("aria-modal")).toBe("true");
    const advisorIncome = screen.getAllByLabelText("Thu nhập mục tiêu (triệu)")[0];
    advisorIncome.focus();
    expect(document.activeElement).toBe(advisorIncome);
    await user.type(advisorIncome, "30");
    expect((advisorIncome as HTMLInputElement).value).toBe("30");
    const close = screen.getByRole("button", { name: "Đóng mục tiêu" });
    close.focus();
    await user.keyboard("{Enter}");
    expect(props.onClose).toHaveBeenCalledTimes(1);
    rerender(<Sprint11TargetModal {...props} role="leader" />);
    expect(await screen.findByRole("dialog", { name: /Mục Tiêu Quản Trị/ })).toBeTruthy();
    const coaching = screen.getByLabelText("Số ca Coaching 1:1");
    coaching.focus();
    expect(document.activeElement).toBe(coaching);
    expect(screen.queryByText("BHNT · Thu nhập cá nhân")).toBeNull();
  });
});
