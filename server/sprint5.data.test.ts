import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const pagePath = new URL("../client/src/pages/Home.tsx", import.meta.url);
const clientPath = new URL("../client/src/lib/supabaseContent.ts", import.meta.url);
const migrationPath = new URL("../supabase/migrations/20260813_sprint5_content_library.sql", import.meta.url);

describe("Sprint 5 Supabase data migration", () => {
  it("uses the official logo and fetches all four Content Library tables", async () => {
    const [page, client] = await Promise.all([readFile(pagePath, "utf8"), readFile(clientPath, "utf8")]);
    expect(page).toContain('bhnt-official-logo_60b68461.png');
    expect(page).toContain('fetchContentLibrary');
    expect(client).toContain('playbook_cards');
    expect(client).toContain('empathy_dictionary');
    expect(client).toContain('leader_playbook');
    expect(client).toContain('marketing_templates');
  });

  it("defines idempotent schema, RLS and expected seed counts", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain('create table if not exists public.playbook_cards');
    expect(sql).toContain('enable row level security');
    expect(sql).toContain('Expected seeded rows: playbook_cards=13, empathy_dictionary=4, leadership_compass=6, marketing_templates=9');
  });
});
