import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(`${root}/${path}`, "utf8");

describe("V27 CMS UX and GAD seeding", () => {
  const cms = read("client/src/components/UserManagementCMS.tsx");
  const home = read("client/src/pages/Home.tsx");
  const api = read("server/pilotUserApi.mjs");
  const content = read("client/src/lib/supabaseContent.ts");
  const css = read("client/src/index.css");

  it("uses separate create and edit dialog state over a default account table", () => {
    expect(cms).toContain('const [createOpen, setCreateOpen] = useState(false)');
    expect(cms).toContain('const [editing, setEditing] = useState<PilotManagedAccount | null>(null)');
    expect(cms).toContain('aria-label="Quản lý Tài khoản"');
    expect(cms).toContain("Tạo tài khoản mới");
    expect(cms).toContain("Cập nhật tài khoản");
    expect(home).toContain("<UserManagementCMS session={pilotSession} />");
    expect(css).toContain(".step5-user-management { display: none; }");
  });

  it("enforces the self-edit role lock in the Edit dialog", () => {
    expect(cms).toContain("session?.userId === editing.id");
    expect(cms).toContain("disabled={selfEditing}");
    expect(cms).toContain("Khóa an toàn: Bạn không thể tự thay đổi vai trò của chính mình.");
    expect(cms).toContain("Khóa an toàn đang hoạt động");
  });

  it("preserves supported role contracts for GAD creation", () => {
    expect(cms).toContain('<option value="director">Director (Giám đốc GA)</option>');
    expect(content).toContain('role: "super_admin" | "director" | "leader" | "advisor"');
    expect(api).toContain('role === "super_admin" || role === "director" || role === "leader" || role === "advisor"');
  });
});
