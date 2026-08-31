import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const sprint8CssPath = new URL("../client/src/sprint8.css", import.meta.url);

describe("Sprint 8 white-surface contrast inventory", () => {
  it("đặt foreground ink cho toàn bộ nhóm card/modal/surface trắng và control nhập liệu", async () => {
    const css = await readFile(sprint8CssPath, "utf8");
    const auditedSurfaces = [
      "content-state", "target-modal", "welcome-modal", "pro-gate", "radar-empty",
      "disc-launch", "disc-modal", "ledger-modal", "log-modal", "energy-store-modal",
      "feedback-form", "cover-card", "news-card", "reward-card",
    ];
    for (const surface of auditedSurfaces) expect(css).toContain(surface);
    expect(css).toContain("color: #0F172A");
    expect(css).toContain("select, option, input, textarea");
    expect(css).toContain("background-color: #FFFFFF");
  });
});
