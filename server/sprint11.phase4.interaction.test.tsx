// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RadarHistoryPanel, Sprint11LeaderCompass } from "../client/src/components/Sprint11LeaderModules";

const leadershipItems = [
  { code: "L01", type: "principle" as const, prefix: "01", topic: "Mô hình tảng băng trôi", core_thinking: "Quan sát hành vi trước khi kết luận về động lực.", share_text: "Thông điệp để chia sẻ", sort_order: 1 },
  { code: "L02", type: "coaching_script" as const, prefix: "CHẠM 01", topic: "5 Whys", core_thinking: "Hỏi tiếp để nhận diện điểm nghẽn có thể hành động.", note: "15 phút 1-1", tags: ["Mất động lực"], roleplay_prompt: "Prompt coaching", sort_order: 2 },
];

describe("Sprint 11 Phase 4 Leader interactions", () => {
  afterEach(() => cleanup());

  it("mở drill-down Radar bằng keyboard và tạo kế hoạch coaching không định danh", async () => {
    const user = userEvent.setup();
    const onToast = vi.fn();
    render(<RadarHistoryPanel onToast={onToast} />);
    const trigger = screen.getByRole("button", { name: /Chuỗi hoạt động đang gián đoạn/ });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText(/Hẹn cafe ngắn/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Tạo kế hoạch chạm/ }));
    expect(onToast).toHaveBeenCalledWith(expect.stringContaining("không định danh"));
  });

  it("chuyển tab La Bàn giữa nguyên tắc và kịch bản coaching", async () => {
    const user = userEvent.setup();
    render(<Sprint11LeaderCompass items={leadershipItems} loading={false} error="" onCopyShare={vi.fn()} onOpenRoleplay={vi.fn()} />);
    const coaching = screen.getByRole("tab", { name: /Kịch bản Coaching/ });
    expect(screen.getByRole("tab", { name: /Nguyên tắc/ }).getAttribute("aria-selected")).toBe("true");
    await user.click(coaching);
    expect(coaching.getAttribute("aria-selected")).toBe("true");
    expect(screen.getAllByText("15 phút 1-1", { exact: false })).toHaveLength(1);
  });
});
