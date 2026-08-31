// @vitest-environment jsdom
import React from "react";
import fs from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContestPanel, DirectorRadar } from "../client/src/components/Sprint9Modules";

const root = "/home/ubuntu/bhnt-learning-hub-research";
const homeSource = fs.readFileSync(`${root}/client/src/pages/Home.tsx`, "utf8");
const sprint11Css = fs.readFileSync(`${root}/client/src/sprint11.css`, "utf8");

describe("Bugfix Contest và thao tác mobile", () => {
  afterEach(() => cleanup());

  it("append Contest được API trả về vào danh sách ngay khi lưu thành công", async () => {
    const user = userEvent.setup();
    const persist = vi.fn().mockResolvedValue({ id: "contest-db-1", title: "Chạm đúng hẹn", xp: 250, createdAt: "2026-08-14T00:00:00.000Z" });
    const onContestCreated = vi.fn();
    render(<ContestPanel managerMode onToast={() => undefined} onPersistContest={persist} onContestCreated={onContestCreated} />);
    await user.click(screen.getByRole("button", { name: /Tạo Contest Mới/ }));
    await user.type(screen.getByLabelText("Tên Contest"), "Chạm đúng hẹn");
    await user.clear(screen.getByLabelText("Thưởng XP"));
    await user.type(screen.getByLabelText("Thưởng XP"), "250");
    await user.click(screen.getByRole("button", { name: /^Tạo thử thách$/ }));
    expect((await screen.findAllByText("Chạm đúng hẹn")).length).toBeGreaterThan(1);
    expect(screen.getByText(/250\s*XP · Vừa tạo/)).toBeTruthy();
    expect(persist).toHaveBeenCalledWith({ title: "Chạm đúng hẹn", xp: 250 });
    expect(onContestCreated).toHaveBeenCalledWith(expect.objectContaining({ id: "contest-db-1", title: "Chạm đúng hẹn" }));
  });

  it("giữ thao tác mở Báo cáo GĐ hoạt động", async () => {
    const user = userEvent.setup();
    render(<DirectorRadar onToast={() => undefined} />);
    await user.click(screen.getByRole("button", { name: /Xuất Báo Cáo GĐ/ }));
    expect(screen.getByText(/Đội đang ở đâu/)).toBeTruthy();
  });

  it("neo lối vào Sổ cái XP và nút Báo cáo bằng CSS mobile thay vì ẩn chúng", () => {
    expect(homeSource).toContain("mobile-xp-ledger");
    expect(homeSource).toContain("Mở Sổ cái XP");
    expect(sprint11Css).toContain(".mobile-xp-ledger { position: fixed");
    expect(sprint11Css).toContain(".radar-page .report-trigger");
    expect(sprint11Css).toContain("display: inline-flex !important");
  });
});
