import React from "react";
import { Coins, Flame, Shield } from "lucide-react";

export type HeaderGamificationBarProps = {
  xp?: number;
  rank?: string;
  coins?: number;
  currentStreak?: number;
  onOpenStreakModal?: () => void;
  onHonorClick?: () => void;
  onCoinsClick?: () => void;
};

const displayAmount = (value: number) => Math.max(0, Math.floor(Number(value) || 0)).toLocaleString("vi-VN");

export default function HeaderGamificationBar({
  xp = 1250,
  rank = "Người Khởi Hành",
  coins = 450,
  currentStreak = 0,
  onOpenStreakModal,
  onHonorClick,
  onCoinsClick,
}: HeaderGamificationBarProps) {
  return (
    <div className="hidden items-center gap-3 xl:flex" aria-label="Chuỗi, danh dự và Xu đổi quà">
      <button
        type="button"
        onClick={onOpenStreakModal}
        className="group flex items-center rounded-full border border-orange-200/60 bg-orange-50/90 p-1 pr-3.5 text-left shadow-sm backdrop-blur-md transition-all hover:border-orange-300 hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1431]"
        title="Chi tiết Chuỗi Bền Bỉ"
        aria-label="Mở chi tiết Chuỗi Bền Bỉ"
      >
        <div className="relative mr-2 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white bg-gradient-to-br from-orange-400 to-amber-500 shadow-sm">
          <Flame size={18} className="fill-white text-white motion-safe:animate-pulse" aria-hidden="true" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[14px] font-black leading-none tracking-tight text-orange-600">{displayAmount(currentStreak)}</span>
          <span className="mt-0.5 text-[9px] font-black uppercase leading-none tracking-widest text-orange-500">Ngày</span>
        </div>
      </button>

      <div data-testid="twin-capsule" className="flex items-center rounded-full border border-white/10 bg-[#1E2B4D]/80 shadow-sm backdrop-blur-md">
        <button
          type="button"
          onClick={onHonorClick}
          className="group flex items-center rounded-l-full border-r border-white/10 p-1 pr-4 text-left transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300"
          title="Bảng Xếp Hạng & Điểm Danh Dự"
          aria-label="XP Ledger — Mở Sổ cái và điểm danh dự"
        >
          <div className="mr-2.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-cyan-400 to-blue-600 shadow-inner">
            <Shield size={16} className="fill-white/20 text-white" aria-hidden="true" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="mb-0.5 max-w-28 truncate text-[9px] font-black uppercase leading-none tracking-widest text-cyan-300 opacity-90">
              {rank}
            </span>
            <span className="text-[14px] font-black leading-none tracking-tight text-white">
              {displayAmount(xp)} <span className="ml-0.5 text-[10px] font-bold text-cyan-100/70">XP</span>
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={onCoinsClick}
          className="group flex items-center rounded-r-full p-1 pl-3 pr-4 text-left transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300"
          title="Kho Quà Tặng (Xu Đổi Quà)"
          aria-label="Mở Kho Quà với Xu đổi quà"
        >
          <div className="relative mr-2.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
            <div className="absolute inset-0 h-full w-full -translate-x-[150%] rotate-45 bg-white/40 transition-transform duration-700 ease-out group-hover:translate-x-[150%]" />
            <Coins size={16} className="z-10 text-white drop-shadow-sm" aria-hidden="true" />
          </div>
          <div className="flex items-end justify-center gap-1 pb-0.5">
            <span className="text-[16px] font-black leading-none tracking-tight text-amber-500">{displayAmount(coins)}</span>
            <span className="mb-px text-[10px] font-black uppercase tracking-widest text-amber-500/70">Xu</span>
          </div>
        </button>
      </div>
    </div>
  );
}
