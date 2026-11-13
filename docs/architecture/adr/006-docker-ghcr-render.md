# ADR-006: Đóng gói Docker, registry GHCR, triển khai trên Render

- **Trạng thái:** Chấp nhận (nhóm xác nhận lại nền tảng trước khi chấm)
- **Ngày:** 2026-11-11

## Bối cảnh
Cần nền tảng có HTTPS tự động, Postgres managed không public, chạy Docker image, health check, chi phí thấp.

## Lựa chọn đã xem xét
Render, Railway, Fly.io, VPS tự quản. VPS linh hoạt nhưng tự lo TLS, patch, backup; Render cân bằng giữa đơn giản và đủ tính năng.

## Quyết định
- Image build trong GitHub Actions, đẩy lên **GHCR**, tag bằng commit SHA và `vX.Y.Z`.
- Render có hai Web Service chạy image (`brewlite-web`, `brewlite-api`) và một Render PostgreSQL.
- CD gọi **deploy hook** với `?imgURL=<image:tag>`; secret nằm trong GitHub Actions secrets/Render env.
- DB chỉ truy cập qua Internal URL trong mạng riêng Render.
- Health check path của API: `/health`.

## Hệ quả
- (+) Rollback bằng cách deploy lại tag cũ.
- (−) Phụ thuộc nhà cung cấp; gói free có cold start.
