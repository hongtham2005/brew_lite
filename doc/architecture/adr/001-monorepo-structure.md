# ADR 001: Sử dụng cấu trúc Monorepo cho dự án BrewLite

## Trạng thái
Accepted

## Bối cảnh
Dự án BrewLite bao gồm cả ứng dụng Frontend (Next.js) và Backend (NestJS). Các thành phần này cần chia sẻ chung tài liệu thiết kế, sơ đồ, cấu hình Docker Compose và các biến môi trường chuẩn hóa nhằm phục vụ quá trình phát triển nhóm và triển khai.

## Quyết định
Tổ chức mã nguồn theo mô hình Monorepo tại thư mục gốc với các thư mục phân tách rõ ràng:
- `frontend/` (hoặc `apps/web`): Chứa mã nguồn Next.js.
- `backend/` (hoặc `apps/api`): Chứa mã nguồn NestJS.
- `docs/`: Chứa toàn bộ tài liệu yêu cầu, sơ đồ và các bản ghi quyết định kiến trúc (ADR).

## Hệ quả & Trade-off
- **Ưu điểm:** Giúp quản lý mã nguồn và tài liệu đồng bộ tại một nơi duy nhất, dễ dàng cấu hình Docker Compose chung và theo dõi tiến độ qua git history.
- **Hạn chế:** Cần chú ý cấu hình pipeline CI/CD phân tách độc lập bước build và test cho từng thư mục con để tránh làm chậm thời gian build tổng thể.