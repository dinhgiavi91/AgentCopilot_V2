import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync(`${process.cwd()}/client/src/pages/Home.tsx`, "utf8");

describe("V33 Player-Coach profile routing", () => {
  it("opens the Profile tab by default for every authenticated Pilot role", () => {
    expect(home).toContain('const nextView: View = "profile";');
    expect(home).not.toContain('pilotSession.profile.role === "leader"\n          ? "radar"');
  });

  it("routes Leaders and Advisors to the personal Agent Home instead of the fallback", () => {
    expect(home).toContain('pilotSession?.profile.role === "leader" || pilotSession?.profile.role === "advisor" || !pilotSession ? <ProfileView />');
    expect(home).not.toContain('pilotSession && pilotSession.profile.role !== "advisor" ? <div className="rounded-3xl border border-amber-200');
  });

  it("keeps Super Admin global and Director agency-scoped macro dashboards", () => {
    expect(home).toContain('pilotSession?.profile.role === "super_admin" ? <AdminHomeDashboard');
    expect(home).toContain('pilotSession?.profile.role === "director" ? <LeadershipMatrixRadar role="director" />');
  });
});
