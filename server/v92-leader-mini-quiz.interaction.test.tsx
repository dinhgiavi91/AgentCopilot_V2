/* @vitest-environment jsdom */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Sprint11LeaderCompass } from "../client/src/components/Sprint11LeaderModules";

const principle = {
  code: "principle-01",
  type: "principle" as const,
  prefix: "01",
  topic: "Nguyên tắc kiểm thử",
  core_thinking: "Dòng một\n• Dòng hai",
  sort_order: 1,
  learning_carousel: {
    situations: [{ question: "Câu hỏi kiểm thử?", options: ["A. Sai", "B. Đúng"], correct_index: 1, correct_explanation: "Phản hồi đúng.", wrong_explanation: "Phản hồi sai." }],
    summary: { title: "Tổng kết kiểm thử", content: "Nội dung tổng kết.", homework: "Bài tập kiểm thử." },
  },
};

describe("V94 Leader Learning Carousel interaction", () => {
  afterEach(() => cleanup());

  it("hiển thị phản hồi đồng cảm và khóa quiz sau đáp án sai, không gọi bất kỳ reward nào", async () => {
    const user = userEvent.setup({ document: window.document });
    const onOpenRoleplay = vi.fn();
    render(<Sprint11LeaderCompass items={[principle]} loading={false} error="" onOpenRoleplay={onOpenRoleplay} />);
    await user.click(screen.getByRole("button", { name: /Nguyên tắc kiểm thử/ }));
    const wrongOption = screen.getByRole("button", { name: "A. Sai" });
    const rightOption = screen.getByRole("button", { name: "B. Đúng" });
    await user.click(wrongOption);
    expect(screen.getByText("Chưa đúng — hãy nhìn lại tác động dài hạn với đội ngũ.")).toBeTruthy();
    expect(screen.getByText("Phản hồi sai.")).toBeTruthy();
    expect(wrongOption.getAttribute("disabled")).not.toBeNull();
    expect(rightOption.getAttribute("disabled")).not.toBeNull();
    expect(onOpenRoleplay).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Tiếp tục →" }));
    expect(screen.getByText("Tổng kết kiểm thử")).toBeTruthy();
    expect(screen.getByText("Bài tập kiểm thử.")).toBeTruthy();
  });

  it("hiển thị xác nhận khi chọn đúng và khóa quiz", async () => {
    const user = userEvent.setup({ document: window.document });
    render(<Sprint11LeaderCompass items={[principle]} loading={false} error="" onOpenRoleplay={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /Nguyên tắc kiểm thử/ }));
    const rightOption = screen.getByRole("button", { name: "B. Đúng" });
    await user.click(rightOption);
    expect(screen.getByText("Đúng rồi — bạn đã chọn một hướng xử lý bền vững.")).toBeTruthy();
    expect(screen.getByText("Phản hồi đúng.")).toBeTruthy();
    expect(rightOption.getAttribute("disabled")).not.toBeNull();
  });
});
