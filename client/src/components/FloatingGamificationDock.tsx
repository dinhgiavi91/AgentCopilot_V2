import React from "react";
import { Coins, Shield } from "lucide-react";

export type FloatingGamificationDockProps = {
  xp?: number;
  coins?: number;
  onHonorClick?: () => void;
  onCoinsClick?: () => void;
};

const displayAmount = (value: number) => Math.max(0, Math.floor(Number(value) || 0)).toLocaleString("vi-VN");

export default function FloatingGamificationDock({
  xp = 0,
  coins = 0,
  onHonorClick,
  onCoinsClick,
}: FloatingGamificationDockProps) {
  const revealClass = "max-w-0 overflow-hidden opacity-0 transition-all duration-500 ease-in-out group-hover:max-w-[100px] group-hover:opacity-100 group-hover:pr-3 group-focus-within:max-w-[100px] group-focus-within:opacity-100 group-focus-within:pr-3";

  return (
    <aside
      data-testid="floating-gamification-dock"
      className="group fixed right-0 top-[30%] z-40 flex flex-col gap-2 rounded-l-3xl border-y border-l border-white/10 bg-[#0B1431]/90 p-1.5 shadow-[-8px_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-300 max-md:bottom-24 max-md:top-auto"
      aria-label="Danh dự XP và Xu đổi quà"
    >
      <button
        type="button"
        onClick={onHonorClick}
        className="group/item flex items-center gap-0 rounded-full p-1 text-left transition-all duration-300 hover:gap-3 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        title="Bảng Xếp Hạng & Điểm Danh Dự"
        aria-label="XP Ledger — Mở Sổ cái và điểm danh dự"
      >
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-inner">
          <Shield size={18} className="fill-white/20 text-white" aria-hidden="true" />
        </div>
        <div data-testid="dock-xp-details" className={`flex flex-col justify-center ${revealClass}`}>
          <span className="text-[15px] font-black leading-none tracking-tight text-white">{displayAmount(xp)}</span>
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan-300">XP</span>
        </div>
      </button>

      <button
        type="button"
        onClick={onCoinsClick}
        className="group/item flex items-center gap-0 rounded-full p-1 text-left transition-all duration-300 hover:gap-3 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        title="Kho Quà Tặng"
        aria-label="Mở Kho Quà với Xu đổi quà"
      >
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
          <div className="absolute inset-0 h-full w-full -translate-x-[150%] rotate-45 bg-white/40 transition-transform duration-700 ease-out group-hover/item:translate-x-[150%]" />
          <Coins size={18} className="z-10 text-white drop-shadow-sm" aria-hidden="true" />
        </div>
        <div data-testid="dock-coins-details" className={`flex flex-col justify-center ${revealClass}`}>
          <span className="text-[15px] font-black leading-none tracking-tight text-white">{displayAmount(coins)}</span>
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-300">Xu</span>
        </div>
      </button>
    </aside>
  );
}
