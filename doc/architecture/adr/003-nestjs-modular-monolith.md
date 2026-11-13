# ADR 003: Sử dụng NestJS theo kiến trúc Modular Monolith cho Backend

## Trạng thái
Accepted

## Bối cảnh
Hệ thống BrewLite có nhiều miền nghiệp vụ gắn kết chặt chẽ với nhau (Quản lý sản phẩm, Giỏ hàng, Đặt đơn hàng, Trừ tồn kho nguyên liệu, Tích điểm Loyalty và Thanh toán qua VNPay), đòi hỏi tính toàn vẹn dữ liệu cao nhưng quy mô nhóm phát triển ở mức tinh gọn.

## Quyết định
Xây dựng Backend bằng **NestJS Framework (TypeScript)** theo kiến trúc **Modular Monolith**. Hệ thống phân tách thành các module độc lập rõ ràng: `Auth`, `Products`, `Orders`, `Payments`, `Inventory`, `Loyalty` và `Mail`.

## Hệ quả & Trade-off
- **Ưu điểm:** Giúp dễ dàng thực hiện Database Transaction (`$transaction`) xuyên suốt nhiều miền nghiệp vụ (như tạo đơn hàng đồng thời trừ kho và áp dụng mã giảm giá) mà không tốn chi phí vận hành phức tạp như Microservices.
- **Hạn chế:** Toàn bộ các module chạy chung một tiến trình và có chung vòng đời triển khai (deployment lifecycle), khó scale độc lập từng module khi tải hệ thống tăng cao trong tương lai.