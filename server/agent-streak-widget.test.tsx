// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AgentStreakWidget from "../client/src/components/AgentStreakWidget";

const milestones = [
  { id: "seven", milestoneDay: 7, title: "Khởi động", rewardLabel: "+50 XP", xpReward: 50, sortOrder: 7 },
  { id: "fourteen", milestoneDay: 14, title: "Giữ nhịp", rewardLabel: "+150 XP", xpReward: 150, sortOrder: 14 },
  { id: "thirty", milestoneDay: 30, title: "Kỷ luật thép", rewardLabel: "+500 XP", xpReward: 500, sortOrder: 30 },
];

afterEach(() => cleanup());

describe("AgentStreakWidget V14", () => {
  it("tính progress động từ mốc trước tới mốc kế tiếp, không render chuỗi vòng tròn cố định", () => {
    render(<AgentStreakWidget currentStreak={5} milestones={milestones} />);

    expect(screen.getByText(/CHUỖI BỀN BỈ/)).toBeTruthy();
    expect(screen.getByText(/2 ngày/)).toBeTruthy();
    expect(screen.getByRole("progressbar", { name: "Tiến độ tới mốc 7 ngày" }).getAttribute("aria-valuenow")).toBe("71");
    expect(screen.queryByLabelText(/Ngày 1/)).toBeNull();
  });

  it("cho phép claim khi mốc đã đạt nhưng chưa nhận", () => {
    const onClaimMilestone = vi.fn();
    render(<AgentStreakWidget currentStreak={7} milestones={milestones} unclaimedMilestone={milestones[0]} onClaimMilestone={onClaimMilestone} />);

    fireEvent.click(screen.getByRole("button", { name: "Nhận 50 XP" }));
    expect(onClaimMilestone).toHaveBeenCalledWith(milestones[0]);
  });

  it("hiển thị 100% khi đã vượt qua mọi milestone hiện có", () => {
    render(<AgentStreakWidget currentStreak={45} milestones={milestones} />);

    expect(screen.getByText(/đã vượt qua mọi cột mốc hiện tại/i)).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("gọi callback khi người dùng mở Chi tiết", () => {
    const onDetails = vi.fn();
    render(<AgentStreakWidget currentStreak={5} milestones={milestones} onDetails={onDetails} />);

    fireEvent.click(screen.getByRole("button", { name: "Xem chi tiết Chuỗi Bền Bỉ" }));
    expect(onDetails).toHaveBeenCalledTimes(1);
  });
});
