// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Sprint10LogModal } from "../client/src/pages/Home";

const advisorSession = { userId: "advisor-1", profile: { id: "advisor-1", email: "advisor@pilot.test", display_name: "TVV Pilot 01", role: "advisor" as const, primary_team_id: "team-1", is_active: true, created_at: "2026-08-18T00:00:00Z" } };
const api = vi.hoisted(() => ({
  getCurrentPilotSession: vi.fn(), subscribePilotAuth: vi.fn(), subscribePilotPasswordRecovery: vi.fn(), logPilotActivity: vi.fn(),
}));
const library = vi.hoisted(() => ({ playbooks: [], empathy: [], leadership: [], marketing: [], discQuestions: [], discProfiles: [], dailyQuizzes: [], xpRewards: [], coverLetters: [], news: [], serviceLevels: [{ level: 3, label: "Cấp 3 — Khá", description: "Đã đáp ứng đúng kỳ vọng.", coaching_hint: "Giữ nhịp." }] }));

vi.mock("../client/src/lib/supabaseContent", () => ({
  hasSupabaseContentConfig: true,
  fetchContentLibrary: vi.fn().mockResolvedValue(library), fetchAdvisorProgress: vi.fn().mockResolvedValue(null), fetchXpLedger: vi.fn().mockResolvedValue([]), fetchTeamCommunityFeed: vi.fn().mockResolvedValue([]), fetchTeamContests: vi.fn().mockResolvedValue([]), createTeamCommunityPost: vi.fn(), toggleTeamCommunityReaction: vi.fn(), createTeamCommunityComment: vi.fn(), createTeamContest: vi.fn(), giftTeamXp: vi.fn(), fetchPilotCrmJournals: vi.fn().mockResolvedValue([]), createPilotCrmJournal: vi.fn(), fetchLeaderTeamReport: vi.fn(), claimDailyQuizXp: vi.fn(), submitDiscAssessment: vi.fn(), submitFeedback: vi.fn(), persistAdvisorTarget: vi.fn(),
  getCurrentPilotSession: api.getCurrentPilotSession, subscribePilotAuth: api.subscribePilotAuth, logPilotActivity: api.logPilotActivity,
  signInPilot: vi.fn(), signOutPilot: vi.fn(), requestPilotPasswordReset: vi.fn(), completePilotPasswordReset: vi.fn(), subscribePilotPasswordRecovery: api.subscribePilotPasswordRecovery, conciseSignalContext: vi.fn().mockReturnValue(""), createPilotIntervention: vi.fn(), fetchPilotOverview: vi.fn(), fetchPilotSignals: vi.fn(), reviewPilotSignal: vi.fn(), fetchSignalEngineRuleConfigs: vi.fn().mockResolvedValue([]), updateSignalEngineRuleConfigs: vi.fn(), runPilotSignalEngine: vi.fn(), runPilotOutcomeEvaluator: vi.fn(),
}));

describe("Pilot Step 2 — Advisor daily activity on Home", () => {
  beforeEach(() => {
    api.getCurrentPilotSession.mockResolvedValue(advisorSession);
    api.subscribePilotAuth.mockReturnValue(() => undefined);
    api.subscribePilotPasswordRecovery.mockReturnValue(() => undefined);
    api.logPilotActivity.mockResolvedValue({ activity: { id: "activity-1" }, followup: { id: "followup-1" } });
    window.history.replaceState(null, "", "/");
    sessionStorage.setItem("agent-copilot-welcome-seen", "true");
    Object.defineProperty(window, "scrollTo", { configurable: true, value: vi.fn() });
  });
  afterEach(() => { cleanup(); vi.clearAllMocks(); sessionStorage.clear(); });

  it("giữ form Nhịp Đập và submit follow-up Dời lịch cho Advisor", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(<Sprint10LogModal content={library} logLevel={3} serviceLevelPreview={3} logAction="Dời lịch" customerJourney="pre_sale" followUp="2026-08-25" revenue="" journalStory="" journalPublic onClose={vi.fn()} onSubmit={onSubmit} onLevelChange={vi.fn()} onPreviewLevel={vi.fn()} onActionChange={vi.fn()} onJourneyChange={vi.fn()} onFollowUpChange={vi.fn()} onRevenueChange={vi.fn()} onJournalChange={vi.fn()} onJournalVisibilityChange={vi.fn()} saving={false} />);
    const submit = await screen.findByRole("button", { name: "Lưu Nhịp Đập" });
    const form = submit.closest("form");
    const followUp = form?.querySelector<HTMLInputElement>("input[type='date']");
    const revenue = form?.querySelector<HTMLInputElement>("input[placeholder='0']");
    expect(followUp).toBeTruthy();
    expect(revenue).toBeTruthy();
    await user.click(submit);
    expect(onSubmit).toHaveBeenCalled();
  });
});
