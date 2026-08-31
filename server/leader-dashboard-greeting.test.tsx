// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import LeaderDashboardGreeting, { getLeaderGreetingForHour } from "../client/src/components/LeaderDashboardGreeting";

afterEach(() => cleanup());

describe("LeaderDashboardGreeting", () => {
  it.each([
    [6, "buổi sáng", "dẫn dắt đội ngũ", "morning-3d_2b91e70b.png"],
    [12, "buổi trưa", "Người thuyền trưởng", "noon-3d_27590f72.png"],
    [15, "buổi chiều", "lời động viên", "afternoon-3d_0720c9df.png"],
    [21, "buổi tối", "Dẫn dắt một tập thể", "night-3d_e69aa523.png"],
  ])("chọn đúng copy và icon 3D ở %s giờ", (hour, time, quote, iconFile) => {
    const greeting = getLeaderGreetingForHour(hour);
    expect(greeting.time).toBe(time);
    expect(greeting.quote).toContain(quote);
    expect(greeting.iconUrl).toContain(iconFile);
  });

  it("hiển thị avatar leader, icon 3D Frosted Glass và Quote đúng chiều", () => {
    render(<LeaderDashboardGreeting userName="Bảo Ngọc" userAvatar="https://example.test/leader.png" companionName="Navigator" />);
    expect(screen.getByText(/Bảo Ngọc!/)).toBeTruthy();
    expect(screen.getByRole("img", { name: "Người đồng hành Navigator" }).getAttribute("src")).toBe("https://example.test/leader.png");
    const timeIcon = screen.getByRole("img", { name: /Biểu tượng/ });
    expect(timeIcon.className).toContain("h-8");
    expect(timeIcon.parentElement?.className).toContain("bg-white/80");
    expect(timeIcon.parentElement?.className).toContain("backdrop-blur-md");
    expect(document.querySelector("svg.lucide-quote")?.className.baseVal).toContain("rotate-180");
  });

  it("có fallback avatar khi leader chưa có ảnh", () => {
    render(<LeaderDashboardGreeting userAvatar="" companionName="Agent Copilot" />);
    expect(screen.getByLabelText("Avatar dự phòng Agent Copilot")).toBeTruthy();
  });
});
