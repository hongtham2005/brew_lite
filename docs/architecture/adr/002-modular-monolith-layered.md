# ADR-002: Kiến trúc phân lớp, backend là modular monolith

- **Trạng thái:** Chấp nhận
- **Ngày:** 2026-11-11

## Bối cảnh
MVP nhỏ, nhóm ít người, thời gian hai sprint. Cần ranh giới domain rõ để test và mở rộng.

## Lựa chọn đã xem xét
1. Microservices – linh hoạt nhưng quá tốn công vận hành, khó debug.
2. Monolith không chia module – nhanh nhưng dễ rối.
3. **Modular monolith (NestJS module theo domain)** – một deployable, ranh giới module rõ.

## Quyết định
Chọn (3). Các module: Auth, Users, Products, Orders, Payments, Promotions, Loyalty, Health. Module chỉ gọi nhau qua service được export; controller → service → repository.

## Hệ quả
- (+) Một container API, deploy/rollback đơn giản; giao dịch DB nằm gọn trong một process.
- (+) Có thể tách module thành service sau này.
- (−) Scale theo cả khối; một lỗi nghiêm trọng có thể ảnh hưởng toàn API.
