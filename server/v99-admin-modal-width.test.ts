import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/bhnt-learning-hub-research";
const cms = readFileSync(`${root}/client/src/components/AdminLeaderPlaybook.tsx`, "utf8");

describe("V99 Admin Leader Playbook modal width", () => {
  it("overrides the Dialog surface rather than only styling the backdrop", () => {
    expect(cms).toContain('w-[95vw] !max-w-7xl min-h-[85vh]');
    expect(cms).toContain('overflow-hidden rounded-3xl');
  });

  it("stretches the internal responsive grid across the expanded surface", () => {
    expect(cms).toContain('grid w-full h-full');
    expect(cms).toContain('lg:grid-cols-12');
    expect(cms).toContain('lg:col-span-4');
    expect(cms).toContain('lg:col-span-8');
    expect(cms).toContain('p-6');
  });
});
