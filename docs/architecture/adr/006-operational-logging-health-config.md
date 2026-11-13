# ADR 006: Cơ chế Vận hành (Logging, Health Check & Quản lý cấu hình)

## Trạng thái
Accepted

## Bối cảnh
Ứng dụng cần cơ chế quản lý cấu hình bảo mật (ẩn các thông tin nhạy cảm như mật khẩu database, khóa bí mật JWT, khóa VNPay), khả năng ghi nhận log giao dịch khi xảy ra lỗi, và cơ chế kiểm tra trạng thái sức khỏe dịch vụ khi chạy trong môi trường Docker.

## Quyết định
- **Quản lý cấu hình:** Sử dụng tệp `.env` tập trung kết hợp `process.env`.
- **Logging:** Sử dụng cơ chế ghi log chuẩn ra luồng console (`console.log` / `console.error`) tại các điểm xử lý thanh toán và gửi email để Docker thu thập log dễ dàng.
- **Health Check:** Cấu hình healthcheck (`pg_isready`) ở tầng `docker-compose.yml` để đảm bảo PostgreSQL khởi động sẵn sàng trước khi kết nối API.

## Hệ quả & Trade-off
- **Ưu điểm:** Giúp triển khai nhanh chóng, gọn nhẹ, thuận tiện cho việc kiểm thử và nghiệm thu trong phạm vi đồ án MVP.
- **Hạn chế:** Ở các phiên bản nâng cao, cần bổ sung thêm thư viện kiểm tra biến môi trường lúc khởi động (`config validation`) và xây dựng endpoint `/api/health` chuyên biệt bên trong NestJS.