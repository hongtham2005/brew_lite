# SRS rút gọn (Task 1.2)

## Yêu cầu chức năng
| Mã | Mô tả | MoSCoW | Tiêu chí chấp nhận |
|---|---|---|---|
| FR-01 | Xem menu | Must | - Trả về danh sách sản phẩm từ database.<br>- Hỗ trợ phân trang hoặc lọc theo danh mục.<br>- Có trạng thái loading và xử lý lỗi khi mất kết nối. |
| FR-02 | Xem chi tiết sản phẩm (size, topping) | Must | - Hiển thị đúng thông tin của một sản phẩm khi click vào.<br>- Cho phép chọn size (S/M/L) và topping kèm theo. |
| FR-03 | Giỏ hàng & tính tổng tiền | Must | - Cập nhật tổng tiền động ngay khi thay đổi số lượng.<br>- Dữ liệu giỏ hàng được lưu trữ ổn định trên client. |
| FR-04 | Đăng ký/Đăng nhập (JWT) | Must | - Kiểm tra định dạng email và độ mạnh mật khẩu.<br>- Trả về JWT Access Token sau khi đăng nhập thành công. |
| FR-05 | Đặt đơn | Must | - Tạo bản ghi Order và OrderItem trong DB.<br>- Sinh ra paymentUrl chính xác từ VNPay sandbox với chữ ký an toàn (checksum). |
| FR-06 | Thanh toán Ví/Thẻ mô phỏng | Must | - Tích hợp cổng thanh toán VNPay.<br>- Xử lý callback trả về, cập nhật trạng thái đơn hàng thành PAID. |
| FR-07 | Lịch sử đơn | Should | - Hiển thị danh sách đơn hàng đã mua của user đang đăng nhập.<br>- Cập nhật đúng trạng thái (PENDING, PAID, CANCELED). |
| FR-08 | Quản lý trạng thái đơn | Should | - Cho phép theo dõi và cập nhật trạng thái đơn hàng trên hệ thống một cách chính xác. |

## Yêu cầu phi chức năng
| Mã | Nhóm | Mô tả | MoSCoW | Tiêu chí chấp nhận |
|---|---|---|---|---|
| NFR-01 | Hiệu năng | Thời gian phản hồi của các API thông thường (như lấy danh mục, chi tiết sản phẩm) dưới $500\text{ms}$ dưới tải thông thường. | Should | API phản hồi nhanh chóng trong ngưỡng thời gian quy định dưới tải chuẩn. |
| NFR-02 | Bảo mật | Mật khẩu người dùng bắt buộc được mã hóa bằng bcrypt trước khi lưu trữ vào PostgreSQL; các API nhạy cảm yêu cầu bắt buộc xác thực bằng Bearer JWT. | Must | Dữ liệu mật khẩu được mã hóa an toàn và các endpoint bảo vệ yêu cầu JWT hợp lệ. |
| NFR-03 | Khả dụng | Giao diện Next.js được thiết kế theo chuẩn mobile-first / PWA, hiển thị mượt mà trên cả thiết bị di động lẫn máy tính. | Should | Giao diện tương thích tốt, hiển thị mượt mà trên nhiều thiết bị. |
| NFR-04 | Khả năng triển khai | Hệ thống phải dễ dàng đóng gói qua Docker và chạy đồng bộ ở cả môi trường local (thông qua docker-compose) lẫn production. | Must | Triển khai thành công qua Docker container và docker-compose mà không gặp lỗi cấu hình. |

## Use-case tổng quát
Xem `docs/diagrams/usecase-overview.puml`.
