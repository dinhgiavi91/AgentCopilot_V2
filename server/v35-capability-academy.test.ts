import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const migration = readFileSync(`${root}/supabase/migrations/20260826073000_v35_capability_academy.sql`, "utf8");
const home = readFileSync(`${root}/client/src/pages/Home.tsx`, "utf8");
const dataLayer = readFileSync(`${root}/client/src/lib/supabaseContent.ts`, "utf8");
const questCard = readFileSync(`${root}/client/src/components/CapabilityQuestCard.tsx`, "utf8");
const studio = readFileSync(`${root}/client/src/components/BaoBoiStudio.tsx`, "utf8");

describe("V35 Capability Academy — learning tied to real execution", () => {
  it("renders a contextual quest plus a challenge CTA in the playbook lesson", () => {
    for (const marker of ["Nhiệm Vụ Kích Hoạt Hôm Nay", "+50 XP Thưởng", "Đọc & Nhận thử thách", "getCapabilityQuest"]) expect(questCard).toContain(marker);
    for (const marker of ["Học đi đôi với hành!", "Nhận Thử Thách Ngay", "ghi Nhịp Đập để nhận thưởng XP", "activeChallenge"]) expect(studio).toContain(marker);
    expect(home).toContain("CapabilityQuestCard");
    expect(home).toContain("startCapabilityQuest");
  });

  it("records Proof of Work only against an active advisor challenge and the caller-owned Heartbeat", () => {
    for (const marker of [
      "create table if not exists public.learning_challenges",
      "status in ('accepted', 'completed')",
      "private.current_profile_role() <> 'advisor'",
      "from public.playbook_cards",
      "id = p_activity_id and user_id = v_user_id and team_id = v_team_id",
      "status = 'completed'",
      "learning_challenge_proof",
      "on conflict (user_id, auto_source, auto_source_key)",
      "revoke all on function public.complete_learning_challenge_proof_v1(uuid, uuid) from public, anon",
      "grant execute on function public.complete_learning_challenge_proof_v1(uuid, uuid) to authenticated",
    ]) expect(migration).toContain(marker);
    expect(migration).not.toMatch(/customer_name|phone|email|policy_number/i);
  });

  it("keeps the proof toggle optional and claims the bonus only after Heartbeat persistence", () => {
    expect(home).toContain("activeLearningChallenge={activeLearningChallenge}");
    expect(home).toContain("proofOfWork={logUsesLearningChallenge}");
    expect(home).toContain("completeLearningChallengeProof(activeLearningChallenge.id, result.activity.id)");
    expect(home).toContain("setLogUsesLearningChallenge(false)");
    expect(home).toContain("Tôi đã áp dụng bài học/thử thách hôm nay");
    expect(dataLayer).toContain('client.rpc("accept_learning_challenge_v1"');
    expect(dataLayer).toContain('client.rpc("complete_learning_challenge_proof_v1"');
  });
});
