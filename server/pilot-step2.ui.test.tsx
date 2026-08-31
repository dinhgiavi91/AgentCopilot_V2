// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FounderPilotOverview, PilotAuthControl, PilotRadar } from "../client/src/components/PilotStep2Modules";

const advisorSession = { userId: "advisor-1", profile: { id: "advisor-1", email: "advisor@pilot.test", display_name: "TVV Pilot 01", role: "advisor" as const, primary_team_id: "team-1", is_active: true, created_at: "2026-08-18T00:00:00Z" } };
const leaderSession = { userId: "leader-1", profile: { id: "leader-1", email: "leader@pilot.test", display_name: "Pilot Leader", role: "leader" as const, primary_team_id: "team-1", is_active: true, created_at: "2026-08-18T00:00:00Z" } };
const superAdminSession = { userId: "admin-1", profile: { id: "admin-1", email: "admin@pilot.test", display_name: "Pilot Admin", role: "super_admin" as const, primary_team_id: "team-1", is_active: true, created_at: "2026-08-18T00:00:00Z" } };

const api = vi.hoisted(() => ({
  signInPilot: vi.fn(), signOutPilot: vi.fn(), requestPilotPasswordReset: vi.fn(), completePilotPasswordReset: vi.fn(), subscribePilotPasswordRecovery: vi.fn(() => () => {}), fetchPilotSignals: vi.fn(), reviewPilotSignal: vi.fn(), createPilotIntervention: vi.fn(), fetchPilotOverview: vi.fn(), fetchSignalEngineRuleConfigs: vi.fn(), updateSignalEngineRuleConfigs: vi.fn(), runPilotSignalEngine: vi.fn(), runPilotOutcomeEvaluator: vi.fn(), conciseSignalContext: vi.fn().mockReturnValue("followups overdue: 1"),
}));

vi.mock("../client/src/lib/supabaseContent", () => api);

describe("Pilot Step 2 — real workflow UI", () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it("đăng nhập Email/Password và trả session Profile để Home redirect theo role", async () => {
    api.signInPilot.mockResolvedValue(advisorSession);
    const onSession = vi.fn();
    const user = userEvent.setup();
    render(<PilotAuthControl session={null} error="" onSession={onSession} onError={vi.fn()} onLoggedOut={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /Đăng nhập Pilot/i }));
    await user.type(screen.getByLabelText("Email"), "advisor@pilot.test");
    await user.type(screen.getByLabelText("Mật khẩu"), "Secret123!");
    await user.click(screen.getByRole("button", { name: /Vào Pilot/i }));
    expect(api.signInPilot).toHaveBeenCalledWith("advisor@pilot.test", "Secret123!");
    expect(onSession).toHaveBeenCalledWith(advisorSession);
  });

  it("gửi yêu cầu reset mật khẩu cho Email Pilot mà không tạo tài khoản", async () => {
    api.requestPilotPasswordReset.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<PilotAuthControl session={null} error="" onSession={vi.fn()} onError={vi.fn()} onLoggedOut={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /Đăng nhập Pilot/i }));
    await user.type(screen.getByLabelText("Email"), "advisor@pilot.test");
    await user.click(screen.getByRole("button", { name: /Gửi link reset/i }));
    expect(api.requestPilotPasswordReset).toHaveBeenCalledWith("advisor@pilot.test");
    expect(await screen.findByText(/link đặt lại mật khẩu đã được gửi/i)).toBeTruthy();
  });

  it("hoàn tất reset mật khẩu từ recovery link bằng Supabase Auth", async () => {
    let recoveryHandler: (() => void) | undefined;
    api.subscribePilotPasswordRecovery.mockImplementation((handler: () => void) => {
      recoveryHandler = handler;
      return () => undefined;
    });
    api.completePilotPasswordReset.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<PilotAuthControl session={null} error="" onSession={vi.fn()} onError={vi.fn()} onLoggedOut={vi.fn()} />);
    act(() => recoveryHandler?.());
    await user.type(await screen.findByLabelText("Mật khẩu mới"), "Secret123!");
    await user.type(screen.getByLabelText("Xác nhận mật khẩu"), "Secret123!");
    await user.click(screen.getByRole("button", { name: /Lưu mật khẩu mới/i }));
    expect(api.completePilotPasswordReset).toHaveBeenCalledWith("Secret123!");
    expect(await screen.findByText(/Mật khẩu đã được cập nhật/i)).toBeTruthy();
  });

  it("gộp danh xưng, avatar Visual DNA, Settings và Logout thành Profile Pill", async () => {
    api.signOutPilot.mockResolvedValue(undefined);
    const onOpenProfileSettings = vi.fn();
    const onLoggedOut = vi.fn();
    const user = userEvent.setup();
    render(<PilotAuthControl session={advisorSession} error="" userName="Hải Đăng" userAvatar="/manus-storage/navigator_bf1942c9.png" onOpenProfileSettings={onOpenProfileSettings} onSession={vi.fn()} onError={vi.fn()} onLoggedOut={onLoggedOut} />);

    expect(screen.getByText("Hải Đăng")).toBeTruthy();
    expect(screen.getByText("TVV Pilot")).toBeTruthy();
    expect((screen.getByAltText("Ảnh đại diện") as HTMLImageElement).src).toContain("navigator_bf1942c9.png");
    await user.click(screen.getByRole("button", { name: /Đổi nhân vật hoặc tên hiển thị/i }));
    expect(onOpenProfileSettings).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: /Đăng xuất Pilot/i }));
    expect(api.signOutPilot).toHaveBeenCalledTimes(1);
    expect(onLoggedOut).toHaveBeenCalledTimes(1);
  });

  it("Leader đọc Radar thật, review Signal và mở form Intervention", async () => {
    api.fetchPilotSignals.mockResolvedValue([{ id: "signal-1", user_id: "advisor-1", team_id: "team-1", signal_type: "followup_overdue", window_days: 7, threshold_version: "pilot-v1", severity: "high", summary: "Follow-up quá hạn", detected_at: "2026-08-18T08:00:00Z", status: "new", metadata: { rule_key: "followup_gap", followups_overdue: 1 }, created_at: "2026-08-18T08:00:00Z", advisor_display_name: "TVV Pilot 01" }]);
    api.reviewPilotSignal.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<PilotRadar session={leaderSession} onToast={vi.fn()} />);
    expect(await screen.findByText("TVV Pilot 01")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Relevant" }));
    expect(api.reviewPilotSignal).toHaveBeenCalledWith("signal-1", "relevant");
    await user.click(await screen.findByRole("button", { name: /Ghi nhận hỗ trợ/i }));
    expect(await screen.findByText("Rationale ngắn")).toBeTruthy();
    expect(screen.getByText(/Check-in nhanh \(SLA: 24h\)/i)).toBeTruthy();
    expect(screen.getByText(/Nhắn 1 tin Zalo nhắc nhở nhẹ nhàng/i)).toBeTruthy();
  });

  it("Leader nhận Playbook đúng SLA cho activity_drop và goal_deviation", async () => {
    api.fetchPilotSignals.mockResolvedValue([
      { id: "signal-activity", user_id: "advisor-1", team_id: "team-1", signal_type: "low_activity", window_days: 7, threshold_version: "pilot-v1", severity: "high", summary: "Không có hoạt động mới", detected_at: "2026-08-18T08:00:00Z", status: "new", metadata: { rule_key: "activity_drop" }, created_at: "2026-08-18T08:00:00Z", advisor_display_name: "TVV Pilot 01" },
      { id: "signal-goal", user_id: "advisor-2", team_id: "team-1", signal_type: "other", window_days: 7, threshold_version: "pilot-v1", severity: "critical", summary: "Lệch mục tiêu", detected_at: "2026-08-18T07:00:00Z", status: "new", metadata: { rule_key: "goal_deviation" }, created_at: "2026-08-18T07:00:00Z", advisor_display_name: "TVV Pilot 02" },
    ]);
    const user = userEvent.setup();
    render(<PilotRadar session={leaderSession} onToast={vi.fn()} />);
    await screen.findByText("TVV Pilot 01");
    await user.click(screen.getAllByRole("button", { name: /Ghi nhận hỗ trợ/i })[0]!);
    expect(await screen.findByText(/Coaching 1:1 \(SLA: 48h\)/i)).toBeTruthy();
    expect(screen.getByText(/Mời cafe 15 phút/i)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Đóng intervention/i }));
    await user.click(screen.getAllByRole("button", { name: /Ghi nhận hỗ trợ/i })[1]!);
    expect(await screen.findByText(/Roleplay \/ Goal Reset \(SLA: 72h\)/i)).toBeTruthy();
    expect(screen.getByText(/luyện tập kỹ năng chốt sale/i)).toBeTruthy();
  });

  it("Founder-only overview đọc tổng hợp vận hành Pilot", async () => {
    api.fetchPilotOverview.mockResolvedValue({ activeTeams: 1, totalAdvisors: 3, newSignalsThisWeek: 2, interventionsThisWeek: 1, signalReviewsThisWeek: 1, openSignals: 2, actedOnSignals: 1, teams: [{ id: "team-1", name: "Pilot Pod", status: "active", newSignals: 2, actedOnSignals: 1 }] });
    api.fetchSignalEngineRuleConfigs.mockResolvedValue([{ rule_key: "activity_drop", is_enabled: true, evaluation_window_hours: 168, severity: "medium", threshold_version: "v1.0.0", updated_at: "2026-08-18T00:00:00Z", updated_by: null }, { rule_key: "followup_gap", is_enabled: true, evaluation_window_hours: 24, severity: "high", threshold_version: "v1.0.0", updated_at: "2026-08-18T00:00:00Z", updated_by: null }]);
    render(<FounderPilotOverview session={superAdminSession} />);
    expect(await screen.findByText("Vận hành Pilot,")).toBeTruthy();
    expect(screen.getByText("Pilot Pod")).toBeTruthy();
    expect(screen.getByText("Signal mới tuần")).toBeTruthy();
  });

  it("Advisor không được đọc Radar Leader", () => {
    render(<PilotRadar session={advisorSession} onToast={vi.fn()} />);
    expect(screen.getByText(/Radar cần tài khoản Leader hoặc Super Admin/i)).toBeTruthy();
  });

  it("Leader lọc Radar và có empty state rõ ràng khi không có Signal khớp", async () => {
    api.fetchPilotSignals.mockResolvedValue([{ id: "signal-1", user_id: "advisor-1", team_id: "team-1", signal_type: "followup_overdue", window_days: 7, threshold_version: "pilot-v1", severity: "high", summary: "Follow-up quá hạn", detected_at: new Date().toISOString(), status: "new", metadata: {}, created_at: "2026-08-18T08:00:00Z", advisor_display_name: "TVV Pilot 01" }]);
    const user = userEvent.setup();
    render(<PilotRadar session={leaderSession} onToast={vi.fn()} />);
    await screen.findByText("TVV Pilot 01");
    await user.selectOptions(screen.getByLabelText("Mức độ"), "low");
    expect(await screen.findByText(/Không có Signal khớp bộ lọc hiện tại/i)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Hiển thị tất cả Signal/i }));
    expect(await screen.findByText("TVV Pilot 01")).toBeTruthy();
  });

  it("Founder có manual dry-run trigger, không yêu cầu UI tự tính Signal", async () => {
    api.fetchPilotOverview.mockResolvedValue({ activeTeams: 1, totalAdvisors: 3, newSignalsThisWeek: 2, interventionsThisWeek: 1, signalReviewsThisWeek: 1, openSignals: 2, actedOnSignals: 1, teams: [] });
    api.fetchSignalEngineRuleConfigs.mockResolvedValue([{ rule_key: "activity_drop", is_enabled: true, evaluation_window_hours: 168, severity: "medium", threshold_version: "v1.0.0", updated_at: "2026-08-18T00:00:00Z", updated_by: null }, { rule_key: "followup_gap", is_enabled: true, evaluation_window_hours: 24, severity: "high", threshold_version: "v1.0.0", updated_at: "2026-08-18T00:00:00Z", updated_by: null }]);
    api.runPilotSignalEngine.mockResolvedValue({ run_id: "run-1", dry_run: true, evaluated_at: "2026-08-18T00:00:00Z", candidate_count: 1, created_count: 0, activity_drop_candidates: 0, followup_gap_candidates: 1, activity_drop_created: 0, followup_gap_created: 0, threshold_versions: { activity_drop: "v1.0.0", followup_gap: "v1.0.0" } });
    const user = userEvent.setup();
    render(<FounderPilotOverview session={superAdminSession} />);
    await user.click(await screen.findByRole("button", { name: /^Chạy dry-run$/i }));
    expect(api.runPilotSignalEngine).toHaveBeenCalledWith(true);
    expect(await screen.findByText(/Dry-run hoàn tất: 1 ứng viên/i)).toBeTruthy();
  });

  it("Founder có manual dry-run Outcome, truyền checkpoint D1 và ngưỡng giờ cho RPC server-side", async () => {
    api.fetchPilotOverview.mockResolvedValue({ activeTeams: 1, totalAdvisors: 3, newSignalsThisWeek: 2, interventionsThisWeek: 1, signalReviewsThisWeek: 1, openSignals: 2, actedOnSignals: 1, teams: [] });
    api.fetchSignalEngineRuleConfigs.mockResolvedValue([]);
    api.runPilotOutcomeEvaluator.mockResolvedValue({ run_id: "outcome-run-1", dry_run: true, checkpoint_day: "d1", checkpoint_hours: 24, evaluated_at: "2026-08-18T00:00:00Z", candidate_count: 2, recovered_count: 1, not_recovered_count: 1, created_count: 0 });
    const user = userEvent.setup();
    render(<FounderPilotOverview session={superAdminSession} />);
    await user.click(await screen.findByRole("button", { name: /Chạy dry-run Outcome/i }));
    expect(api.runPilotOutcomeEvaluator).toHaveBeenCalledWith("d1", 24, true);
    expect(await screen.findByText(/Dry-run Outcome: 2 can thiệp đủ checkpoint/i)).toBeTruthy();
  });
});
