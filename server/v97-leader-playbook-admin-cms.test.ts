import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/bhnt-learning-hub-research";
const cms = readFileSync(`${root}/client/src/components/AdminLeaderPlaybook.tsx`, "utf8");
const content = readFileSync(`${root}/client/src/lib/supabaseContent.ts`, "utf8");
const compass = readFileSync(`${root}/client/src/components/Sprint11LeaderModules.tsx`, "utf8");

describe("V97 Admin Leader Playbook CMS", () => {
  it("chỉ mount quản lý đầy đủ cho Super Admin tại La Bàn thực tế", () => {
    expect(compass).toContain('import { AdminLeaderPlaybook } from "./AdminLeaderPlaybook"');
    expect(compass).toContain("isSuperAdmin && <AdminLeaderPlaybook");
    expect(cms).toContain("Leader Playbook Manager");
    expect(cms).toContain("fetchAdminLeaderPlaybook");
    expect(cms).toContain("Chỉnh sửa");
    expect(cms).toContain("Thêm mới");
  });

  it("tạo form động đầy đủ cho cả principle và coaching_script", () => {
    for (const field of ["Tình huống Learning Carousel", "Lựa chọn A", "Lựa chọn B", "Đáp án đúng", "Giải thích khi đúng", "Giải thích khi sai", "Tiêu đề tổng kết", "Nội dung tổng kết", "Bài tập", "Tags (ngăn cách bằng dấu phẩy)", "Action text", "Roleplay prompt"]) {
      expect(cms).toContain(field);
    }
    expect(cms).toContain("Thêm tình huống");
    expect(cms).toContain('editor.type === "principle"');
  });

  it("đọc/lưu JSONB qua hàm Super Admin role-gated và bảo toàn Zero-PII", () => {
    expect(content).toContain("export async function fetchAdminLeaderPlaybook");
    expect(content).toContain("export async function saveAdminLeaderPlaybook");
    expect(content).toContain("assertDynamicContentManager(session)");
    expect(content).toContain("validateLeaderSituations");
    expect(content).toContain("learning_carousel:");
    expect(content).toContain("roleplay_prompt:");
    expect(content).toContain("onConflict: \"id\"");
    expect(content).toContain("containsContactPii(text)");
  });

  it("dùng pure white, gold và nền homework sáng hơn cho Summary Navy", () => {
    expect(compass).toContain("!text-yellow-400");
    expect(compass).toContain('className="mt-3 text-sm font-medium leading-6 !text-white"');
    expect(compass).toContain("bg-slate-800/80");
    expect(compass).toContain("!text-gray-50");
  });
});
