import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/bhnt-learning-hub-research";
const migration = readFileSync(`${root}/supabase/migrations/20260820103000_o2o_rewards_notification_center.sql`, "utf8");
const dataLayer = readFileSync(`${root}/client/src/lib/supabaseContent.ts`, "utf8");
const home = readFileSync(`${root}/client/src/pages/Home.tsx`, "utf8");
const app = readFileSync(`${root}/client/src/App.tsx`, "utf8");
const agentMomentCard = readFileSync(`${root}/client/src/components/AgentMomentCard.tsx`, "utf8");
const momentShareScreen = readFileSync(`${root}/client/src/components/MomentShareScreen.tsx`, "utf8");
const leaderRewards = readFileSync(`${root}/client/src/components/O2OLeaderRewards.tsx`, "utf8");
const radar = readFileSync(`${root}/client/src/components/PilotStep2Modules.tsx`, "utf8");

describe("O2O Reward Fulfillment & Notification Center", () => {
  it("tạo notification center có RLS owner-only và Realtime publication", () => {
    expect(migration).toContain("create table if not exists public.user_notifications");
    expect(migration).toContain("user_notifications_owner_select");
    expect(migration).toContain("user_id = auth.uid()");
    expect(migration).toContain("alter publication supabase_realtime add table public.user_notifications");
    expect(migration).toContain("list_my_notifications_v1");
    expect(migration).toContain("mark_my_notification_read_v1");
  });

  it("ghi notification cho XP, đổi quà và tương tác Community không chứa PII khách hàng", () => {
    expect(migration).toContain("notify_xp_ledger_insert_v1");
    expect(migration).toContain("notify_reward_redemption_insert_v1");
    expect(migration).toContain("notify_community_comment_insert_v1");
    expect(migration).toContain("notify_community_reaction_insert_v1");
    expect(migration).toContain("gift_received");
    expect(migration).toContain("reward_fulfilled");
  });

  it("khóa luồng fulfillment vào pending rewards của đúng Team", () => {
    expect(migration).toContain("list_team_pending_reward_redemptions_v1");
    expect(migration).toContain("private.can_manage_team(p.primary_team_id)");
    expect(migration).toContain("fulfill_team_reward_redemption_v1");
    expect(migration).toContain("v_redemption.status <> 'pending'");
    expect(migration).toContain("Bạn chỉ có thể xác nhận quà của Team mình.");
    expect(migration).toContain("fulfilled_by = v_actor_id");
  });

  it("không mở RPC O2O hoặc trigger functions cho anon", () => {
    expect(migration).toContain("revoke execute on function public.list_my_notifications_v1() from anon;");
    expect(migration).toContain("revoke execute on function public.fulfill_team_reward_redemption_v1(uuid) from anon;");
    expect(migration).toContain("revoke execute on function public.notify_xp_ledger_insert_v1() from public, anon, authenticated;");
    expect(migration).toContain("grant execute on function public.fulfill_team_reward_redemption_v1(uuid) to authenticated;");
  });

  it("có helper client cho notification, kho quà của tôi và fulfillment Leader", () => {
    expect(dataLayer).toContain("fetchMyNotifications");
    expect(dataLayer).toContain("subscribeUserNotifications");
    expect(dataLayer).toContain("fetchMyRewardRedemptions");
    expect(dataLayer).toContain("subscribeMyRewardRedemptions");
    expect(dataLayer).toContain("fetchTeamPendingRewardRedemptions");
    expect(dataLayer).toContain("fulfillTeamRewardRedemption");
  });

  it("render Bell dropdown, Kho Quà và Voucher O2O cho TVV", () => {
    expect(home).toContain('aria-label="Thông báo"');
    expect(home).toContain("Thông báo của bạn");
    expect(home).toContain("absolute top-full mt-2 right-0 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-4");
    expect(home).toContain("group-hover:visible group-hover:translate-y-0 group-hover:opacity-100");
    expect(home).toContain("flex w-full flex-col gap-1 border-b border-slate-100 p-4");
    expect(home).toContain("Chưa có thông báo nào");
    expect(home).toContain("Kho Quà Của Tôi");
    expect(home).toContain("AGENT MOMENT™");
    expect(home).toContain("<MomentShareScreen");
    expect(home).toContain('momentBadgeText: "AGENT MOMENT™"');
    expect(agentMomentCard).not.toContain("CỘT MỐC ĐÁNG NHỚ");
    expect(agentMomentCard).not.toContain('aria-label="Chia sẻ"');
    expect(momentShareScreen).toContain("TẢI ẢNH KHOE THÀNH TÍCH");
    expect(home).toContain("subscribeMyRewardRedemptions");
    expect(home).toContain('import { toast } from "sonner"');
    expect(home).not.toContain("const notify =");
    expect(home).toContain("toast.success(");
    expect(home).not.toContain("command-toast");
    expect(app).toContain('<Toaster position="top-right" duration={3000} closeButton={true} visibleToasts={1} />');
  });

  it("render Leader Command Center thay cho cụm Report và Radar cũ", () => {
    expect(home).toContain('import LeaderCommandCenter from "../components/LeaderCommandCenter"');
    expect(home).toContain("<LeaderCommandCenter");
    expect(home).not.toContain("<PilotRadar session={pilotSession}");
  });

  it("chỉ render Quản lý Trả Quà trong Sổ cái XP của Leader, không ở Radar", () => {
    const radarStart = home.indexOf("function RadarView()");
    const radarEnd = home.indexOf("function DiscView()", radarStart);
    const ledgerStart = home.indexOf("{xpOpen && (");
    const ledgerEnd = home.indexOf("{xpStoreOpen && (", ledgerStart);
    expect(home.slice(radarStart, radarEnd)).not.toContain("O2OLeaderRewards");
    expect(home.slice(ledgerStart, ledgerEnd)).toContain('pilotSession?.profile.role === "leader" && <O2OLeaderRewards');
  });

  it("hiển thị Quản lý Trả Quà cho Leader và cập nhật ngay sau xác nhận", () => {
    expect(leaderRewards).toContain("Quản lý Trả Quà");
    expect(leaderRewards).toContain("Chỉ hiển thị phần thưởng đang chờ trao của Team bạn.");
    expect(leaderRewards).toContain("mt-4 grid grid-cols-1 gap-4 md:grid-cols-2");
    expect(leaderRewards).toContain("flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md");
    expect(leaderRewards).toContain("Trao Quà Xong");
    expect(leaderRewards).toContain("fulfillTeamRewardRedemption");
    expect(leaderRewards).toContain("current.filter((item) => item.id !== redemption.id)");
  });

  it("dùng Help panel eJoy cho Cẩm nang Radar và làm nổi bật CTA Ghi nhận hỗ trợ", () => {
    expect(radar).toContain("HelpCircle");
    expect(radar).toContain("relative group inline-block z-[100] ml-3");
    expect(radar).toContain("group-hover:opacity-100 group-hover:visible");
    expect(radar).toContain("p-2 rounded-full hover:bg-amber-100 transition");
    expect(radar).toContain("📖 Cách dùng Radar");
    expect(radar).toContain("Ghi nhận hỗ trợ");
    expect(radar).toContain("bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white border border-amber-300 font-bold py-1.5 px-3 rounded-md transition-colors shadow-sm");
  });
});
