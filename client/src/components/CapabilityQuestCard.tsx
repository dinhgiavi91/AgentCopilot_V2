import { ArrowRight, BadgeCheck, Target } from "lucide-react";
import type { PlaybookCard } from "../lib/supabaseContent";

type Props = {
  playbook: PlaybookCard | null;
  activeTitle?: string | null;
  onStart: (playbook: PlaybookCard) => void;
};

export function getCapabilityQuest(playbooks: PlaybookCard[]): PlaybookCard | null {
  return playbooks.find((playbook) => /từ chối|tu choi|chốt|chot|chi phí cơ hội/i.test(`${playbook.skill_system} ${playbook.situation}`)) ?? playbooks[0] ?? null;
}

export function CapabilityQuestCard({ playbook, activeTitle = null, onStart }: Props) {
  if (!playbook) return null;
  const active = Boolean(activeTitle);
  return <section className="mb-6 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 shadow-sm" aria-label="Gợi ý Thực chiến"><div className="mb-2 flex items-start justify-between gap-3"><h3 className="flex items-center gap-2 text-sm font-black text-orange-800"><Target size={17} />Nhiệm Vụ Kích Hoạt Hôm Nay</h3><span className="rounded-full bg-orange-200 px-2 py-1 text-[10px] font-black text-orange-800">+50 XP Thưởng</span></div><p className="mb-3 text-sm leading-relaxed text-orange-700"><strong>{active ? "Đang thực hiện:" : "Gợi ý thực chiến:"}</strong> {active ? activeTitle : `Luyện Bảo Bối “${playbook.situation}”, rồi ghi Nhịp Đập khi đã áp dụng.`}</p><button type="button" onClick={() => onStart(playbook)} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.98]">{active ? <><BadgeCheck size={14} />Mở Bảo Bối đang áp dụng</> : <>Đọc & Nhận thử thách<ArrowRight size={14} /></>}</button></section>;
}
