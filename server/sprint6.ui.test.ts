import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const homePath = new URL("../client/src/pages/Home.tsx", import.meta.url);
const baoBoiStudioPath = new URL("../client/src/components/BaoBoiStudio.tsx", import.meta.url);
const sprint6CssPath = new URL("../client/src/sprint6.css", import.meta.url);
const sprint8CssPath = new URL("../client/src/sprint8.css", import.meta.url);

describe("Sprint 6 operational UI", () => {
  it("giữ đủ entry point sidebar và smart actions yêu cầu", async () => {
    const source = await readFile(homePath, "utf8");
    for (const route of ["disc", "cover", "feedback"]) expect(source).toContain(`openView(\"${route}\")`);
    expect(source).toContain('openNewsSection("news")');
    expect(source).toContain('openNewsSection("case")');
    expect(source).toContain('className="fab-log cta-glow fixed bottom-6 right-6 z-40"');
    expect(source).toContain("setLogOpen(true)");
    expect(source).toContain("showLedger");
    expect(source).toContain("xp-clickable");
  });

  it("render từ Operational Library và dùng Leader Command Center theo quyền Profile", async () => {
    const source = await readFile(homePath, "utf8");
    expect(source).toContain("content.discQuestions.length");
    expect(source).toContain("content.discProfiles.find");
    expect(source).toContain("TroLyThamDinh");
    expect(source).toContain("visibleNews.map");
    expect(source).toContain("submitFeedback");
    expect(source).toContain("LeaderCommandCenter");
    expect(source).toContain("LeadershipMatrixRadar");
  });

  it("có wizard DISC, Daily Log theo Cấp độ dịch vụ và XP rewards từ Master Data", async () => {
    const source = await readFile(homePath, "utf8");
    expect(source).toContain("startDisc");
    expect(source).toContain("chooseDiscAnswer");
    expect(source).toContain('className="disc-question-card"');
    expect(source).toContain('className="disc-result"');
    expect(source).toContain("content.serviceLevels.map");
    expect(source).toContain("service-level-explainer");
    expect(source).toContain("Ký Hợp Đồng");
    expect(source).toContain('logAction === "Dời lịch"');
    expect(source).toContain("content.xpRewards.map");
    expect(source).toContain("Trạm Tiếp Năng Lượng");
    expect(source).toContain('"daily_quiz_correct"');
    expect(source).toContain('"daily_quiz_incorrect"');
    expect(source).toContain("function DailyQuiz()");
    expect(source).toContain("NẠP NÃO MỖI SÁNG · SUPABASE");
    expect(source).toContain("content.dailyQuizzes");
  });

  it("có Case Study Thực Chiến, định dạng nội dung và focus-visible cho CTA", async () => {
    const [source, studio, css] = await Promise.all([readFile(homePath, "utf8"), readFile(baoBoiStudioPath, "utf8"), readFile(sprint6CssPath, "utf8")]);
    expect(source).toContain("newsSection");
    expect(source).toContain("visibleNews");
    expect(source).toContain("Case Study Thực Chiến");
    expect(studio).toContain("flashcard-scene group perspective-1000");
    expect(studio).toContain("Kịch bản (Xem trước)");
    expect(source).toContain("empathy-answer");
    expect(css).toContain(".cta-glow:focus-visible");
    expect(css).toContain(".news-filter button:focus-visible");
    expect(css).toContain(".disc-wizard");
    expect(css).toContain(".playbook-mindset");
    expect(css).toContain(".energy-store-modal");
  });

  it("giữ cùng lúc các thành phần Sprint 3–8 có nguy cơ regression", async () => {
    const [source, studio] = await Promise.all([readFile(homePath, "utf8"), readFile(baoBoiStudioPath, "utf8")]);
    for (const requiredFeature of [
      "function DailyQuiz()",
      "className=\"fab-log cta-glow fixed bottom-6 right-6 z-40\"",
      "AnimatedNumber",
      "xpStoreOpen",
      "PilotAuthControl",
      "LeaderCommandCenter",
      "FounderPilotOverview",
      "content.playbooks",
      "content.marketing",
      "content.dailyQuizzes",
      "fetchAdvisorProgress",
      "completed_quiz_today",
      "setAdvisorProgress",
      "users_profile.current_streak",
      "managerMode",
      "logPilotActivity",
      "getCurrentPilotSession",
      "Chưa đủ điểm, hãy đi gặp khách hàng thêm nhé!",
    ]) expect(source).toContain(requiredFeature);
    expect(studio).toContain("is-pro-locked");
  });

  it("có lớp nhận diện Sprint 8 cho Inter, Header Navy, Toggle PRO và Feed", async () => {
    const [source, css] = await Promise.all([readFile(homePath, "utf8"), readFile(sprint8CssPath, "utf8")]);
    for (const styleRule of ["font-family: \"Inter\"", ".command-topbar", ".profile-button.is-manager-pro", ".radar-sos-card", ".news-card::before"]) expect(css).toContain(styleRule);
    for (const accessibilityRule of ["color: #0F172A", ".profile-button:focus-visible", ".radar-sos-card button:focus-visible", ".ledger-store-cta:focus-visible"]) expect(css).toContain(accessibilityRule);
    expect(source).toContain('aria-label="Chế Độ Quản Lý (PRO)"');
    expect(source).toContain("aria-pressed={managerMode}");
    expect(source).toContain("Case Study Thực Chiến");
    expect(source).not.toContain("Case Study Bồi Thường");
    expect(source).not.toContain("caseStudyButton");
  });
});
