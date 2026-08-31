import React, { useEffect, useMemo, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Bot, CheckCircle2, Circle, Clock3, Download, Heart, ImageIcon, Italic, Loader2, Mic, Move, Palette, Play, RotateCcw, ShieldCheck, Sparkles, Star, Trophy, Type, User, Video, X } from "lucide-react";
import { toJpeg } from "html-to-image";
import { type MarketingTemplate, type PilotSession } from "../lib/supabaseContent";

type RoleplayModalProps = { situation: string; prompt: string; onClose: () => void; onCompleted?: () => void | Promise<void> };
type RoleplayState = "ready" | "recording" | "review";

const roleplayFeedback = [
  "Bạn đã mở đầu bằng một câu hỏi. Lần sau hãy dừng 2 giây để khách có không gian phản hồi.",
  "Phản xạ ổn định. Hãy nối lại với nhu cầu dài hạn trước khi đề cập giải pháp.",
  "Bạn giữ được giọng điệu thấu cảm. Thử xác nhận một bước follow-up thật cụ thể ở phần kết.",
];

export function RoleplayModal({ situation, prompt, onClose, onCompleted }: RoleplayModalProps) {
  const [state, setState] = useState<RoleplayState>("ready");
  const [secondsLeft, setSecondsLeft] = useState(180);
  const feedback = useMemo(() => roleplayFeedback[(prompt.length + situation.length) % roleplayFeedback.length], [prompt, situation]);

  useEffect(() => {
    if (state !== "recording") return;
    const timer = window.setInterval(() => setSecondsLeft((current) => current > 0 ? current - 1 : 180), 1000);
    return () => window.clearInterval(timer);
  }, [state]);

  const timer = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const reset = () => { setState("ready"); setSecondsLeft(180); };
  const toggleRecord = () => setState((current) => {
    if (current === "recording") { void onCompleted?.(); return "review"; }
    return "recording";
  });
  return <div className="roleplay-backdrop" role="dialog" aria-modal="true" aria-labelledby="roleplay-title"><section className="roleplay-modal sprint11-roleplay-modal"><button className="roleplay-close" onClick={onClose} aria-label="Đóng phòng luyện tập"><X size={20} /></button><header><span><Video size={15} />PHÒNG LUYỆN TẬP ROLEPLAY · 03:00</span><h2 id="roleplay-title">Tập phản xạ trước khi<br /><em>ra gặp khách.</em></h2><p>{situation}</p></header><div className="roleplay-camera"><div className="camera-grid" /><div className="camera-avatar"><Mic size={30} /><span>CAMERA DEMO</span></div><div className="camera-status"><i className={state === "recording" ? "is-recording" : ""} />{state === "recording" ? "ĐANG LUYỆN TẬP" : state === "review" ? "ĐÃ HOÀN TẤT VÒNG TẬP" : "SẴN SÀNG ROLEPLAY"}</div><div className="roleplay-timer"><Clock3 size={16} />{timer}</div></div><div className="roleplay-prompt"><ShieldCheck size={18} /><div><span>GỢI Ý MỞ ĐẦU</span><strong>{prompt}</strong></div></div>{state === "review" && <section className="sprint11-ai-feedback" aria-live="polite"><Bot size={21} /><div><span>AI COACHING · MÔ PHỎNG DEMO</span><strong>{feedback}</strong><small>Không có video, giọng nói hoặc dữ liệu khách hàng nào được gửi đi hay lưu trữ.</small></div></section>}<footer><button className="roleplay-secondary" onClick={reset}><RotateCcw size={16} />Làm lại</button><button className={`roleplay-record ${state === "recording" ? "is-recording" : ""}`} onClick={toggleRecord}><Circle size={16} fill="currentColor" />{state === "recording" ? "Dừng & nhận góp ý" : state === "review" ? "Tập lượt mới" : "Bắt đầu Record"}</button></footer><small>Giao diện demo không kích hoạt camera, không ghi âm hoặc lưu video.</small></section></div>;
}

const demoVideos = [
  { id: "reel-01", title: "Cách tôi chốt HĐ 50 triệu", tag: "Chốt nhu cầu", duration: "01:18", takeaway: "Mở bằng mục tiêu tài chính, không mở bằng sản phẩm." },
  { id: "reel-02", title: "Xử lý từ chối phí đắt", tag: "Bảo Bối thực chiến", duration: "00:46", takeaway: "Hỏi điều khách đang so sánh trước khi giải thích giá trị." },
  { id: "reel-03", title: "Một câu hỏi mở đúng lúc", tag: "Coaching tại hiện trường", duration: "01:05", takeaway: "Chốt bằng một bước follow-up nhỏ, có thời điểm rõ ràng." },
];

export function SalesVideoReels({ onWatch }: { onWatch?: (videoId: string) => void | Promise<void> }) {
  const [activeId, setActiveId] = useState(demoVideos[0].id);
  const active = demoVideos.find((item) => item.id === activeId) ?? demoVideos[0];
  return <section className="sales-reels" aria-label="Video Thực Chiến demo"><div className="sales-reels-head"><div><span><Video size={15} />VIDEO THỰC CHIẾN · DEMO</span><h2>Học từ một pha xử lý,<br /><em>trong một phút.</em></h2></div><p>Video placeholder phục vụ bản demo Leader; không chứa hình ảnh hoặc dữ liệu khách hàng thật.</p></div><div className="sprint11-reel-now" aria-live="polite"><Play size={17} fill="currentColor" /><div><span>ĐANG CHỌN PHÂN TÍCH</span><strong>{active.title}</strong></div><p>{active.takeaway}</p></div><div className="sales-reels-grid">{demoVideos.map((item, index) => <article className={`sales-reel reel-${index + 1} ${activeId === item.id ? "is-active" : ""}`} key={item.id}><video src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" preload="metadata" muted playsInline aria-label={`Video demo: ${item.title}`} /><div className="reel-gradient" /><span className="reel-duration">{item.duration}</span><button className="reel-play" aria-label={`Xem ${item.title}`} aria-pressed={activeId === item.id} onClick={() => { setActiveId(item.id); void onWatch?.(item.id); }}><Play size={20} fill="currentColor" /></button><footer><small>{item.tag}</small><h3>{item.title}</h3><span>Video demo · Leader Library</span></footer></article>)}</div></section>;
}

type MarketingStudioProps = {
  session: PilotSession | null;
  templates?: MarketingTemplate[];
};

const MOCK_TEMPLATES: MarketingTemplate[] = [
  { code: "MKT01", category: "Dành Cho Khách Hàng", occasion: "Chúc mừng Sinh nhật", message_template: "Chúc anh/chị một ngày thật ý nghĩa, bình an, hạnh phúc, sức khỏe và thành công!", image_url: null, sort_order: 1 },
  { code: "MKT02", category: "Dành Cho Khách Hàng", occasion: "Kỷ niệm 1 năm hợp đồng", message_template: "Cảm ơn anh/chị đã trao niềm tin để đội ngũ được đồng hành bảo vệ gia đình mình.", image_url: null, sort_order: 2 },
];

type TextAlign = "text-left" | "text-center" | "text-right";
type SignatureIcon = "user" | "star" | "heart" | "trophy";
type MarketingFontClass = "custom-font-sriracha" | "custom-font-pacifico" | "custom-font-dancing" | "custom-font-playfair" | "custom-font-montserrat";
const MARKETING_STUDIO_FONT_LINK_ID = "marketing-studio-google-fonts";
const MARKETING_STUDIO_FONT_HREF = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Montserrat:ital,wght@0,400;0,700;1,400;1,700&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Sriracha&display=swap";
const MARKETING_STUDIO_FONT_STYLES = `
  @import url('${MARKETING_STUDIO_FONT_HREF}');
  .custom-font-sriracha { font-family: 'Sriracha', cursive !important; }
  .custom-font-pacifico { font-family: 'Pacifico', cursive !important; }
  .custom-font-dancing { font-family: 'Dancing Script', cursive !important; }
  .custom-font-playfair { font-family: 'Playfair Display', serif !important; }
  .custom-font-montserrat { font-family: 'Montserrat', sans-serif !important; }
`;

const MARKETING_GRADIENTS = [
  { className: "bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700", start: "#2563eb", end: "#6d28d9", glow: "rgba(191,219,254,.62)" },
  { className: "bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700", start: "#10b981", end: "#0e7490", glow: "rgba(167,243,208,.58)" },
  { className: "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600", start: "#f59e0b", end: "#e11d48", glow: "rgba(254,240,138,.62)" },
  { className: "bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-800", start: "#d946ef", end: "#3730a3", glow: "rgba(233,213,255,.58)" },
] as const;

function getMarketingGradient(code?: string | null) {
  const hash = Array.from(code ?? "marketing").reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return MARKETING_GRADIENTS[hash % MARKETING_GRADIENTS.length];
}

function normalizeCategory(value: unknown) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function MarketingStudio({ session, templates = [] }: MarketingStudioProps) {
  const availableTemplates = templates.length > 0 ? templates : MOCK_TEMPLATES;
  const availableTabs = useMemo(() => {
    const categories = new Map<string, string>();
    availableTemplates.forEach((template) => {
      const label = String(template.category ?? "").trim() || "Khác";
      const key = normalizeCategory(label) || "khac";
      if (!categories.has(key)) categories.set(key, label);
    });
    return Array.from(categories, ([key, label]) => ({ key, label }));
  }, [availableTemplates]);
  const [activeTab, setActiveTab] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<MarketingTemplate | null>(null);
  const [text, setText] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState("");
  const [fontClass, setFontClass] = useState<MarketingFontClass>("custom-font-sriracha");
  const [color, setColor] = useState("#451a03");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [fontSize, setFontSize] = useState(16);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textPos, setTextPos] = useState({ x: 10, y: 30 });
  const [sigPos, setSigPos] = useState({ x: 10, y: 80 });
  const [showSignature, setShowSignature] = useState(true);
  const [sigName, setSigName] = useState(session?.profile.display_name || "TVV của đội ngũ");
  const [sigTitle, setSigTitle] = useState(session?.profile.role === "leader" ? "Leader · Đội ngũ đồng hành" : "Tư vấn viên · Đội ngũ đồng hành");
  const [sigIcon, setSigIcon] = useState<SignatureIcon>("user");
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const existing = document.getElementById(MARKETING_STUDIO_FONT_LINK_ID);
    if (existing) return;

    const link = document.createElement("link");
    link.id = MARKETING_STUDIO_FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href = MARKETING_STUDIO_FONT_HREF;
    document.head.appendChild(link);

    return () => link.remove();
  }, []);

  useEffect(() => {
    setActiveTab((current) => availableTabs.some((tab) => tab.key === current) ? current : (availableTabs[0]?.key ?? ""));
  }, [availableTabs]);

  const currentTabTemplates = useMemo(() => {
    return availableTemplates.filter((template) => (normalizeCategory(template.category) || "khac") === activeTab);
  }, [activeTab, availableTemplates]);

  useEffect(() => {
    setSelectedTemplate((current) => {
      const selectedInCurrentTab = currentTabTemplates.find((template) => template.code === current?.code);
      return selectedInCurrentTab ?? currentTabTemplates[0] ?? null;
    });
  }, [currentTabTemplates]);

  const selectedBg = selectedTemplate;
  const selectedTemplateImage = selectedTemplate?.image_url?.trim() ?? "";

  const suggestedMessages = useMemo(() => Array.from(new Set(
    currentTabTemplates
      .map((template) => template.message_template?.trim())
      .filter((message): message is string => Boolean(message))
  )), [currentTabTemplates]);

  useEffect(() => {
    setText(selectedBg?.message_template || "");
    setSelectedSuggestion("");
  }, [selectedBg?.code]);

  useEffect(() => {
    if (!session?.profile) return;
    setSigName((current) => current === "TVV của đội ngũ" ? session.profile.display_name || current : current);
    setSigTitle((current) => current.includes("Đội ngũ đồng hành") ? (session.profile.role === "leader" ? "Leader · Đội ngũ đồng hành" : "Tư vấn viên · Đội ngũ đồng hành") : current);
  }, [session?.profile.display_name, session?.profile.role]);

  const handleSelectTemplate = (template: MarketingTemplate) => {
    setSelectedTemplate(template);
  };

  const handleExportImage = async () => {
    const element = document.getElementById("marketing-export-node");
    if (!element) return;

    const imgElement = element.querySelector("img");
    let originalSrc = "";

    try {
      if (imgElement && imgElement.src && !imgElement.src.startsWith("data:")) {
        originalSrc = imgElement.src;
        const base64Data = await new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = originalSrc + (originalSrc.includes("?") ? "&" : "?") + "cb=" + Date.now();

          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("Canvas context unavailable."));
              return;
            }
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/jpeg", 1.0));
          };
          img.onerror = () => reject(new Error("Canvas Load Failed"));
        });

        imgElement.src = base64Data;
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      const dataUrl = await toJpeg(element, { cacheBust: true, pixelRatio: 2.5, quality: 1.0, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `AgentCopilot_Marketing_${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Export error:", error);
      alert(`Lỗi xuất ảnh: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      if (imgElement && originalSrc) {
        imgElement.src = originalSrc;
      }
    }
  };

  const handleDownload = async () => {
    if (!selectedBg) return;
    setExporting(true);
    setSuccess(false);
    try {
      await document.fonts?.ready;
      const width = 800;
      const height = 1000;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Không thể khởi tạo canvas");
      const gradient = getMarketingGradient(selectedBg.code);
      const background = context.createLinearGradient(0, 0, width, height);
      background.addColorStop(0, gradient.start);
      background.addColorStop(1, gradient.end);
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);
      const spotlight = context.createRadialGradient(width * 0.22, height * 0.16, 12, width * 0.22, height * 0.16, width * 0.85);
      spotlight.addColorStop(0, gradient.glow);
      spotlight.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = spotlight;
      context.fillRect(0, 0, width, height);
      context.fillStyle = "rgba(255,255,255,.16)";
      context.font = "900 24px system-ui, sans-serif";
      context.textAlign = "center";
      context.fillText(String(selectedBg.occasion || "AGENT COPILOT").toUpperCase(), width / 2, 62);

      const fontFamily = fontClass === "custom-font-pacifico" ? "Pacifico" : fontClass === "custom-font-dancing" ? "Dancing Script" : fontClass === "custom-font-playfair" ? "Playfair Display" : fontClass === "custom-font-montserrat" ? "Montserrat" : "Sriracha";
      const scaledFontSize = fontSize * (width / 400);
      const textX = (textPos.x / 100) * width;
      const textY = (textPos.y / 100) * height;
      const maxTextWidth = ((100 - textPos.x - 5) / 100) * width;
      const textAnchorX = textAlign === "center" ? textX + maxTextWidth / 2 : textAlign === "right" ? textX + maxTextWidth : textX;
      context.font = `${isItalic ? "italic " : ""}${isBold ? "700 " : "400 "}${scaledFontSize}px "${fontFamily}", sans-serif`;
      context.fillStyle = color;
      context.textAlign = textAlign;
      context.textBaseline = "top";
      context.shadowColor = "rgba(0, 0, 0, 0.5)";
      context.shadowBlur = 2;
      context.shadowOffsetX = 1;
      context.shadowOffsetY = 2;
      const lines = text.split("\n").flatMap((paragraph) => {
        const words = paragraph.split(/\s+/).filter(Boolean);
        if (words.length === 0) return [""];
        const wrapped: string[] = [];
        let line = "";
        words.forEach((word) => {
          const candidate = line ? `${line} ${word}` : word;
          if (context.measureText(candidate).width > maxTextWidth && line) {
            wrapped.push(line);
            line = word;
          } else line = candidate;
        });
        if (line) wrapped.push(line);
        return wrapped;
      });
      lines.forEach((line, index) => context.fillText(line, textAnchorX, textY + index * scaledFontSize * 1.6));
      context.shadowColor = "transparent";
      context.shadowBlur = 0;
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;

      if (showSignature) {
        const signatureX = (sigPos.x / 100) * width;
        const scaleMod = width / 800;
        const signatureWidth = Math.min(300 * scaleMod, width - signatureX - 16);
        const signatureHeight = 70 * scaleMod;
        const signatureY = Math.min((sigPos.y / 100) * height, height - signatureHeight - 16);
        const radius = 16 * scaleMod;
        context.beginPath();
        context.moveTo(signatureX + radius, signatureY);
        context.lineTo(signatureX + signatureWidth - radius, signatureY);
        context.arcTo(signatureX + signatureWidth, signatureY, signatureX + signatureWidth, signatureY + radius, radius);
        context.lineTo(signatureX + signatureWidth, signatureY + signatureHeight - radius);
        context.arcTo(signatureX + signatureWidth, signatureY + signatureHeight, signatureX + signatureWidth - radius, signatureY + signatureHeight, radius);
        context.lineTo(signatureX + radius, signatureY + signatureHeight);
        context.arcTo(signatureX, signatureY + signatureHeight, signatureX, signatureY + signatureHeight - radius, radius);
        context.lineTo(signatureX, signatureY + radius);
        context.arcTo(signatureX, signatureY, signatureX + radius, signatureY, radius);
        context.closePath();
        context.fillStyle = "rgba(255, 255, 255, 0.12)";
        context.fill();
        context.strokeStyle = "rgba(255, 255, 255, 0.3)";
        context.lineWidth = scaleMod;
        context.stroke();

        const iconX = signatureX + 35 * scaleMod;
        const iconY = signatureY + 35 * scaleMod;
        context.beginPath();
        context.arc(iconX, iconY, 20 * scaleMod, 0, Math.PI * 2);
        context.fillStyle = "rgba(255, 255, 255, 0.18)";
        context.fill();
        context.strokeStyle = "rgba(255, 255, 255, 0.4)";
        context.stroke();
        context.font = `${20 * scaleMod}px system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = color;
        context.fillText(renderSignatureIcon(), iconX, iconY);

        context.textAlign = "left";
        context.textBaseline = "top";
        context.fillStyle = color;
        const nameFontSize = 18 * scaleMod;
        context.font = `700 ${nameFontSize}px "Playfair Display", Georgia, serif`;
        context.fillText(sigName || "TVV của đội ngũ", signatureX + 70 * scaleMod, signatureY + 14 * scaleMod);
        context.globalAlpha = 0.9;
        const titleFontSize = 10 * scaleMod;
        context.font = `700 ${titleFontSize}px system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
        context.fillText((sigTitle || "Đội ngũ đồng hành").toUpperCase(), signatureX + 70 * scaleMod, signatureY + 42 * scaleMod);
        context.globalAlpha = 1;
      }

      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Canvas rỗng")), "image/png"));
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `AgentCopilot_${selectedBg.code}_${Date.now()}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Marketing Studio native canvas export failed:", error);
      window.alert("Không thể tạo ảnh Marketing. Hãy thử lại.");
    } finally {
      setExporting(false);
    }
  };

  const renderSignatureIcon = () => {
    if (sigIcon === "star") return "⭐";
    if (sigIcon === "heart") return "❤️";
    if (sigIcon === "trophy") return "🏆";
    return "👤";
  };

  return (
    <section className="rounded-[24px] border border-slate-100 bg-white p-4 font-sans shadow-sm sm:p-6" aria-label="Marketing 1-Chạm Studio">
      <style>{MARKETING_STUDIO_FONT_STYLES}</style>
      <header className="mb-6">
        <span className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600"><Sparkles size={16} /> MARKETING STUDIO</span>
        <h2 className="text-2xl font-black leading-tight text-slate-900">Thiết kế linh hoạt, <em className="not-italic text-amber-600">chạm đúng cảm xúc.</em></h2>
        <p className="mt-1 text-sm text-slate-500">Chọn phôi, đặt thông điệp và mô phỏng ảnh tải về. Không nhập dữ liệu định danh của khách hàng.</p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-100 pb-4" role="tablist" aria-label="Danh mục template Marketing">
        {availableTabs.length ? availableTabs.map((tab) => <button key={tab.key} type="button" role="tab" aria-selected={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${activeTab === tab.key ? "bg-amber-100 text-amber-700" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>{tab.label}</button>) : <p className="text-sm text-slate-400">Chưa có dữ liệu danh mục.</p>}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-6">
          <div>
            <label className="mb-3 block text-xs font-black uppercase tracking-widest text-slate-500">1. Chọn phôi theo bối cảnh</label>
            <div className="custom-scrollbar grid max-h-[280px] grid-cols-3 gap-3 overflow-y-auto pr-2 sm:grid-cols-4">
              {currentTabTemplates.length === 0 && <p className="col-span-full py-4 text-sm text-slate-400">Chưa có mẫu cho danh mục này.</p>}
              {currentTabTemplates.map((template) => <button key={template.code} type="button" onClick={() => handleSelectTemplate(template)} aria-pressed={selectedBg?.code === template.code} className={`relative aspect-[3/4] w-full overflow-hidden rounded-xl border-2 transition-all ${getMarketingGradient(template.code).className} ${selectedBg?.code === template.code ? "border-amber-500 shadow-md ring-2 ring-amber-500/20" : "border-slate-200 opacity-70 hover:opacity-100"}`}>{template.image_url ? <img src={template.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <div className="absolute inset-0 flex items-center justify-center bg-white/5"><ImageIcon size={20} className="text-white/65" /></div>}<span className="absolute inset-x-0 bottom-0 truncate bg-black/35 px-2 py-1 text-center text-[9px] font-bold text-white">{template.occasion || "Mẫu Marketing"}</span></button>)}
            </div>
          </div>

          <div key={selectedBg?.code || "empty"}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><label htmlFor="marketing-studio-message" className="block text-xs font-black uppercase tracking-widest text-slate-500">2. Tùy chỉnh thông điệp</label>{suggestedMessages.length > 0 && <select aria-label="Chọn thông điệp gợi ý" value={selectedSuggestion} onChange={(event) => { const message = event.target.value; setSelectedSuggestion(message); if (message) setText(message); }} className="max-w-full rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs font-bold text-amber-700 outline-none"><option value="">Gợi ý theo danh mục…</option>{suggestedMessages.map((message) => <option key={message} value={message}>{message.length > 52 ? `${message.slice(0, 52)}…` : message}</option>)}</select>}</div>
            <textarea id="marketing-studio-message" value={text} onChange={(event) => { setText(event.target.value); setSelectedSuggestion(""); }} className="mb-3 min-h-[100px] w-full resize-y rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-medium outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10" placeholder="Nhập lời chúc..." maxLength={400} />
            <p className="mb-3 text-xs text-slate-500">Không nhập tên, email, số điện thoại hoặc thông tin định danh của khách hàng.</p>
            <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex flex-wrap items-center gap-3"><select value={fontClass} onChange={(event) => setFontClass(event.target.value as MarketingFontClass)} className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 outline-none"><option value="custom-font-sriracha">Thư tay mộc mạc · Sriracha</option><option value="custom-font-pacifico">Thư tay lãng mạn · Pacifico</option><option value="custom-font-dancing">Bay bổng · Dancing Script</option><option value="custom-font-playfair">Sang trọng · Playfair</option><option value="custom-font-montserrat">Hiện đại · Montserrat</option></select>
              <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1" aria-label="Đậm và nghiêng"><button aria-label="Chữ đậm" type="button" onClick={() => setIsBold((current) => !current)} className={`rounded p-1 ${isBold ? "bg-amber-100 text-amber-700" : "text-slate-500 hover:bg-slate-100"}`}><Bold size={16} /></button><button aria-label="Chữ nghiêng" type="button" onClick={() => setIsItalic((current) => !current)} className={`rounded p-1 ${isItalic ? "bg-amber-100 text-amber-700" : "text-slate-500 hover:bg-slate-100"}`}><Italic size={16} /></button></div>
              <div className="flex rounded-lg border border-slate-200 bg-white p-1" aria-label="Căn lề chữ">{([{ value: "left", icon: <AlignLeft size={16} /> }, { value: "center", icon: <AlignCenter size={16} /> }, { value: "right", icon: <AlignRight size={16} /> }] as Array<{ value: "left" | "center" | "right"; icon: React.ReactNode }>).map((item) => <button aria-label={`Căn ${item.value}`} type="button" key={item.value} onClick={() => setTextAlign(item.value)} className={`rounded p-1 ${textAlign === item.value ? "bg-amber-100 text-amber-700" : "text-slate-400"}`}>{item.icon}</button>)}</div></div>
              <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3"><div className="flex items-center gap-2"><Palette size={14} className="text-slate-400" /><div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1"><input aria-label="Chọn màu tùy ý" type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-6 w-6 cursor-pointer rounded border-0 p-0" />{["#ffffff", "#0f172a", "#d97706", "#b91c1c", "#1d4ed8"].map((swatch) => <button aria-label={`Màu ${swatch}`} type="button" key={swatch} onClick={() => setColor(swatch)} className="h-5 w-5 rounded-full border border-slate-300 shadow-sm" style={{ backgroundColor: swatch }} />)}</div></div><div className="flex min-w-[150px] flex-1 items-center gap-2"><Type size={14} className="shrink-0 text-slate-400" /><input aria-label="Cỡ chữ" type="range" min="12" max="48" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} className="w-full accent-amber-500" /><span className="w-8 text-right text-[10px] font-bold text-slate-400">{fontSize}px</span></div></div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4"><label className="mb-3 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500"><Move size={12} />Vị trí lời chúc</label><input aria-label="Dọc lời chúc" type="range" min="0" max="80" value={textPos.y} onChange={(event) => setTextPos({ ...textPos, y: Number(event.target.value) })} className="mb-2 w-full accent-amber-500" /><input aria-label="Ngang lời chúc" type="range" min="0" max="80" value={textPos.x} onChange={(event) => setTextPos({ ...textPos, x: Number(event.target.value) })} className="w-full accent-amber-500" /></div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4"><label className="mb-3 flex items-center justify-between gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500"><span className="flex items-center gap-1"><User size={12} />Vị trí chữ ký</span><input aria-label="Bật chữ ký" type="checkbox" checked={showSignature} onChange={(event) => setShowSignature(event.target.checked)} className="accent-amber-500" /></label><input aria-label="Dọc chữ ký" type="range" min="0" max="90" value={sigPos.y} onChange={(event) => setSigPos({ ...sigPos, y: Number(event.target.value) })} className="mb-2 w-full accent-amber-500" disabled={!showSignature} /><input aria-label="Ngang chữ ký" type="range" min="0" max="60" value={sigPos.x} onChange={(event) => setSigPos({ ...sigPos, x: Number(event.target.value) })} className="w-full accent-amber-500" disabled={!showSignature} /></div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"><label className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500"><span>3. Chữ ký tùy chỉnh</span><input aria-label="Hiển thị chữ ký" type="checkbox" checked={showSignature} onChange={(event) => setShowSignature(event.target.checked)} className="accent-amber-500" /></label>{showSignature && <><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><input aria-label="Tên hiển thị nội bộ" value={sigName} onChange={(event) => setSigName(event.target.value)} placeholder="Tên hiển thị nội bộ" maxLength={60} className="rounded-lg border border-slate-200 bg-white p-2 text-sm outline-none focus:border-amber-500" /><input aria-label="Chức danh nội bộ" value={sigTitle} onChange={(event) => setSigTitle(event.target.value)} placeholder="Chức danh nội bộ" maxLength={80} className="rounded-lg border border-slate-200 bg-white p-2 text-sm outline-none focus:border-amber-500" /></div><div className="flex flex-wrap gap-2">{([{ value: "user", label: "Người dùng", icon: <User size={15} /> }, { value: "star", label: "Ngôi sao", icon: <Star size={15} /> }, { value: "heart", label: "Trái tim", icon: <Heart size={15} /> }, { value: "trophy", label: "Cúp vàng", icon: <Trophy size={15} /> }] as Array<{ value: SignatureIcon; label: string; icon: React.ReactNode }>).map((item) => <button key={item.value} type="button" onClick={() => setSigIcon(item.value)} className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-bold ${sigIcon === item.value ? "border-amber-300 bg-amber-100 text-amber-800" : "border-slate-200 bg-white text-slate-600"}`}>{item.icon}{item.label}</button>)}</div><p className="text-xs text-slate-500">Chỉ dùng tên hiển thị và chức danh nội bộ; không thêm số điện thoại hoặc dữ liệu khách hàng.</p></>}</div>

           <button type="button" className="mt-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-sm font-black text-white shadow-[0_8px_25px_rgba(245,158,11,0.3)] transition-all hover:scale-[1.02] disabled:scale-100 disabled:opacity-70" onClick={() => void handleExportImage()} disabled={exporting || !selectedBg}>{exporting ? <><Loader2 size={18} className="animate-spin" />Đang tạo ảnh...</> : success ? <><CheckCircle2 size={18} />Đã tải thành công!</> : <><Download size={18} />Xuất Ảnh & Chia Sẻ</>}</button>
        </div>

          <div className="relative flex-1 w-full h-full flex items-center justify-center p-4 overflow-hidden"><div id="marketing-export-node" className="relative w-full max-w-[400px] aspect-[4/5] overflow-hidden mx-auto shadow-2xl">{selectedTemplateImage && <img src={selectedTemplateImage} crossOrigin="anonymous" alt="Template Background" className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" onError={(event) => { event.currentTarget.style.display = "none"; }} />}<div className="relative z-10 w-full h-full p-6 flex flex-col pointer-events-none overflow-hidden"><div className="absolute" style={{ top: `${textPos.y}%`, left: `${textPos.x}%`, width: `${100 - textPos.x - 5}%` }}><p className={`whitespace-pre-wrap leading-[1.6] drop-shadow-md ${fontClass}`} style={{ fontSize: `${fontSize}px`, color, textAlign, fontWeight: isBold ? 700 : 400, fontStyle: isItalic ? "italic" : "normal" }}>{text || "Lời chúc của bạn..."}</p></div>{showSignature && <div className="absolute flex items-center gap-3 rounded-2xl border border-white/25 bg-white/5 p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:p-3" style={{ top: `${sigPos.y}%`, left: `${sigPos.x}%`, color }}><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10">{renderSignatureIcon()}</div><div className="flex flex-col"><strong className="mb-1 text-sm font-black leading-none" style={{ color }}>{sigName || "TVV của đội ngũ"}</strong><span className="text-[9px] font-black uppercase tracking-widest opacity-80" style={{ color }}>{sigTitle || "Đội ngũ đồng hành"}</span></div></div>}</div></div></div>
      </div>
    </section>
  );
}
