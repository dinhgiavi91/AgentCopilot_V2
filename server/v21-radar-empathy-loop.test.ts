import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const radar = readFileSync("client/src/components/LeaderCommandCenter.tsx", "utf8");
const report = readFileSync("client/src/components/LeaderExecutiveReport.tsx", "utf8");
const data = readFileSync("client/src/lib/supabaseContent.ts", "utf8");
const migration = readFileSync("supabase/migrations/20260825103000_v21_recovery_watchlist.sql", "utf8");

describe("V21 Radar Empathy Loop", () => {
  it("bảo vệ Watchlist bằng RPC Team-scope và không cấp execute cho anon", () => {
    for (const token of ["get_team_recovery_watchlist_v1", "v_role not in ('leader', 'super_admin')", "i.team_id = v_team_id", "revoke all", "from public, anon", "grant execute", "to authenticated"]) expect(migration).toContain(token);
  });

  it("đưa quỹ XP Leader, CTA trợ giúp và Watchlist dữ liệu thật vào Radar", () => {
    for (const token of ["session.profile.xp_balance", "Ngân sách Động viên", "Hỗ trợ TVV này 🤝", "fetchTeamRecoveryWatchlist", "Tiến độ Phục hồi (Watchlist)", "Tỷ lệ hồi sinh đã đo", "Chờ đủ dữ liệu đo"]) expect(radar).toContain(token);
    expect(radar).toContain("setSelectedSignal(signal)");
  });

  it("nối contract Watchlist và thêm Coaching ROI vào PDF mà không thay báo cáo cũ", () => {
    for (const token of ["TeamRecoveryWatchlist", "fetchTeamRecoveryWatchlist", "recoveryRate", "recoveredCount"]) expect(data).toContain(token);
    for (const token of ["Nỗ lực Quản trị · Coaching ROI", "Tổng ca hỗ trợ", "TVV phục hồi", "Tỷ lệ hồi sinh", "fetchTeamRecoveryWatchlist"]) expect(report).toContain(token);
    expect(report).toContain("Báo Cáo Hiệu Suất Cấp Cao");
  });
});
