# Concierge Data Flow & AI Evaluation Strategy

## Concierge Data Flow

Super Admin là nguồn quản trị nội dung. Khi tạo hoặc điều chỉnh Bản tin, Bảo Bối, Từ điển UW hay Template UW, Super Admin lựa chọn một trong hai phạm vi: **Global** để `team_id = NULL`, hoặc **Local** để gán `team_id` của Agency/Workspace đích. Agency Leader và TVV chỉ tiêu thụ nội dung đã được phân phối; họ không phải là nguồn nhập dữ liệu nghiệp vụ.

| Lớp nội dung | Global Content | Local Content |
|---|---|---|
| Bản tin 90s | `team_id IS NULL` | `news_case_studies.team_id = user.team_id` và có thể gắn `is_internal_memo` |
| Bảo Bối | `team_id IS NULL` | `playbook_cards.team_id = user.team_id`, lọc thêm qua `product_tags` khi cần |
| Trợ lý Thẩm định | `team_id IS NULL` | `uw_dictionary`/`uw_templates.team_id = user.team_id`, lọc thêm qua `company_tags` khi cần |

Khi policy RLS multi-tenant được kích hoạt, TVV sẽ chỉ đọc bản ghi thỏa điều kiện sau:

```sql
team_id IS NULL OR team_id = user.current_team_id
```

> Migration hiện tại bổ sung phạm vi dữ liệu và seed một Bảo Bối Global. Nó **không** thay policy RLS hoặc xây UI quản trị, để tránh thay đổi quyền truy cập ngoài phạm vi được phê duyệt.

## AI Evaluation cho Bác Sĩ Hợp Đồng

`playbook_cards.ai_evaluation_rules` lưu một JSON rule-set theo Bảo Bối. Với mã `W014`, rule-set ghi nhận ba hành vi tích cực: khen ngợi hợp đồng cũ, hỏi mục tiêu tham gia ban đầu và nêu khoảng trống bảo vệ bằng dữ kiện khách quan. Rule-set cũng có một negative trigger khi chê bai công ty đối thủ hoặc hợp đồng cũ.

Một Edge Function trong tương lai sẽ nhận **tín hiệu hành vi đã cấu trúc** từ Roleplay, không nhận tên khách hàng, số hợp đồng, số điện thoại hoặc audio thô. Hàm sẽ xác thực quyền truy cập Global/Local Content, đọc rule-set của Bảo Bối đang luyện, cộng/trừ điểm theo trigger khớp và trả về phản hồi cụ thể. Ví dụ, hành vi chê bai sẽ trừ 50 điểm và nhắc TVV quay lại cách tiếp cận tôn trọng lựa chọn hiện hữu.

| Bước xử lý dự kiến | Kiểm soát bắt buộc |
|---|---|
| Xác thực session và Team | Chỉ đọc Bảo Bối Global hoặc thuộc Team của TVV |
| Nhận evidence có cấu trúc | Không chứa PII, số hợp đồng hoặc audio gốc |
| Đọc `ai_evaluation_rules` | Rule-set chỉ từ Bảo Bối active được phép truy cập |
| Chấm điểm và phản hồi | Ghi ledger/audit idempotent, nêu trigger đã khớp |

Edge Function, nhận diện AI và luồng UI chấm điểm **chưa được triển khai** trong bản nâng cấp này. Phạm vi hiện tại là schema và dữ liệu sẵn sàng cho bước tích hợp an toàn tiếp theo.
