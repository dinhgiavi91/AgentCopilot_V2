// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LeaderMetricsGuide from "../client/src/components/LeaderMetricsGuide";

describe("LeaderMetricsGuide", () => {
  it("đồng bộ initialTab, chuyển mục lục và đóng bằng ESC", () => {
    const onClose = vi.fn();
    const { rerender } = render(<LeaderMetricsGuide isOpen={false} onClose={onClose} initialTab="morale" />);
    expect(screen.queryByRole("dialog")).toBeNull();
    rerender(<LeaderMetricsGuide isOpen onClose={onClose} initialTab="morale" />);
    expect(screen.getByRole("dialog", { name: "Từ điển Tham mưu" })).toBeTruthy();
    expect(screen.getAllByText("Chỉ số Động lực").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Cấu trúc 3 Trụ Cột" }));
    expect(screen.getAllByText("Cấu trúc 3 Trụ Cột").length).toBeGreaterThan(0);
    expect(screen.getByText(/Dùng để vạch trần năng suất ảo/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Tín hiệu Radar" }));
    expect(screen.getAllByText("Tín hiệu Radar").length).toBeGreaterThan(0);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
