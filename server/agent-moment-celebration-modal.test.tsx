// @vitest-environment jsdom
import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentMomentCelebrationModal } from "../client/src/components/AgentMomentCelebrationModal";

describe("Agent Moment Celebration Modal", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("không render khi đóng và mở cinematic overlay cùng Master Card khi nhận Recognition", () => {
    const { rerender, container } = render(<AgentMomentCelebrationModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).toBeNull();

    rerender(<AgentMomentCelebrationModal isOpen onClose={vi.fn()} cardData={{ agentName: "Minh", rewardName: "Bùa Cứu Chuỗi" }} />);
    expect(screen.getByRole("dialog", { name: "Ting Ting! Món quà từ Sếp" })).toBeTruthy();
    expect(screen.getByText("Vinh danh đặc biệt dành cho bạn")).toBeTruthy();
    expect(screen.getByText("VÌ NHỮNG NỖ LỰC")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Tuyệt vời! Cảm ơn Sếp!/i })).toBeTruthy();
    expect(container.innerHTML).toContain("bg-[#0B1431]/95");
    expect(container.innerHTML).toContain("lucide-party-popper");
    expect(container.innerHTML).toContain("lucide-sparkles");
  });

  it("bắn callback nhận thưởng trước khi thu nhỏ và đóng modal", async () => {
    vi.useFakeTimers();
    const sequence: string[] = [];
    const onClaimReward = vi.fn((rewardName: string | null) => sequence.push(`claim:${rewardName}`));
    const onClose = vi.fn(() => sequence.push("close"));

    render(<AgentMomentCelebrationModal isOpen onClose={onClose} onClaimReward={onClaimReward} cardData={{ rewardName: "Thưởng 100 XP" }} />);
    fireEvent.click(screen.getByRole("button", { name: /Tuyệt vời! Cảm ơn Sếp!/i }));

    expect(onClaimReward).toHaveBeenCalledWith("Thưởng 100 XP");
    expect(sequence).toEqual(["claim:Thưởng 100 XP"]);
    expect(screen.getByRole("button", { name: /Đang nhận quà/i })).toBeTruthy();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });
    expect(sequence).toEqual(["claim:Thưởng 100 XP", "close"]);
  });

  it("phát âm thanh mở thẻ và Ting Ting nhưng không để lỗi audio chặn claim", async () => {
    vi.useFakeTimers();
    const play = vi.fn(() => Promise.reject(new Error("autoplay blocked")));
    const OriginalAudio = globalThis.Audio;
    class AudioMock {
      volume = 1;
      play = play;
      constructor(_src: string) {}
    }
    Object.defineProperty(globalThis, "Audio", { configurable: true, value: AudioMock });
    const onClaimReward = vi.fn();
    const onClose = vi.fn();

    render(<AgentMomentCelebrationModal isOpen onClose={onClose} onClaimReward={onClaimReward} />);
    expect(play).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: /Tuyệt vời! Cảm ơn Sếp!/i }));
    expect(play).toHaveBeenCalledTimes(2);
    expect(onClaimReward).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    Object.defineProperty(globalThis, "Audio", { configurable: true, value: OriginalAudio });
  });
});
