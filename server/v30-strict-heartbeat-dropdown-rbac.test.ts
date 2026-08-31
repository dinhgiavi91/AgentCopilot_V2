import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getVisibleHeartbeatMembers } from "../client/src/components/HeartbeatHierarchyPanel";

const root = process.cwd();
const migration = readFileSync(`${root}/supabase/migrations/20260826033000_v30_strict_heartbeat_dropdown_rbac.sql`, "utf8");

const members = [
  { id: "self", displayName: "Self", teamId: "team", role: "leader" as const },
  { id: "admin", displayName: "Super Admin", teamId: "team", role: "super_admin" as const },
  { id: "director", displayName: "Director", teamId: "team", role: "director" as const },
  { id: "leader", displayName: "Leader", teamId: "team", role: "leader" as const },
  { id: "advisor", displayName: "Advisor", teamId: "team", role: "advisor" as const },
];

describe("V30 strict Heartbeat dropdown RBAC", () => {
  it("shows Leaders only Advisors and excludes the current account", () => {
    expect(getVisibleHeartbeatMembers(members, { id: "self", role: "leader" }).map((member) => member.role)).toEqual(["advisor"]);
  });

  it("shows Directors only Leaders and Advisors", () => {
    const visibleRoles = getVisibleHeartbeatMembers(members, { id: "director", role: "director" }).map((member) => member.role);
    expect(visibleRoles).toEqual(["leader", "leader", "advisor"]);
    expect(visibleRoles.every((role) => role === "leader" || role === "advisor")).toBe(true);
  });

  it("keeps all other accounts visible only to Super Admin", () => {
    expect(getVisibleHeartbeatMembers(members, { id: "admin", role: "super_admin" }).map((member) => member.id)).toEqual(["self", "director", "leader", "advisor"]);
  });

  it("rejects crafted leader/director requests for superior Heartbeat records in the RPC", () => {
    expect(migration).toContain("Leader can only inspect Advisor Heartbeat.");
    expect(migration).toContain("Director can only inspect Leader or Advisor Heartbeat.");
    expect(migration).toContain("v_role = 'leader' and u.role = 'advisor'");
    expect(migration).toContain("v_role = 'director' and u.role in ('leader', 'advisor')");
    expect(migration).toContain("u.id <> v_actor_id");
  });
});
