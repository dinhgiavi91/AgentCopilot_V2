import React, { useEffect, useState } from "react";
import { Activity, AlertCircle, Grid, HeartPulse, Info, ShieldQuestion, Target, X, Zap } from "lucide-react";

export type LeaderMetricTopic = "matrix" | "pillars" | "energy" | "empathy" | "morale" | "radar";

type LeaderMetricsGuideProps = {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LeaderMetricTopic;
};

const metricsData: Array<{ id: LeaderMetricTopic; icon: React.ReactElement; title: string; color: string; bg: string; origin: string; why: string; action: string }> = [
  { id: "matrix", icon: <Grid size={20} />, title: "Ma trận Hiệu suất", color: "text-indigo-500", bg: "bg-indigo-50", origin: "Tương quan giữa trục Kết quả hỗ trợ của Leader và trục Nỗ lực tự thân của TVV từ chuỗi cùng nhịp hoạt động.", why: "Tránh cào bằng cách quản lý. Người đang cố gắng nhưng chưa ra kết quả cần cách hỗ trợ khác người đã bỏ cuộc.", action: "Chấm ở vùng Cam/Đỏ: check-in gỡ rối ngay. Vùng Xanh: ghi nhận, khen ngợi và giao thêm quyền phù hợp." },
  { id: "pillars", icon: <Activity size={20} />, title: "Cấu trúc 3 Trụ Cột", color: "text-blue-500", bg: "bg-blue-50", origin: "Tự động phân loại thao tác của TVV. 🟦 Học tập (xem Video, Playbook). 🟨 Gắn kết (check-in, tương tác Cộng đồng). 🟩 Thực chiến (nhập CRM, follow-up khách hàng). Ví dụ: [1–6–2] = 1 Học tập, 6 Gắn kết, 2 Thực chiến.", why: "Dùng để vạch trần năng suất ảo. Một TVV có tổng nhịp cao nhưng điểm Xanh lá (Thực chiến) bằng 0 có thể đang dùng điểm danh và học lý thuyết để né việc gọi, chăm sóc hoặc follow-up khách hàng.", action: "Nhìn vào màu bị khuyết để trị bệnh: thiếu Xanh lá → kéo ra role-play/thực chiến ngay. Thiếu Xanh dương → giao bài xem Video/Playbook để mài rìu, tránh rớt số." },
  { id: "energy", icon: <Zap size={20} />, title: "Năng lượng Team", color: "text-amber-500", bg: "bg-amber-50", origin: "Tỷ lệ TVV có phát sinh nhịp hoạt động trong phạm vi ngày hoặc tuần so với tổng quân số Team.", why: "Đo sức sống tập thể. Team đông nhưng ít người có nhịp đang ở trạng thái ngủ đông và cần một cú hâm nóng chung.", action: "Năng lượng dưới 50%: tổ chức mini-game, phát động thử thách nhỏ hoặc kick-off ngắn thay vì soi từng người." },
  { id: "empathy", icon: <AlertCircle size={20} />, title: "Cần thấu cảm", color: "text-rose-500", bg: "bg-rose-50", origin: "Số tín hiệu ưu tiên chưa được Leader xử lý trong Radar, như mất nhịp, follow-up quá hạn hoặc chuyển đổi giảm.", why: "Đây là lời kêu cứu ngầm qua hành vi. Trì hoãn hỗ trợ có thể khiến TVV nản chí và rớt chuỗi sâu hơn.", action: "Xem đây là To-do List mỗi ngày: mở tín hiệu, nhắn hỏi thăm và ghi nhận hỗ trợ để đưa số này về 0." },
  { id: "morale", icon: <HeartPulse size={20} />, title: "Chỉ số Động lực", color: "text-emerald-500", bg: "bg-emerald-50", origin: "Chuỗi giữ kỷ luật quan sát được và mật độ nhịp phản hồi gần đây của TVV trong Team.", why: "Không đo cảm xúc, không thay thế đối thoại. Đây là tín hiệu hành vi để nhận biết ai đang giữ nhịp đều và ai có nguy cơ hụt hơi.", action: "Morale dưới 50: không ép số. Ưu tiên check-in, mời trò chuyện ngắn hoặc gửi Thẻ Vinh Danh để kéo lại nhịp." },
  { id: "radar", icon: <Target size={20} />, title: "Tín hiệu Radar", color: "text-blue-500", bg: "bg-blue-50", origin: "Signal Engine quét điểm nghẽn như trễ follow-up, mất nhịp check-in hoặc chuyển đổi giảm theo ngưỡng Team.", why: "Giúp Leader không cần hỏi thăm chung chung. Dữ liệu chỉ ra ai đang kẹt ở đâu để cuộc hỗ trợ cụ thể và tinh tế hơn.", action: "Bấm vào tín hiệu để mở Playbook, dùng lời nhắc gợi ý và ghi nhận hỗ trợ ngay trong Radar." },
];

export default function LeaderMetricsGuide({ isOpen, onClose, initialTab = "matrix" }: LeaderMetricsGuideProps) {
  const [activeTab, setActiveTab] = useState<LeaderMetricTopic>(initialTab);

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const activeContent = metricsData.find((item) => item.id === activeTab) ?? metricsData[0];

  return <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-[#0B1431]/70 p-3 backdrop-blur-sm sm:p-6" role="presentation" onClick={onClose}>
    <section className="flex h-[80vh] min-h-[480px] w-full max-w-[900px] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="leader-metrics-guide-title" onClick={(event) => event.stopPropagation()}>
      <header className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4 sm:px-6"><div className="flex min-w-0 items-center gap-3"><div className="rounded-xl bg-[#0B1431] p-2 text-white shadow-sm"><ShieldQuestion size={22} aria-hidden="true" /></div><div><h2 id="leader-metrics-guide-title" className="text-[18px] font-black uppercase tracking-tight text-[#0B1431] sm:text-[20px]">Từ điển Tham mưu</h2><p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 sm:text-[12px]">Giải mã hệ thống chỉ số Radar</p></div></div><button type="button" onClick={onClose} className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-colors hover:bg-slate-200" aria-label="Đóng Từ điển Tham mưu"><X size={20} /></button></header>
      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <nav className="grid max-h-[34vh] w-full grid-cols-2 gap-2 overflow-y-auto border-b border-slate-100 bg-slate-50/50 p-3 sm:max-h-none sm:w-1/3 sm:grid-cols-1 sm:border-b-0 sm:border-r sm:p-4" aria-label="Mục lục chỉ số">{metricsData.map((item) => <button key={item.id} type="button" onClick={() => setActiveTab(item.id)} className={`flex min-w-0 items-center gap-2 rounded-2xl border p-3 text-left transition-all sm:gap-3 sm:p-4 ${activeTab === item.id ? "border-slate-200 bg-white shadow-[0_4px_15px_rgba(0,0,0,0.05)]" : "border-transparent text-slate-500 hover:bg-slate-100"}`} aria-current={activeTab === item.id ? "page" : undefined}><span className={`shrink-0 rounded-xl p-2 ${activeTab === item.id ? `${item.bg} ${item.color}` : "bg-slate-200 text-slate-400"}`}>{item.icon}</span><span className={`line-clamp-2 text-[11px] font-bold sm:text-[14px] ${activeTab === item.id ? "text-[#0B1431]" : "text-slate-500"}`}>{item.title}</span></button>)}</nav>
        <div className="min-h-0 flex-1 overflow-y-auto bg-white p-5 sm:w-2/3 sm:p-10"><div className="animate-in fade-in slide-in-from-right-4 duration-300"><div className="mb-7 flex items-center gap-4"><div className={`rounded-2xl p-4 [&>svg]:h-[38px] [&>svg]:w-[38px] ${activeContent.bg} ${activeContent.color}`}>{activeContent.icon}</div><h1 className="text-[23px] font-black leading-tight text-[#0B1431] sm:text-[28px]">{activeContent.title}</h1></div><div className="space-y-7"><MetricDictionarySection title="Nguồn gốc dữ liệu"><p className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-[14px] font-medium leading-relaxed text-[#0B1431] sm:p-5 sm:text-[16px]">{activeContent.origin}</p></MetricDictionarySection><MetricDictionarySection title="Tại sao cần đo lường?"><p className="text-[14px] leading-relaxed text-slate-600 sm:text-[16px]">{activeContent.why}</p></MetricDictionarySection><div className="relative mt-6 overflow-hidden rounded-3xl border border-blue-100 bg-blue-50 p-5 sm:p-6"><Info className="absolute -right-3 -top-3 text-blue-500 opacity-10" size={100} aria-hidden="true" /><h3 className="relative z-10 mb-3 text-[12px] font-black uppercase tracking-widest text-blue-800">Hướng dẫn hành động cho Leader</h3><p className="relative z-10 text-[14px] font-bold leading-relaxed text-blue-900 sm:text-[16px]">{activeContent.action}</p></div></div></div></div>
      </div>
    </section>
  </div>;
}

function MetricDictionarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h3 className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400"><span className="h-px w-6 bg-slate-300" />{title}</h3>{children}</section>;
}
