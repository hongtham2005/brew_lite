# ADR-007: Chạy migration an toàn khi deploy và chiến lược rollback

- **Trạng thái:** Chấp nhận
- **Ngày:** 2026-11-11

## Bối cảnh
DB production không public nên pipeline CI không kết nối trực tiếp để migrate.

## Quyết định
- Entrypoint của container API chạy `migration:run` rồi mới `start`. Migration chạy trong transaction; Postgres advisory lock đảm bảo chỉ một instance migrate tại một thời điểm.
- Migration theo mô hình **expand → migrate → contract**: bản deploy mới phải chạy được với schema cũ và ngược lại; không xoá/đổi tên cột trong cùng release.
- Nếu migration lỗi, container không khởi động → Render giữ bản cũ đang chạy; smoke test thất bại → pipeline dừng.
- Rollback: deploy lại image tag trước đó (schema vẫn tương thích nhờ expand/contract). Chỉ chạy `migration:revert` thủ công khi bắt buộc.

## Hệ quả
- (+) Không cần mở DB ra ngoài.
- (−) Release có thay đổi schema phá vỡ cần chia thành hai release.
