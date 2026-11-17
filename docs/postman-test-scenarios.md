# Kịch bản Kiểm thử Chức năng & Hiệu năng (Load Test) bằng Postman

Tệp cấu hình Postman Collection tự động đi kèm: [`docs/BrewLite_API.postman_collection.json`](BrewLite_API.postman_collection.json).

Collection được chia thành **2 thư mục chuyên biệt**:
1. **`1. Functional & E2E Test Suite (TC-01 -> TC-13)`**: Kiểm thử toàn diện luồng nghiệp vụ, bảo mật (`401`), validate dữ liệu (`400`) và chống trùng lặp (`Idempotency`).
2. **`2. Performance & Mass Random Users Load Test (PERF-01 -> PERF-05)`**: Tự động sinh hàng loạt **Random Users + Random Orders** để kiểm thử hiệu năng (`NFR-01: Thời gian phản hồi < 500ms`) và chịu tải Database.

---

## 1. Bảng Kịch bản Kiểm thử Chức năng & Ngoại lệ (`TC-01` $\rightarrow$ `TC-13`)

| Mã TC | Tên kịch bản kiểm thử | Method & Endpoint | Dữ liệu đầu vào (Headers / Body) | Kết quả mong đợi (Expected Result) | Yêu cầu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Kiểm tra trạng thái API & Database | `GET /health` | Không cần Auth | - HTTP `200 OK`, `< 500ms`<br>- `status: "ok"`, `database: "connected"` | `NFR-01`, `NFR-04` |
| **TC-02** | Đăng ký tài khoản ngẫu nhiên | `POST /auth/register` | Body: `{ "username": "{{testUsername}}", "email": "{{testEmail}}", "password": "123456" }` | - HTTP `201 Created`<br>- Trả về `user` đã tạo, ẩn `passwordHash` | `FR-04`, `NFR-02` |
| **TC-03** | Đăng nhập & cấp phát JWT Token | `POST /auth/login` | Body: `{ "email": "{{testEmail}}", "password": "123456" }` | - HTTP `200/201`<br>- Trả về `access_token` (tự lưu vào biến `{{accessToken}}`) | `FR-04`, `NFR-02` |
| **TC-04** | Lấy danh sách Menu & số ly có thể pha | `GET /products` | Không cần Auth | - HTTP `200 OK`, `< 500ms`<br>- Mảng sản phẩm có trường `stock` tính động | `FR-01`, `NFR-01` |
| **TC-05** | Xem chi tiết sản phẩm & công thức | `GET /products/1` | Không cần Auth | - HTTP `200 OK`, `< 500ms`<br>- Trả về sản phẩm `id = 1` kèm mảng `recipes` | `FR-02`, `NFR-01` |
| **TC-06** | Kiểm tra mã giảm giá hợp lệ (`BREW10`) | `GET /orders/promo/check?code=BREW10&amount=90000` | Query: `code=BREW10`, `amount=90000` | - HTTP `200 OK`<br>- Trả về `discountAmount: 9000` (giảm 10%) | `FR-03`, `FR-05` |
| **TC-07** | **[Negative]** Chặn tạo đơn khi thiếu JWT | `POST /orders` | Không truyền Header `Authorization` | - HTTP `401 Unauthorized` | `FR-04`, `NFR-02` |
| **TC-08** | Tạo đơn hàng mới (Trừ kho nguyên liệu & Áp mã giảm giá) | `POST /orders` | Header: `Bearer {{accessToken}}`<br>Body: `2x Cà phê sữa (Size M, Trân châu đen)`, `promoCode: "BREW10"` | - HTTP `201 Created`<br>- `status: "PENDING"`, `total: 81000`<br>- Tự lưu `{{orderId}}` và `{{orderTotal}}` | `FR-05` |
| **TC-09** | Khởi tạo giao dịch VNPay Sandbox (Lần 1) | `POST /payments` | Header: `Bearer {{accessToken}}`<br>Body: `{ "orderId": {{orderId}}, "amount": {{orderTotal}}, "method": "VNPAY_QR", "idempotencyKey": "{{idempotencyKey}}" }` | - HTTP `201 Created`<br>- Sinh ra `paymentUrl` trỏ tới `sandbox.vnpayment.vn` kèm `vnp_SecureHash` | `FR-05` |
| **TC-10** | **[Idempotency]** Gửi lặp lại yêu cầu thanh toán với cùng `idempotencyKey` (Lần 2) | `POST /payments` | Giữ nguyên `idempotencyKey` của `TC-09` | - HTTP `200/201`<br>- `message` chứa `"Idempotent"`<br>- Trả lại đúng `paymentUrl` cũ, không tạo giao dịch mới | `FR-05`, `NFR-02` |
| **TC-11** | **[Negative]** Chặn phương thức thanh toán không hỗ trợ | `POST /payments` | Body: `"method": "CASH_INVALID"` | - HTTP `400 Bad Request`<br>- `message: "Phương thức thanh toán không được hỗ trợ."` | `FR-05` |
| **TC-12** | Xem lịch sử đơn hàng cá nhân | `GET /orders/me` | Header: `Bearer {{accessToken}}` | - HTTP `200 OK`<br>- Danh sách đơn hàng của user có chứa đơn `{{orderId}}` | `FR-06` |
| **TC-13** | Hủy đơn hàng & hoàn trả nguyên liệu vào kho | `PATCH /orders/{{orderId}}/cancel` | Header: `Bearer {{accessToken}}` | - HTTP `200 OK`<br>- `status: "CANCELLED"`, nguyên liệu được cộng hoàn lại vào kho | `FR-06` |

---

## 2. Bảng Kịch bản Tạo hàng loạt Random Users & Kiểm thử Hiệu năng (`PERF-01` $\rightarrow$ `PERF-05`)

Mỗi vòng lặp (Iteration) hoặc mỗi Virtual User chạy thư mục số 2 sẽ tự động sinh **Họ tên ngẫu nhiên, Email ngẫu nhiên, Món nước ngẫu nhiên (`1..4`), Size ngẫu nhiên (`S/M/L`) và Topping ngẫu nhiên**, đồng thời đo ngưỡng thời gian phản hồi theo tiêu chuẩn **`NFR-01 (< 500ms)`**:

| Mã PERF | Tên bước chịu tải | Method & Endpoint | Cơ chế sinh dữ liệu ngẫu nhiên (Pre-request Script) | Ngưỡng hiệu năng kiểm chứng (SLA Assertion) |
| :--- | :--- | :--- | :--- | :--- |
| **PERF-01** | Tự sinh Random User & Đăng ký | `POST /auth/register` | Ghép ngẫu nhiên Họ (`Nguyen, Tran, Le...`) + Tên (`Tuan, Tham, Phuong...`) + `timestamp` + mã 6 chữ số $\rightarrow$ `{{testEmail}}`, `{{testUsername}}` | - HTTP `200/201`<br>- Thời gian băm `bcrypt` (10 rounds) + Insert DB `< 800ms` |
| **PERF-02** | Đăng nhập Random User & Lấy JWT | `POST /auth/login` | Dùng `{{testEmail}}` vừa tạo ở `PERF-01`, tự lưu `{{accessToken}}` | - HTTP `200/201`<br>- Thời gian xác thực & ký JWT `< 500ms` |
| **PERF-03** | Truy xuất Menu dưới tải (`NFR-01`) | `GET /products` | Truy vấn danh sách sản phẩm + tính động `stock` từ bảng `RecipeItem` & `Ingredient` | - HTTP `200 OK`<br>- Thời gian phản hồi **`< 500ms`** (`NFR-01`) |
| **PERF-04** | Đặt đơn hàng ngẫu nhiên (Transaction + OCC) | `POST /orders` | Random `productId` (`1..4`), `size` (`S/M/L`), `topping` (`Trân châu đen, Kem Cheese...`) | - HTTP `201 Created`<br>- Thời gian chạy Transaction trừ kho `< 500ms` |
| **PERF-05** | Khởi tạo link thanh toán VNPay | `POST /payments` | Tự sinh `idempotencyKey` riêng cho đơn hàng vừa đặt, ký `HMAC-SHA512` | - HTTP `200/201`<br>- Thời gian phản hồi `< 500ms` |

---

## 3. Hướng dẫn chạy Tạo hàng loạt Random Users & Đo Performance trên Postman

### Bước 1: Import Collection vào Postman
1. Mở **Postman** $\rightarrow$ Nhấn **Import** (góc trên bên trái).
2. Chọn file **`d:\Projects\SWE\brew_lite\docs\BrewLite_API.postman_collection.json`**.
3. Bạn sẽ thấy 2 thư mục con bên trong Collection:
   - 📁 `1. Functional & E2E Test Suite (TC-01 -> TC-13)`
   - 📁 `2. Performance & Mass Random Users Load Test (PERF-01 -> PERF-05)`

---

### Cách A: Tạo hàng loạt 20 – 100 Random Users & Orders bằng Collection Runner (tab `Functional`)
1. Nhấp chuột phải vào thư mục thứ 2: **`2. Performance & Mass Random Users Load Test (PERF-01 -> PERF-05)`** $\rightarrow$ Chọn **Run folder**.
2. Ở tab **Functional**:
   - Ô **Iterations** (Số lượng User ngẫu nhiên muốn tạo): Nhập **`20`** hoặc **`50`** (ví dụ nhập `50` sẽ tự động tạo ra **50 tài khoản khách hàng ngẫu nhiên + 50 đơn hàng + 50 giao dịch thanh toán** vào Database!).
   - Ô **Delay**: Để `0 ms` (nếu muốn bắn liên tiếp tốc độ tối đa) hoặc `50 ms`.
3. Nhấn nút xanh **Run BrewLite API...**.
4. **Kết quả:**
   - Postman sẽ chạy 50 vòng lặp $\times$ 5 request = **250 requests** kèm thời gian phản hồi (`ms`) của từng request.
   - Mở **Prisma Studio** (`http://localhost:5555`) vào bảng `User`, `Order`, `Payment` bạn sẽ thấy 50 khách hàng và 50 đơn hàng ngẫu nhiên vừa được đổ vào Database, đồng thời cột `stock` và `version` trong bảng `Ingredient` tăng/giảm đúng theo số ly đã đặt!

---

### Cách B: Chạy biểu đồ Load Test / Stress Test thời gian thực (tab `Performance` của Postman)
Nếu bạn muốn lấy **biểu đồ Throughput (Requests/s), Thời gian phản hồi trung bình (Avg / P95 / P99 Response Time) và Error Rate** để đưa vào báo cáo:
1. Nhấp chuột phải vào thư mục **`2. Performance & Mass Random Users Load Test (PERF-01 -> PERF-05)`** $\rightarrow$ Chọn **Run folder**.
2. Chuyển sang tab **Performance** (nằm cạnh tab *Functional* ở bên phải màn hình Runner):
   - **Virtual users** (Số lượng người dùng ảo truy cập đồng thời): Nhập **`10`** hoặc **`20`**.
   - **Test duration**: Chọn **`1 mins`** (hoặc `2 mins`).
   - **Load profile**: Chọn **Fixed** (tải cố định) hoặc **Ramp up** (tăng dần tải).
3. Nhấn nút **Run**.
4. Postman sẽ vẽ **biểu đồ thời gian thực (Real-time Graph)** hiển thị:
   - Tổng số Requests đã gửi, số Requests/giây (`req/s`).
   - Thời gian phản hồi trung bình (`Avg response time < 500ms` đạt chuẩn `NFR-01`).
   - Tỷ lệ lỗi (`Error rate %`).

> **Mẹo khi chạy Load Test số lượng lớn (> 100 đơn):** Trước khi chạy 100 vòng lặp, bạn có thể tăng tồn kho nguyên liệu trong Prisma Studio (bảng `Ingredient`, cột `stock` lên `50000`) hoặc chạy lại `npm --prefix backend run prisma:seed` để kho nguyên liệu luôn dồi dào.
