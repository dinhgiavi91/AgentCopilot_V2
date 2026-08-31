import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const social = readFileSync(new URL("../client/src/components/PilotStep4SocialModules.tsx", import.meta.url), "utf8");
const crm = readFileSync(new URL("../client/src/components/Sprint11CrmModules.tsx", import.meta.url), "utf8");
const adminPlaybook = readFileSync(new URL("../client/src/components/AdminLeaderPlaybook.tsx", import.meta.url), "utf8");
const adminHome = readFileSync(new URL("../client/src/components/AdminHomeDashboard.tsx", import.meta.url), "utf8");
const content = readFileSync(new URL("../client/src/lib/supabaseContent.ts", import.meta.url), "utf8");


describe("V111 lite patch", () => {
  it("applies the required Community PostCard classes", () => {
    expect(social).toContain("bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 mb-6 overflow-hidden");
    expect(social).toContain("text-gray-900 text-[15px] md:text-base font-medium leading-relaxed mt-3");
    expect(social).toContain("hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg px-4 py-2 font-semibold");
  });

  it("renders the CRM nurture history as a structured table", () => {
    expect(crm).toContain('<table className="w-full text-left border-collapse text-sm">');
    expect(crm).toContain('<thead className="bg-gray-50 border-b">');
    expect(crm).toContain("Ngày chạm");
    expect(crm).toContain("Giai đoạn");
    expect(crm).toContain("Hành động");
    expect(crm).toContain("Follow-up");
    expect(crm).toContain("<tbody>");
  });

  it("lets an admin select a playbook row to populate the form", () => {
    expect(adminPlaybook).toContain("onClick={() => { setEditor(mapItemToEditor(record)); setNotice(\"\"); setError(\"\"); }}");
    expect(adminPlaybook).toContain("cursor-pointer");
  });

  it("fetches and displays the God Mode quiz question bank", () => {
    expect(content).toContain("export async function fetchAdminDailyQuizBank(): Promise<DailyQuiz[]>");
    expect(adminHome).toContain("const [quizBank, setQuizBank] = useState<DailyQuiz[]>([]);");
    expect(adminHome).toContain("fetchAdminDailyQuizBank()");
    expect(adminHome).toContain('<div className="max-h-64 overflow-y-auto mt-6 border-t pt-4">');
    expect(adminHome).toContain("quizBank.map((item) =>");
  });

  it("confirms no manus.space asset URL remains in the frontend source", () => {
    const frontend = [social, crm, adminPlaybook, adminHome, content].join("\n");
    expect(frontend).not.toContain("manus.space");
  });
});
