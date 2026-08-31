import React, { useRef, useState } from "react";
import { Camera, Check, Heart, Navigation, Shield, Target, User, X } from "lucide-react";

export const CORE_CAST_AVATARS = [
  {
    id: "navigator",
    name: "Navigator",
    role: "Trust & Momentum",
    color: "text-[#1E3A8A]",
    bgInfo: "bg-[#1E3A8A]",
    Icon: Navigation,
    url: "/manus-storage/navigator_bf1942c9.png",
    traits: "Đáng tin cậy, rõ ràng, luôn hướng về phía trước.",
    quote: "“Tôi biết đường, hãy đi cùng tôi.”",
  },
  {
    id: "nurturer",
    name: "Nurturer",
    role: "Empathy & Recovery",
    color: "text-[#F59E0B]",
    bgInfo: "bg-[#D97706]",
    Icon: Heart,
    url: "/manus-storage/nurturer_f9392345.png",
    traits: "Ấm áp, lắng nghe, thấu cảm.",
    quote: "“Tôi ở đây để lắng nghe và hỗ trợ bạn.”",
  },
  {
    id: "copilot",
    name: "Wise Copilot",
    role: "Foresight & Guidance",
    color: "text-[#22D3EE]",
    bgInfo: "bg-[#0E7490]",
    Icon: Target,
    url: "/manus-storage/wise-copilot_71afd824.png",
    traits: "Thông thái, bao quát, tầm nhìn xa.",
    quote: "“Để tôi giúp bạn nhìn xa hơn.”",
  },
  {
    id: "guardian",
    name: "Loyal Guardian",
    role: "Protection & Consistency",
    color: "text-[#10B981]",
    bgInfo: "bg-[#15803D]",
    Icon: Shield,
    url: "/manus-storage/loyal-guardian_1a5fa487.png",
    traits: "Trung thành, bảo vệ, kiên định.",
    quote: "“Bạn không bao giờ phải đi một mình.”",
  },
] as const;

export type CoreCastId = (typeof CORE_CAST_AVATARS)[number]["id"];

export type AgentProfilePreference = {
  displayName: string;
  avatarId: CoreCastId | "custom";
  avatarUrl: string;
};

interface AgentProfileSettingsProps {
  initialName: string;
  initialAvatarId?: CoreCastId | "custom";
  initialAvatarUrl?: string;
  onClose: () => void;
  onSave: (profile: AgentProfilePreference) => void;
}

const MAX_LOCAL_AVATAR_BYTES = 2 * 1024 * 1024;

export function AgentProfileSettings({
  initialName,
  initialAvatarId = "navigator",
  initialAvatarUrl,
  onClose,
  onSave,
}: AgentProfileSettingsProps) {
  const [name, setName] = useState(initialName);
  const [selectedAvatarId, setSelectedAvatarId] = useState<CoreCastId | "custom">(initialAvatarId);
  const [customAvatarUrl, setCustomAvatarUrl] = useState(initialAvatarId === "custom" ? initialAvatarUrl || "" : "");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Vui lòng chọn một tệp ảnh hợp lệ.");
      return;
    }
    if (file.size > MAX_LOCAL_AVATAR_BYTES) {
      setUploadError("Ảnh cần nhỏ hơn 2 MB để lưu cục bộ an toàn.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCustomAvatarUrl(String(reader.result || ""));
      setSelectedAvatarId("custom");
      setUploadError("");
    };
    reader.onerror = () => setUploadError("Không thể đọc ảnh. Vui lòng thử lại.");
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const selectedCoreAvatar = CORE_CAST_AVATARS.find((avatar) => avatar.id === selectedAvatarId);
    const avatarUrl = selectedAvatarId === "custom" ? customAvatarUrl : selectedCoreAvatar?.url || CORE_CAST_AVATARS[0].url;
    if (!avatarUrl) {
      setUploadError("Hãy chọn một nhân vật hoặc tải ảnh cá nhân trước khi lưu.");
      return;
    }
    onSave({
      displayName: name.trim() || initialName || "TVV Agent Copilot",
      avatarId: selectedAvatarId,
      avatarUrl,
    });
  };

  return (
    <div
      aria-labelledby="agent-profile-settings-title"
      aria-modal="true"
      className="flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      style={{ position: "fixed", inset: 0, zIndex: 99998, backgroundColor: "rgba(11, 20, 49, 0.82)", backdropFilter: "blur(12px)" }}
    >
      <section
        className="flex w-full max-w-[460px] flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        style={{ position: "relative", zIndex: 99999, maxHeight: "min(90vh, 760px)" }}
      >
        <header className="relative overflow-hidden px-6 py-6">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50" />
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <h2 id="agent-profile-settings-title" className="bg-gradient-to-r from-[#0B1431] to-[#1E3A8A] bg-clip-text text-[22px] font-black uppercase tracking-tight text-transparent">Người Đồng Hành</h2>
              <p className="mt-1 text-[12px] font-medium text-slate-600">Lựa chọn nhân vật đại diện cho hành trình của bạn.</p>
            </div>
            <button aria-label="Đóng cài đặt hồ sơ" className="rounded-full bg-white/70 p-2 text-slate-400 shadow-sm transition-all hover:bg-white hover:text-red-500" onClick={onClose} type="button"><X size={20} /></button>
          </div>
        </header>

        <div className="overflow-y-auto px-6 py-5">
          <div className="mb-5">
            <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-[#1E3A8A]" htmlFor="agent-display-name">Tên hiển thị / Danh xưng</label>
            <div className="group relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1E3A8A]/50 transition-colors group-focus-within:text-[#1E3A8A]" size={18} />
              <input className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-[18px] font-black text-[#0B1431] shadow-sm transition-all focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/20" id="agent-display-name" onChange={(event) => setName(event.target.value)} value={name} />
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <label className="block text-[11px] font-black uppercase tracking-widest text-[#1E3A8A]">Biệt đội Copilot Squad</label>
              <button className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-600 transition-colors hover:bg-amber-100 hover:text-amber-700" onClick={() => fileInputRef.current?.click()} type="button"><Camera size={14} /> Tải ảnh thật</button>
              <input accept="image/*" className="sr-only" onChange={(event) => handleUpload(event.target.files?.[0])} ref={fileInputRef} type="file" />
            </div>

            {selectedAvatarId === "custom" && customAvatarUrl && (
              <button aria-pressed="true" className="mb-3 flex w-full items-center gap-3 rounded-2xl border-2 border-amber-500 bg-amber-50 p-3 text-left shadow-[0_8px_15px_rgba(245,158,11,0.16)]" onClick={() => setSelectedAvatarId("custom")} type="button">
                <img alt="Ảnh cá nhân đã chọn" className="h-16 w-16 rounded-2xl object-cover shadow-sm" src={customAvatarUrl} />
                <span className="min-w-0 flex-1"><span className="block text-[13px] font-black text-[#0B1431]">Ảnh cá nhân</span><span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Nhân vật riêng của bạn</span></span>
                <Check className="rounded-full bg-amber-500 p-0.5 text-white" size={18} strokeWidth={4} />
              </button>
            )}

            <div className="grid grid-cols-2 gap-4 pb-2">
              {CORE_CAST_AVATARS.map((character) => {
                const isSelected = selectedAvatarId === character.id;
                const isLeftColumn = character.id === "navigator" || character.id === "copilot";
                const { Icon } = character;
                return (
                  <div className={`relative ${isSelected ? "z-50" : "z-10"}`} key={character.id}>
                    <button aria-label={`Chọn ${character.name}`} aria-pressed={isSelected} className={`relative flex w-full flex-col items-center gap-2 rounded-[24px] border-2 bg-white p-3 transition-all duration-300 ${isSelected ? "scale-[1.02] border-orange-500 shadow-[0_8px_20px_rgba(249,115,22,0.2)]" : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"}`} onClick={() => setSelectedAvatarId(character.id)} type="button">
                      <span className={`relative h-20 w-20 overflow-hidden rounded-[18px] transition-transform duration-300 ${isSelected ? "ring-4 ring-orange-500/20" : "group-hover:scale-105"}`}><img alt={character.name} className="h-full w-full bg-slate-100 object-cover" src={character.url} /></span>
                      <span className="text-center"><span className="block text-[14px] font-black leading-tight text-[#0B1431]">{character.name}</span><span className="mt-1 flex items-center justify-center gap-1 text-[9.5px] font-bold uppercase tracking-widest text-slate-500"><Icon className="text-slate-400" size={14} />{character.role}</span></span>
                      {isSelected && <span className="absolute -right-2 -top-2 rounded-full border-2 border-white bg-orange-500 p-1 shadow-md"><Check className="text-white" size={14} strokeWidth={4} /></span>}
                    </button>
                    {isSelected && <section aria-live="polite" className={`absolute top-6 w-[170px] rounded-2xl border border-white/20 p-3.5 text-white shadow-[0_15px_35px_rgba(0,0,0,0.25)] ${character.bgInfo} ${isLeftColumn ? "left-[92%] rounded-tl-sm" : "right-[92%] rounded-tr-sm"}`}>
                      <span aria-hidden="true" className={`absolute top-5 h-3.5 w-3.5 rotate-45 ${character.bgInfo} ${isLeftColumn ? "-left-1.5" : "-right-1.5"}`} />
                      <span className="relative z-10 block"><span className="mb-1.5 flex items-center gap-1.5"><Icon className="text-white/80" size={14} /><span className="text-[10px] font-bold uppercase tracking-widest leading-none text-white">{character.name}</span></span><span className="mb-2 block text-[11.5px] font-medium leading-relaxed text-white/95"><strong>Tính cách:</strong> {character.traits}</span><span className="block text-[12px] font-bold italic leading-snug text-amber-200">{character.quote}</span></span>
                    </section>}
                  </div>
                );
              })}
            </div>
            {uploadError && <p className="mt-3 text-xs font-medium text-rose-600" role="alert">{uploadError}</p>}
          </div>
        </div>

        <footer className="border-t border-slate-100 bg-white p-5">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-[16px] font-black uppercase tracking-widest text-white shadow-[0_8px_20px_rgba(245,158,11,0.3)] transition-all hover:opacity-90 active:scale-[0.98]" onClick={handleSave} type="button">Lưu lựa chọn</button>
        </footer>
      </section>
    </div>
  );
}
