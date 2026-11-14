# Đặc tả Use-case: Đặt và thanh toán đơn hàng (Task 1.3)
- **ID:** UC-01
- **Actor:** Customer; Payment Service (phụ)
- **Trigger:** Khách hàng nhấn nút "Xác nhận đặt hàng & Thanh toán" tại trang giỏ hàng.
- **Tiền điều kiện:** Khách hàng đã đăng nhập vào hệ thống và sở hữu JWT Token hợp lệ; Giỏ hàng trên giao diện Next.js đã có ít nhất một sản phẩm được chọn mua kèm tùy chọn (size, topping).
- **Hậu điều kiện (thành công / thất bại):**
    - *Thành công:* Bản ghi đơn hàng (Order) được khởi tạo trong cơ sở dữ liệu kèm theo danh sách chi tiết (OrderItem) ở trạng thái PENDING, hệ thống tạo thành công phiên giao dịch thanh toán và trả về chuỗi đường dẫn paymentUrl của VNPay cho client.
    - *Thất bại:* Transaction bị hủy (rollback), trả về mã lỗi HTTP tương ứng, không tạo đơn hàng.

## Luồng chính
1. Khách hàng truy cập trang giỏ hàng, kiểm tra danh sách sản phẩm, số lượng và tổng tiền thanh toán.
2. Khách hàng nhấn nút "Xác nhận đặt hàng & Thanh toán".
3. Giao diện Next.js gửi yêu cầu `POST /orders` kèm theo JWT Token và dữ liệu giỏ hàng lên NestJS API.
4. Backend tiến hành xác thực token, kiểm tra tính hợp lệ của dữ liệu, sau đó thực hiện transaction lưu Order và OrderItem vào PostgreSQL với trạng thái PENDING.
5. Module thanh toán khởi tạo yêu cầu giao dịch với VNPay, tính toán chuỗi mã hóa bảo mật (checksum) dựa trên merchant secret key.
6. Backend trả về phản hồi thành công (201 Created) kèm theo thông tin chi tiết và đường dẫn paymentUrl của VNPay.
7. Giao diện Next.js nhận URL và tự động chuyển hướng người dùng sang trang cổng thanh toán VNPay để hoàn tất giao dịch.

## Luồng thay thế
- Khách hàng có thể thay đổi số lượng hoặc xóa sản phẩm trong giỏ hàng trước khi nhấn xác nhận đặt hàng, hệ thống tự động tính toán lại tổng tiền động.

## Luồng ngoại lệ (hết hàng, chưa đăng nhập, thanh toán thất bại, gửi lại yêu cầu)
- **E1 (Người dùng chưa đăng nhập hoặc Token hết hạn):** Hệ thống phát hiện thiếu hoặc hết hạn JWT Token, trả về mã lỗi 401 Unauthorized và điều hướng người dùng về trang đăng nhập (`/login`).
- **E2 (Lỗi dữ liệu hoặc sản phẩm không hợp lệ):** Nếu thông tin sản phẩm không tồn tại hoặc lỗi định dạng, database transaction bị hủy (rollback), hệ thống trả về mã lỗi 400 Bad Request kèm thông báo lỗi cụ thể.
- **E3 (Lỗi kết nối cổng thanh toán):** Nếu cổng VNPay không phản hồi, hệ thống ghi log lỗi và thông báo trạng thái gián đoạn tạm thời để khách hàng có thể thử lại sau.

## Liên kết yêu cầu
FR-03, FR-04, FR-05, FR-06, NFR-02