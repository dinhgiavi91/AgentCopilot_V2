import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("/home/ubuntu/upload/pasted_content_180.txt", "utf8").replace(/\r\n/g, "\n");
const start = source.indexOf("[\n  {\n    \"type\": \"principle\"");
const end = source.indexOf("\n]\n\n2. SITUATIONAL FILTERS");
const entries = JSON.parse(source.slice(start, end + 2));
const migration = readFileSync(new URL("../supabase/migrations/20260827033000_v83_smart_leader_playbook_coaching.sql", import.meta.url), "utf8");
const seed = readFileSync(new URL("../supabase/seeds/20260827033010_v83_leader_playbook_seed.sql", import.meta.url), "utf8");
const contentClient = readFileSync(new URL("../client/src/lib/supabaseContent.ts", import.meta.url), "utf8");
const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const cms = readFileSync(new URL("../client/src/components/InPlaceContentAdmin.tsx", import.meta.url), "utf8");
const compass = readFileSync(new URL("../client/src/components/Sprint11LeaderModules.tsx", import.meta.url), "utf8");

describe("V83 Smart Leader Playbook & Coaching CRM", () => {
  it("giữ nguyên ba nội dung nhúng, loại nội dung và tags tình huống", () => {
    expect(entries).toHaveLength(3);
    expect(entries.map((entry: { type: string }) => entry.type)).toEqual(["principle", "coaching_script", "coaching_script"]);
    expect(entries.every((entry: { tags: string[] }) => Array.isArray(entry.tags) && entry.tags.length >= 2)).toBe(true);
    expect(entries.flatMap((entry: { tags: string[] }) => entry.tags)).toEqual(expect.arrayContaining(["Đang mất lửa", "Đang cãi nhau", "Chạy số cuối tháng"]));
  });

  it("seed idempotent map coaching_script tương thích và không xóa dữ liệu La Bàn cũ", () => {
    expect(seed).toContain("v83-leader-playbook-01");
    expect(seed).toContain("v83-leader-playbook-02");
    expect(seed).toContain("v83-leader-playbook-03");
    expect(seed).toContain("on conflict (legacy_source_code) do update set");
    expect(seed).toContain("'coaching'");
    expect(seed).not.toContain("delete from public.leader_playbook");
  });

  it("buộc ghi nhận coaching qua RPC của Leader, giới hạn Team và chặn contact PII", () => {
    expect(migration).toContain("create table if not exists public.coaching_logs");
    expect(migration).toContain("coaching_logs_note_no_contact_pii");
    expect(migration).toContain("v_role <> 'leader'");
    expect(migration).toContain("primary_team_id = v_team_id and role = 'advisor'");
    expect(migration).toContain("revoke all on public.coaching_logs from anon");
    expect(migration).toContain("revoke execute on function public.list_my_coaching_advisors_v1() from public, anon");
    expect(migration).toContain("revoke execute on function public.log_my_coaching_application_v1(uuid, uuid, text) from public, anon");
    expect(migration).toContain("log_my_coaching_application_v1");
    expect(contentClient).toContain('client.rpc("list_my_coaching_advisors_v1")');
    expect(contentClient).toContain('client.rpc("log_my_coaching_application_v1"');
  });

  it("hiển thị filter tags, CTA coaching và L.E.A.D chỉ trong ngữ cảnh Dashboard Leader", () => {
    expect(cms).toContain('key: "tags"');
    expect(contentClient).toContain('select("id, type, prefix, title, content, note, tags, share_text, roleplay_prompt, mini_quiz, learning_carousel, created_at")');
    expect(compass).toContain('aria-label="Lọc tình huống coaching"');
    expect(compass).toContain("🎭 Luyện tập với AI");
    expect(home).toContain("COACHING CRM · KHÔNG XP");
    expect(home).toContain('const isLeaderDashboard = pilotSession?.profile.role === "leader"');
    expect(home).toContain("Trắc Nghiệm Định Vị Phong Cách Lãnh Đạo");
    expect(home).toContain("KẾT QUẢ L.E.A.D ĐÃ LƯU");
    expect(home).toContain("Làm DISC 5 câu");
  });
});
