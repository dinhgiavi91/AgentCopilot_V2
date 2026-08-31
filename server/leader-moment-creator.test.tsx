// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LeaderMomentCreator } from "../client/src/components/LeaderMomentCreator";
import { SYSTEM_MESSAGES } from "../client/src/lib/momentCopyEngine";

describe("Leader Moment Creator & Copy Engine", () => {
  afterEach(() => cleanup());

  it("cung cấp đủ năm tone Recovery chuẩn PLG", () => {
    expect(Object.keys(SYSTEM_MESSAGES.recovery.tones)).toEqual(["calm", "warm", "proud", "encouraging", "grateful"]);
    expect(SYSTEM_MESSAGES.recovery.title).toBe("BẠN ĐÃ TÌM LẠI NHỊP");
  });

  it("đổi Reward hoặc Human Voice theo quy tắc loại trừ và cập nhật Live Preview", () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();
    const { container } = render(<LeaderMomentCreator agentName="Minh" onClose={onClose} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Ấm áp" }));
    expect(screen.getByText(SYSTEM_MESSAGES.recovery.tones.warm)).toBeTruthy();
    expect(screen.getByText("LEADER VINH DANH")).toBeTruthy();
    expect(screen.getByText("CẢM ƠN BẠN")).toBeTruthy();
    expect(screen.getByText("VÌ NHỮNG NỖ LỰC")).toBeTruthy();
    const dialog = screen.getByRole("dialog", { name: "Tạo thẻ vinh danh" });
    expect(dialog.className).toContain("flex-col");
    expect(dialog.className).toContain("md:flex-row");
    expect(screen.getByText("Live Preview").parentElement?.parentElement?.className).toContain("max-md:!w-full");
    expect(container.innerHTML).toContain("heart-emerald-bright-3d_6d6779c0.png");
    expect(screen.getByText("Bùa Cứu Chuỗi")).toBeTruthy();
    expect((screen.getByLabelText(/Lời nhắn của Leader/i) as HTMLTextAreaElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(/Chọn phần thưởng/i), { target: { value: "none" } });
    expect((screen.getByLabelText(/Lời nhắn của Leader/i) as HTMLTextAreaElement).disabled).toBe(false);
    expect(screen.getByText("Lời nhắn trực tiếp từ Leader")).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/Lời nhắn của Leader/i), { target: { value: "Anh thấy em đã cố gắng rất nhiều." } });
    expect(screen.getAllByText("Anh thấy em đã cố gắng rất nhiều.").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /Gửi thẻ vinh danh này/i }));
    expect(onSubmit).toHaveBeenCalledWith({ tone: "warm", message: "Anh thấy em đã cố gắng rất nhiều.", rewardName: null });
  });

  it("đóng modal khi bấm lớp nền", () => {
    const onClose = vi.fn();
    render(<LeaderMomentCreator agentName="Minh" onClose={onClose} onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole("presentation"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
