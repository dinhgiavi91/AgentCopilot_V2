// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import FloatingGamificationDock from "../client/src/components/FloatingGamificationDock";

afterEach(() => cleanup());

describe("FloatingGamificationDock", () => {
  it("giữ hai icon XP/Xu thu gọn trong dock Navy cố định và an toàn ở mobile", () => {
    render(<FloatingGamificationDock xp={941} coins={450} />);

    const dock = screen.getByTestId("floating-gamification-dock");
    expect(dock.className).toContain("fixed");
    expect(dock.className).toContain("right-0");
    expect(dock.className).toContain("top-[30%]");
    expect(dock.className).toContain("bg-[#0B1431]/90");
    expect(dock.className).toContain("max-md:bottom-24");
    expect(dock.className).toContain("z-40");
    for (const id of ["dock-xp-details", "dock-coins-details"]) {
      expect(screen.getByTestId(id).className).toContain("max-w-0");
      expect(screen.getByTestId(id).className).toContain("group-hover:max-w-[100px]");
    }
    expect(screen.queryByTestId("dock-streak-details")).toBeNull();
    expect(screen.queryByRole("button", { name: "Mở chi tiết Chuỗi Bền Bỉ" })).toBeNull();
  });

  it("mở đúng XP Ledger và Kho Quà qua hai icon Dock", () => {
    const onHonorClick = vi.fn();
    const onCoinsClick = vi.fn();
    render(<FloatingGamificationDock onHonorClick={onHonorClick} onCoinsClick={onCoinsClick} />);

    fireEvent.click(screen.getByRole("button", { name: "XP Ledger — Mở Sổ cái và điểm danh dự" }));
    fireEvent.click(screen.getByRole("button", { name: "Mở Kho Quà với Xu đổi quà" }));
    expect(onHonorClick).toHaveBeenCalledTimes(1);
    expect(onCoinsClick).toHaveBeenCalledTimes(1);
  });
});
