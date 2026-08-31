/** @vitest-environment jsdom */
import React, { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../client/src/lib/supabaseContent", () => ({
  fetchTeamGiftRecipients: vi.fn().mockResolvedValue([{ id: "advisor-02", displayName: "TVV Pilot 02", role: "advisor" }]),
  giftTeamXp: vi.fn(),
  completeAdvisorOnboarding: vi.fn(),
  fetchPilotManagedAccounts: vi.fn(),
  fetchPilotManagementTeams: vi.fn(),
  fetchPilotMeasurementScorecard: vi.fn(),
  createPilotManagedAccount: vi.fn(),
  updatePilotManagedAccount: vi.fn(),
}));

import { AdvisorQuickGuide, GlobalGiftXpModal } from "../client/src/components/PilotStep5BusinessModules";
import { giftTeamXp } from "../client/src/lib/supabaseContent";

function GiftHarness() {
  const [open, setOpen] = useState(true);
  return <><button onClick={() => setOpen(true)}>Mở Gift XP</button><GlobalGiftXpModal open={open} onClose={() => setOpen(false)} onCompleted={() => undefined} /></>;
}

function OnboardingHarness() {
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  return <AdvisorQuickGuide session={{ userId: "advisor-02", profile: { role: "advisor", onboarding_completed_at: completedAt } } as any} onCompleted={(value) => setCompletedAt(value)} />;
}

function ExclusiveModalHarness() {
  const [giftOpen] = useState(true);
  const session = { userId: "advisor-02", profile: { role: "advisor", onboarding_completed_at: null } } as any;
  return <><GlobalGiftXpModal open={giftOpen} onClose={() => undefined} onCompleted={() => undefined} /><AdvisorQuickGuide session={giftOpen ? null : session} onCompleted={() => undefined} /></>;
}

function LeaderGiftHarness() {
  return <GlobalGiftXpModal open onClose={() => undefined} onCompleted={() => undefined} session={{ userId: "leader-01", profile: { role: "leader" } } as any} />;
}

function SuccessfulGiftHarness({ onCompleted }: { onCompleted: () => void }) {
  const [open, setOpen] = useState(true);
  return <GlobalGiftXpModal open={open} onClose={() => setOpen(false)} onCompleted={onCompleted} session={{ userId: "advisor-02", profile: { role: "advisor" } } as any} />;
}

describe("Pilot Step 5 — Modal Tailwind thuần cho mobile", () => {
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it("Gift XP render qua wrapper Tailwind, đóng bằng backdrop và reset form khi mở lại", async () => {
    const user = userEvent.setup();
    render(<GiftHarness />);
    const dialog = await screen.findByRole("dialog");
    const overlay = screen.getByTestId("gift-xp-backdrop") as HTMLElement;
    const modalLayer = overlay.parentElement as HTMLElement;
    expect(document.body.contains(dialog)).toBe(true);
    expect(overlay).not.toBeNull();
    expect(modalLayer.style.position).toBe("fixed");
    expect(modalLayer.style.zIndex).toBe("99998");
    expect(modalLayer.style.backgroundColor).toBe("rgba(15, 23, 42, 0.7)");
    expect(modalLayer.style.display).toBe("flex");
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toBeNull();
    expect(dialog.style.position).toBe("relative");
    expect(dialog.style.zIndex).toBe("99999");
    expect(dialog.style.backgroundColor).toBe("rgb(255, 255, 255)");
    expect(dialog.style.maxWidth).toBe("28rem");
    expect(dialog.style.maxHeight).toBe("90vh");
    expect(screen.getByRole("combobox").className).toContain("bg-slate-50");
    expect(screen.getByRole("textbox", { name: "Số XP" }).className).toContain("rounded-xl");
    expect(screen.getByPlaceholderText("Ghi nhận một đóng góp cụ thể, không chứa thông tin khách hàng.").className).toContain("focus:ring-2");
    expect(screen.getByText("Tặng XP Động Viên")).toBeTruthy();
    expect(screen.getByText("Lưu ý: Điểm sẽ được trừ trực tiếp từ quỹ XP thành tích cá nhân của bạn.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tặng Điểm" })).toBeTruthy();

    const note = screen.getByPlaceholderText("Ghi nhận một đóng góp cụ thể, không chứa thông tin khách hàng.") as HTMLTextAreaElement;
    await user.type(note, "Cam on dong doi");
    await user.click(overlay);
    expect(screen.queryByRole("dialog")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Mở Gift XP" }));
    const reopenedNote = await screen.findByPlaceholderText("Ghi nhận một đóng góp cụ thể, không chứa thông tin khách hàng.") as HTMLTextAreaElement;
    expect(reopenedNote.value).toBe("");
    await user.click(screen.getByRole("button", { name: "Đóng Tặng Điểm" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Onboarding dùng wrapper Tailwind và có thể đóng an toàn", async () => {
    vi.useFakeTimers();
    render(<OnboardingHarness />);
    expect(screen.queryByRole("dialog")).toBeNull();
    act(() => { vi.advanceTimersByTime(2500); });
    const dialog = screen.getByRole("dialog");
    expect(document.body.contains(dialog)).toBe(true);
    const overlay = screen.getByTestId("advisor-guide-backdrop") as HTMLElement;
    const modalLayer = overlay.parentElement as HTMLElement;
    expect(overlay).not.toBeNull();
    expect(modalLayer.style.position).toBe("fixed");
    expect(modalLayer.style.zIndex).toBe("99998");
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toBeNull();
    expect(dialog.style.position).toBe("relative");
    expect(dialog.style.backgroundColor).toBe("rgb(255, 255, 255)");
    expect(dialog.style.zIndex).toBe("99999");
    expect(dialog.querySelector("ol")).toBeNull();
    expect(dialog.querySelectorAll(".flex.gap-4.items-start.bg-slate-50.p-4.rounded-xl.border.border-slate-100")).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "Đóng hướng dẫn" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("không render đồng thời Onboarding khi Gift XP đang mở", async () => {
    render(<ExclusiveModalHarness />);
    expect(await screen.findByRole("dialog", { name: "Tặng XP Động Viên" })).toBeTruthy();
    expect(screen.queryByRole("dialog", { name: "Ba nhịp đầu tiên cho một tuần rõ ràng." })).toBeNull();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
  });

  it("hiển thị cảnh báo quỹ Leader theo role", async () => {
    render(<LeaderGiftHarness />);
    expect(await screen.findByText("Điểm được trừ từ quỹ Leader. Không ảnh hưởng điểm cá nhân của bạn.")).toBeTruthy();
  });

  it("hiển thị +XP trước khi đóng sau Gift XP thành công", async () => {
    const user = userEvent.setup();
    const onCompleted = vi.fn();
    vi.mocked(giftTeamXp).mockResolvedValue({ giftId: "gift-01", giverRemainingXpBudget: 4800, recipientTotalXp: 40, communityPostId: null, idempotent: false });
    render(<SuccessfulGiftHarness onCompleted={onCompleted} />);
    await user.type(await screen.findByPlaceholderText("Ghi nhận một đóng góp cụ thể, không chứa thông tin khách hàng."), "Cảm ơn bạn đã hỗ trợ team.");
    await user.click(screen.getByRole("button", { name: "Tặng Điểm" }));
    expect((await screen.findByTestId("gift-xp-flyup")).textContent).toContain("+20 XP");
    await new Promise((resolve) => setTimeout(resolve, 1600));
    expect(onCompleted).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
