import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const content = readFileSync(new URL("../client/src/lib/supabaseContent.ts", import.meta.url), "utf8");
const crm = readFileSync(new URL("../client/src/components/Sprint11CrmModules.tsx", import.meta.url), "utf8");
const community = readFileSync(new URL("../client/src/components/PilotStep4SocialModules.tsx", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20260827094000_v71_tvv_dynamic_logic.sql", import.meta.url), "utf8");

describe("V71 TVV full logic wiring", () => {
  it("lưu DISC checkpoint vào profiles và chỉ mở modal khi TVV chưa có kết quả", () => {
    expect(migration).toContain("add column if not exists disc_result text");
    expect(migration).toContain("create or replace function public.complete_my_disc_checkpoint_v1");
    expect(content).toContain('supabase.rpc("complete_my_disc_checkpoint_v1"');
    expect(content).toContain("onboarding_completed_at, disc_result, leadership_style, leadership_style_description, created_at");
    expect(home).toContain("pilotSession?.profile.role !== \"advisor\"");
    expect(home).toContain("const storedResult = pilotSession.profile.disc_result");
    expect(home).toContain("if (content.discQuestions.length) setDiscOpen(true)");
  });

  it("lấy Daily Push từ CMS active theo ngày, ghi XP qua luồng hiện hữu và khóa theo completion persisted", () => {
    expect(migration).toContain("where q.is_active");
    expect(migration).toContain("order by md5(q.code || current_date::text), q.code");
    expect(home).toContain("setDailyPushOpen(true)");
    expect(home).toContain('aria-label="Nạp Não Mỗi Sáng"');
    expect(home).toContain("const completedQuizToday = lastQuizDate === todayDateKey");
    expect(home).toContain("setDailyPushOpen(false);");
  });

  it("giữ bốn station TVV đọc dữ liệu live và bind Case Study video_url với fallback", () => {
    for (const source of ["news_90s", "case_studies", "empathy_dictionary", "feedback_config"]) expect(content).toContain(source);
    expect(home).toContain("function CaseStudyVideo");
    expect(home).toContain("youtube-nocookie.com/embed");
    expect(home).toContain("Video tình huống sẽ được cập nhật");
  });

  it("fetch CRM scenario theo cả stage/context, default follow-up vẫn editable và refresh danh sách ngay sau ghi", () => {
    expect(migration).toContain("create table if not exists public.crm_nurture_scenarios");
    expect(content).toContain("export async function fetchCrmNurtureScenario");
    expect(content).toContain('.eq("stage", stage)');
    expect(content).toContain('.eq("context", context)');
    expect(crm).toContain("useEffect(() => {");
    expect(crm).toContain("fetchCrmNurtureScenario(stage, context)");
    expect(crm).toContain("getCrmDefaultFollowUpDate");
    expect(crm).toContain("setFollowUpTouched(true)");
    expect(home).toContain("setCrmRecords(await fetchPilotCrmJournals())");
    expect(home).toContain("onNavigate={openView}");
  });

  it("chỉ thay Tailwind Top 5 XP bằng card sáng và podium Gold/Silver/Bronze", () => {
    expect(community).toContain("bg-white p-5 text-slate-900 shadow-lg");
    expect(community).toContain("from-yellow-300 via-amber-400 to-orange-500");
    expect(community).toContain("from-slate-200 to-slate-400");
    expect(community).toContain("from-orange-300 to-rose-400");
    expect(community).toContain("shadow-[0_0_15px_rgba(251,191,36,0.5)]");
    expect(community).toContain("hover:-translate-y-1");
    expect(community).toContain("<Crown");
  });
});
