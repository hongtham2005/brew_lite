# ADR-008: Logging, health check và quản lý cấu hình

- **Trạng thái:** Chấp nhận
- **Ngày:** 2026-11-11

## Quyết định
- **Logging:** `nestjs-pino`, log JSON ra stdout (Render thu thập). Mỗi request có `requestId`; che (redact) header `authorization` và các trường mật khẩu/token.
- **Health:** `GET /health` (`@nestjs/terminus`) kiểm tra process + kết nối DB, trả 200/503. Dùng cho health check của Render và smoke test.
- **Config:** `@nestjs/config` + schema validate (Joi/zod); thiếu biến bắt buộc → API không khởi động. Chỉ `.env.example` được commit; production dùng biến môi trường của nền tảng.

## Hệ quả
- (+) Phát hiện sớm lỗi cấu hình; log an toàn, dễ truy vết.
- (−) Chưa có tracing/metrics; để mở rộng.
