# ADR-003: PostgreSQL + TypeORM, schema quản lý bằng migration

- **Trạng thái:** Chấp nhận
- **Ngày:** 2026-11-11

## Bối cảnh
Dữ liệu đơn hàng/tồn kho/thanh toán cần ACID và quan hệ rõ. Đề bắt buộc PostgreSQL và migration/seed tái tạo được.

## Quyết định
- PostgreSQL 16.
- ORM: TypeORM (tích hợp sẵn với NestJS).
- `synchronize: false` ở mọi môi trường; mọi thay đổi schema là một file migration trong `apps/api/src/migrations`.
- Seed dữ liệu mẫu bằng script `npm run seed` (idempotent).
- Tạo đơn + trừ tồn kho chạy trong **một transaction**; dùng khoá hàng (`SELECT ... FOR UPDATE`) để tránh bán quá tồn.

## Hệ quả
- (+) Schema có version, tái tạo được trên local/CI/production.
- (−) TypeORM có nhiều điểm lỗi vặt; nhóm cần viết integration test cho truy vấn quan trọng.
