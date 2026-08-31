# Ghi nhận xác minh responsive — Pasted Content 99

- **375 × 812:** Dashboard Advisor hiển thị theo một cột, tiêu đề “Chuỗi Bền Bỉ” giữ trên một dòng, không thấy Sổ cái XP trùng lặp, và các khối nội dung không bị tràn ngang trong ảnh kiểm tra.
- **1280 × 720:** Dashboard giữ bố cục desktop với thanh điều hướng rộng, thẻ Streak, Daily Quiz, Mục tiêu tháng và Phiếu hành động không bị xô lệch.
- **Leader Oracle / Báo cáo:** Được bảo vệ thêm bằng regression component: Oracle có wrapper `min-h-[100dvh]` và nội dung full-width có giới hạn desktop; Báo cáo dùng surface `w-full`, `min-h-[100dvh]`, padding mobile `px-4` và bảng duy trì cuộn ngang có chủ đích.

## Hotfix mobile-only tiếp theo

Hai viewport `375 × 812` và `1280 × 720` tiếp tục render ổn định ở shell hiện hành. Các class override mới được xác minh qua regression component; trạng thái preview hiện tại dừng tại Welcome Modal nên không đại diện trực tiếp cho màn Báo cáo/Oracle theo role Leader.

## Hotfix iPhone 7 Plus

Viewport `414 × 736` và desktop `1280 × 720` đều tải shell bình thường sau khi các component Oracle/Báo cáo chuyển từ `dvh` sang `vh` qua `min-h-screen`. Preview quản lý phiên làm việc vẫn dừng tại Welcome Modal; các regression component xác nhận cấu trúc Báo cáo, Oracle và Live Preview theo breakpoint đã được yêu cầu.

## Hotfix export/PDF

Viewport `375 × 812` và `1280 × 720` tiếp tục tải shell ổn định. Phiên preview còn dừng tại Welcome Modal, vì vậy việc xác minh Oracle/Báo cáo/ảnh xuất trực tiếp theo role được bao phủ bởi regression component và build production thay vì ảnh chụp shell.

## Hotfix artifact và RAM mobile

Viewport `375 × 812` và `1280 × 720` tiếp tục render shell bình thường. Regression bao phủ thao tác ẩn/khôi phục overlay Gift, guard `scale: 1` mobile cho PDF, CTA Oracle giới hạn chiều cao và việc không còn các API ES2022+ bị cấm trong source Báo cáo.

## Hotfix Gift/Oracle/PDF memory

Viewport `375 × 812` và `1280 × 720` tiếp tục tải shell ổn định. Regression component xác nhận Gift giữ nguyên trong capture khi chỉ gỡ tạm hiệu ứng blur/shadow, thẻ Oracle đạt `600px` ở mobile với khoảng đệm dưới prompt, và PDF dùng `800px/0.8` mobile so với `1200px/2` desktop.

## Admin Control Center

Viewport `375 × 812` và `1280 × 720` vẫn tải shell ổn định sau khi Admin Control Center được gắn dưới tab Super Admin. Phiên preview còn ở Welcome Modal nên không mang session Super Admin để chụp trực tiếp; regression mới bao phủ cấu trúc User & Team Matrix, XP Treasury và các controls bắt buộc.

## MarketingStudio

Viewport `1280 × 720` hiển thị MarketingStudio với picker template, editor thông điệp, CTA xuất ảnh và canvas preview song song. Ở `375 × 812`, picker chuyển thành lưới hai cột; editor, CTA và canvas preview xếp dọc, không tràn ngang và vẫn thao tác được.

## MarketingStudio Premium Upgrade

Ở `1280 × 720`, phiên bản Studio mới hiển thị wrapper trắng, picker bo tròn, editor nhãn hai bước, CTA amber và canvas mô phỏng rõ ràng. Ở `375 × 812`, toàn bộ controls cùng canvas giữ thứ tự dọc, CTA hiển thị toàn chiều rộng và không phát sinh tràn ngang.

## MarketingStudio Advanced Editor

Ở `1280 × 720`, Marketing 1-Chạm chỉ còn editor Studio, không còn hero hay lưới thư viện cũ. Các tab, lựa chọn phôi cuộn ngang, toolbar font/màu/căn lề, hai nhóm slider và canvas cùng hiện trên một màn hình. Ở `375 × 812`, controls xếp dọc, hàng phôi cuộn ngang có chủ đích, CTA toàn chiều rộng và canvas nằm sau form mà không tràn ngang.

## Ultimate MarketingStudio & CMS Poster Preview

Ở `1280 × 720`, Studio hiển thị đầy đủ font family, căn lề bằng icon, màu/cỡ chữ, vị trí chữ ký, tên/chức danh nội bộ và bộ chọn icon; canvas song song vẫn giữ đúng tỉ lệ. Ở `375 × 812`, các controls xếp dọc, hai input chữ ký không tràn, icon selector và CTA vẫn dễ chạm. Chữ ký chỉ mang nhãn đội ngũ, không có số điện thoại hoặc định danh khách hàng.

## Typography Inline & Color Picker

Ở `1280 × 720`, font selector, bold/italic, alignment và palette năm màu cùng custom picker hiển thị trên thanh formatting; canvas lấy typography từ CSS inline nên không còn phụ thuộc lớp font toàn cục. Ở `375 × 812`, toolbar co gọn nhưng vẫn thấy font, B/I, alignment, swatches và slider cỡ chữ; không xuất hiện tràn ngang.

## Google Fonts & Glassmorphism Signature

Ở `1280 × 720`, selector hiển thị Montserrat, Playfair và Dancing Script; chữ ký được đổi thành glassmorphism `bg-white/10` trong suốt, để thấy nền phía sau và lấy màu theo thông điệp. Ở `375 × 812`, signature không làm tràn canvas và vẫn hiển thị rõ trong khung 4:5.

## Reliable Font Link & Handwriting Options

MarketingStudio nay gắn stylesheet Google Fonts vào `document.head` bằng `useEffect` và chờ `document.fonts.ready` trước khi html2canvas xuất ảnh. Ở cả `1280 × 720` và `375 × 812`, selector hiển thị mặc định Caveat và vẫn giữ đầy đủ Great Vibes, Dancing Script, Playfair Display, Montserrat; bố cục toolbar không tràn ngang.

## Font Override & Light Glassmorphism

Canvas thông điệp nhận lớp font chuyên biệt có `!important`, tránh typography toàn cục ghi đè font đã chọn. Ở `1280 × 720` và `375 × 812`, chữ ký có nền `bg-white/20`, blur và viền `border-white/40`; hình nền vẫn nhìn xuyên qua, trong khi icon/tên/chức danh tiếp tục đồng bộ màu thông điệp.

## Vietnamese Fonts & Background Object URL

Ở `1280 × 720`, Kalam hiển thị thông điệp có dấu tiếng Việt trên canvas; selector vẫn giữ Dancing Script, Playfair và Montserrat. Ảnh nền được nạp từ object URL sau khi có thể fetch CORS và fallback nguồn trực tiếp nếu host không cho phép, với thu hồi object URL khi đổi mẫu. Ở `375 × 812`, canvas ảnh nền, typography và form tiếp tục xếp dọc không tràn ngang.

## Base64 Export & Transparent Glass

Ảnh nền được fetch qua proxy công khai, chuyển bằng FileReader thành Base64 Data URL trước khi canvas xuất PNG; fallback URL trực tiếp vẫn hoạt động nếu proxy không thể tải ảnh. Ở `1280 × 720` và `375 × 812`, Kalam cùng style `@import` fallback hiển thị đúng, và chữ ký `bg-white/5` với `backdrop-blur-sm` trong hơn nhưng vẫn đọc được nhờ màu chữ chọn từ thông điệp.

## Native Canvas Export & No Blur

Ảnh nền nay được tải qua proxy ảnh, vẽ bằng native `Image`/`canvas` rồi chuyển thành Data URL trước khi xuất. Typography mặc định là Sriracha và có lựa chọn Pacifico, Dancing Script, Playfair, Montserrat. Cả `1280 × 720` và `375 × 812` hiển thị canvas ổn định; lớp chữ ký không còn `backdrop-blur` hoặc `backdrop-filter`, vì vậy không tạo lớp mờ gây cản trở html2canvas.

## HTML-to-Image Export

Luồng tải PNG sử dụng `html-to-image` với `toPng`, `pixelRatio: 2` và `cacheBust: true`; MarketingStudio không còn gọi html2canvas. Ở `1280 × 720` và `375 × 812`, canvas, CTA xuất ảnh, typography Sriracha, chữ ký Zero-PII và bố cục responsive hiển thị ổn định.

## Stable HTML2Canvas Base64 Export

Luồng export được khôi phục sang html2canvas, nhưng chỉ cho phép xuất sau khi ảnh nền proxy đã được fetch và chuyển thành Base64 Data URL bằng FileReader. CTA hiển thị trạng thái “Đang chuẩn bị ảnh nền...” khi cần và không khởi chạy export trong thời gian này. Ở `1280 × 720` và `375 × 812`, canvas không blur, chữ ký Zero-PII và bố cục studio tiếp tục ổn định.

## Direct Supabase Storage Export

MarketingStudio nay dùng `image_url` Supabase Storage trực tiếp cho thumbnail và canvas với `crossOrigin="anonymous"`; proxy, FileReader và Base64 đã được loại khỏi luồng render/export. html2canvas tiếp tục dùng `useCORS: true` và `allowTaint: false`. Ở `1280 × 720` và `375 × 812`, phôi ảnh, canvas, CTA và bố cục responsive hiển thị ổn định.

## Direct Base64 Export with Cache-Buster

Trước khi export, ảnh nền Supabase được fetch trực tiếp với tham số cache-buster, chuyển Blob thành Base64 Data URL bằng FileReader và gắn vào canvas. CTA bị khóa khi ảnh đang chuẩn bị; nếu fetch trực tiếp không thành công, hệ thống thử fallback một lần trước khi hiển thị thông báo lỗi rõ ràng. Ở `1280 × 720` và `375 × 812`, canvas, typography, chữ ký Zero-PII và bố cục tiếp tục ổn định.

## DOM-to-Image Export

MarketingStudio dùng `dom-to-image-more/toPng` với cache-busting, placeholder trong suốt và SVG DOM embedding; fallback qua `html-to-image/toPng` nếu lượt xuất chính thất bại. html2canvas cùng Base64 prefetch đã được loại khỏi riêng luồng MarketingStudio. Ở `1280 × 720` và `375 × 812`, canvas, CTA, typography và chữ ký Zero-PII giữ bố cục ổn định.

## Stable HTML2Canvas & Native Emoji Export

Chọn phôi chỉ tái tính khi chuyển tab, tránh state update lặp khi mảng templates đổi tham chiếu. Ảnh nền được nạp bằng native `Image`/canvas thành Base64 trước html2canvas; CTA khóa khi nền chưa sẵn sàng. Trong chữ ký xuất ảnh, icon là emoji native nên không buộc html2canvas phân tích SVG Lucide. Ở `1280 × 720` và `375 × 812`, canvas, CTA và bố cục vẫn ổn định.

## Direct Cache-Busting CORS Export

Canvas và thumbnail thêm tham số timestamp `t` vào `image_url` khi đổi tab hoặc chọn phôi, đồng thời giữ `crossOrigin="anonymous"`. Luồng export dùng html2canvas CORS-safe trực tiếp, không còn Base64, proxy hoặc FileReader. Ở `1280 × 720` và `375 × 812`, canvas, chữ ký Zero-PII và CTA giữ bố cục ổn định.

## CSS Background Export

Trong riêng vùng export, ảnh nền dùng `backgroundImage` từ URL cache-busting với `backgroundSize: cover` và `backgroundPosition: center`, thay cho thẻ `<img>`. html2canvas vì vậy xử lý lớp nền CSS trực tiếp. Ở `1280 × 720` và `375 × 812`, canvas poster, typography, chữ ký Zero-PII và CTA vẫn ổn định.

## Native Canvas Export

Luồng tải PNG của MarketingStudio không còn dùng thư viện DOM-to-canvas. Engine native tạo canvas `800 × 1000`, tải ảnh nền qua proxy CORS trước khi `drawImage`, vẽ đoạn chữ có wrap và vẽ block chữ ký/emoji bằng `CanvasRenderingContext2D`, sau đó tải Blob PNG. Ở `1280 × 720` và `375 × 812`, preview, CTA, typography và bố cục responsive vẫn ổn định.

## Direct Supabase Native Canvas

Native canvas nay tải trực tiếp `image_url` Supabase với cache-buster và `crossOrigin="anonymous"`, không qua proxy. Chữ ký export dùng stack `system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial` để hiển thị tiếng Việt ổn định ngay cả khi Google Font tải chậm. Ở `1280 × 720` và `375 × 812`, preview, CTA và bố cục studio tiếp tục ổn định.

## Dynamic Canvas Resolution & Playfair Signature

Canvas export dùng `naturalWidth`/`naturalHeight` của ảnh nền, chỉ thu nhỏ khi vượt `1200px`, giữ tỷ lệ gốc và tính lại kích thước chữ theo bề rộng xuất. Bóng chữ giảm còn blur `2` để sắc nét hơn. Tên chữ ký dùng Playfair Display trong khi chức danh tiếp tục dùng sans-serif; nền chữ ký vẫn trong suốt. Preview ổn định ở `1280 × 720` và `375 × 812`.

## Contextual Admin Marketing

Với vai trò advisor, Marketing 1-Chạm chỉ hiển thị Marketing Studio; không có toggle hoặc CMS quản lý phôi. Desktop `1280 × 720` và mobile `375 × 812` đều giữ canvas, editor và CTA xuất ảnh không tràn. Với role leader/super_admin, source contract bảo vệ toggle Studio/Quản lý Phôi, CMS chỉ nhận schema `marketing` và callback đồng bộ lại thư viện sau CRUD; Pilot tab không còn render CMS này.

## Template Grid & Persistent Marketing CMS

Ở desktop `1280 × 720`, phôi chuyển thành lưới bốn cột cuộn dọc cao tối đa `280px`, để preview 4:5 bên phải không bị ép. Ở mobile `375 × 812`, lưới ba cột xếp gọn phía trên editor và preview, không tạo cuộn ngang. Với leader/super_admin, Studio và CMS giữ mount qua CSS `block/hidden`; CMS nhận records Marketing đã nạp sẵn, tránh spinner “Đang tải...” khi lần đầu chuyển sang Quản lý Phôi.

## Stable Tab Background Selection

Danh sách phôi được memoize theo tab. Khi đổi tab hoặc thư viện được cập nhật, nền hiện tại chỉ đổi sang phôi đầu tiên khi mã phôi không còn thuộc danh sách đã lọc; khi còn hợp lệ, preview giữ nguyên nền và không làm mới URL ảnh. Desktop `1280 × 720` và mobile `375 × 812` hiển thị canvas nền ổn định.
