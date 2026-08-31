import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const homePath = "/home/ubuntu/bhnt-learning-hub-research/client/src/pages/Home.tsx";
const baoBoiStudioPath = "/home/ubuntu/bhnt-learning-hub-research/client/src/components/BaoBoiStudio.tsx";
const videoPath = "/home/ubuntu/bhnt-learning-hub-research/client/src/components/Sprint10VideoModules.tsx";
const leaderPath = "/home/ubuntu/bhnt-learning-hub-research/client/src/components/Sprint9Modules.tsx";
const cssPath = "/home/ubuntu/bhnt-learning-hub-research/client/src/sprint10.css";

describe("Sprint 10 UX and demo UI regression", () => {
  it("giữ form mục tiêu ba biến và Nhịp Đập hai bối cảnh", async () => {
    const source = await readFile(homePath, "utf8");
    for (const marker of ["Tháng này, bạn muốn", "Hoa hồng dự kiến (%)", "Size HĐ trung bình", "Đã gặp & Đang bám sát", "Khách Hàng Mới", "Khách Hiện Hữu"]) expect(source).toContain(marker);
  });

  it("giữ UI Roleplay, video động và Báo cáo Leader storytelling", async () => {
    const [home, studio, video, leader, css] = await Promise.all([readFile(homePath, "utf8"), readFile(baoBoiStudioPath, "utf8"), readFile(videoPath, "utf8"), readFile(leaderPath, "utf8"), readFile(cssPath, "utf8")]);
    expect(home).toContain('item.video_url && <a href={item.video_url}');
    expect(home).not.toContain("SalesVideoReels onWatch");
    for (const marker of ["AI Roleplay Studio", "Bắt đầu Ghi âm mô phỏng", "Không thu, xử lý hoặc lưu trữ âm thanh"]) expect(studio).toContain(marker);
    expect(leader).toContain("storytelling-report");
    for (const marker of ["PHÒNG LUYỆN TẬP ROLEPLAY", "Bắt đầu Record", "Cách tôi chốt HĐ 50 triệu", "Xử lý từ chối phí đắt"]) expect(video).toContain(marker);
    for (const marker of ["roleplay-modal", "sales-reels", "storytelling-report"]) expect(css).toContain(marker);
  });
});
