import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(`${root}/${path}`, "utf8");

describe("V23 General Agency Director hierarchy", () => {
  const migration = read("supabase/migrations/20260825114000_v23_ga_director_hierarchy.sql");
  const home = read("client/src/pages/Home.tsx");
  const types = read("client/src/lib/pilotTypes.ts");
  const dataLayer = read("client/src/lib/supabaseContent.ts");
  const matrix = read("client/src/components/LeadershipMatrixRadar.tsx");
  const accountApi = read("server/pilotUserApi.mjs");

  it("adds an indexed self-reference for direct GA child teams", () => {
    expect(migration).toContain("add column if not exists parent_team_id uuid references public.teams(id) on delete cascade");
    expect(migration).toContain("create index if not exists teams_parent_team_id_idx");
  });

  it("adds Director to the canonical profile role contract", () => {
    expect(migration).toContain("alter type public.pilot_role add value if not exists 'director'");
    expect(types).toContain('"super_admin" | "director" | "leader" | "advisor"');
    expect(accountApi).toContain('role === "director"');
    expect(dataLayer).toContain('role: "super_admin" | "director" | "leader" | "advisor"');
  });

  it("enforces Global or direct-child Agency scope only inside the SECURITY DEFINER RPC", () => {
    expect(migration).toContain("security definer");
    expect(migration).toContain("v_role not in ('super_admin', 'director')");
    expect(migration).toContain("v_role = 'super_admin' or t.parent_team_id = v_agency_team_id");
    expect(migration).toContain("'scope', case when v_role = 'super_admin' then 'global' else 'agency' end");
    expect(migration).toContain("revoke all on function public.get_admin_leadership_radar_v1() from public, anon");
    expect(migration).toContain("grant execute on function public.get_admin_leadership_radar_v1() to authenticated");
  });

  it("does not allow the browser to broaden the Director scope", () => {
    expect(dataLayer).toContain('client.rpc("get_admin_leadership_radar_v1")');
    expect(matrix).toContain("component never sends");
    expect(matrix).not.toContain("parentTeamId");
    expect(matrix).toContain("phạm vi Team con được kiểm soát trong RPC");
  });

  it("routes Super Admin to Matrix and Director to the scoped Hybrid Radar while retaining Leader Command Center", () => {
    expect(home).toContain('if (role === "super_admin") return <LeadershipMatrixRadar role="super_admin" />');
    expect(home).toContain('if (role === "director" && pilotSession) return <DirectorHybridRadar');
    expect(home).toContain('if (role === "leader" && pilotSession) return <div className="screen-enter radar-page gated-radar-wrap"><LeaderCommandCenter');
    expect(home).toContain("Radar Lãnh Đạo chưa áp dụng cho TVV.");
  });
});
