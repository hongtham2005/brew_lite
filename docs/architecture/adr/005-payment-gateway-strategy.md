# ADR 005: Chiến lược tích hợp Cổng thanh toán VNPay và Mock Gateway

## Trạng thái
Accepted

## Bối cảnh
Hệ thống cần tích hợp thanh toán trực tuyến thực tế qua cổng VNPay Sandbox (hỗ trợ sinh URL thanh toán kèm chữ ký bảo mật checksum và nhận IPN/Return callback), đồng thời vẫn cần phương án dự phòng để kiểm thử khi mạng gián đoạn hoặc cổng thanh toán bảo trì.

## Quyết định
Thiết kế tầng thanh toán linh hoạt, tách biệt giữa **`OnlinePaymentGatewayService`** (tích hợp thực tế với VNPay Sandbox) và **`MockPaymentGatewayService`** (mô phỏng nội bộ). Trong module thanh toán (`PaymentsModule`), cấu hình mặc định sử dụng `OnlinePaymentGatewayService` để phục vụ demo và nghiệm thu đồ án.

## Hệ quả & Trade-off
- **Ưu điểm:** Xác thực chính xác luồng nghiệp vụ thanh toán thực tế, kiểm chứng thành công cơ chế bảo mật checksum và cập nhật trạng thái đơn hàng `PAID`.
- **Hạn chế:** Phụ thuộc vào độ ổn định của máy chủ Sandbox VNPay bên thứ ba; cần quản lý cẩn thận các biến môi trường cấu hình `vnp_TmnCode` và `vnp_HashSecret`.