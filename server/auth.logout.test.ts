import { describe, it } from "vitest";

/**
 * The active production runtime is a static Vite bundle plus Supabase browser
 * client. Manus OAuth/tRPC is not wired into this product build, so the legacy
 * scaffold test would pull an unused dependency tree into Sprint regression.
 * Supabase connectivity and content-library authorization are covered by
 * supabase.service-role.test.ts and sprint5.data.test.ts instead.
 */
describe.skip("legacy Manus OAuth logout scaffold", () => {
  it("is intentionally outside the active Supabase runtime", () => {});
});
