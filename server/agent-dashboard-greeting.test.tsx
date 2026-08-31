// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import AgentDashboardGreeting, { getGreetingForHour } from "../client/src/components/AgentDashboardGreeting";

afterEach(() => cleanup());

describe("AgentDashboardGreeting", () => {
  it.each([
    [6, "buổi sáng", "Một ly cafe", "morning-3d_2b91e70b.png"],
    [12, "buổi trưa", "Nghỉ ngơi một chút", "noon-3d_27590f72.png"],
    [15, "buổi chiều", "Một chút cố gắng", "afternoon-3d_0720c9df.png"],
    [21, "buổi tối", "Không phải ngày nào", "night-3d_e69aa523.png"],
  ])("chọn đúng thông điệp và icon 3D %s giờ", (hour, time, quote, iconFile) => {
    const greeting = getGreetingForHour(hour);
    expect(greeting.time).toBe(time);
    expect(greeting.quote).toContain(quote);
    expect(greeting.iconUrl).toContain(iconFile);
  });

  it("hiển thị avatar người đồng hành và danh xưng động", () => {
    render(<AgentDashboardGreeting userName="Minh An" userAvatar="https://example.test/guardian.png" companionName="Loyal Guardian" />);
    expect(screen.getByText(/Minh An!/)).toBeTruthy();
    expect(screen.getByRole("img", { name: "Người đồng hành Loyal Guardian" }).getAttribute("src")).toBe("https://example.test/guardian.png");
    const timeIcon = screen.getByRole("img", { name: /Biểu tượng/ });
    expect(timeIcon.className).toContain("h-8");
    expect(timeIcon.parentElement?.className).toContain("bg-white/80");
    expect(timeIcon.parentElement?.className).toContain("backdrop-blur-md");
    expect(document.querySelector("svg.lucide-quote")?.className.baseVal).toContain("rotate-180");
  });

  it("có fallback avatar khi không truyền ảnh", () => {
    render(<AgentDashboardGreeting userAvatar="" companionName="Navigator" />);
    expect(screen.getByLabelText("Avatar dự phòng Navigator")).toBeTruthy();
  });
});
