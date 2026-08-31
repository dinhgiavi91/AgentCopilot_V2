import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(`${root}/${path}`, "utf8");

describe("V25 auth and role hotfix", () => {
  const api = read("server/pilotUserApi.mjs");
  const accountCms = read("client/src/components/PilotStep5BusinessModules.tsx");
  const dataLayer = read("client/src/lib/supabaseContent.ts");
  const home = read("client/src/pages/Home.tsx");

  it("accepts Director in the account API while preserving Super Admin-only access", () => {
    expect(api).toContain('role === "super_admin" || role === "director" || role === "leader" || role === "advisor"');
    expect(api).toContain('profiles[0]?.role !== "super_admin"');
    expect(dataLayer).toContain('role: "super_admin" | "director" | "leader" | "advisor"');
  });

  it("exposes Director in the management form and surfaces server-side account errors", () => {
    expect(accountCms).toContain('directorOption.value = "director"');
    expect(accountCms).toContain("Director (Giám đốc GA)");
    expect(accountCms).toContain("toast.error(notice)");
    expect(accountCms).toContain('form.role === "director" ? "GA Team của Director" : "Team"');
  });

  it("waits for session hydration and keeps each known role on its intended dashboard", () => {
    expect(home).toContain("pilotSessionHydrating");
    expect(home).toContain("Đang xác minh quyền Pilot…");
    expect(home).toContain('pilotSession?.profile.role === "super_admin" ? <AdminHomeDashboard');
    expect(home).toContain('pilotSession?.profile.role === "director" ? <LeadershipMatrixRadar role="director" />');
    expect(home).toContain('pilotSession?.profile.role === "leader" || pilotSession?.profile.role === "advisor" || !pilotSession ? <ProfileView />');
    expect(home).toContain("Quyền Pilot chưa được định tuyến");
    expect(home).toContain("setPilotSessionHydrating(false);");
  });
});
