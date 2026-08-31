# Ý tưởng thiết kế — BHNT Learning Hub Research

## Ba hướng phong cách

### Theme Name: Editorial Radar
Very Brief Intro: Một báo cáo kiểu editorial-data, dùng nền kem giấy, mực xanh đêm và các đường nhấn hổ phách để biến dữ liệu năng lực thành câu chuyện rõ ràng, có chiều sâu và đáng tin.
Probability: 0.06

### Theme Name: Field Notes Atlas
Very Brief Intro: Giao diện như một bản đồ dã chiến của đội ngũ, dùng lưới tọa độ, thẻ ghi chú và mốc hành trình để nhấn vào vận hành thực chiến hơn là cảm giác “dashboard khô”.
Probability: 0.04

### Theme Name: Signal Studio
Very Brief Intro: Một phòng điều khiển sáng, tối giản và giàu nhịp điệu, nơi XP, streak và tín hiệu Radar được biểu đạt bằng các lớp màu tương phản và chuyển động ngắn.
Probability: 0.08

## Phương án được chọn: Editorial Radar

### Design Movement
Swiss editorial design pha trộn với data journalism hiện đại: cấu trúc kỷ luật, khoảng trắng có chủ đích, typography mạnh và các dấu hiệu trực quan giúp người đọc định hướng nhanh.

### Core Principles
1. **Dữ liệu phải kể được một câu chuyện:** mỗi biểu đồ gắn với một câu hỏi vận hành, không trang trí vô nghĩa.
2. **Tín hiệu trước chi tiết:** đưa các tín hiệu quan trọng như streak, XP, radar và lộ trình lên vùng nhìn đầu tiên.
3. **Thực chiến, không màu mè:** nội dung đề xuất phải bám vào các bảng dữ liệu hiện có và hành vi sale hằng ngày.
4. **Zero-PII mặc định:** mọi ví dụ và insight chỉ dùng mã nội bộ, vai trò, cấp độ và tín hiệu năng lượng; không hiển thị thông tin nhận diện khách hàng.

### Color Philosophy
Nền kem giấy tạo cảm giác gần gũi, dễ đọc như một bản briefing; xanh mực đêm đem lại độ tin cậy và đủ tương phản cho nội dung dài; hổ phách là “signature color” của năng lượng, XP và hành động cần ưu tiên; xanh rêu là tín hiệu ổn định và hồi phục. Màu đỏ đất chỉ dùng cho cảnh báo cần leader can thiệp.

### Layout Paradigm
Một cột điều hướng dọc ở bên trái như “mục lục báo cáo”, phần nội dung dùng các khối editorial bất đối xứng: hero có số liệu lớn, biểu đồ nằm cạnh diễn giải, các module xếp thành dòng nhịp điệu thay vì lưới card đồng nhất. Các phần có thể kéo đến bằng anchor và trạng thái filter được giữ trong cùng một trang.

### Signature Elements
1. **Đường nhịp:** một đường line-chart mảnh chạy như nhịp tim, dùng để nối các điểm XP, streak, radar và learning path.
2. **Tem tín hiệu:** các nhãn nhỏ như `SIGNAL`, `PATH`, `SOS`, `ZERO-PII` mô phỏng nhãn biên tập.
3. **La bàn kép:** biểu tượng dấu cộng giữa la bàn và pulse line, dùng cho logo, favicon và các điểm đầu mục.

### Interaction Philosophy
Tương tác phải giúp người đọc đặt câu hỏi và đi sâu: filter theo cấp độ, DISC hoặc loại module; hover để đọc diễn giải; click vào điểm dữ liệu để mở “vì sao điều này quan trọng”. Mọi thao tác có phản hồi nhẹ, rõ ràng và không làm mất ngữ cảnh.

### Animation
Các khối báo cáo xuất hiện theo stagger 40–60ms, chỉ animate opacity/transform trong 180–260ms. Đường nhịp vẽ vào khi vào viewport, thanh tiến trình nạp từ 0 đến giá trị thật, filter chuyển trạng thái bằng ease-out snappy. Tôn trọng `prefers-reduced-motion` bằng cách tắt các chuyển động không thiết yếu.

### Typography System
Display dùng **Space Grotesk** với weight 600–700 cho tiêu đề và số liệu; body dùng **DM Sans** cho độ đọc tiếng Việt tốt ở cỡ nhỏ. Nhãn dữ liệu dùng Space Grotesk 11–12px, letter-spacing rộng; tiêu đề section 28–40px; hero headline 56–76px trên desktop, 40–48px trên mobile.

### Brand Essence
Một bản đồ năng lực và sức bền cho đội ngũ sale BHNT, giúp leader nhìn thấy tín hiệu trước khi hiệu suất tụt và giúp từng chiến binh biết bước học tiếp theo. Ba tính cách: **sắc bén, ấm áp, thực chiến**.

### Brand Voice
Headline nói ngắn, có lực, hướng vào hành động; CTA dùng động từ cụ thể; microcopy giải thích “vì sao” thay vì gây áp lực. Ví dụ: “Đọc tín hiệu trước khi chuỗi đứt.” và “Chọn một trạm để tạo nhịp hôm nay.”

### Wordmark & Logo
Logo là một la bàn bốn hướng tối giản, ở tâm có một nhịp pulse tạo thành dấu cộng; không dùng chữ trong biểu tượng. Wordmark hiển thị `BHNT / FIELDNOTE` bằng Space Grotesk, với dấu gạch chéo như một đường phân cách dữ liệu.

### Signature Brand Color
**Amber Signal — #E9A23B**, màu hổ phách dùng độc quyền cho XP, CTA chính và các điểm tín hiệu cần hành động.
