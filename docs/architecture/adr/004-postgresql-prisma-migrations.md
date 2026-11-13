# ADR 004: Sử dụng PostgreSQL và Prisma ORM với cơ chế Migration

## Trạng thái
Accepted

## Bối cảnh
Dữ liệu về đơn hàng, chi tiết sản phẩm, số lượng tồn kho nguyên liệu thô và lịch sử thanh toán đòi hỏi tính nhất quán tuyệt đối (tuân thủ chuẩn ACID) và cần được quản lý phiên bản schema rõ ràng.

## Quyết định
Sử dụng **PostgreSQL** làm hệ quản trị cơ sở dữ liệu quan hệ chính kết hợp **Prisma ORM**. Toàn bộ thay đổi cấu trúc bảng được quản lý qua thư mục `prisma/migrations/`, sử dụng lệnh `prisma migrate dev` khi phát triển local và **`prisma migrate deploy`** khi triển khai tự động lên production.

## Hệ quả & Trade-off
- **Ưu điểm:** Hỗ trợ type-safety mạnh mẽ trong TypeScript, giảm thiểu lỗi truy vấn và đảm bảo tính toàn vẹn dữ liệu thông qua cơ chế transaction an toàn.
- **Hạn chế:** Cần tuân thủ nghiêm ngặt quy trình chạy migration khi cập nhật phiên bản ứng dụng trên môi trường production để tránh xung đột dữ liệu.