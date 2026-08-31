import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, RefreshCw, ShieldAlert, UserCog, Users } from "lucide-react";
import { toast } from "sonner";
import {
  createPilotManagedAccount,
  fetchPilotManagedAccounts,
  fetchPilotManagementTeams,
  updatePilotManagedAccount,
  type PilotManagedAccount,
  type PilotManagementTeam,
  type PilotSession,
} from "../lib/supabaseContent";
import type { Profile as PilotProfile } from "../lib/pilotTypes";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

type ManagedRole = PilotProfile["role"];
type AccountDraft = {
  email: string;
  password: string;
  displayName: string;
  role: ManagedRole;
  teamId: string;
  xpBalance: string;
  isActive: boolean;
};

const emptyDraft = (): AccountDraft => ({
  email: "",
  password: "",
  displayName: "",
  role: "advisor",
  teamId: "",
  xpBalance: "500",
  isActive: true,
});

const roleLabel: Record<ManagedRole, string> = {
  super_admin: "Super Admin",
  director: "Director (Giám đốc GA)",
  leader: "Leader (Trưởng Nhóm)",
  advisor: "Advisor (TVV)",
};

const roleBadge: Record<ManagedRole, string> = {
  super_admin: "bg-violet-100 text-violet-800 border-violet-200",
  director: "bg-indigo-100 text-indigo-800 border-indigo-200",
  leader: "bg-amber-100 text-amber-800 border-amber-200",
  advisor: "bg-slate-100 text-slate-700 border-slate-200",
};

function AccountFields({ draft, onChange, teams, mode, selfEditing }: {
  draft: AccountDraft;
  onChange: (next: AccountDraft) => void;
  teams: PilotManagementTeam[];
  mode: "create" | "edit";
  selfEditing: boolean;
}) {
  const update = <K extends keyof AccountDraft>(key: K, value: AccountDraft[K]) => onChange({ ...draft, [key]: value });
  const isDirector = draft.role === "director";
  return (
    <div className="grid gap-4 py-2 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700 sm:col-span-2">
        Tên hiển thị
        <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" value={draft.displayName} onChange={(event) => update("displayName", event.target.value)} />
      </label>
      {mode === "create" && <>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
          Email đăng nhập
          <input type="email" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" value={draft.email} onChange={(event) => update("email", event.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
          Mật khẩu tạm
          <input type="password" minLength={8} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" value={draft.password} onChange={(event) => update("password", event.target.value)} />
        </label>
      </>}
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
        Vai trò
        <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500" value={draft.role} onChange={(event) => update("role", event.target.value as ManagedRole)} disabled={selfEditing}>
          <option value="super_admin">Super Admin</option>
          <option value="director">Director (Giám đốc GA)</option>
          <option value="leader">Leader (Trưởng Nhóm)</option>
          <option value="advisor">Advisor (TVV)</option>
        </select>
        {selfEditing && <span className="text-[11px] font-bold text-rose-600">Khóa an toàn: Bạn không thể tự thay đổi vai trò của chính mình.</span>}
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
        {isDirector ? "GA Team phụ trách" : "Team phụ trách"}
        <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" value={draft.teamId} onChange={(event) => update("teamId", event.target.value)}>
          <option value="" disabled>Chọn Team</option>
          {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
        Quỹ XP
        <input inputMode="numeric" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" value={draft.xpBalance} onChange={(event) => update("xpBalance", event.target.value.replace(/[^0-9]/g, ""))} />
      </label>
      {mode === "edit" && <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700">
        <input type="checkbox" checked={draft.isActive} onChange={(event) => update("isActive", event.target.checked)} className="size-4 accent-indigo-600" />
        Tài khoản đang hoạt động
      </label>}
    </div>
  );
}

export function UserManagementCMS({ session }: { session: PilotSession | null }) {
  const [accounts, setAccounts] = useState<PilotManagedAccount[]>([]);
  const [teams, setTeams] = useState<PilotManagementTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<PilotManagedAccount | null>(null);
  const [draft, setDraft] = useState<AccountDraft>(emptyDraft);

  const load = useCallback(async () => {
    if (session?.profile.role !== "super_admin") return;
    setLoading(true);
    try {
      const [nextAccounts, nextTeams] = await Promise.all([fetchPilotManagedAccounts(), fetchPilotManagementTeams()]);
      setAccounts(nextAccounts);
      setTeams(nextTeams);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  }, [session?.profile.role]);

  useEffect(() => { void load(); }, [load]);

  const initialTeamId = useMemo(() => teams[0]?.id ?? "", [teams]);
  const openCreate = () => {
    setDraft({ ...emptyDraft(), teamId: initialTeamId });
    setCreateOpen(true);
  };
  const openEdit = (account: PilotManagedAccount) => {
    setDraft({ email: account.email, password: "", displayName: account.displayName, role: account.role, teamId: account.teamId, xpBalance: String(account.xpBalance), isActive: account.isActive });
    setEditing(account);
  };
  const closeAll = () => { setCreateOpen(false); setEditing(null); setDraft(emptyDraft()); };
  const selfEditing = Boolean(editing && session?.userId === editing.id);

  const submitCreate = async () => {
    const xpBalance = Number(draft.xpBalance);
    if (!draft.displayName.trim() || !draft.email.trim() || draft.password.length < 8 || !draft.teamId || !Number.isInteger(xpBalance)) {
      toast.error("Nhập đủ tên, email, mật khẩu từ 8 ký tự, Team và quỹ XP hợp lệ.");
      return;
    }
    setSaving(true);
    try {
      await createPilotManagedAccount({ email: draft.email.trim(), password: draft.password, displayName: draft.displayName.trim(), role: draft.role, teamId: draft.teamId, xpBalance });
      toast.success("Đã tạo tài khoản Pilot.");
      closeAll();
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo tài khoản.");
    } finally { setSaving(false); }
  };

  const submitEdit = async () => {
    if (!editing) return;
    const xpBalance = Number(draft.xpBalance);
    if (!draft.displayName.trim() || !draft.teamId || !Number.isInteger(xpBalance)) {
      toast.error("Nhập đủ tên, Team và quỹ XP hợp lệ.");
      return;
    }
    setSaving(true);
    try {
      await updatePilotManagedAccount(editing.id, { displayName: draft.displayName.trim(), role: draft.role, teamId: draft.teamId, xpBalance, isActive: draft.isActive });
      toast.success("Đã cập nhật tài khoản Pilot.");
      closeAll();
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật tài khoản.");
    } finally { setSaving(false); }
  };

  if (session?.profile.role !== "super_admin") return null;
  return <section className="my-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-label="Quản lý Tài khoản">
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-1 flex items-center gap-2 text-[11px] font-black tracking-[0.14em] text-indigo-600"><UserCog size={14} />QUẢN LÝ TÀI KHOẢN</div>
        <h2 className="text-2xl font-black text-slate-900">Phân quyền & quỹ XP</h2>
        <p className="mt-1 text-sm text-slate-500">Tạo mới và cập nhật tài khoản bằng các luồng riêng biệt, có khóa chống tự hạ quyền.</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => void load()} className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50" aria-label="Làm mới danh sách"><RefreshCw size={17} /></button>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.97]"><Plus size={17} />Tạo tài khoản mới</button>
      </div>
    </div>
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Tài khoản</th><th className="px-4 py-3">Vai trò</th><th className="px-4 py-3">Team / GA</th><th className="px-4 py-3">Quỹ XP</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Thao tác</th></tr></thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500"><Loader2 className="mx-auto mb-2 animate-spin" size={20} />Đang tải tài khoản…</td></tr> : accounts.length ? accounts.map((account) => <tr key={account.id} className="hover:bg-slate-50/70"><td className="px-4 py-3"><div className="font-bold text-slate-900">{account.displayName}</div><div className="text-xs text-slate-500">{account.email}</div></td><td className="px-4 py-3"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${roleBadge[account.role]}`}>{roleLabel[account.role]}</span></td><td className="px-4 py-3 font-medium text-slate-700">{account.teamName}</td><td className="px-4 py-3 font-bold text-slate-800">{account.xpBalance.toLocaleString("vi-VN")} XP</td><td className="px-4 py-3"><span className={`text-xs font-bold ${account.isActive ? "text-emerald-700" : "text-slate-500"}`}>{account.isActive ? "Hoạt động" : "Tạm dừng"}</span></td><td className="px-4 py-3 text-right"><button onClick={() => openEdit(account)} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"><Pencil size={14} />Sửa</button></td></tr>) : <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500"><Users className="mx-auto mb-2" size={22} />Chưa có tài khoản để hiển thị.</td></tr>}
        </tbody>
      </table>
    </div>
    <Dialog open={createOpen} onOpenChange={(open) => !open && closeAll()}><DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-2xl border-slate-200 bg-white"><DialogHeader><DialogTitle className="text-xl font-black text-slate-900">Tạo tài khoản mới</DialogTitle><DialogDescription>Khởi tạo auth user, role, Team và quỹ XP trong một thao tác quản trị.</DialogDescription></DialogHeader><AccountFields draft={draft} onChange={setDraft} teams={teams} mode="create" selfEditing={false} /><DialogFooter><button onClick={closeAll} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Hủy</button><button onClick={() => void submitCreate()} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving && <Loader2 className="animate-spin" size={16} />}Tạo tài khoản</button></DialogFooter></DialogContent></Dialog>
    <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && closeAll()}><DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-2xl border-slate-200 bg-white"><DialogHeader><DialogTitle className="text-xl font-black text-slate-900">Cập nhật tài khoản</DialogTitle><DialogDescription>{selfEditing ? "Role đang khóa để bảo vệ quyền Super Admin của chính bạn." : "Chỉnh sửa role, Team, quỹ XP và trạng thái tài khoản."}</DialogDescription></DialogHeader>{selfEditing && <div className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800"><ShieldAlert size={16} className="shrink-0" />Khóa an toàn đang hoạt động: role của chính bạn không thể thay đổi.</div>}<AccountFields draft={draft} onChange={setDraft} teams={teams} mode="edit" selfEditing={selfEditing} /><DialogFooter><button onClick={closeAll} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Hủy</button><button onClick={() => void submitEdit()} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving && <Loader2 className="animate-spin" size={16} />}Lưu cập nhật</button></DialogFooter></DialogContent></Dialog>
  </section>;
}
