# Bối cảnh, Stakeholder và Phạm vi (Task 1.1)

## 1. Vấn đề nghiệp vụ
Ứng dụng BrewLite được xây dựng nhằm giải quyết các bài toán vận hành cốt lõi cho một cửa hàng kinh doanh F&B (Cà phê và đồ uống):
- Khách hàng thường gặp khó khăn vì phải xếp hàng chờ đợi lâu để gọi món, thiếu kênh đặt trước linh hoạt trên nền tảng di động (mobile-first/PWA).
- Quản lý cửa hàng thiếu hệ thống tập trung để theo dõi trạng thái đơn hàng thời gian thực, quản lý thực đơn, cũng như tự động hóa việc tính toán điểm thưởng (loyalty) cho khách hàng trung thành.
- Nhân viên quầy dễ bị quá tải, nhầm lẫn đơn thủ công khi lượng khách đông vào giờ cao điểm.

## 2. Stakeholder
| Stakeholder | Vai trò | Mục tiêu & kỳ vọng |
|---|---|---|
| Khách hàng | Người trực tiếp sử dụng ứng dụng để xem menu, đặt món và thanh toán | Giao diện thân thiện (mobile-first), đặt món nhanh chóng, thanh toán trực tuyến bảo mật (VNPay) và tích điểm đổi quà |
| Nhân viên quầy | Tiếp nhận đơn hàng, cập nhật trạng thái đơn (đang chuẩn bị, sẵn sàng giao...) | Theo dõi sát sao trạng thái đơn hàng trên hệ thống, thao tác xử lý mượt mà, hạn chế sai sót |
| Quản lý cửa hàng | Quản lý thực đơn, cấu hình sản phẩm, theo dõi thống kê doanh thu và cấu hình khuyến mãi | Quản lý tập trung, báo cáo doanh thu trực quan, kiểm soát tồn kho và phân quyền nhân sự |
| Giảng viên/khách hàng nghiệm thu | Đánh giá chất lượng sản phẩm, kiểm tra tính đúng đắn của quy trình và mã nguồn | Hệ thống đáp ứng đúng các ràng buộc kỹ thuật (Next.js, NestJS, PostgreSQL, Docker), code sạch, có kiểm thử và CI/CD đầy đủ |
| Nhóm phát triển | Thiết kế kiến trúc, lập trình, viết kiểm thử, thiết lập CI/CD và triển khai (Deployment) | Phân chia công việc rõ ràng, quy trình Git chuẩn chỉnh, hệ thống dễ bảo trì và mở rộng |
| Đơn vị thanh toán | Cung cấp cổng thanh toán trực tuyến, xử lý giao dịch qua mã QR / ví điện tử | Tích hợp an toàn, xác thực chữ ký (checksum) chính xác và xử lý cơ chế callback (IPN/Return) ổn định |

## 3. Phạm vi
### 3.1. In-scope (MVP)
- Xác thực người dùng: Đăng ký, đăng nhập tài khoản bằng JWT. 
- Quản lý thực đơn: Xem danh sách sản phẩm, chi tiết sản phẩm kèm tuỳ chọn size và topping. 
- Giỏ hàng & Đặt đơn: Thêm/sửa/xóa sản phẩm trong giỏ hàng, tính tổng tiền tự động và tạo đơn hàng (/orders). 
- Thanh toán: Tích hợp cổng thanh toán VNPay (tạo URL thanh toán, xử lý callback trả về, cập nhật trạng thái đơn hàng). 
- Quản lý trạng thái & Lịch sử: Xem lịch sử đơn hàng cá nhân và cập nhật trạng thái đơn hàng. 
- Hệ thống Loyalty: Tự động cộng điểm thưởng tương ứng với giá trị đơn hàng thanh toán thành công.

### 3.2. Out-of-scope (mở rộng sau MVP)
- Hệ thống quản lý đa chi nhánh phức tạp (Multi-branch chain-wide inventory).
- Tích hợp các cổng thanh toán quốc tế (PayPal, Stripe) hoặc ví điện tử khác ngoài VNPay.
- Hệ thống giao hàng tích hợp tài xế (Shipper logistics real-time tracking).

## 4. Giả định, ràng buộc , rủi ro
### 4.1. Giả định
- Người dùng có thiết bị di động hoặc máy tính có kết nối Internet ổn định để truy cập giao diện Next.js/PWA. 
- Cổng thanh toán Sandbox của VNPay hoạt động ổn định trong suốt quá trình nhóm kiểm thử (testing) và nghiệm thu.

### 4.2. Ràng buộc
- Bắt buộc sử dụng công nghệ: Next.js (Frontend), NestJS (Backend), PostgreSQL (Database), và Docker (Container hóa). 
- Toàn bộ mã nguồn phải được quản lý trên Git với quy trình CI/CD tự động hóa. 

### 4.3. Rủi ro ban đầu & biện pháp giảm thiểu
- Rủi ro lệch múi giờ / lỗi kết nối Database: Sử dụng Prisma ORM kết hợp biến môi trường (.env) chuẩn hóa và chạy qua Docker Compose để đồng bộ môi trường local và production.
- Rủi ro sai lệch chữ ký VNPay (Checksum): Xây dựng hàm helper chuẩn hóa tham số theo đúng tài liệu kỹ thuật của VNPay và viết Unit Test kỹ lưỡng ở tầng Service.

