import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const expected = {
  playbook_cards: 13,
  empathy_dictionary: 4,
  leadership_compass: 6,
  marketing_templates: 9,
} as const;

describe("Sprint 5 Content Library RLS", () => {
  it("allows the browser Anon Key to read all public content tables with at least the seeded baseline", async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(url).toBeTruthy();
    expect(anonKey).toBeTruthy();

    const client = createClient(url!, anonKey!, { auth: { persistSession: false } });
    for (const [table, expectedCount] of Object.entries(expected)) {
      const { count, error } = await client.from(table).select("code", { count: "exact", head: true });
      expect(error).toBeNull();
      expect(count ?? 0).toBeGreaterThanOrEqual(expectedCount);
    }
  });
});
