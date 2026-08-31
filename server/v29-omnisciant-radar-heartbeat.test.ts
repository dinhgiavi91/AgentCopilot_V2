import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(`${root}/${path}`, "utf8");

describe("V29 Omnisciant Radar and Heartbeat hierarchy", () => {
  const radarMigration = read("supabase/migrations/20260826030000_v29_omnisciant_radar_heartbeat.sql");
  const heartbeatFix = read("supabase/migrations/20260826031000_v29_heartbeat_scope_fix.sql");
  const dataLayer = read("client/src/lib/supabaseContent.ts");
  const matrix = read("client/src/components/LeadershipMatrixRadar.tsx");
  const heartbeat = read("client/src/components/HeartbeatHierarchyPanel.tsx");
  const drilldown = read("client/src/components/TeamOperationalRadarDrilldown.tsx");
  const home = read("client/src/pages/Home.tsx");
  const routes = read("client/src/lib/sprint6Logic.ts");

  it("uses SECURITY DEFINER RPCs and denies anonymous drill-down access", () => {
    expect(radarMigration).toContain("create or replace function public.get_team_operational_radar_v1");
    expect(radarMigration).toContain("create or replace function public.get_heartbeat_hierarchy_v1");
    expect(radarMigration).toContain("security definer");
    expect(radarMigration).toContain("revoke all on function public.get_team_operational_radar_v1(uuid) from public, anon");
    expect(radarMigration).toContain("revoke all on function public.get_heartbeat_hierarchy_v1(uuid, uuid) from public, anon");
  });

  it("enforces Team hierarchy and keeps advisor Heartbeat self-only", () => {
    expect(radarMigration).toContain("t.parent_team_id = v_primary_team_id");
    expect(heartbeatFix).toContain("if v_role = 'advisor' and p_user_id is null then p_user_id := v_actor_id;");
    expect(heartbeatFix).toContain("Advisor can only inspect own Heartbeat.");
    expect(heartbeatFix).toContain("Selected user is outside your Heartbeat scope.");
  });

  it("keeps the returned operational contract Zero-PII", () => {
    expect(radarMigration).not.toContain("customer_name");
    expect(radarMigration).not.toContain("phone");
    expect(radarMigration).not.toContain("policy_number");
    expect(radarMigration).toContain("service_level");
    expect(radarMigration).toContain("action_result");
  });

  it("renders Admin-only Team drill-down and a dedicated Heartbeat tab", () => {
    expect(matrix).toContain('role === "super_admin" && <section');
    expect(matrix).toContain("TeamOperationalRadarDrilldown");
    expect(drilldown).toContain("Chỉ xem · Không tạo can thiệp");
    expect(heartbeat).toContain("fetchHeartbeatHierarchy");
    expect(heartbeat).toContain("Bạn chỉ thấy log của chính mình.");
    expect(home).toContain('{ id: "heartbeat" as View, label: "Nhịp Đập"');
    expect(home).toContain('{view === "heartbeat" && <HeartbeatHierarchyPanel');
    expect(routes).toContain('"heartbeat"');
  });

  it("calls scope-enforced RPCs rather than client-side table reads", () => {
    expect(dataLayer).toContain('client.rpc("get_team_operational_radar_v1"');
    expect(dataLayer).toContain('client.rpc("get_heartbeat_hierarchy_v1"');
  });
});
