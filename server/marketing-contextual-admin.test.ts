import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const managerSource = readFileSync(new URL("../client/src/components/MarketingManager.tsx", import.meta.url), "utf8");
const cmsSource = readFileSync(new URL("../client/src/components/PilotAdminCMS.tsx", import.meta.url), "utf8");

describe("Marketing Contextual Admin", () => {
  it("đặt toggle Studio/Quản lý Phôi trong Marketing cho đúng role", () => {
    for (const token of [
      'useState<"studio" | "manager">("studio")',
      'pilotSession?.profile.role === "leader"',
      'pilotSession?.profile.role === "super_admin"',
      "Marketing Studio",
      "Quản lý Phôi",
      "<MarketingManager templates={content.marketing} onTemplatesChanged={refreshMarketingTemplates} />",
      "const refreshMarketingTemplates = React.useCallback(async () =>",
      "fetchContentLibrary()",
    ]) {
      expect(homeSource).toContain(token);
    }
  });

  it("gỡ CMS Marketing khỏi Pilot và nhúng schema Marketing đúng ngữ cảnh", () => {
    expect(homeSource).not.toContain('import { PilotAdminCMS }');
    expect(homeSource).not.toContain('<PilotAdminCMS />');
    expect(managerSource).toContain('allowedSchemas={MARKETING_SCHEMA}');
    expect(managerSource).toContain('defaultSchema="marketing"');
    expect(managerSource).toContain("initialRecords={initialRecords}");
    expect(managerSource).toContain("onContentChanged={onTemplatesChanged}");
    expect(cmsSource).toContain("allowedSchemas?: readonly ContentKey[]");
    expect(cmsSource).toContain("initialRecords?: ContentRecord[]");
    expect(cmsSource).toContain("useState<ContentRecord[]>(() => initialRecords ?? [])");
    expect(cmsSource).toContain("selectedSchema === \"marketing\" && initialRecords !== undefined");
    expect(cmsSource).toContain("onContentChanged?: () => Promise<void> | void");
    expect(cmsSource).toContain("await onContentChanged?.()");
    expect(cmsSource).toContain("renderPreview: (data: any = {})");
    expect(cmsSource).toContain("data?.image_url");
    expect(cmsSource).toContain("data?.message_template");
    expect(cmsSource).toContain("const saveRecord = async () =>");
    expect(cmsSource).toContain("const deleteRecord = async");
    expect(cmsSource).toContain("function getDynamicCategory(category: unknown, fallback: string)");
    expect(cmsSource).toContain("nextForm.category = getDynamicCategory(record.category, DEFAULT_MARKETING_CATEGORY)");
    expect(cmsSource).toContain('selectedSchema === "marketing" && field.key === "category"');
    expect(cmsSource).toContain("const marketingCategoryOptions = React.useMemo");
    expect(cmsSource).toContain("+ Thêm Tab (Danh mục) mới");
    expect(cmsSource).toContain("isCustomMarketingCategory");
    expect(cmsSource).not.toContain("void onContentChanged?.()");
    expect(cmsSource).not.toContain("refreshData");
  });

  it("unmount Studio hoặc CMS không hoạt động để không tạo render nền", () => {
    expect(homeSource).toContain('{activeMarketingView === "studio" && (');
    expect(homeSource).toContain('{isMarketingAdmin && activeMarketingView === "manager" && (');
    expect(homeSource).not.toContain('className={activeMarketingView === "studio" ? "block" : "hidden"}');
    expect(homeSource).not.toContain('className={activeMarketingView === "manager" ? "block" : "hidden"}');
  });
});
