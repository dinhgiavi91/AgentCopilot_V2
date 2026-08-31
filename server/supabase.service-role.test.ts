import { describe, expect, it } from "vitest";

describe("Supabase service-role access", () => {
  it("authenticates against the lightweight Auth settings endpoint", async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(url).toBeTruthy();
    expect(key).toBeTruthy();

    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key!, Authorization: `Bearer ${key!}` },
    });

    expect(response.ok).toBe(true);
  });

  it.skipIf(process.env.RUN_SUPABASE_MANAGEMENT_CHECK !== "true")("authenticates to the Management API with a Personal Access Token", async () => {
    const pat = process.env.SUPABASE_MANAGEMENT_PAT;
    expect(pat).toBeTruthy();

    const response = await fetch("https://api.supabase.com/v1/projects?limit=1", {
      headers: { Authorization: `Bearer ${pat!}` },
    });

    expect(response.ok).toBe(true);
  });
});
