// @vitest-environment jsdom
import React from "react";
import fs from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Sprint11TargetModal } from "../client/src/components/Sprint11TargetModal";

const root = "/home/ubuntu/bhnt-learning-hub-research";
const homeSource = fs.readFileSync(`${root}/client/src/pages/Home.tsx`, "utf8");

describe("State sync Mục tiêu", () => {
  afterEach(() => cleanup());

  it("chờ callback persistence hoàn tất trước khi đóng modal Mục tiêu", async () => {
    const user = userEvent.setup();
    let resolveSave: (() => void) | undefined;
    const onSave = vi.fn(() => new Promise<void>((resolve) => { resolveSave = resolve; }));
    render(<Sprint11TargetModal role="advisor" initialAdvisor={{ bhntIncome: 30_000_000, pntIncome: 8_000_000, bhntCommission: 40, pntCommission: 15, bhntContractSize: 25_000_000, pntContractSize: 8_000_000 }} initialLeader={{ bhntRevenue: 0, pntRevenue: 0, activeAdvisors: 0, recruits: 0 }} onClose={() => undefined} onSave={onSave} />);
    await user.click(screen.getByRole("button", { name: /Lưu mục tiêu cá nhân/ }));
    expect(screen.getByRole("button", { name: /Đang lưu/ })).toBeTruthy();
    resolveSave?.();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("chỉ gán Progress Bar từ mục tiêu Supabase đã trả về", () => {
    expect(homeSource).toContain("await persistAdvisorTarget");
    expect(homeSource).toContain("setTargetIncome(persisted.targetIncome)");
    expect(homeSource).toContain("requiredMeetings: plan.requiredMeetings");
  });
});
