import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/20260825111000_v22_admin_radar_tarot_agent_mirror.sql", "utf8");
const content = readFileSync("client/src/lib/supabaseContent.ts", "utf8");
const admin = readFileSync("client/src/components/AdminHomeDashboard.tsx", "utf8");
const oracle = readFileSync("client/src/components/LeaderWeeklyOracle.tsx", "utf8");
const mirror = readFileSync("client/src/components/AgentMirrorModal.tsx", "utf8");
const home = readFileSync("client/src/pages/Home.tsx", "utf8");

describe("V22 Leadership Radar, Tarot CMS và Agent Mirror", () => {
  it("tạo kho Tarot có RLS Super Admin và chặn contact PII", () => {
    for (const token of ["create table if not exists public.cosmic_tarot_cards", "cosmic_tarot_cards_no_contact_pii", "tarot_read_authenticated", "tarot_write_super_admin", "role = 'super_admin'"]) expect(migration).toContain(token);
    expect(migration).toContain("from public, anon");
  });

  it("giữ tổng hợp Leadership Radar và Agent Mirror theo quyền tối thiểu", () => {
    for (const token of ["get_admin_leadership_radar_v1", "get_my_agent_mirror_v1", "role = 'super_admin'", "v_role <> 'advisor'", "supported_advisors", "performance_score", "next_tip"]) expect(migration).toContain(token);
    expect(migration).not.toContain("customer_name");
    expect(migration).not.toContain("policy_number");
  });

  it("nối helpers có kiểm role và validation Zero-PII", () => {
    for (const token of ["fetchAdminLeadershipRadar", "fetchMyAgentMirror", "fetchAdminCosmicTarotCards", "saveAdminCosmicTarotCard", "deleteAdminCosmicTarotCard", "containsContactPii", "role !== \"super_admin\"", "role !== \"advisor\""]) expect(content).toContain(token);
  });

  it("render ma trận Leadership Radar và CMS Tarot trong God Mode", () => {
    for (const token of ["Radar Đánh Giá Lãnh Đạo", "Leadership Radar", "Bài Tín Hiệu Vũ Trụ", "Oracle CMS", "fetchAdminLeadershipRadar", "preserveAspectRatio=\"none\""]) expect(admin).toContain(token);
    expect(admin).toContain("Cấu Hình Cột Mốc Chuỗi");
    expect(admin).toContain("Ngân Hàng Nạp Não");
  });

  it("dùng Smart Tarot động cho Oracle và mở Agent Mirror riêng cho TVV", () => {
    expect(oracle).toContain("drawSmartTarotCard");
    expect(oracle).toContain("mapTarotCard");
    expect(oracle).not.toContain("const cardsDB");
    for (const token of ["Hành Trình Của Tôi", "fetchMyAgentMirror", "xpEarned", "learningToolsUsed", "agentMirrorOpen", "<AgentMirrorModal"]) expect(`${mirror}\n${home}`).toContain(token);
  });
});
