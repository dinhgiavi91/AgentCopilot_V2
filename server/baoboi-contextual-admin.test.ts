import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const pageSource = readFileSync(new URL("../client/src/components/BaoBoiPage.tsx", import.meta.url), "utf8");
const studioSource = readFileSync(new URL("../client/src/components/BaoBoiStudio.tsx", import.meta.url), "utf8");
const cmsSource = readFileSync(new URL("../client/src/components/BaoBoiCMS.tsx", import.meta.url), "utf8");
const genericCmsSource = readFileSync(new URL("../client/src/components/PilotAdminCMS.tsx", import.meta.url), "utf8");
const contentSource = readFileSync(new URL("../client/src/lib/supabaseContent.ts", import.meta.url), "utf8");

describe("BaoBoi Contextual Admin", () => {
  it("giữ Studio/CMS trong parent role-gated và chỉ mount view đang chọn", () => {
    for (const token of [
      'const isSuperAdmin = session?.profile.role === "super_admin"',
      'useState<"studio" | "cms">("studio")',
      '{viewMode === "studio" && <BaoBoiStudio',
      '{isSuperAdmin && viewMode === "cms" && <BaoBoiCMS',
      '<BaoBoiStudio session={session}',
      "La Bàn Kỹ Năng",
      "Quản lý Bảo Bối",
    ]) expect(pageSource).toContain(token);
    expect(pageSource).not.toContain('session?.profile.role === "super_admin" || session?.profile.role === "leader"');
    expect(pageSource).not.toContain('className={viewMode === "studio" ? "block" : "hidden"}');
  });

  it("nhóm tab theo pillar và giữ Mastery Loop 3 trạm trên AI Mentor", () => {
    for (const token of [
      "const availableTabs = useMemo(() =>",
      "const currentTabPlaybooks = useMemo(() =>",
      "canViewTeamScopedContent(session?.profile.role)",
      "filterTeamScopedContent(playbooks, effectiveDataViewMode, currentTeamId)",
      "Kiến thức Hệ thống (Global)",
      "Nội bộ Team của bạn (Local)",
      "export function getPillar",
      "Kiến thức Y Khoa & Pháp lý",
      "Nghệ thuật Khai vấn",
      "Xử lý Từ chối & Chốt Sales",
      "Tiêu chuẩn CSKH",
      "flashcard-scene group perspective-1000",
      "preserve-3d group-hover:rotate-y-180",
      "function PlaybookCard",
      "const openPlaybook = () =>",
      "window.matchMedia(\"(max-width: 1023px)\").matches",
      "function MobilePlaybookDetail",
      "const [selectedItem, setSelectedItem]",
      "function DesktopPlaybookDetail",
      "if (!selectedItem) return null",
      "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full",
      "Xem toàn bộ",
      "relative z-[99] pointer-events-auto cursor-pointer mt-auto flex",
      "onPractice={setRoleplayItem}",
      "max-w-5xl",
      "lg:flex-row",
      "Kịch bản chuẩn",
      "Logic & Dẫn chứng (The Why)",
      "Sự thật / Customer Insight",
      "Iceberg Cognitive Learning Path · 5 bước",
      "1. Tình huống (Phần nổi)",
      "2. Sự thật / Customer Insight",
      "3. Góc nhìn định tâm",
      "4. Logic & Dẫn chứng (The Why)",
      "5. Kịch bản chuẩn (The How)",
      "const customerInsight = playbook.customer_insight ||",
      "export function buildAiRoleplayPayload",
      "system_prompt",
      "customer_insight: playbook.customer_insight",
      "standard_script: playbook.coaching_prompts",
      "containsPotentialPii",
      "const [aiResult, setAiResult]",
      "Biến kiến thức thành của bạn",
      "Báo cáo Phản tỉnh",
      "const [userScript, setUserScript] = useState(\"\")",
      "startRoleplay",
      "Bản nháp của bạn (không phải transcript audio)",
      "Phân tích Điểm mù (Blind Spot Analysis)",
      "Khách hàng mô phỏng",
      "Đang trình bày tình huống",
      "Đến lượt bạn. Hãy tự tin phản hồi!",
      "AI Mentor đang tạo góp ý mô phỏng",
      "const [roleplayItem, setRoleplayItem]",
      "type RoleplayStage = \"preparation\" | \"customer_playing\" | \"idle\" | \"recording\" | \"analyzing\" | \"result\"",
      "if (isRoleplayPlaybook(playbook)) setRoleplayItem(playbook);",
      "Không thu, xử lý hoặc lưu trữ âm thanh",
    ]) expect(studioSource).toContain(token);
  });

  it("dùng CMS schema playbooks và Hệ Kỹ Năng động từ records thực", () => {
    for (const token of [
      'allowedSchemas={PLAYBOOK_SCHEMA}',
      'defaultSchema="playbooks"',
      "onContentChanged={onPlaybooksChanged}",
      'key: "required_level", label: "Cấp độ"',
      'key: "customer_insight", label: "Sự thật / Customer Insight"',
      'key: "core_logic", label: "Logic Cốt lõi & Dẫn chứng (The Why)"',
      'key: "coaching_prompts", label: "Kịch bản khai vấn"',
      "const playbookCategoryOptions = React.useMemo",
      "isCustomPlaybookCategory",
      "+ Thêm mới Hệ Kỹ Năng",
      "nextForm.skill_system = getDynamicCategory(record.skill_system, DEFAULT_PLAYBOOK_CATEGORY)",
      "CRUD trực tiếp · Supabase playbook_cards",
      "Xóa Bảo Bối",
      "readOnly={selectedSchema === \"playbooks\" && field.key === \"code\" && Boolean(editingCode)}",
    ]) expect(token.includes("allowedSchemas") || token.includes("defaultSchema") || token.includes("onContentChanged") ? cmsSource : genericCmsSource).toContain(token);
    expect(cmsSource).toContain("customer_insight: playbook.customer_insight ?? \"\"");
    expect(cmsSource).toContain("core_logic: playbook.core_logic ?? \"\"");
    expect(contentSource).toContain("customer_insight: string | null");
    expect(contentSource).toContain("core_logic: string | null");
    expect(contentSource).toContain("situation, customer_insight, mindset, core_logic, coaching_prompts");
  });

  it("nối Content Library và phần thưởng roleplay tại parent Home", () => {
    expect(homeSource).toContain("const refreshPlaybooks = React.useCallback(async () =>");
    expect(homeSource).toContain("<BaoBoiPage");
    expect(homeSource).toContain('source: "training_roleplay"');
    expect(homeSource).not.toContain("<RoleplayModal");
  });
});
