// @vitest-environment jsdom
import React from "react";
import fs from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { DirectorRadar } from "../client/src/components/Sprint9Modules";
import { buildGoalVsActual, mockSelfReportedSales } from "../client/src/lib/leaderSalesPicture";

const sprint9Css = fs.readFileSync("/home/ubuntu/bhnt-learning-hub-research/client/src/sprint9.css", "utf8");

describe("Bức tranh Doanh số Goal vs. Actual", () => {
  afterEach(() => cleanup());

  it("chỉ cộng doanh thu từ Nhịp Đập Ký Hợp Đồng hoặc Thành công", () => {
    const picture = buildGoalVsActual(620_000_000, mockSelfReportedSales);
    expect(picture.actualRevenue).toBe(280_000_000);
    expect(picture.successfulTouches).toBe(3);
    expect(picture.completionRate).toBe(45);
    expect(picture.progressWidth).toBe(45);
  });

  it("giới hạn bề rộng thanh tiến độ ở 100% khi thực đạt vượt mục tiêu", () => {
    const picture = buildGoalVsActual(100, [{ status: "Thành công", revenue: 150 }]);
    expect(picture.completionRate).toBe(150);
    expect(picture.progressWidth).toBe(100);
  });

  it("hiển thị Goal vs. Actual cùng progressbar trong Modal Báo Cáo GĐ", async () => {
    const user = userEvent.setup();
    render(<DirectorRadar onToast={() => undefined} />);
    await user.click(screen.getByRole("button", { name: /Xuất Báo Cáo GĐ/ }));
    expect(screen.getByText(/Tiến độ Mục tiêu/i)).toBeTruthy();
    expect(screen.getByText("620 triệu")).toBeTruthy();
    expect(screen.getByText("280 triệu")).toBeTruthy();
    expect(screen.getByText("45%")).toBeTruthy();
    expect(screen.getByRole("progressbar", { name: "Tiến độ Mục tiêu Team" }).getAttribute("aria-valuenow")).toBe("45");
    expect(screen.getByText(/Số liệu tự khai báo từ Nhịp Đập/)).toBeTruthy();
  });

  it("giữ Goal vs. Actual dễ đọc ở mobile bằng layout một cột", () => {
    expect(sprint9Css).toContain(".report-goal-vs-actual");
    expect(sprint9Css).toContain("@media(max-width:760px){.report-goal-vs-actual");
    expect(sprint9Css).toContain(".goal-actual-values{grid-template-columns:1fr}");
  });
});
