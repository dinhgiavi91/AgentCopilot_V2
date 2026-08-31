import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../client/src/components/AdminDashboard.tsx", import.meta.url), "utf8");

describe("Admin Control Center UI skeleton", () => {
  it("có ma trận tài khoản, dropdown role/team và menu hành động", () => {
    for (const token of ["User &amp; Team Matrix", "+ Tạo Tài Khoản Mới", "Vai trò của ${user.name}", "Team của ${user.name}", "Mở hành động cho ${user.name}", "Vô hiệu hóa", "border-slate-200", "rounded-xl"]) {
      expect(source).toContain(token);
    }
  });

  it("có form Kho Bạc XP với ba loại giao dịch và execution CTA", () => {
    for (const token of ["Kho Bạc XP &amp; Ngân Sách", "Cấp ngân sách tháng", "Thưởng nóng", "Trừ vi phạm", "Số lượng XP", "Lý do", "Thực thi Giao dịch", "executeTreasuryTransaction"]) {
      expect(source).toContain(token);
    }
  });
});
