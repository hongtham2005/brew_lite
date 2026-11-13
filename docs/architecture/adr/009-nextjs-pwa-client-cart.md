# ADR-009: Next.js mobile-first/PWA, giỏ hàng phía client

- **Trạng thái:** Chấp nhận
- **Ngày:** 2026-11-11

## Quyết định
- Next.js (App Router) + Tailwind, thiết kế mobile-first; PWA có manifest và service worker (cache menu để xem offline).
- Giỏ hàng lưu ở client (state + `localStorage`) để không cần đăng nhập mới thêm món.
- Khi đặt đơn, client chỉ gửi `productId`, `size`, `toppings`, `quantity`; **server tính lại giá và tổng tiền**, không tin giá từ client.
- Kiểm tra dữ liệu ở cả frontend và backend.

## Hệ quả
- (+) Trải nghiệm nhanh, ít bảng DB hơn.
- (−) Giỏ không đồng bộ giữa nhiều thiết bị; chấp nhận cho MVP.
