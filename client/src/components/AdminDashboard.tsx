import { useState } from "react";
import {
  Building2,
  ChevronDown,
  CircleDollarSign,
  CircleUserRound,
  Coins,
  Edit3,
  MoreHorizontal,
  ShieldCheck,
  UserPlus,
  UserX,
  UsersRound,
  WalletCards,
  Zap,
} from "lucide-react";

type AdminRole = "super_admin" | "director" | "leader" | "advisor";
type TransactionType = "monthly_budget" | "hot_reward" | "violation";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: AdminRole;
  team: string;
  active: boolean;
};

const roleOptions: Array<{ value: AdminRole; label: string }> = [
  { value: "super_admin", label: "Super Admin" },
  { value: "director", label: "GA / Director" },
  { value: "leader", label: "Leader" },
  { value: "advisor", label: "TVV" },
];

const teams = ["Pilot Pod", "Alpha Team", "Growth Pod", "Chưa phân Team"];

const initialUsers: AdminUser[] = [
  { id: "admin-platform", name: "Admin Platform", email: "admin@workspace.local", initials: "AP", role: "super_admin", team: "Pilot Pod", active: true },
  { id: "director-ops", name: "Giám đốc Vận hành", email: "director@workspace.local", initials: "GV", role: "director", team: "Growth Pod", active: true },
  { id: "leader-pilot", name: "Leader Pilot Pod", email: "leader.pilot@workspace.local", initials: "LP", role: "leader", team: "Pilot Pod", active: true },
  { id: "advisor-alpha", name: "TVV Alpha", email: "advisor.alpha@workspace.local", initials: "TA", role: "advisor", team: "Alpha Team", active: false },
];

const transactionOptions: Array<{ value: TransactionType; label: string; description: string }> = [
  { value: "monthly_budget", label: "Cấp ngân sách tháng", description: "Bổ sung quỹ vận hành định kỳ" },
  { value: "hot_reward", label: "Thưởng nóng", description: "Ghi nhận một đóng góp nổi bật" },
  { value: "violation", label: "Trừ vi phạm", description: "Điều chỉnh theo quy chế nội bộ" },
];

const roleStyles: Record<AdminRole, string> = {
  super_admin: "bg-violet-50 text-violet-700 ring-violet-200",
  director: "bg-sky-50 text-sky-700 ring-sky-200",
  leader: "bg-amber-50 text-amber-700 ring-amber-200",
  advisor: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showCreateHint, setShowCreateHint] = useState(false);
  const [leaderId, setLeaderId] = useState("leader-pilot");
  const [xpAmount, setXpAmount] = useState("5000");
  const [transactionType, setTransactionType] = useState<TransactionType>("monthly_budget");
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");

  const updateUser = (id: string, patch: Partial<Pick<AdminUser, "role" | "team" | "active">>) => {
    setUsers((current) => current.map((user) => (user.id === id ? { ...user, ...patch } : user)));
  };

  const executeTreasuryTransaction = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const leader = users.find((user) => user.id === leaderId);
    const amount = Number(xpAmount);
    if (!leader || !Number.isFinite(amount) || amount <= 0) {
      setNotice("Hãy chọn Leader và nhập số lượng XP hợp lệ.");
      return;
    }
    setNotice(`Đã chuẩn bị giao dịch ${amount.toLocaleString("vi-VN")} XP cho ${leader.name}.`);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8" aria-label="Admin Control Center">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:p-7">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.22)]">
              <ShieldCheck size={24} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">B2B Operations</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Admin Control Center</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Quản trị tài khoản, Pod và ngân sách XP từ một không gian vận hành thống nhất.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateHint((current) => !current)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <UserPlus size={18} aria-hidden="true" />+ Tạo Tài Khoản Mới
          </button>
        </header>

        {showCreateHint && (
          <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800" role="status">
            <UserPlus className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
            <span>Skeleton UI sẵn sàng để nối luồng tạo tài khoản an toàn ở sprint backend kế tiếp.</span>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="user-team-matrix-title">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-indigo-600"><UsersRound size={15} aria-hidden="true" />Quản trị truy cập</div>
              <h2 id="user-team-matrix-title" className="mt-1 text-xl font-bold tracking-tight text-slate-900">User &amp; Team Matrix</h2>
              <p className="mt-1 text-sm text-slate-500">Phân vai, gán Pod và kiểm soát trạng thái tài khoản.</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"><Building2 size={14} aria-hidden="true" />{users.length} tài khoản</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-left">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Tài khoản</th>
                  <th className="px-4 py-4">Vai trò</th>
                  <th className="px-4 py-4">Team / Pod</th>
                  <th className="px-4 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="group transition-colors hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-extrabold text-slate-600 ring-2 ring-white">{user.initials}</div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{user.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <label className="relative block w-40">
                        <span className={`pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[10px] font-bold ring-1 ${roleStyles[user.role]}`}>{roleOptions.find((role) => role.value === user.role)?.label}</span>
                        <select aria-label={`Vai trò của ${user.name}`} value={user.role} onChange={(event) => updateUser(user.id, { role: event.target.value as AdminRole })} className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-2 pr-8 text-[10px] text-transparent outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                          {roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={15} aria-hidden="true" />
                      </label>
                    </td>
                    <td className="px-4 py-4">
                      <label className="relative block w-40">
                        <select aria-label={`Team của ${user.name}`} value={user.team} onChange={(event) => updateUser(user.id, { team: event.target.value })} className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                          {teams.map((team) => <option key={team}>{team}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={15} aria-hidden="true" />
                      </label>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${user.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.active ? "bg-emerald-500" : "bg-slate-400"}`} />{user.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="relative px-6 py-4 text-right">
                      <button type="button" aria-label={`Mở hành động cho ${user.name}`} onClick={() => setOpenMenuId((current) => (current === user.id ? null : user.id))} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"><MoreHorizontal size={19} /></button>
                      {openMenuId === user.id && (
                        <div className="absolute right-6 top-14 z-20 w-40 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-lg" role="menu">
                          <button type="button" onClick={() => { setOpenMenuId(null); setNotice(`Đang mở chế độ chỉnh sửa cho ${user.name}.`); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><Edit3 size={15} />Chỉnh sửa</button>
                          <button type="button" onClick={() => { updateUser(user.id, { active: !user.active }); setOpenMenuId(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"><UserX size={15} />{user.active ? "Vô hiệu hóa" : "Kích hoạt"}</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="xp-treasury-title">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50/70 to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-indigo-600"><WalletCards size={15} aria-hidden="true" />Vận hành ngân sách</div>
              <h2 id="xp-treasury-title" className="mt-1 text-xl font-bold tracking-tight text-slate-900">Kho Bạc XP &amp; Ngân Sách</h2>
              <p className="mt-1 text-sm text-slate-500">Cấp quỹ minh bạch, sẵn sàng để kết nối audit trail ở sprint kế tiếp.</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.2)]"><Coins size={23} aria-hidden="true" /></div>
          </div>

          <form className="p-5 sm:p-6" onSubmit={executeTreasuryTransaction}>
            <div className="grid gap-5 lg:grid-cols-[1.05fr_.7fr_1.7fr]">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Chọn Leader</span>
                <select value={leaderId} onChange={(event) => setLeaderId(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                  {users.filter((user) => user.role === "leader" || user.role === "director").map((user) => <option key={user.id} value={user.id}>{user.name} · {user.team}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Số lượng XP</span>
                <div className="relative">
                  <input aria-label="Số lượng XP" type="number" min="1" value={xpAmount} onChange={(event) => setXpAmount(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                  <Zap className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-amber-500" size={17} aria-hidden="true" />
                </div>
              </label>
              <fieldset>
                <legend className="mb-2 block text-sm font-bold text-slate-700">Loại giao dịch</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {transactionOptions.map((option) => (
                    <label key={option.value} className={`cursor-pointer rounded-xl border p-3 transition ${transactionType === option.value ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                      <input type="radio" name="transaction-type" value={option.value} checked={transactionType === option.value} onChange={() => setTransactionType(option.value)} className="sr-only" />
                      <span className="block text-xs font-bold text-slate-800">{option.label}</span>
                      <span className="mt-1 block text-[11px] leading-4 text-slate-500">{option.description}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-[1fr_auto] md:items-end">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Lý do</span>
                <input aria-label="Lý do" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Ví dụ: Phân bổ quỹ hoạt động tháng 08" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              </label>
              <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"><CircleDollarSign size={18} aria-hidden="true" />Thực thi Giao dịch</button>
            </div>
            {notice && <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800" role="status">{notice}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}
