import { useEffect, useState } from "react";
import { fetchPilotManagementTeams, type PilotManagementTeam } from "../lib/supabaseContent";

export function useWorkspaceAssignmentTeams() {
  const [teams, setTeams] = useState<PilotManagementTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void fetchPilotManagementTeams()
      .then((nextTeams) => { if (active) setTeams(nextTeams); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Không thể tải danh sách Team."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { teams, loading, error };
}

type WorkspaceAssignmentFieldProps = {
  teamId: string | null;
  onTeamIdChange: (teamId: string | null) => void;
  teams: PilotManagementTeam[];
  loading?: boolean;
  error?: string;
};

/** Super Admin assigns a record to Global (null) or one real Team UUID. */
export function WorkspaceAssignmentField({ teamId, onTeamIdChange, teams, loading = false, error = "" }: WorkspaceAssignmentFieldProps) {
  return <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
    <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-indigo-800">
      Phân luồng Dữ liệu (Workspace) *
    </label>
    <select
      value={teamId ?? ""}
      onChange={(event) => onTeamIdChange(event.target.value || null)}
      disabled={loading}
      className="w-full rounded-lg border-2 border-indigo-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none transition-all focus:border-indigo-500 disabled:cursor-wait disabled:opacity-60"
    >
      <option value="">[Hệ Thống] - Áp dụng chung toàn App (Global)</option>
      {teams.map((team) => <option key={team.id} value={team.id}>{team.name} (Nội bộ)</option>)}
    </select>
    <p className="mt-1 text-[10px] font-medium text-indigo-500">Chọn Hệ Thống để hiển thị cho mọi user. Chọn Team để chỉ TVV và Leader của Team đó thấy.</p>
    {error && <p className="mt-1 text-[10px] font-medium text-rose-600">{error}</p>}
  </div>;
}
