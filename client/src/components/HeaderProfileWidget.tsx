import React from "react";
import { LogOut } from "lucide-react";

type HeaderProfileWidgetProps = {
  userName?: string;
  userAvatar?: string;
  role?: string;
  onOpenSettings: () => void;
  onLogout: () => void;
};

export function HeaderProfileWidget({
  userName = "Đinh Vĩ",
  userAvatar,
  role = "TVV Pilot",
  onOpenSettings,
  onLogout,
}: HeaderProfileWidgetProps) {
  return (
    <div className="flex max-w-[calc(100vw-1rem)] items-center rounded-[20px] border border-white/10 bg-[#1E2B4D]/90 p-1 pr-1.5 shadow-sm backdrop-blur-md transition-all hover:bg-[#1E2B4D] sm:max-w-none">
      <button
        aria-label="Đổi nhân vật hoặc tên hiển thị"
        className="group flex min-w-0 items-center gap-2.5 rounded-[16px] px-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        onClick={onOpenSettings}
        title="Đổi nhân vật/tên hiển thị"
        type="button"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-slate-800 shadow-sm transition-transform duration-300 group-hover:scale-105">
          {userAvatar ? <img alt="Ảnh đại diện" className="h-full w-full object-cover" src={userAvatar} /> : <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600 text-[14px] font-bold text-white">{userName.charAt(0).toUpperCase()}</span>}
        </span>
        <span className="mr-1 hidden min-w-0 flex-col text-left sm:flex">
          <span className="max-w-[120px] truncate text-[13px] font-bold leading-tight tracking-wide text-white">{userName}</span>
          <span className="mt-0.5 text-[10px] font-medium uppercase leading-none tracking-widest text-cyan-400">{role}</span>
        </span>
      </button>
      <span aria-hidden="true" className="mx-1 h-6 w-px bg-white/10" />
      <button
        aria-label="Đăng xuất Pilot"
        className="rounded-xl p-2 text-slate-400 transition-colors duration-200 hover:bg-white/5 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        onClick={onLogout}
        title="Đăng xuất"
        type="button"
      >
        <LogOut size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
