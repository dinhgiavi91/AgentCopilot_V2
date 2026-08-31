import { describe, expect, it } from "vitest";
import { buildZaloDeepLink, calculateTargetPlan, shouldShowWelcome } from "../client/src/lib/sprint4Logic";

describe("Sprint 4 interaction logic", () => {
  it("recalculates income progress and required meetings from a new target", () => {
    const plan = calculateTargetPlan(40_000_000, 15_000_000);

    expect(plan).toEqual({
      requiredMeetings: 53,
      finishedMeetings: 20,
      progress: 38,
      meetingProgress: 38,
    });
  });

  it("shows welcome only on the initial root visit and encodes the Zalo message", () => {
    expect(shouldShowWelcome("", false)).toBe(true);
    expect(shouldShowWelcome("#empathy", false)).toBe(false);
    expect(shouldShowWelcome("", true)).toBe(false);
    expect(buildZaloDeepLink("Gửi bạn lời chúc tốt đẹp nhất...")).toBe(
      "https://zalo.me/?text=G%E1%BB%ADi%20b%E1%BA%A1n%20l%E1%BB%9Di%20ch%C3%BAc%20t%E1%BB%91t%20%C4%91%E1%BA%B9p%20nh%E1%BA%A5t..."
    );
  });
});
