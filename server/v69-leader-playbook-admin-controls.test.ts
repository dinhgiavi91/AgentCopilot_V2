import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const compass = readFileSync(new URL("../client/src/components/Sprint11LeaderModules.tsx", import.meta.url), "utf8");
const controls = readFileSync(new URL("../client/src/components/InPlaceContentAdmin.tsx", import.meta.url), "utf8");
const content = readFileSync(new URL("../client/src/lib/supabaseContent.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20260826215000_v69_leader_playbook_note.sql", import.meta.url), "utf8");

describe("V69 Leader Playbook Admin Controls", () => {
  it("gate control La Bàn bằng role Super Admin và hiển thị CTA thêm nội dung", () => {
    expect(home).toContain('isSuperAdmin={pilotSession?.profile.role === "super_admin"}');
    expect(compass).toContain('isSuperAdmin && <AdminLeaderPlaybook');
    expect(compass).toContain('import { AdminLeaderPlaybook } from "./AdminLeaderPlaybook"');
    expect(compass).toContain('onChanged={onContentChanged ?? (() => undefined)}');
  });

  it("có icon sửa/xóa accordion và menu ba chấm cho coaching", () => {
    for (const marker of ["Pencil", "Trash2", "MoreVertical", "Mở menu nội dung", "Chỉnh sửa", "Xóa"]) expect(controls).toContain(marker);
    expect(compass).toContain('data-leader-principles="accordion"');
    expect(compass).toContain('data-leader-coaching="card-grid"');
  });

  it("lưu note/tagline cùng Type, Title và Markdown content vào leader_playbook", () => {
    expect(controls).toContain('key: "note", label: "Ghi chú / Tagline"');
    expect(content).toContain('const note = optionalCmsText(input.note, 280);');
    expect(content).toContain('select("id, type, prefix, title, content, note, tags, share_text, roleplay_prompt, mini_quiz, learning_carousel, created_at")');
    expect(migration).toContain('add column if not exists note text');
  });
});
