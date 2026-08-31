// @vitest-environment jsdom
import React from "react";
import fs from "node:fs";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdvancedDirectorReport } from "../client/src/components/AdvancedDirectorReport";

vi.mock("html-to-image", () => ({ toPng: vi.fn(async () => "data:image/png;base64,report") }));

const sprint9Css = fs.readFileSync("/home/ubuntu/bhnt-learning-hub-research/client/src/sprint9.css", "utf8");

describe("Báo Cáo Giám Đốc nâng cao", () => {
  afterEach(() => cleanup());

  it("hiển thị 01B hiệu suất tháng trước, trend chart và giữ Mục tiêu chỉ đọc", () => {
    render(<AdvancedDirectorReport onClose={() => undefined} onToast={() => undefined} />);
    expect(screen.getByText(/Hiệu suất tháng trước/i)).toBeTruthy();
    expect(screen.getByText("+18%")).toBeTruthy();
    expect(screen.getByText("-6%")).toBeTruthy();
    expect(screen.getByRole("img", { name: /Biểu đồ doanh thu tự khai báo/i })).toBeTruthy();
    expect(screen.queryByRole("textbox", { name: /Mục tiêu/i })).toBeNull();
  });

  it("mở drill-down Top đóng góp khi bấm số Thực đạt", async () => {
    const user = userEvent.setup();
    render(<AdvancedDirectorReport onClose={() => undefined} onToast={() => undefined} />);
    await user.click(screen.getByRole("button", { name: /280 triệu/i }));
    expect(screen.getByLabelText("Top đóng góp thực đạt")).toBeTruthy();
    expect(screen.getByText("TVV #01")).toBeTruthy();
    expect(screen.getByText("TVV #04")).toBeTruthy();
  });

  it("có menu xuất PDF/PNG và CSS không tràn chart ở viewport mobile", async () => {
    const user = userEvent.setup();
    render(<AdvancedDirectorReport onClose={() => undefined} onToast={() => undefined} />);
    await user.click(screen.getByRole("button", { name: /Tải Báo Cáo/i }));
    expect(screen.getByRole("button", { name: /PDF nhiều trang/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Ảnh PNG/i })).toBeTruthy();
    expect(sprint9Css).toContain("@media(max-width:760px)");
    expect(sprint9Css).toContain(".month-comparison-grid{grid-template-columns:1fr}");
    expect(sprint9Css).toContain(".revenue-trend svg{display:block;width:100%;height:auto");
  });

  it("xuất ảnh PNG bằng html-to-image và kích hoạt file tải xuống", async () => {
    const user = userEvent.setup();
    const downloadSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    render(<AdvancedDirectorReport onClose={() => undefined} onToast={() => undefined} />);
    await user.click(screen.getByRole("button", { name: /Tải Báo Cáo/i }));
    await user.click(screen.getByRole("button", { name: /Ảnh PNG/i }));
    await waitFor(() => expect(downloadSpy).toHaveBeenCalled());
    expect((downloadSpy.mock.instances[0] as HTMLAnchorElement).download).toBe("bao-cao-giam-doc.png");
    downloadSpy.mockRestore();
  });
});
