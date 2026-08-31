import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(`${root}/${path}`, "utf8");

describe("V28 Hybrid Director Radar", () => {
  const migration = read("supabase/migrations/20260825133000_v28_director_hybrid_radar.sql");
  const home = read("client/src/pages/Home.tsx");
  const hybrid = read("client/src/components/DirectorHybridRadar.tsx");
  const dataLayer = read("client/src/lib/supabaseContent.ts");

  it("keeps operational RPCs Team-scoped while allowing Director micro access", () => {
    expect(migration).toContain("v_role not in ('leader', 'director', 'super_admin')");
    expect(migration).toContain("v_role not in ('leader', 'director')");
    expect(migration).toContain("i.team_id = v_team_id");
    expect(migration).toContain("revoke all on function public.get_team_recovery_watchlist_v1() from public, anon");
    expect(migration).toContain("revoke all on function public.draw_smart_tarot_v1(text, uuid) from public, anon");
  });

  it("routes Director to a segmented Macro/Direct hybrid without replacing Leader Radar", () => {
    expect(home).toContain("<DirectorHybridRadar session={pilotSession}");
    expect(home).toContain('if (role === "leader" && pilotSession)');
    expect(hybrid).toContain('useState<"macro" | "micro">("macro")');
    expect(hybrid).toContain("Quản trị vĩ mô");
    expect(hybrid).toContain("Quân trực tiếp");
    expect(hybrid).toContain('<LeadershipMatrixRadar role="director" />');
    expect(hybrid).toContain("<LeaderCommandCenter session={session}");
  });

  it("filters the operational signal feed to the actor's primary Team and permits Director helpers", () => {
    expect(dataLayer).toContain('.eq("team_id", session.profile.primary_team_id)');
    expect(dataLayer).toContain('["leader", "director", "super_admin"].includes(session.profile.role)');
    expect(dataLayer).toContain('["leader", "director"].includes(session.profile.role)');
  });
});
