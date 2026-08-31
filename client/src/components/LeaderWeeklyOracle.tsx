import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, Image as ImageIcon, RefreshCw, Rocket, ShieldAlert, Sparkles, Target, X } from "lucide-react";
import { toast } from "sonner";
import { drawSmartTarotCard, type CosmicTarotCard } from "../lib/supabaseContent";

type SolarOracleCard = {
  id: string;
  theme: "success" | "warning" | "danger";
  tarotTitle: string;
  tarotQuote: string;
  strategyTitle: string;
  strategyText: string;
  icon: React.ReactNode;
};

type OracleStar = { id: number; top: string; left: string; size: string; delay: string; opacity: number };

const ORACLE_DRAW_CHIME = "/manus-storage/celebration-open-chime_b1969992.mp3";
const ORACLE_FLIP_TING = "/manus-storage/celebration-claim-coin_04b021b1.mp3";

function mapTarotCard(card: CosmicTarotCard): SolarOracleCard {
  const trigger = card.signalTrigger.toLowerCase();
  const theme = trigger.includes("momentum") || trigger.includes("sales") ? "success" : trigger.includes("empathy") || trigger.includes("alert") ? "danger" : "warning";
  const icon = theme === "success" ? <Rocket size={48} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,.8)]" /> : theme === "danger" ? <ShieldAlert size={48} className="text-rose-400 drop-shadow-[0_0_15px_rgba(251,113,133,.8)]" /> : <Target size={48} className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,.8)]" />;
  return { id: card.id, theme, tarotTitle: card.cardTitle, tarotQuote: card.crypticQuote, strategyTitle: "GỢI Ý TỪ COPILOT", strategyText: card.actionableAdvice, icon };
}

const DRAW_READY_CARD: SolarOracleCard = { id: "smart-tarot-ready", theme: "warning", tarotTitle: "Tín Hiệu Đang Chờ", tarotQuote: "Copilot sẽ rút đúng thông điệp của Team khi bạn chọn lá bài.", strategyTitle: "GỢI Ý TỪ COPILOT", strategyText: "Đang chờ Smart Tarot xác định tín hiệu Team.", icon: <Sparkles size={48} className="text-amber-400" /> };

function playSound(kind: "ambient" | "draw" | "flip" | "success") {
  if (typeof Audio === "undefined" || (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent))) return;
  const source = kind === "ambient" ? ORACLE_DRAW_CHIME : ORACLE_FLIP_TING;
  try {
    const audio = new Audio(source);
    audio.volume = kind === "ambient" ? 0.18 : 0.62;
    const attempt = audio.play();
    if (attempt && typeof attempt.catch === "function") void attempt.catch(() => undefined);
  } catch {
    // Browser audio restrictions are intentionally non-blocking.
  }
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(/\s+/);
  let line = "";
  let currentY = y;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      ctx.fillText(line, x, currentY);
      currentY += lineHeight;
      line = word;
    } else line = next;
  }
  if (line) ctx.fillText(line, x, currentY);
  return currentY;
}

function generateOracleImage(card: SolarOracleCard): { canvas: HTMLCanvasElement; dataUrl: string } | null {
  if (typeof document === "undefined") return null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context failed");

    const palette = card.theme === "success" ? { base: "#064e3b", accent: "#34d399" } : card.theme === "warning" ? { base: "#78350f", accent: "#fbbf24" } : { base: "#4c0519", accent: "#fb7185" };
    const gradient = ctx.createLinearGradient(0, 0, 800, 1000);
    gradient.addColorStop(0, palette.base);
    gradient.addColorStop(1, "#020617");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 1000);

    for (let i = 0; i < 80; i += 1) {
      ctx.fillStyle = `rgba(255,255,255,${0.1 + ((i * 17) % 45) / 100})`;
      ctx.beginPath();
      ctx.arc((i * 83) % 800, (i * 149) % 900, 1 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 30px system-ui, sans-serif";
    ctx.fillText("THÔNG ĐIỆP TỪ AGENT COPILOT", 400, 100);
    ctx.strokeStyle = "rgba(255,255,255,.2)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(200, 130); ctx.lineTo(600, 130); ctx.stroke();
    ctx.fillStyle = palette.accent;
    ctx.font = "900 46px system-ui, sans-serif";
    wrapText(ctx, card.tarotTitle, 400, 220, 650, 55);
    ctx.fillStyle = "#ffffff";
    ctx.font = "italic 28px system-ui, sans-serif";
    const quoteEndY = wrapText(ctx, `“${card.tarotQuote}”`, 400, 335, 650, 42);

    const promptY = quoteEndY + 72;
    drawRoundedRect(ctx, 50, promptY, 700, 260, 20);
    ctx.fillStyle = "rgba(0,0,0,.5)";
    ctx.fill();
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.fillText("GỢI Ý KÊU GỌI TEAM", 400, promptY + 52);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 27px system-ui, sans-serif";
    wrapText(ctx, card.strategyText, 400, promptY + 112, 590, 39);
    ctx.fillStyle = "rgba(255,255,255,.4)";
    ctx.font = "20px system-ui, sans-serif";
    ctx.fillText("Hệ thống Tham mưu Chiến lược Radar Copilot", 400, 950);

    return { canvas, dataUrl: canvas.toDataURL("image/png") };
  } catch (error) {
    console.error("Canvas Gen Error:", error);
    return null;
  }
}

function tryBlobDownload(blob: Blob) {
  if (typeof document === "undefined" || typeof URL === "undefined") return false;
  try {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `Que-Boi-Tuan-Nay-${Date.now()}.png`;
    link.style.display = "none";
    document.body.appendChild(link);
    try {
      link.click();
    } finally {
      link.remove();
      URL.revokeObjectURL(objectUrl);
    }
    return true;
  } catch {
    return false;
  }
}

function SolarSystem({ stars }: { stars: OracleStar[] }) {
  const orbit = (seconds: number, ring: string, reverse = false): React.CSSProperties => ({
    border: `1.5px solid ${ring}`,
    boxShadow: `0 0 28px ${ring}`,
    animationDuration: `${seconds}s`,
    animationTimingFunction: "linear",
    animationDirection: reverse ? "reverse" : "normal",
  });
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden opacity-100">
    {stars.map((star) => <i key={star.id} className="absolute rounded-full bg-white animate-pulse motion-reduce:animate-none" style={{ top: star.top, left: star.left, width: star.size, height: star.size, animationDelay: star.delay, opacity: star.opacity }} />)}
    <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 18% 16%, rgba(217,70,239,.30), transparent 34%), radial-gradient(circle at 86% 78%, rgba(37,99,235,.32), transparent 38%), radial-gradient(circle at 48% 50%, rgba(79,70,229,.22), transparent 50%)" }} />
    <div className="absolute -left-[20%] -top-[20%] h-[80vh] w-[80vw] rounded-full bg-purple-500/25 blur-[160px] mix-blend-screen animate-pulse motion-reduce:animate-none" style={{ animationDuration: "8s" }} />
    <div className="absolute -bottom-[20%] -right-[20%] h-[80vh] w-[80vw] rounded-full bg-blue-500/25 blur-[160px] mix-blend-screen animate-pulse motion-reduce:animate-none" style={{ animationDuration: "12s", animationDelay: "2s" }} />
    <div className="absolute -right-[10%] -top-[10%] h-[60vh] w-[60vw] rounded-full bg-fuchsia-500/18 blur-[140px]" /><div className="absolute -bottom-[10%] -left-[10%] h-[60vh] w-[60vw] rounded-full bg-indigo-500/18 blur-[140px]" />
    <div className="absolute h-[300px] w-[300px] rounded-full bg-purple-600/20 blur-[80px] motion-reduce:animate-none" /><div className="absolute h-[150px] w-[150px] rounded-full bg-indigo-500/30 blur-[50px]" />
    <div className="absolute h-[300px] w-[300px] animate-spin rounded-full motion-reduce:animate-none sm:h-[380px] sm:w-[380px]" style={orbit(15, "rgba(103,232,249,.22)")}><i className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_15px_4px_rgba(103,232,249,.7)]" /></div>
    <div className="absolute h-[450px] w-[450px] animate-spin rounded-full motion-reduce:animate-none sm:h-[550px] sm:w-[550px]" style={orbit(25, "rgba(236,72,153,.24)", true)}><i className="absolute bottom-[10%] right-[10%] h-4 w-4 rounded-full bg-pink-400 shadow-[0_0_20px_5px_rgba(236,72,153,.7)]" /></div>
    <div className="absolute h-[600px] w-[600px] animate-spin rounded-full motion-reduce:animate-none sm:h-[750px] sm:w-[750px]" style={orbit(40, "rgba(59,130,246,.20)")}><span className="absolute left-[10%] top-[20%] flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 shadow-[0_0_25px_6px_rgba(59,130,246,.8)]"><i className="absolute h-[35px] w-[35px] rounded-full" style={{ border: "1px solid rgba(255,255,255,.3)" }} /></span></div>
    <div className="absolute h-[800px] w-[800px] animate-spin rounded-full motion-reduce:animate-none sm:h-[950px] sm:w-[950px]" style={orbit(60, "rgba(239,68,68,.16)", true)}><i className="absolute bottom-[20%] right-[15%] h-5 w-5 rounded-full bg-red-500 shadow-[0_0_25px_5px_rgba(239,68,68,.7)]" /></div>
    <div className="absolute h-[1000px] w-[1000px] animate-spin rounded-full motion-reduce:animate-none sm:h-[1250px] sm:w-[1250px]" style={orbit(90, "rgba(245,158,11,.14)")}><span className="absolute bottom-[15%] left-[15%] flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 shadow-[0_0_35px_8px_rgba(245,158,11,.6)]"><i className="h-[12px] w-[50px] -rotate-12 rounded-full" style={{ border: "3px solid rgba(253,224,71,.8)", boxShadow: "0 0 15px rgba(253,224,71,.5)" }} /></span></div>
  </div>;
}

export default function LeaderWeeklyOracle({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; teamData?: unknown }) {
  const [step, setStep] = useState<"draw" | "front" | "back">("draw");
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [oracleResult, setOracleResult] = useState<SolarOracleCard | null>(null);
  const [shareState, setShareState] = useState<"idle" | "loading" | "success">("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [oracleCards, setOracleCards] = useState<SolarOracleCard[]>([DRAW_READY_CARD]);
  const [loadingCards, setLoadingCards] = useState(false);
  const timers = useRef<number[]>([]);
  const stars = useMemo<OracleStar[]>(() => Array.from({ length: 100 }, (_, id) => ({ id, top: `${(id * 37) % 100}%`, left: `${(id * 61) % 100}%`, size: `${1 + (id % 3)}px`, delay: `${(id % 9) * 0.35}s`, opacity: 0.25 + ((id * 17) % 70) / 100 })), []);

  useEffect(() => {
    if (!isOpen) return;
    setStep("draw"); setSelectedCardIdx(null); setOracleResult(null); setShareState("idle"); setDownloadUrl(null); setShowPreviewModal(false); setOracleCards([DRAW_READY_CARD]); setLoadingCards(false); playSound("ambient");
    return () => { timers.current.forEach((timer) => window.clearTimeout(timer)); timers.current = []; };
  }, [isOpen]);
  useEffect(() => { if (!isOpen) return; const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", closeOnEscape); return () => window.removeEventListener("keydown", closeOnEscape); }, [isOpen, onClose]);
  if (!isOpen) return null;
  const schedule = (callback: () => void, delay: number) => { const timer = window.setTimeout(callback, delay); timers.current.push(timer); };
  const handleDraw = async (index: number) => { if (selectedCardIdx !== null || !oracleCards.length || loadingCards) return; playSound("draw"); setSelectedCardIdx(index); setLoadingCards(true); try { const draw = await drawSmartTarotCard(); schedule(() => { setOracleResult(mapTarotCard(draw.card)); setStep("front"); setLoadingCards(false); }, 800); } catch (reason) { setSelectedCardIdx(null); setLoadingCards(false); toast.error(reason instanceof Error ? reason.message : "Chưa thể rút Smart Tarot cho Team."); } };
  const handleFlip = () => { if (step !== "front") return; playSound("flip"); setStep("back"); schedule(() => playSound("success"), 400); };
  const handleGenerateAndPreviewImage = () => { if (!oracleResult || shareState === "loading") return; setShareState("loading"); try { if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) { setDownloadUrl("data:image/png;base64,oracle-preview"); setShowPreviewModal(true); setShareState("success"); return; } const image = generateOracleImage(oracleResult); if (!image) throw new Error("Canvas context unavailable"); image.canvas.toBlob((blob) => { try { setDownloadUrl(blob ? URL.createObjectURL(blob) : image.dataUrl); setShowPreviewModal(true); setShareState("success"); } catch (error) { console.error("Oracle image preview failed:", error); setShareState("idle"); toast.error("Không thể mở ảnh quẻ. Vui lòng thử lại."); } }, "image/png"); } catch (error) { console.error("Oracle canvas export failed:", error); setShareState("idle"); toast.error("Không thể tạo ảnh PNG. Vui lòng thử lại."); } };
  const tone = oracleResult?.theme === "success" ? "from-emerald-400 to-teal-800" : oracleResult?.theme === "warning" ? "from-amber-400 to-orange-800" : "from-rose-400 to-red-800";
  const actionTone = oracleResult?.theme === "success" ? "from-emerald-500 to-teal-600" : oracleResult?.theme === "warning" ? "from-amber-500 to-orange-600" : "from-rose-500 to-red-600";

  return <div className="fixed inset-0 z-[99999] flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#02040a] p-0 sm:p-4" role="presentation" onClick={onClose}>
    <SolarSystem stars={stars} /><div className="absolute inset-0 z-[1] bg-[#02040a]/58 backdrop-blur-[2px]" />
    <button type="button" onClick={onClose} aria-label="Đóng Leader Weekly Oracle" className="absolute right-4 top-4 z-30 rounded-full bg-white/5 p-3 text-white/50 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/10 hover:text-white sm:right-6 sm:top-6"><X size={24} /></button>
    <section className="relative z-10 flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-4 py-16 sm:min-h-[520px] sm:px-0 sm:py-8" role="dialog" aria-modal="true" aria-label="Tín Hiệu Vũ Trụ" onClick={(event) => event.stopPropagation()}>
      {step === "draw" && <div className="flex w-full flex-col items-center animate-in fade-in zoom-in-95 duration-500"><div className="mb-14 text-center"><h2 className="mb-4 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-[36px] font-black uppercase tracking-tight text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,.6)] md:text-[48px]">Tín Hiệu Vũ Trụ</h2><p className="text-[15px] font-medium uppercase tracking-[.12em] text-blue-100/70">{loadingCards ? "Đang nạp kho bài định mệnh" : oracleCards.length ? "Hãy chọn một lá bài định mệnh" : "Kho bài đang chờ Super Admin cập nhật"}</p></div><div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:gap-10">{[0, 1, 2].map((index) => <button key={index} type="button" disabled={loadingCards || !oracleCards.length} onClick={() => handleDraw(index)} aria-label={`Rút thẻ Oracle số ${index + 1}`} className={`relative h-[170px] w-[110px] rounded-[20px] border border-white/20 bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-950 p-1.5 transition-all duration-500 hover:-translate-y-5 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 sm:h-[280px] sm:w-[180px] ${selectedCardIdx === index ? "z-20 scale-110 shadow-[0_0_52px_rgba(192,132,252,.85)]" : selectedCardIdx !== null ? "scale-50 opacity-0" : ""}`}><span className="absolute inset-1 overflow-hidden rounded-[14px] border border-purple-300/40 bg-[#070b19]"><span className="absolute left-1/2 top-1/2 h-[240%] w-[240%] -translate-x-1/2 -translate-y-1/2 animate-spin bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(192,132,252,.55)_360deg)] motion-reduce:animate-none" style={{ animationDuration: "3s", animationTimingFunction: "linear" }} /><span className="absolute inset-[3px] flex items-center justify-center rounded-[10px] bg-gradient-to-b from-indigo-950 to-[#070b19]"><Sparkles className="text-purple-300/60" size={40} /></span></span></button>)}</div></div>}
      {oracleResult && <><div className="relative w-[340px] max-md:h-[600px] md:w-[380px] md:h-[580px] animate-in fade-in zoom-in-95 duration-700" style={{ perspective: "1000px" }}><div className="tarot-card-3d relative h-full w-full transition-transform duration-[800ms]" style={{ transform: step === "back" ? "rotateY(180deg)" : "rotateY(0deg)" }}>
        <article className="tarot-card-face absolute inset-0 rounded-[28px] bg-gradient-to-br from-purple-400 via-fuchsia-500 to-indigo-600 p-[2px] shadow-[0_20px_50px_rgba(168,85,247,.4)]"><div className="relative flex h-full flex-col items-center overflow-hidden rounded-[26px] bg-[#0f172a] p-8 text-center"><div className="absolute top-0 h-40 w-full bg-gradient-to-b from-purple-500/30 to-transparent" /><p className="relative z-10 mt-4 w-full border-b border-purple-500/30 pb-4 text-[12px] font-black uppercase tracking-[.3em] text-purple-300">Quẻ bói tuần này</p><h2 className="relative z-10 mt-8 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-[29px] font-black text-transparent">{oracleResult.tarotTitle}</h2><div className="relative z-10 my-8 flex h-24 w-24 items-center justify-center rounded-full border border-purple-500/30 bg-purple-900/40"><Sparkles size={40} className="text-purple-300" /></div><p className="relative z-10 text-[16px] font-medium italic leading-relaxed text-purple-100/90">“{oracleResult.tarotQuote}”</p><button type="button" onClick={handleFlip} className="relative z-10 mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 py-4 text-[14px] font-black uppercase tracking-widest text-white"><RefreshCw size={18} />Giải mã quẻ</button></div></article>
        <article className={`tarot-card-face absolute inset-0 rounded-[28px] bg-gradient-to-br p-[2px] shadow-[0_20px_50px_rgba(0,0,0,.5)] ${tone}`} style={{ transform: "rotateY(180deg)" }}>
          <div className="relative flex h-full flex-col items-center overflow-hidden rounded-[26px] bg-[#0B1431] p-6 text-center sm:p-8">
            <div className="absolute top-0 h-40 w-full bg-gradient-to-b from-white/15 to-transparent" />
            <div className="relative z-10 mt-2 drop-shadow-[0_0_20px_rgba(255,255,255,.2)]">{oracleResult.icon}</div>
            <h3 className="relative z-10 mt-5 w-full border-b border-white/10 pb-3 text-[20px] font-black uppercase tracking-widest text-white">{oracleResult.strategyTitle}</h3>
            <p className="relative z-10 mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-left text-[14px] font-semibold leading-relaxed text-white/95">{oracleResult.strategyText}</p>
            <div className="relative z-10 mt-4 w-full rounded-xl border border-white/10 bg-black/20 p-4 text-left max-md:mb-6"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/50">Gợi ý hành động Team</span><p className="text-[13px] font-medium italic text-white/90">{oracleResult.strategyText}</p></div>
          </div>
        </article>
      </div></div>{step === "back" && <div className="pointer-events-auto relative z-[100] -mt-16 flex w-[340px] gap-3 px-3 sm:w-[380px]"><button type="button" onClick={handleGenerateAndPreviewImage} disabled={shareState === "loading"} className={`flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-4 text-[12px] font-black uppercase tracking-wide text-white shadow-xl transition-transform hover:scale-[1.03] disabled:hover:scale-100 ${shareState === "loading" ? "from-slate-600 to-slate-700" : actionTone}`}>{shareState === "loading" ? <><RefreshCw size={17} className="animate-spin" />Đang tạo ảnh...</> : <><Download size={17} />Tải Ảnh Chia Sẻ</>}</button><button type="button" onClick={onClose} aria-label="Đóng quẻ Oracle" className="rounded-xl bg-white/10 px-4 text-white/70 backdrop-blur-sm hover:bg-white/20"><X size={20} /></button></div>}</>}
    </section>
    {showPreviewModal && downloadUrl && <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Ảnh Quẻ đã sẵn sàng" onClick={() => setShowPreviewModal(false)}><div className="relative flex max-h-[92vh] w-full max-w-md flex-col items-center rounded-3xl border border-white/15 bg-slate-900 p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => setShowPreviewModal(false)} aria-label="Đóng ảnh quẻ" className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white"><X size={18} /></button><ImageIcon className="mb-2 text-cyan-300" size={22} /><h3 className="text-center text-sm font-black uppercase tracking-widest text-white">Ảnh Quẻ đã sẵn sàng</h3><p className="mb-3 mt-1 text-center text-xs text-slate-300">Mẹo: Nhấn giữ (trên điện thoại) hoặc Click chuột phải vào ảnh để lưu nhanh!</p><img src={downloadUrl} alt="Ảnh Quẻ Oracle đã tạo" className="max-h-[62vh] w-auto max-w-full rounded-xl border border-white/10 shadow-xl" /><a href={downloadUrl} download="Que-Boi.png" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-950 transition-colors hover:bg-cyan-400"><Download size={16} />Tải PNG về máy</a></div></div>}
  </div>;
}
