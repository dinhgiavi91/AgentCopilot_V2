import React, { useRef, useState } from "react";
import { BarChart3, ChevronDown, Download, FileText, HeartHandshake, ImageDown, Sparkles, TrendingDown, TrendingUp, Trophy, X } from "lucide-react";
import { toPng } from "html-to-image";
import { buildGoalVsActual, mockMonthlyPerformance, mockRevenueContributors, mockSelfReportedSales, mockWeeklyRevenueTrend } from "../lib/leaderSalesPicture";

type AdvancedDirectorReportProps = { onClose: () => void; onToast: (message: string) => void };

function formatMillions(amount: number) {
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(amount / 1_000_000)} triệu`;
}

function RevenueTrendChart() {
  const maxRevenue = Math.max(...mockWeeklyRevenueTrend.map((point) => point.revenue));
  return <div className="revenue-trend" aria-label="Xu hướng doanh thu thực đạt theo tuần"><div className="trend-heading"><div><span>XU HƯỚNG THỰC ĐẠT</span><strong>Doanh thu theo tuần</strong></div><small>Tháng này</small></div><svg viewBox="0 0 320 132" role="img" aria-label="Biểu đồ doanh thu tự khai báo theo 4 tuần"><line x1="14" y1="112" x2="306" y2="112" className="trend-base-line" />{mockWeeklyRevenueTrend.map((point, index) => { const height = Math.round((point.revenue / maxRevenue) * 72); const x = 32 + index * 72; const y = 100 - height; return <g key={point.week}><rect x={x} y={y} width="38" height={height} rx="8" className="trend-bar" /><text x={x + 19} y="124" textAnchor="middle" className="trend-week">{point.week}</text><text x={x + 19} y={y - 7} textAnchor="middle" className="trend-value">{Math.round(point.revenue / 1_000_000)}</text></g>; })}</svg></div>;
}

export function AdvancedDirectorReport({ onClose, onToast }: AdvancedDirectorReportProps) {
  const reportRef = useRef<HTMLElement>(null);
  const [contributorsOpen, setContributorsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const salesPicture = buildGoalVsActual(620_000_000, mockSelfReportedSales);

  const exportReport = async (format: "png" | "pdf") => {
    if (!reportRef.current) return;
    setExporting(true);
    setExportOpen(false);
    try {
      const [imageData, { jsPDF }] = await Promise.all([toPng(reportRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: "#f8fafc", style: { transform: "none", margin: "0" } }), import("jspdf")]);
      if (format === "png") {
        const anchor = document.createElement("a");
        anchor.href = imageData;
        anchor.download = "bao-cao-giam-doc.png";
        anchor.click();
      } else {
        const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
        const pageWidth = 190;
        const pageHeight = 277;
        const image = new Image();
        image.src = imageData;
        await image.decode();
        const imageHeight = image.naturalHeight * pageWidth / image.naturalWidth;
        let remainingHeight = imageHeight;
        let position = 10;
        pdf.addImage(imageData, "PNG", 10, position, pageWidth, imageHeight);
        remainingHeight -= pageHeight;
        while (remainingHeight > 0) {
          pdf.addPage();
          position = remainingHeight - imageHeight + 10;
          pdf.addImage(imageData, "PNG", 10, position, pageWidth, imageHeight);
          remainingHeight -= pageHeight;
        }
        pdf.save("bao-cao-giam-doc.pdf");
      }
      onToast(`Đã tải Báo Cáo GĐ dạng ${format === "pdf" ? "PDF" : "ảnh PNG"}.`);
    } catch {
      onToast("Chưa thể xuất báo cáo. Vui lòng thử lại khi kết nối ổn định.");
    } finally {
      setExporting(false);
    }
  };

  return <div className="director-report-backdrop"><section ref={reportRef} className={`director-report storytelling-report ${exporting ? "is-exporting" : ""}`}><button className="report-close export-control" onClick={onClose} aria-label="Đóng báo cáo"><X size={18} /></button><header><div><span>BÁO CÁO GIÁM ĐỐC · DEMO PRO</span><h2>Đội đang ở đâu<br /><em>và đi tiếp thế nào?</em></h2><p>Chuyển dữ liệu hành động thành một câu chuyện lãnh đạo: nhìn đúng điểm nghẽn, ghi nhận nỗ lực và chọn một ưu tiên rõ ràng.</p></div><div className="report-export export-control"><button className="report-download" aria-expanded={exportOpen} onClick={() => setExportOpen((open) => !open)} disabled={exporting}><Download size={15} />{exporting ? "Đang tạo file…" : "Tải Báo Cáo"}<ChevronDown size={14} /></button>{exportOpen && <div className="report-export-menu"><button onClick={() => void exportReport("pdf")}><FileText size={15} />PDF nhiều trang</button><button onClick={() => void exportReport("png")}><ImageDown size={15} />Ảnh PNG</button></div>}</div></header><section className="report-story-section report-overview"><div className="report-section-label"><i>01</i><div><span>TỔNG QUAN</span><h3>Nhịp đội vẫn đang chạy.</h3></div></div><div className="report-kpis"><article><strong>12</strong><span>TVV hoạt động</span></article><article><strong>3</strong><span>Tín hiệu cần chạm</span></article><article><strong>74%</strong><span>Nhịp follow-up</span></article></div><div className="report-analysis"><b>Điểm nghẽn tuần này</b><p>Điểm nghẽn ưu tiên là kỹ năng chuyển đổi sau cuộc gặp. Tuần tới, phân cặp coaching và review tín hiệu Radar vào cuối tuần.</p></div></section><section className="report-story-section report-goal-vs-actual"><div className="report-section-label"><i>01A</i><div><span>TIẾN ĐỘ MỤC TIÊU · GOAL VS. ACTUAL</span><h3>Bức tranh Doanh số tự khai báo.</h3></div></div><div className="goal-actual-values"><article><span>MỤC TIÊU TEAM</span><strong>{formatMillions(salesPicture.teamGoal)}</strong><small>Tổng mục tiêu TVV đã đặt đầu tháng</small></article><article className="actual-trigger-card"><span>THỰC ĐẠT</span><button aria-expanded={contributorsOpen} aria-controls="revenue-contributors" onClick={() => setContributorsOpen((open) => !open)}><strong>{formatMillions(salesPicture.actualRevenue)}</strong><ChevronDown size={16} /></button><small>{salesPicture.successfulTouches} Nhịp Đập Ký Hợp Đồng/Thành công · Chạm để xem đóng góp</small></article></div>{contributorsOpen && <div id="revenue-contributors" className="revenue-contributors" aria-label="Top đóng góp thực đạt"><div><span>TOP ĐÓNG GÓP · TỰ KHAI BÁO</span><b>{formatMillions(salesPicture.actualRevenue)} tổng thực đạt</b></div>{mockRevenueContributors.map((contributor, index) => <article key={contributor.alias}><i>{index + 1}</i><strong>{contributor.alias}</strong><span>{contributor.contracts} HĐ</span><b>{formatMillions(contributor.contribution)}</b></article>)}</div>}<div className="goal-progress-card"><header><span>TỶ LỆ HOÀN THÀNH</span><strong>{salesPicture.completionRate}%</strong></header><div className="goal-progress-track" role="progressbar" aria-label="Tiến độ Mục tiêu Team" aria-valuemin={0} aria-valuemax={100} aria-valuenow={salesPicture.completionRate}><i style={{ width: `${salesPicture.progressWidth}%` }} /></div><footer><span>{formatMillions(salesPicture.actualRevenue)} thực đạt</span><span>{formatMillions(salesPicture.teamGoal)} mục tiêu</span></footer></div><RevenueTrendChart /><p className="self-report-note">Số liệu tự khai báo từ Nhịp Đập có trạng thái Ký Hợp Đồng hoặc Thành công; chỉ dùng để nhìn xu hướng nội bộ, không liên kết dữ liệu công ty BH.</p></section><section className="report-story-section report-monthly-performance"><div className="report-section-label"><i>01B</i><div><span>HIỆU SUẤT THÁNG TRƯỚC · MOM</span><h3>Nhìn xu hướng, không chỉ một con số.</h3></div></div><div className="month-comparison-grid"><article className="is-up"><div><TrendingUp size={17} /><span>DOANH SỐ</span></div><strong>+{mockMonthlyPerformance.revenueChange}%</strong><p>{formatMillions(salesPicture.actualRevenue)} so với {formatMillions(mockMonthlyPerformance.previousRevenue)} tháng trước</p></article><article className="is-down"><div><TrendingDown size={17} /><span>HỢP ĐỒNG</span></div><strong>{mockMonthlyPerformance.contractChange}%</strong><p>{mockMonthlyPerformance.currentContracts} HĐ so với {mockMonthlyPerformance.previousContracts} HĐ tháng trước</p></article></div><p className="self-report-note">So sánh MoM mô phỏng từ tổng Nhịp Đập tự khai báo; không đại diện số liệu công ty bảo hiểm.</p></section><section className="report-story-section report-effort"><div className="report-section-label"><i>02</i><div><span>ĐÁNH GIÁ NỖ LỰC TEAM</span><h3>Không chỉ nhìn vào hợp đồng.</h3></div></div><div className="effort-grid"><article><Trophy size={18} /><strong>8/12 TVV</strong><span>giữ nhịp hoạt động tối thiểu 3 ngày</span></article><article><HeartHandshake size={18} /><strong>19 chạm</strong><span>follow-up và động viên đã được ghi nhận</span></article><article><Sparkles size={18} /><strong>1 điểm sáng</strong><span>một TVV mới đã luyện Bảo Bối trước cuộc hẹn</span></article></div></section><section className="report-story-section report-plan"><div className="report-section-label"><i>03</i><div><span>ĐỀ XUẤT KẾ HOẠCH TUẦN</span><h3>Chọn ít việc, làm thật sâu.</h3></div></div><ol><li><b>Thứ Hai:</b> Leader roleplay 15 phút với nhóm có tỷ lệ từ chối cao.</li><li><b>Giữa tuần:</b> Mỗi TVV hoàn tất 3 chạm follow-up có ngày hẹn rõ ràng.</li><li><b>Thứ Sáu:</b> Vinh danh một hành động chăm sóc tốt, không chỉ người chốt HĐ.</li></ol></section><button className="cta-glow export-control" onClick={() => { onClose(); onToast("Báo cáo GĐ storytelling đã sẵn sàng để trình bày trong phiên demo."); }}><Sparkles size={16} />Xác nhận báo cáo</button></section></div>;
}
