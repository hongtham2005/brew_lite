# ADR-005: Cổng thanh toán mô phỏng + idempotency key

- **Trạng thái:** Chấp nhận
- **Ngày:** 2026-11-11

## Bối cảnh
Đề yêu cầu thanh toán Ví/Thẻ mô phỏng và xử lý gửi lại yêu cầu thanh toán.

## Quyết định
- `PaymentsModule` định nghĩa interface `PaymentGateway`; hiện thực `MockPaymentGateway` (quy tắc xác định để test: ví dụ số thẻ kết thúc `0002` → từ chối).
- Client gửi header `Idempotency-Key` (UUID) cho `POST /payments`. Bảng `payments` có ràng buộc `UNIQUE(idempotency_key)`; gửi lại cùng key trả về kết quả đã lưu, không charge lần hai.
- Kết quả thanh toán và cập nhật trạng thái đơn nằm trong cùng transaction DB.

## Hệ quả
- (+) Đổi sang cổng thật chỉ cần thêm adapter mới.
- (−) Mock không phản ánh độ trễ/lỗi mạng thật; test bổ sung bằng gateway giả lập timeout.
