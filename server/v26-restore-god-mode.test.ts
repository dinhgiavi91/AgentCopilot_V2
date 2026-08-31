import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(`${root}/${path}`, "utf8");

describe("V26 restore God Mode and prevent self-demotion", () => {
  const accountApi = read("server/pilotUserApi.mjs");
  const accountCms = read("client/src/components/PilotStep5BusinessModules.tsx");

  it("enforces the self-demotion lock on the server, not only in the UI", () => {
    expect(accountApi).toContain("return { userId: identity.id }");
    expect(accountApi).toContain('userId === actor.userId && payload.role !== "super_admin"');
    expect(accountApi).toContain("Khóa an toàn: Bạn không thể tự thay đổi vai trò Super Admin của chính mình.");
  });

  it("disables the own-role control and shows a visible safety explanation", () => {
    expect(accountCms).toContain("editing && editing.id === session.userId");
    expect(accountCms).toContain("roleSelect.disabled = editingOwnAccount");
    expect(accountCms).toContain("*Khóa an toàn: Bạn không thể tự thay đổi vai trò của chính mình.");
    expect(accountCms).toContain("existingLockHint?.remove()");
  });
});
