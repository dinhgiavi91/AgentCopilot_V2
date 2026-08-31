import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");

describe("Root content data flow", () => {
  it("dùng callback ổn định và effect tải Content Library đúng một lần khi mount", () => {
    expect(homeSource).toContain("const loadRootContent = React.useCallback(async () => fetchContentLibrary(), []);");
    expect(homeSource).toContain("loadRootContent()");
    expect(homeSource).toMatch(/useEffect\(\(\) => \{\s+if \(!hasSupabaseContentConfig\) return;[\s\S]{0,4000}?\}, \[\]\);/);
  });

  it("không đồng bộ content/templates qua effect dependency gây render storm", () => {
    expect(homeSource).not.toContain("}, [content]);");
    expect(homeSource).not.toContain("}, [templates]);");
    expect(homeSource).not.toContain("}, [refreshData]);");
  });

  it("dedupe event session và notification realtime trước khi tạo state update root", () => {
    expect(homeSource).toContain("function arePilotSessionsEquivalent(current: PilotSession | null, next: PilotSession | null)");
    expect(homeSource).toContain("setPilotSession((current) => arePilotSessionsEquivalent(current, session) ? current : session)");
    expect(homeSource).toContain("setPilotSession((current) => arePilotSessionsEquivalent(current, refreshedSession) ? current : refreshedSession)");
    expect(homeSource).toContain("const existing = current.find((item) => item.id === notification.id);");
    expect(homeSource).toContain("return current;");
  });
});
