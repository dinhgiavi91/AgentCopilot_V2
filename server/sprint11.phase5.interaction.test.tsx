// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { MarketingStudio, RoleplayModal, SalesVideoReels } from "../client/src/components/Sprint10VideoModules";

describe("Sprint 11 Phase 5 demo interactions", () => {
  afterEach(() => cleanup());

  it("chuyển Roleplay 03:00 sang feedback AI mô phỏng bằng keyboard", async () => {
    const user = userEvent.setup();
    render(<RoleplayModal situation="Khách cần thêm thời gian suy nghĩ." prompt="Điều gì khiến anh/chị muốn cân nhắc thêm?" onClose={() => undefined} />);
    const record = screen.getByRole("button", { name: /Bắt đầu Record/ });
    record.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: /Dừng & nhận góp ý/ })).toBeTruthy();
    await user.keyboard("{Enter}");
    expect(screen.getByText(/AI COACHING · MÔ PHỎNG DEMO/)).toBeTruthy();
    expect(screen.getByText(/không.*lưu trữ/i)).toBeTruthy();
  });

  it("chọn Reels và cập nhật phân tích clip đang xem", async () => {
    const user = userEvent.setup();
    render(<SalesVideoReels />);
    const secondReel = screen.getByRole("button", { name: /Xem Xử lý từ chối phí đắt/ });
    await user.click(secondReel);
    expect(secondReel.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText(/Hỏi điều khách đang so sánh/)).toBeTruthy();
  });

  it("đồng bộ mẫu Marketing thật với thông điệp Studio", async () => {
    const user = userEvent.setup();
    render(<MarketingStudio session={null} templates={[
      { code: "MKT01", category: "Chăm sóc", occasion: "Lời chúc sinh nhật", message_template: "Chúc bạn một ngày thật vui.", image_url: null, sort_order: 1 },
      { code: "MKT02", category: "Chăm sóc", occasion: "Lời cảm ơn", message_template: "Cảm ơn bạn đã đồng hành.", image_url: null, sort_order: 2 },
    ]} />);
    expect(screen.getByDisplayValue("Chúc bạn một ngày thật vui.")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Lời cảm ơn/ }));
    expect(screen.getByDisplayValue("Cảm ơn bạn đã đồng hành.")).toBeTruthy();
    expect(screen.getByText(/Không nhập tên, email/)).toBeTruthy();
  });
});
