// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HeaderGamificationBar from "../client/src/components/HeaderGamificationBar";

afterEach(() => cleanup());

describe("HeaderGamificationBar", () => {
  it("tách Chuỗi, danh dự XP Navy và Xu đổi quà Amber với số liệu định dạng", () => {
    const { container } = render(<HeaderGamificationBar xp={1250} rank="Chuyên viên 1 năm" coins={450} currentStreak={2} />);

    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("Ngày")).toBeTruthy();
    expect(screen.getByText("Chuyên viên 1 năm")).toBeTruthy();
    expect(screen.getByText("1.250")).toBeTruthy();
    expect(screen.getByText("450")).toBeTruthy();
    expect(screen.getByText("XP")).toBeTruthy();
    expect(screen.getByText("Xu")).toBeTruthy();
    expect(container.firstElementChild?.className).toContain("xl:flex");
    const capsule = screen.getByTestId("twin-capsule");
    expect(capsule.className).toContain("bg-[#1E2B4D]/80");
    const xpButton = screen.getByRole("button", { name: "XP Ledger — Mở Sổ cái và điểm danh dự" });
    const coinsButton = screen.getByRole("button", { name: "Mở Kho Quà với Xu đổi quà" });
    expect(xpButton.className).toContain("border-r");
    expect(xpButton.className).toContain("hover:bg-white/5");
    expect(coinsButton.className).toContain("hover:bg-white/5");
  });

  it("mở đúng luồng Chuỗi, XP Ledger và Kho Quà khi nhấn từng pill", () => {
    const onOpenStreakModal = vi.fn();
    const onHonorClick = vi.fn();
    const onCoinsClick = vi.fn();
    render(<HeaderGamificationBar onOpenStreakModal={onOpenStreakModal} onHonorClick={onHonorClick} onCoinsClick={onCoinsClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Mở chi tiết Chuỗi Bền Bỉ" }));
    fireEvent.click(screen.getByRole("button", { name: "XP Ledger — Mở Sổ cái và điểm danh dự" }));
    fireEvent.click(screen.getByRole("button", { name: "Mở Kho Quà với Xu đổi quà" }));
    expect(onOpenStreakModal).toHaveBeenCalledTimes(1);
    expect(onHonorClick).toHaveBeenCalledTimes(1);
    expect(onCoinsClick).toHaveBeenCalledTimes(1);
  });
});
