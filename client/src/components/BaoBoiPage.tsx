import { useState } from "react";
import { BookOpen, Settings } from "lucide-react";
import { type ActiveLearningChallenge, type PilotSession, type PlaybookCard } from "../lib/supabaseContent";
import { BaoBoiCMS } from "./BaoBoiCMS";
import { BaoBoiStudio } from "./BaoBoiStudio";

type BaoBoiPageProps = {
  session: PilotSession | null;
  playbooks: PlaybookCard[];
  userRole: "FREE" | "PRO";
  onPlaybooksChanged: () => Promise<void> | void;
  onRoleplayCompleted?: () => Promise<void> | void;
  activeChallenge?: ActiveLearningChallenge | null;
  onAcceptChallenge?: (playbook: PlaybookCard) => Promise<void> | void;
  learningRequest?: { playbookCode: string; openRoleplay: boolean } | null;
  onLearningRequestHandled?: () => void;
};

/** Contextual Admin: only the active Studio/CMS view is mounted. */
export function BaoBoiPage({ session, playbooks, userRole, onPlaybooksChanged, onRoleplayCompleted, activeChallenge = null, onAcceptChallenge, learningRequest = null, onLearningRequestHandled }: BaoBoiPageProps) {
  const isSuperAdmin = session?.profile.role === "super_admin";
  const [viewMode, setViewMode] = useState<"studio" | "cms">("studio");

  return <div className="flex flex-col gap-6">{isSuperAdmin && <div className="flex justify-center"><div className="inline-flex gap-1 rounded-xl bg-slate-100 p-1 shadow-inner"><button type="button" onClick={() => setViewMode("studio")} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all sm:px-6 ${viewMode === "studio" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><BookOpen size={16} />La Bàn Kỹ Năng</button><button type="button" onClick={() => setViewMode("cms")} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all sm:px-6 ${viewMode === "cms" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><Settings size={16} />Quản lý Bảo Bối</button></div></div>}{viewMode === "studio" && <BaoBoiStudio session={session} playbooks={playbooks} userRole={userRole} onRoleplayCompleted={onRoleplayCompleted} activeChallenge={activeChallenge} onAcceptChallenge={onAcceptChallenge} learningRequest={learningRequest} onLearningRequestHandled={onLearningRequestHandled} />}{isSuperAdmin && viewMode === "cms" && <BaoBoiCMS playbooks={playbooks} onPlaybooksChanged={onPlaybooksChanged} />}</div>;
}
