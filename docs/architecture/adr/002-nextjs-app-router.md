# ADR 002: Sử dụng Next.js App Router cho Frontend Tier

## Trạng thái
Accepted

## Bối cảnh
Hệ thống yêu cầu giao diện người dùng theo hướng mobile-first, tải trang thực đơn nhanh chóng, hỗ trợ SEO tốt và phân tách linh hoạt giữa nội dung công khai (menu, chi tiết sản phẩm) với nội dung cá nhân hóa (giỏ hàng, đặt đơn, lịch sử mua hàng).

## Quyết định
Sử dụng **Next.js với mô hình App Router**, kết hợp linh hoạt giữa Server-Side Rendering (SSR) / React Server Components và Client-Side Rendering (CSR) tùy theo đặc thù trang. Ví dụ, trang thực đơn (`menu/page.tsx`) thực hiện gọi API dữ liệu ở phía client để tối ưu tương tác.

## Hệ quả & Trade-off
- **Ưu điểm:** Cấu trúc thư mục định tuyến trực quan, tối ưu hóa hiệu năng tải trang và trải nghiệm người dùng trên thiết bị di động.
- **Hạn chế:** Đội ngũ phát triển cần nắm vững ranh giới giữa Client Component (`"use client"`) và Server Component để quản lý trạng thái giỏ hàng và token xác thực hiệu quả.