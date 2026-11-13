# BrewLite - Ứng dụng đặt cà phê không dùng tiền mặt

Bài tập lớn môn **Công nghệ Phần mềm** - Khoa CNTT, Đại học Sài Gòn (HK I, 2026-2027).

> BrewLite giúp khách hàng đặt và thanh toán đồ uống không dùng tiền mặt chỉ trong vài chạm, giảm thời gian xếp hàng và nhận đơn nhanh tại quầy.

## Công nghệ

| Thành phần | Công nghệ |
|------------|-----------|
| Frontend   | Next.js (React, TypeScript), TailwindCSS, Zustand |
| Backend    | NestJS (TypeScript), REST, class-validator, JWT (Passport) |
| CSDL       | PostgreSQL + Prisma |
| Thanh toán | VNPay (sandbox, xác minh chữ ký callback) |
| DevOps     | Docker Compose, Git |

## Phân công

| TV  | Chức năng                  | Task     | Thư mục chính |
|-----|----------------------------|----------|---------------|
| TV1 | Infrastructure + Shared    | 1, 9     | `docker-compose.yml`, `backend/prisma/seed.ts`, `frontend/src/components/shared`, `frontend/src/app/layout.tsx` |
| TV2 | Product Catalog            | 2, 3     | `backend/src/products`, `frontend/src/app/menu` |
| TV3 | Product Detail             | 4        | `frontend/src/app/products/[id]` |
| TV4 | Shopping Cart              | 5        | `frontend/src/store`, `frontend/src/app/cart` |
| TV5 | Authentication             | 7        | `backend/src/auth`, `frontend/src/app/(auth)` |
| TV6 | Order + Payment + Advanced | 6, 8, 10 | `backend/src/{orders,payments,inventory,promotions,loyalty}`, `frontend/src/app/{checkout,orders}` |

## Cấu trúc thư mục

```
brewlite/
├── backend/    # NestJS API (products, auth, orders, payments, inventory, promotions, loyalty)
├── frontend/   # Next.js (menu, products/[id], cart, auth, checkout, orders)
├── docs/       # reports (báo cáo từng TV), scrum (backlog, retrospective), diagrams
├── docker-compose.yml
└── .env.example
```

## Chạy nhanh bằng Docker

```bash
Copy-Item .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Cấu hình VNPay sandbox

Thanh toán sử dụng VNPay sandbox. Sau khi VNPay xác nhận giao dịch, backend gửi email có nút **Xác nhận đơn hàng** tới địa chỉ `PAYMENT_CONFIRMATION_EMAIL`; khách bấm nút để hoàn tất.

- Cấu hình `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_URL` và `VNPAY_RETURN_URL` theo thông tin merchant sandbox.
- `PAYMENT_FRONTEND_URL` phải là địa chỉ frontend (mặc định `http://localhost:3000`); `VNPAY_RETURN_URL` là địa chỉ backend nhận trình duyệt quay về (mặc định `http://localhost:3001/payments/vnpay/return`).
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` phải cấu hình SMTP để gửi email xác nhận. Với Gmail, dùng App Password.
- `PAYMENT_CONFIRMATION_EMAIL` là địa chỉ nhận email xác nhận thanh toán; nếu để trống, email được gửi tới địa chỉ tài khoản đặt hàng.
- Để VNPay gửi IPN server-to-server trong môi trường triển khai, backend phải có URL HTTPS công khai.

Các giá trị trong `.env.example` chỉ là ví dụ. Thay credential bằng thông tin merchant sandbox được cấp trong `.env`; không commit credential thật.

## Chạy local (không Docker)

```bash
# Backend
Copy-Item .env.example .env
docker compose up -d db
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run start:dev

# Frontend (terminal khác)
cd frontend
npm install
npm run dev
```

## API chính

| Endpoint | Chức năng |
|----------|-----------|
| GET /products | Danh sách đồ uống (menu) |
| GET /products/:id | Chi tiết một sản phẩm |
| POST /auth/register | Đăng ký |
| POST /auth/login | Đăng nhập, trả JWT |
| POST /orders | Tạo đơn (PENDING) |
| POST /payments | Thanh toán (idempotent, header `Idempotency-Key`) |
| GET /orders/me | Lịch sử đơn |

Trạng thái đơn: `PENDING -> PAID -> PREPARING -> READY -> COMPLETED` (nhánh ngoại lệ: `PAYMENT_FAILED`, `CANCELLED`).

## Quy ước Git

- Nhánh: `main` (ổn định) <- `develop` <- `feature/tvX-<ten-chuc-nang>`
- Commit: `feat(products): add GET /products`, `fix(cart): ...`, `docs(report): ...`
- Mỗi Pull Request cần ít nhất 1 thành viên review.

## Kế hoạch Sprint

| Sprint | Mục tiêu | Task |
|--------|----------|------|
| 1 | Nền tảng & hiển thị menu | 1, 2, 3, 4 |
| 2 | Giỏ hàng, đặt đơn, đăng nhập | 5, 6, 7 |
| 3 | Thanh toán, bàn giao, nghiệp vụ nâng cao | 8, 9, 10 |

## Definition of Done

- Code chạy được, không lỗi build, đúng tiêu chí chấp nhận.
- Commit rõ ràng, được review trong nhóm.
- API có validate đầu vào; UI xử lý loading/lỗi cơ bản.
- Có hướng dẫn chạy trong README.
