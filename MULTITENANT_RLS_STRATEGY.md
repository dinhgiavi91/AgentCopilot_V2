# Chiến lược RLS cho Nội dung Multi-Tenant

## Mục tiêu

Hệ thống hỗ trợ hai lớp nội dung: **nội dung toàn cục** do đội ngũ hệ thống quản trị và **nội dung cục bộ** theo Workspace/Team. Migration hiện tại đã thêm khóa phạm vi dữ liệu; việc thay thế các policy đọc/ghi hiện hữu bằng policy multi-tenant sẽ được triển khai ở bước policy riêng, sau khi hoàn tất ánh xạ `current_team_id` của session.

| Module | Bảng thực tế | Phạm vi mới |
|---|---|---|
| Bản tin 90s | `news_case_studies` | `team_id`, `is_internal_memo` |
| Bảo Bối | `playbook_cards` | `team_id`, `product_tags` |
| Trợ lý Thẩm định | `uw_dictionary`, `uw_templates` | `team_id`, `company_tags` |

> **Quy ước:** `team_id IS NULL` biểu thị dữ liệu toàn cục. Bản ghi có `team_id` biểu thị nội dung thuộc một Workspace cụ thể. `teams` đã tồn tại từ Pilot Foundation nên migration tái sử dụng bảng này thay vì tạo một mô hình Workspace song song.

## Quy tắc đọc dự kiến

Người dùng đã xác thực sẽ đọc được một bản ghi khi đó là dữ liệu toàn cục, hoặc khi `team_id` của bản ghi trùng `current_team_id` trong hồ sơ/session của họ. Cùng một điều kiện này áp dụng nhất quán cho Bản tin, Bảo Bối, Từ điển UW và Templates UW.

```sql
team_id IS NULL
OR team_id = current_team_id()
```

Các `product_tags` và `company_tags` là lớp lọc và phân loại bổ sung ở tầng sản phẩm. Chúng không thay thế điều kiện cô lập Workspace bằng `team_id`.

## Quy tắc ghi dự kiến

Leader được phép tạo, sửa hoặc xóa **chỉ** những bản ghi có `team_id` trùng Team của họ. Super Admin có thể quản trị nội dung toàn cục và thực hiện quản trị xuyên Team khi chính sách vận hành cho phép. Advisor chỉ có quyền đọc theo phạm vi đã nêu, không có quyền ghi vào thư viện nội dung.

```sql
-- Mẫu điều kiện ghi cho Leader
team_id = current_team_id()
AND current_user_role() IN ('leader', 'super_admin')
```

## Trình tự triển khai policy

1. Xác nhận một hàm hoặc JWT claim ổn định để lấy `current_team_id` và role của người dùng.
2. Thay policy đọc rộng hiện hữu bằng điều kiện Global hoặc Local Content trên từng bảng.
3. Thêm policy `INSERT`, `UPDATE`, `DELETE` scope theo Team cho Leader và policy Global Content cho Super Admin.
4. Kiểm thử bằng tối thiểu hai Team để chứng minh không có đọc/ghi chéo tenant trước khi bật UI quản trị phạm vi nội dung.

Trong giai đoạn chuyển tiếp này, migration **chỉ thêm cột, khóa ngoại và index**; nó không thay đổi các policy RLS đang chạy hay tự gán dữ liệu cũ vào một Team. Vì vậy toàn bộ nội dung hiện hữu tiếp tục được xem là Global Content cho đến khi policy mới được nghiệm thu.
