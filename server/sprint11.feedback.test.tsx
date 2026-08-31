// @vitest-environment jsdom
import React from "react";
import fs from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { PersistentDirectorReport } from "../client/src/components/Sprint11LeaderModules";
import { getJournalNextSteps } from "../client/src/lib/sprint9Logic";

const root = "/home/ubuntu/bhnt-learning-hub-research";
const homeSource = fs.readFileSync(`${root}/client/src/pages/Home.tsx`, "utf8");
const cssSource = fs.readFileSync(`${root}/client/src/sprint11.css`, "utf8");
const htmlSource = fs.readFileSync(`${root}/client/index.html`, "utf8");

describe("Feedback Sprint 11 — regression", () => {
  afterEach(() => cleanup());

  it("đưa next-step theo tín hiệu ghi chú Zero-PII mà không thêm định danh khách hàng", () => {
    const steps = getJournalNextSteps("Khách muốn dời lịch và hẹn lại tuần sau", "pre_sale", "financial_goal");
    expect(steps.steps[0]).toMatch(/khung giờ cụ thể/i);
    expect(steps.cadence).toMatch(/5 ngày/);
    expect(JSON.stringify(steps)).not.toMatch(/tên khách hàng|số điện thoại|email/i);
  });

  it("cho Leader thu gọn và mở lại Báo cáo Giám đốc bằng keyboard", async () => {
    const user = userEvent.setup();
    render(<PersistentDirectorReport onToast={() => undefined} />);
    expect(screen.getByText("TVV hoạt động")).toBeTruthy();
    const toggle = screen.getByRole("button", { name: /Thu gọn/ });
    toggle.focus();
    await user.keyboard("{Enter}");
    expect(screen.queryByText("TVV hoạt động")).toBeNull();
    await user.keyboard("{Enter}");
    expect(screen.getByText("Tỷ lệ chạm")).toBeTruthy();
  });

  it("neo các sửa UX quan trọng: font, modal, dashboard, Radar và Marketing", () => {
    expect(htmlSource).toContain("Plus+Jakarta+Sans");
    expect(cssSource).toContain(".store-backdrop.sprint6-backdrop");
    expect(cssSource).toContain(".daily-quiz");
    expect(cssSource).toContain(".dashboard-motivation-art");
    expect(homeSource).toContain("LeaderCommandCenter");
    expect(homeSource).toContain("FounderPilotOverview");
    expect(homeSource).toContain("MarketingStudio");
    expect(homeSource).toContain("templates={content.marketing}");
  });
});
