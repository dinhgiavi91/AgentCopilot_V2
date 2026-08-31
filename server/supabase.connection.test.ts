import { describe, expect, it } from "vitest";

describe("Supabase connection", () => {
  it("auth settings accepts the project URL and anon key", async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(url).toMatch(/^https:\/\/.+\.supabase\.co$/);
    expect(anonKey).toBeTruthy();

    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: anonKey as string },
    });

    expect(response.status).toBe(200);
  }, 15_000);
});
