// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AgentStreakDetailsModal from "../client/src/components/AgentStreakDetailsModal";

afterEach(() => cleanup());

describe("AgentStreakDetailsModal", () => {
  it("không render khi đóng", () => {
    render(<AgentStreakDetailsModal isOpen={false} currentStreak={5} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("hiển thị chuỗi lớn và đánh dấu mốc gần nhất khi đang ở ngày thứ 5", () => {
    render(<AgentStreakDetailsModal isOpen currentStreak={5} onClose={vi.fn()} />);

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "5" })).toBeTruthy();
    expect(screen.getAllByText("Khởi Động Hoàn Hảo")).toHaveLength(2);
    expect(screen.getByText("2 ngày")).toBeTruthy();
    expect(screen.getByTestId("streak-milestone-7").getAttribute("data-status")).toBe("next");
    expect(screen.getByTestId("streak-milestone-14").getAttribute("data-status")).toBe("upcoming");
    expect(screen.getByTestId("streak-details-header").className).toContain("shrink-0");
    expect(screen.getByTestId("streak-details-roadmap").className).toContain("flex-1");
    expect(screen.getByTestId("streak-details-roadmap").className).toContain("overflow-y-auto");
    expect(screen.getByTestId("streak-details-footer").className).toContain("shrink-0");
  });

  it("đánh dấu phần thưởng đã nhận và chuyển trọng tâm sang milestone kế tiếp", () => {
    render(<AgentStreakDetailsModal isOpen currentStreak={14} onClose={vi.fn()} />);

    expect(screen.getByTestId("streak-milestone-7").getAttribute("data-status")).toBe("reached");
    expect(screen.getByTestId("streak-milestone-14").getAttribute("data-status")).toBe("reached");
    expect(screen.getByTestId("streak-milestone-21").getAttribute("data-status")).toBe("next");
    expect(screen.getByText("7 ngày")).toBeTruthy();
  });

  it("đóng được bằng nút X, nút Đóng và click backdrop", () => {
    const closeWithX = vi.fn();
    const { unmount } = render(<AgentStreakDetailsModal isOpen currentStreak={5} onClose={closeWithX} />);
    fireEvent.click(screen.getByLabelText("Đóng chi tiết chuỗi"));
    expect(closeWithX).toHaveBeenCalledTimes(1);
    unmount();

    const closeWithFooter = vi.fn();
    const { container } = render(<AgentStreakDetailsModal isOpen currentStreak={5} onClose={closeWithFooter} />);
    fireEvent.click(screen.getByRole("button", { name: "Đóng" }));
    expect(closeWithFooter).toHaveBeenCalledTimes(1);
    fireEvent.click(container.firstElementChild as HTMLElement);
    expect(closeWithFooter).toHaveBeenCalledTimes(2);
  });
});
