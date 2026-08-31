# BHNT Learning Hub — Báo cáo nghiên cứu & định hướng sản phẩm

**Ngày nghiên cứu:** 13/08/2026 · **Nguồn nội bộ:** `Database_SaaS_BHNT(1).xlsx`, `pasted_content.txt` · **Benchmark chính:** [Salesforce Trailhead][2]

## Tóm tắt điều hành

Qua đối chiếu website [Go Global Learning Hub][1], workbook Database SaaS BHNT và các learning hub đã có, kết luận chính là dự án không thiếu “nội dung”; dự án đang cần một **learning loop có nhịp**. Workbook đã chứa guide khởi hành, bài DISC, quiz buổi sáng, playbook xử lý từ chối, ngôn ngữ thấu cảm, form thẩm định, bài leadership, phần thưởng, ngân hàng điểm, feedback và Radar. Cơ hội lớn nhất nằm ở việc nối các mảnh đó thành một hành trình nhỏ, có điểm tiến bộ, có bằng chứng năng lực và có hành động chăm người khi tín hiệu đi xuống.

Website tĩnh đã được xây dựng như một **bản đồ nghiên cứu có thể tương tác**. Người xem có thể lọc module theo cấp độ và loại nội dung, chuyển đổi giữa các lớp signal, xem biểu đồ XP–streak, đọc bảng hồ sơ ẩn danh, khám phá Radar Giữ Quân và chọn từng đề xuất trong lộ trình 90 ngày. Các con số trên trang được gắn nhãn là dữ liệu mẫu, không phải KPI chính thức.

## 1. Những điều học được từ Go Global Learning Hub

Go Global Learning Hub định vị trải nghiệm quanh ba hành động: học, lãnh đạo và ra thế giới. Website dùng thử thách 30 giây, XP hôm nay, streak, hạng đấu tuần, cấp độ Haus, bài học khoảng 5 phút, huy hiệu và chứng chỉ để làm giảm ma sát bắt đầu [1]. Các thẻ khóa học còn cho người học biết cấp độ, ngôn ngữ, thời lượng và dạng trải nghiệm như interactive, scenario-based, simulator hay coaching.

Một điểm đáng học khác là Mochi không chỉ là một chatbot đặt cạnh kho nội dung. Mochi được mô tả như một guide giúp người học chọn hành trình phù hợp, hiểu ba cấp độ và học bằng ngôn ngữ thuận tiện [1]. Với BHNT, vai trò tương tự nên được chuyển thành **trợ lý chọn đúng trạm**: đọc cấp độ, DISC, tín hiệu tuần và đề xuất đúng quiz hoặc playbook kế tiếp.

## 2. Benchmark chính: Salesforce Trailhead

Trailhead phù hợp làm mô hình học hỏi vì kết hợp ba lớp: nội dung ngắn, thực hành và tiến trình năng lực. Website mô tả gamified platform với points và badges, đồng thời dùng Trailblazer Ranks để người học thể hiện chuyên môn [2]. Trang rank giải thích rằng mỗi badge hoàn thành cộng điểm và kéo người học đi lên trong hành trình [4]. Đây là cách biến XP thành tín hiệu tiến bộ, thay vì chỉ là một con số nằm trong hồ sơ.

Trailhead cũng nhấn mạnh hands-on experience, guided pathways, bite-sized modules, real-world scenarios, cộng đồng và chứng nhận [2]. Cách chuyển hóa cho BHNT nên là: **mỗi module ngắn phải kết thúc bằng một thao tác thực chiến**, mỗi badge phải gắn với bằng chứng, và mỗi cấp độ phải trả lời được câu hỏi “sale này đã làm được gì?”.

HubSpot Academy bổ sung một nguyên tắc tổ chức nội dung: learning path là các certification, course và lesson được tuyển chọn theo vai trò hoặc mục tiêu; playlist thì gom nội dung theo chủ đề và có thể học theo thứ tự linh hoạt [3]. Vì vậy, BHNT có thể giữ các worksheet hiện tại như thư viện nguồn, nhưng hiển thị chúng qua path Rookie, Pro và Master thay vì bắt người dùng nhớ tên từng sheet.

## 3. Bức tranh dữ liệu hiện tại

Workbook có 16 worksheet và 67 dòng dữ liệu thực có nội dung sau khi loại các dòng trống dùng để chừa chỗ nhập liệu. Cấu trúc hiện tại đã bao phủ gần đủ một hệ điều hành sale: hướng dẫn khởi hành, hồ sơ, nhịp khách hàng, playbook, thấu cảm, thẩm định, leadership, phần thưởng, XP, feedback, bản tin và quiz.

| Vùng dữ liệu | Dòng thực | Vai trò trong learning hub | Cơ hội đề xuất |
| --- | ---: | --- | --- |
| `0_La Bàn Khởi Hành` | 5 | Onboarding và hướng dẫn bắt đầu | Biến thành path 5 bước có progress |
| `10_Trạm Đăng Kiểm Năng Lực` | 5 | Quiz DISC | Dùng để cá nhân hóa playbook, không gắn nhãn cứng |
| `12_Nạp Não Mỗi Sáng` | 2 | Micro-learning | Mở rộng thành sprint 7 ngày |
| `3_Bảo Bối Thực Chiến` | 13 | Kịch bản, SPIN, Funnel, tuân thủ | Gắn tag theo cấp độ, DISC, tình huống |
| `13_Marketing 1 Chạm` | 9 | Template chăm sóc và vinh danh | Đưa vào nhiệm vụ sau một ca WOW |
| `7_Trạm Tiếp Năng Lượng` | 3 | Reward catalogue | Gắn reward với hành vi được xác minh |
| `8_Ngân Hàng Điểm` | 2 | Event ledger sơ khai | Khóa giao dịch trùng và lưu nguồn điểm |
| `14_Radar Giữ Quân` | 1 | Case cứu net mẫu | Chuẩn hóa thành signal → chẩn đoán → đơn thuốc |

Hồ sơ mẫu có 4 chiến binh, tổng 6.595 XP, streak trung bình 52,25 ngày và streak cao nhất 150 ngày. Ba hồ sơ đang ở trạng thái “Hừng hực”, một hồ sơ “Hơi mệt”; phân bố DISC là D=2, I=1, S=1, C=0; cấp độ là Rookie=1, Pro=2, Master=1. Đây là ảnh chụp mẫu đủ để dựng trải nghiệm và kiểm thử logic, nhưng chưa đủ để kết luận về năng suất, tỷ lệ chuyển đổi hay sức khỏe thật của đội ngũ.

Bảng `2_Nhịp Đập Khách Hàng` có 3 log, tổng 75 điểm cộng, điểm dịch vụ trung bình 4,67/6 và 1 khoảnh khắc WOW. Vì dữ liệu còn nhỏ, website chỉ dùng chúng để minh họa cách đọc signal và tuyệt đối không trình bày như xu hướng kinh doanh dài hạn.

## 4. Kiến trúc trải nghiệm nên triển khai

### 4.1. Vòng lặp học 5 phút

Luồng ưu tiên nên là **Nạp Não → Hành động → Phản tư → XP**. Người dùng mở quiz một câu, nhận giải thích ngắn, thực hiện một hành động hợp lệ trong `2_Nhịp Đập Khách Hàng`, rồi thấy điểm và streak được cập nhật. Một hoạt động hợp lệ không nên chỉ là mở app; phải là câu trả lời, log có cấu trúc hoặc bài luyện đã hoàn thành.

Trong 7 ngày đầu, có thể dùng 7 quiz tài chính cá nhân/BHNT, mỗi quiz +10 XP. Ngày thứ 7 nên mở một badge hoặc một phần thưởng nhỏ. Cách này học từ nhịp 30 giây–5 phút của Go Global [1] nhưng buộc nội dung BHNT đi ra đời sống thực.

### 4.2. Path theo Rookie, Pro và Master

Rookie nên tập trung vào onboarding, DISC, ngôn ngữ thấu cảm, tuân thủ và kỹ năng hỏi. Pro nên mở playbook xử lý từ chối, SPIN, Funnel, thẩm định và các ca cần phối hợp. Master nên mở Radar, coaching, leadership và khả năng tạo bằng chứng cho người khác. Ba cấp độ này nên có điều kiện mở khóa minh bạch, không chỉ dựa trên số XP.

### 4.3. XP, badge và event ledger

`8_Ngân Hàng Điểm` nên là sổ giao dịch duy nhất. Mỗi event cần có mã duy nhất, người tạo, thời gian, loại hoạt động, điểm cộng/trừ và nguồn. Bot phải chống cộng trùng; số điểm hiển thị trong hồ sơ là tổng các giao dịch hợp lệ. Nên phân biệt XP học tập, XP dịch vụ và XP coaching để leader không đánh đồng “đã click quiz” với “đã xử lý một ca tốt”.

### 4.4. Radar Giữ Quân

Radar nên là một view chăm người với ba tầng: **signal**, **chẩn đoán** và **đơn thuốc**. Slice ưu tiên những người có streak = 0, không có hoạt động hợp lệ trong 48 giờ hoặc XP 7 ngày giảm. Nhóm theo mức độ cảnh báo, sort theo thời gian từ hoạt động cuối cùng; sau đó leader chọn hành động như coaching 15 phút, đi chung ca, gợi ý playbook hoặc freeze streak.

Không nên công khai bảng xếp hạng năng lượng. Việc hiển thị nickname trong bảng nội bộ phải đi cùng quyền truy cập; phiên bản báo cáo và nghiên cứu nên dùng mã ẩn danh. Mục tiêu của Radar là **can thiệp sớm và có tình người**, không phải tạo thêm áp lực giám sát.

### 4.5. Zero-PII

Trường `Khoảnh Khắc WOW / Thấu Cảm` là vùng có nguy cơ bị nhập email, số điện thoại hoặc số định danh. AppSheet nên có `Valid_If` và thông báo rõ ràng khi phát hiện mẫu số dài, email hoặc từ khóa nhạy cảm. Dữ liệu khách hàng chỉ nên tồn tại dưới mã nội bộ hoặc loại tình huống; không dùng số điện thoại làm khóa nghiệp vụ trong learning hub.

## 5. Lộ trình 90 ngày

| Giai đoạn | Việc cần làm | Kết quả kiểm chứng |
| --- | --- | --- |
| 0–30 ngày | Chuẩn hóa event ledger, mở 7-day sprint, thêm rule Zero-PII, định nghĩa hoạt động hợp lệ | Một sale có thể hoàn thành vòng lặp trong dưới 5 phút; điểm không bị cộng trùng |
| 31–60 ngày | Ghép path Rookie/Pro/Master, thêm badge theo bằng chứng, liên kết playbook với DISC và ngữ cảnh | Người học biết bước tiếp theo; leader nhìn thấy tiến độ theo năng lực |
| 61–90 ngày | Đưa Radar vào nhịp coaching; thêm chẩn đoán 5 Whys và đơn thuốc hồi phục | Mỗi alert có owner, thời hạn follow-up và trạng thái hậu phục hồi |

## 6. Phạm vi có thể tiếp tục thực hiện

Từ bộ dữ liệu hiện có, có thể tiếp tục triển khai theo bốn nhánh. Nhánh thứ nhất là viết và kiểm thử các biểu thức AppSheet cho streak, XP, gating Freemium, slice Radar và Zero-PII. Nhánh thứ hai là tạo seed data thực chiến cho quiz DISC, kịch bản SPIN/Socratic và 7 ngày Nạp Não. Nhánh thứ ba là thiết kế UX AppSheet cho từng vai trò sale, leader và admin. Nhánh thứ tư là xây cơ chế báo cáo định kỳ, event ledger và bộ kiểm thử dữ liệu trước khi đưa vào vận hành.

Website hiện tại là lớp nghiên cứu và truyền đạt, không thay thế AppSheet backend. Nó cho phép đội dự án nhìn cùng một bản đồ trước khi quyết định công thức, quyền truy cập và automation nào sẽ đi vào ứng dụng thật.

## References

[1]: https://learning.nguyenphivan.com/ "Go Global Learning Hub by Nguyễn Phi Vân"
[2]: https://trailhead.salesforce.com/ "Trailhead — The fun way to learn"
[3]: https://academy.hubspot.com/learning-paths "HubSpot Academy Learning Paths and Playlists"
[4]: https://trailhead.salesforce.com/trailblazer-ranks "Trailhead — Trailblazer Ranks"
