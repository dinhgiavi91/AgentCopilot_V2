import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/bhnt-learning-hub-research";
const vite = readFileSync(`${root}/vite.config.ts`, "utf8");
const css = readFileSync(`${root}/client/src/index.css`, "utf8");
const tailwind = readFileSync(`${root}/client/tailwind.config.js`, "utf8");
const app = readFileSync(`${root}/client/src/App.tsx`, "utf8");
const home = readFileSync(`${root}/client/src/pages/Home.tsx`, "utf8");
const radar = readFileSync(`${root}/client/src/components/PilotStep2Modules.tsx`, "utf8");

describe("Tailwind, Sonner và Radar kiến trúc", () => {
  it("đăng ký Tailwind Vite plugin và entrypoint CSS quét đúng client source", () => {
    expect(vite).toContain('import tailwindcss from "@tailwindcss/vite"');
    expect(vite).toContain("plugins: [tailwindcss(), storageProxy(), pilotUserApi()]");
    expect(css).toContain('@import "tailwindcss";');
    expect(tailwind).toContain('content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]');
  });

  it("dùng một Toaster Sonner và không còn toast thủ công trong Home", () => {
    expect(app).toContain('<Toaster position="top-right" duration={3000} closeButton={true} visibleToasts={1} />');
    expect(home).toContain('import { toast } from "sonner"');
    expect(home).toContain("toast.success(");
    expect(home).toContain("toast.error(");
    for (const removed of ["const notify =", "toastTimeoutRef", "setToast(", "className=\"command-toast\""]) expect(home).not.toContain(removed);
  });

  it("đặt HelpCircle eJoy tại đúng PilotRadar component", () => {
    expect(radar).toContain("relative group inline-block z-[100]");
    expect(radar).toContain("group-hover:opacity-100 group-hover:visible");
    expect(radar).toContain("📖 Cách dùng Radar");
  });
});
