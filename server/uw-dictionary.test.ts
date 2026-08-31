import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildUwLetter, getUwDocumentChecklist, getUwGuideText, hasPotentialUnderwritingPii } from "../client/src/components/TroLyThamDinh";
import type { UwDictionaryEntry, UwTemplate } from "../client/src/lib/supabaseContent";

const entry: UwDictionaryEntry = {
  id: "uw-1",
  team_id: null,
  condition: "Nang thận (N28.1)",
  layman: "Cần phân biệt nguyên nhân mắc phải và bẩm sinh.",
  decision: "Cần UW đối chiếu quy tắc hiện hành.",
  docs: "Kết quả siêu âm và bệnh án có mã ICD.",
  tips: "Kiểm tra mã ICD trước khi nộp hồ sơ.",
  icd_code: "N28.1",
  category: "Thận tiết niệu",
  company_tag: "Áp dụng chung",
  reference_link: null,
  is_active: true,
  created_at: "2026-08-24T00:00:00Z",
  updated_at: "2026-08-24T00:00:00Z",
};

const templates: UwTemplate[] = [
  { id: "t1", team_id: null, template_code: "MEDICAL", template_name: "Giải trình Bệnh lý", guide_text: "Trình bày trung thực dựa trên chứng từ.", checklist: ["Sổ khám bệnh"], letter_body: "Kính gửi {company}. Mã {reference}. Vấn đề {issue_name}. Mốc {time}. Diễn tiến {treatment}. Chứng từ {docs}.", phase: "PRE_UW", is_active: true, created_at: "", updated_at: "" },
  { id: "t2", team_id: null, template_code: "VSSID_FIX", template_name: "Giải trình Sai lệch VssID", guide_text: "Đối chiếu khách quan dữ kiện hành chính và y khoa.", checklist: ["Trích xuất VssID"], letter_body: "VssID {reference}: {issue_name}; {treatment}; {docs}.", phase: "PRE_UW", is_active: true, created_at: "", updated_at: "" },
  { id: "t3", team_id: null, template_code: "NEGOTIATE_EXCLUSION", template_name: "Đàm phán Loại trừ", guide_text: "Tôn trọng quản trị rủi ro và quy tắc sản phẩm.", checklist: ["Điều khoản sản phẩm"], letter_body: "Loại trừ {reference}: {issue_name}; {treatment}; {docs}.", phase: "PRE_UW", is_active: true, created_at: "", updated_at: "" },
  { id: "t4", team_id: null, template_code: "RE_EVALUATION", template_name: "Bổ sung Kê khai", guide_text: "Chủ động bổ sung dữ kiện có thể đối chiếu.", checklist: ["Tờ khai bổ sung"], letter_body: "Bổ sung {reference}: {issue_name}; {time}; {treatment}; {docs}.", phase: "PRE_UW", is_active: true, created_at: "", updated_at: "" },
  { id: "t5", team_id: null, template_code: "ACCIDENT", template_name: "Tai nạn Sinh hoạt", guide_text: "Chứng từ đầy đủ là nghĩa vụ; chỉ giải trình thiếu chứng từ khi khách quan, có thể kiểm chứng.", checklist: ["Giấy ra viện", "Biên lai tài chính"], letter_body: "Tai nạn {reference}: {issue_name}; {time}; {treatment}; {docs}. Chỉ giải trình nguyên nhân khách quan, có thể kiểm chứng.", phase: "CLAIM", is_active: true, created_at: "", updated_at: "" },
  { id: "t6", team_id: null, template_code: "CLAIM", template_name: "Khiếu nại Quyền lợi", guide_text: "Tôn trọng quyết định ban đầu và nêu căn cứ đối chiếu.", checklist: ["Thông báo Claim"], letter_body: "Claim {reference}: {issue_name}; {treatment}; {docs}.", phase: "CLAIM", is_active: true, created_at: "", updated_at: "" },
];

describe("Trợ lý Thẩm định — UW Dictionary Enterprise", () => {
  it("tạo sáu bản nháp từ template động và chỉ thay mã tham chiếu không định danh", () => {
    const base = { company: "Công ty BHNT A", reference: "Hồ sơ A-17", issueName: "Nang thận (N28.1)", time: "Tháng 5/2026", statusOrHistory: "Ổn định, cần chuyên môn xác nhận.", documents: "Siêu âm và giấy xác nhận." };
    const letters = templates.map((template) => buildUwLetter(entry, { ...base, letterType: template.template_code }, template));
    for (const letter of letters) {
      expect(letter).toContain("Hồ sơ A-17");
      expect(letter).toContain("Không chứa thông tin định danh khách hàng");
      expect(letter).toContain("CẦN UW/CHUYÊN MÔN RÀ SOÁT");
      expect(letter).not.toContain("{reference}");
      expect(letter).not.toContain("{patient}");
    }
    expect(letters[4]).toContain("khách quan, có thể kiểm chứng");
  });

  it("lấy guide và checklist từ template CMS theo type, rồi hợp nhất chứng từ từ điển", () => {
    expect(getUwGuideText("MEDICAL", templates)).toContain("trung thực");
    expect(getUwGuideText("ACCIDENT", templates)).toContain("Chứng từ đầy đủ là nghĩa vụ");
    const accidentChecklist = getUwDocumentChecklist("ACCIDENT", entry.docs, templates);
    expect(accidentChecklist).toContain("Kết quả siêu âm và bệnh án có mã ICD.");
    expect(accidentChecklist).toContain("Giấy ra viện");
    expect(accidentChecklist).toContain("Biên lai tài chính");
  });

  it("phát hiện email và số điện thoại trước khi tạo bản nháp", () => {
    expect(hasPotentialUnderwritingPii("khach@example.com")).toBe(true);
    expect(hasPotentialUnderwritingPii("0901 234 567")).toBe(true);
    expect(hasPotentialUnderwritingPii("Hồ sơ A-17, tháng 5/2026")).toBe(false);
  });

  it("giữ contract Enterprise cho migration, CRUD templates và Generator Supabase động", () => {
    const dataLayer = readFileSync("client/src/lib/supabaseContent.ts", "utf8");
    const dictionaryCms = readFileSync("client/src/components/TroLyThamDinhCMS.tsx", "utf8");
    const templateCms = readFileSync("client/src/components/UwTemplatesCMS.tsx", "utf8");
    const studio = readFileSync("client/src/components/TroLyThamDinh.tsx", "utf8");
    const migration = readFileSync("/home/ubuntu/uw_enterprise_migration.json", "utf8");

    expect(migration).toContain("ADD COLUMN IF NOT EXISTS icd_code");
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS public.uw_templates");
    expect(migration).toContain("uw_templates_manage");
    expect(dataLayer).toContain('from("uw_templates")');
    expect(dataLayer).toContain("export async function fetchUwTemplates");
    expect(dataLayer).toContain("export async function saveUwTemplate");
    expect(dataLayer).toContain("export async function deleteUwTemplate");
    expect(dataLayer).toContain("Template chỉ dùng {reference}");
    expect(dictionaryCms).toContain("Mã ICD");
    expect(dictionaryCms).toContain("Hãng áp dụng");
    expect(templateCms).toContain("Contextual Admin · Supabase uw_templates");
    expect(templateCms).toContain("Zero-PII");
    expect(templateCms).toContain("saveUwTemplate");
    expect(templateCms).toContain("deleteUwTemplate");
    expect(studio).toContain("fetchUwTemplates");
    expect(studio).toContain("activeTemplate");
    expect(studio).toContain("canViewTeamScopedContent(session?.profile.role)");
    expect(studio).toContain("filterTeamScopedContent(entries, effectiveDataViewMode, currentTeamId)");
    expect(studio).toContain("filterTeamScopedContent(templates, dataViewMode, teamId)");
    expect(studio).toContain("Kiến thức Hệ thống (Global)");
    expect(studio).toContain("Nội bộ Team của bạn (Local)");
    expect(studio).toContain("template.letter_body.replace");
    expect(studio).not.toContain("formPatient");
    expect(studio).not.toContain('setLetterType("APPEAL")');
  });
});
