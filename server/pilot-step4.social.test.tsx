// @vitest-environment jsdom
import fs from "node:fs";
import path from "node:path";
import React, { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PilotStep4FeedbackModule } from "../client/src/components/PilotStep4FeedbackModule";
import { TeamContestPanel } from "../client/src/components/PilotStep4SocialModules";

vi.mock("../client/src/lib/supabaseContent", () => ({
  fetchFeedbackConfig: vi.fn().mockResolvedValue({
    id: 1,
    headline: "Nói thật. Xây tốt hơn.",
    dropdown_options: ["Radar Giữ Quân"],
    question_label: "Đề xuất phát triển",
    updated_at: "2026-08-27T00:00:00.000Z",
  }),
}));

const migration = fs.readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260818180000_pilot_step4_team_social_gamification.sql"), "utf8");
const home = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

describe("Pilot Step 4 — Social/Gamification Team scope và UX Go-Live", () => {
  it("tạo dữ liệu Social/Contest theo Team và chỉ cho Leader quản trị Contest", () => {
    expect(migration).toContain("create table if not exists public.community_posts");
    expect(migration).toContain("create table if not exists public.community_comments");
    expect(migration).toContain("create table if not exists public.community_likes");
    expect(migration).toContain("create table if not exists public.team_contests");
    expect(migration).toContain("community_posts_team_select");
    expect(migration).toContain("team_contests_team_select");
    expect(migration).toContain("team_contests_leader_insert");
    expect(migration).toContain("private.is_active_team_member(team_id)");
  });

  it("ghi Gift XP qua RPC có xác thực Team và không mở quyền ghi ledger trực tiếp", () => {
    expect(migration).toContain("gift_team_xp_v1");
    expect(migration).toContain("not private.user_belongs_to_team(p_recipient_id, v_team_id)");
    expect(migration).toContain("revoke execute on function public.gift_team_xp_v1");
    expect(migration).toContain("xp_ledger_select_team_scoped");
  });

  it("nối Home với fetch/refetch thật cho Community, Contest và CRM", () => {
    expect(home).toContain("fetchTeamCommunityFeed");
    expect(home).toContain("fetchTeamContests");
    expect(home).toContain("createTeamCommunityPost");
    expect(home).toContain("createPilotCrmJournal");
    expect(home).toContain("setCrmRecords(await fetchPilotCrmJournals())");
    expect(home).toContain("LeaderCommandCenter");
    expect(home).toContain("LeadershipMatrixRadar");
  });

  it("giữ textarea Góc Lắng Nghe nhận state mới sau khi tải cấu hình động", async () => {
    function Harness() {
      const [suggestion, setSuggestion] = useState("");
      return <PilotStep4FeedbackModule rating={5} feature="Radar Giữ Quân" suggestion={suggestion} saving={false} onRatingChange={() => undefined} onFeatureChange={() => undefined} onSuggestionChange={setSuggestion} onSubmit={(event) => event.preventDefault()} />;
    }
    render(<Harness />);
    const input = await screen.findByPlaceholderText("Nhập góp ý giúp đội ngũ làm tốt hơn…");
    fireEvent.change(input, { target: { value: "Hiển thị đúng dữ liệu Team" } });
    expect((input as HTMLTextAreaElement).value).toBe("Hiển thị đúng dữ liệu Team");
  });

  it("vẫn hiển thị empty state Contest cho Advisor, không mở nút tạo", () => {
    render(<TeamContestPanel managerMode={false} contests={[]} onPersistContest={vi.fn()} onToast={vi.fn()} />);
    expect(screen.getByText("Chưa có dữ liệu Contest tuần này.")).toBeTruthy();
    expect(screen.queryByText("Tạo Contest Mới")).toBeNull();
  });
});
