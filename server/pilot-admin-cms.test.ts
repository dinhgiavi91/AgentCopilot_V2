import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../client/src/components/PilotAdminCMS.tsx", import.meta.url), "utf8");

describe("Pilot Admin CMS", () => {
  it("khai báo schema đầy đủ cho ba module content", () => {
    for (const token of ["const CONTENT_SCHEMAS", "playbook_cards", "leadership_compass", "marketing_templates", "skill_system", "customer_insight", "Sự thật / Customer Insight", "mindset", "occasion", "image_url", "coaching_prompts", "core_thinking", "message_template"]) {
      expect(source).toContain(token);
    }
  });

  it("dùng Supabase persistence, card preview inline và textarea đủ cao", () => {
    for (const token of ["hasSupabaseContentConfig", "createClient", ".upsert(payload, { onConflict: \"code\" })", "schema.renderPreview(formData)", "Mở Bảo Bối", "Nhập Link URL để hiển thị hình ảnh", "Chữ ký mô phỏng Zero-PII", "aspect-[4/5]", "CHẠM", "min-h-[120px]", "MÔ PHỎNG HIỂN THỊ TRÊN APP TVV", "h-[calc(100vh-100px)]", "sticky top-4"]) {
      expect(source).toContain(token);
    }
  });
});
