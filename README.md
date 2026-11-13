# ☕ BrewLite

BrewLite là ứng dụng web đặt đồ uống, thực hiện cho đồ án môn Công nghệ Phần mềm. Luồng chính gồm xem menu, chọn món, đăng nhập, tạo đơn, thanh toán và theo dõi đơn hàng.


## Công nghệ

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** NestJS 10, TypeScript, Prisma 7
- **Database:** PostgreSQL 16
- **Chạy local:** Docker Compose hoặc chạy từng phần
- **Thanh toán:** VNPay sandbox

## Cấu trúc repository

```text
.
├── backend/                 # NestJS API, Prisma schema, migrations, seed, tests
├── frontend/                # Next.js App Router
├── docs/
│   ├── architecture/
│   │   └── adr/             # Architecture Decision Records
│   ├── diagrams/            # Sơ đồ kiến trúc và deployment
│   ├── requirements/        # Context, SRS, use case
│   ├── deployment.md
│   └── traceability-matrix.md
├── docker-compose.yml
├── .env.example
└── README.md
```

## Yêu cầu

- Git
- Node.js 20 trở lên và npm
- Docker Desktop hoặc Docker Engine với Docker Compose v2 nếu chạy PostgreSQL/Docker

## Chạy toàn bộ bằng Docker Compose

Chạy từ thư mục gốc. Tạo `.env` từ file mẫu nếu chưa có:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
docker compose up --build
```

Compose khởi động PostgreSQL, backend và frontend. Backend container hiện chạy `prisma db push` và seed dữ liệu khi khởi động.

| Thành phần | Địa chỉ local |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:3001 |
| API kiểm tra nhanh | http://localhost:3001/ — trả về `BrewLite API is running!` |
| PostgreSQL | `localhost:5432` |

Dừng các service bằng `Ctrl+C` hoặc `docker compose down`. Lệnh `down` giữ lại dữ liệu trong volume `pgdata`; không dùng `docker compose down -v` nếu cần giữ database.

## Chạy từng phần

### 1. Cấu hình và chạy database

Từ thư mục gốc:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
docker compose up -d db
```

### 2. Chạy backend

Mở terminal riêng:

```powershell
cd backend
npm ci
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

Backend chạy tại http://localhost:3001. Prisma đọc `.env` từ thư mục gốc. Hãy để database chạy trước khi migrate hoặc seed.

### 3. Chạy frontend

Mở terminal khác từ thư mục gốc:

```powershell
cd frontend
npm ci
npm run dev
```

Frontend chạy tại http://localhost:3000. Mặc định frontend gọi API ở `http://localhost:3001`. Nếu đổi địa chỉ API, đặt `NEXT_PUBLIC_API_URL` trước khi chạy/build frontend.

### Cấu hình database local

`.env.example` là mẫu cho cấu hình local. Các giá trị mặc định của PostgreSQL là user `brewlite`, database `brewlite`, mật khẩu `password`. Prisma cũng hỗ trợ `DATABASE_URL` để chỉ định URL kết nối đầy đủ.

Seed hiện đang dùng URL local cố định `postgresql://brewlite:password@localhost:5432/brewlite`. Nếu thay user, mật khẩu hoặc tên database, cần cập nhật cấu hình seed tương ứng. Không commit `.env` hoặc secret thật.

Các biến SMTP (`MAIL_*`) dùng để gửi email xác nhận thanh toán. Các biến `VNPAY_*` dùng cho sandbox. Chức năng tương ứng cần credential hợp lệ; giá trị mẫu không dành cho production.

## API hiện có


| Method | Đường dẫn | Mô tả |
|---|---|---|
| `GET` | `/` | Kiểm tra nhanh backend |
| `GET` | `/products` | Danh sách sản phẩm |
| `GET` | `/products/:id` | Chi tiết sản phẩm |
| `POST` | `/auth/register` | Đăng ký |
| `POST` | `/auth/login` | Đăng nhập |
| `GET` | `/auth/me` | Hồ sơ người dùng, cần JWT |
| `POST` | `/orders` | Tạo đơn, cần JWT |
| `GET` | `/orders/me` | Đơn của người dùng, cần JWT |
| `GET` | `/orders/:id` | Chi tiết đơn thuộc người dùng, cần JWT |
| `PATCH` | `/orders/:id/cancel` | Hủy đơn, cần JWT |
| `GET` | `/orders/promo/check?code=BREW10&amount=60000` | Kiểm tra mã khuyến mãi |
| `POST` | `/payments` | Tạo thanh toán, cần JWT |
| `POST` | `/payments/email/confirm` | Xác nhận đơn qua email |
| `GET` | `/payments/vnpay/return` | URL VNPay chuyển người dùng về |
| `POST` | `/payments/vnpay/ipn` | Callback server-to-server của VNPay |

Menu hiện lấy dữ liệu từ API/database. Seed có 4 sản phẩm: Cà phê sữa, Americano, Cappuccino và Trà đào. Khi API không kết nối được, frontend thay bằng danh sách fallback 6 sản phẩm.

## Kiểm tra và build

### Backend

```powershell
cd backend
npm test
npm run test:e2e
npm run build
```

### Frontend

```powershell
cd frontend
npm run lint
npm run build
```


## Tài liệu dự án

- [Context và scope](docs/requirements/context-and-scope.md)
- [Software Requirements Specification](docs/requirements/srs.md)
- [Use case checkout](docs/requirements/usecase-checkout.md)
- [Architecture](docs/architecture/)
  - [ADR](docs/architecture/adr/)
    - [ADR-001: Monorepo structure](docs/architecture/adr/001-monorepo-structure.md)
    - [ADR-002: Next.js App Router](docs/architecture/adr/002-nextjs-app-router.md)
    - [ADR-003: NestJS modular monolith](docs/architecture/adr/003-nestjs-modular-monolith.md)
    - [ADR-004: PostgreSQL và Prisma migrations](docs/architecture/adr/004-postgresql-prisma-migrations.md)
    - [ADR-005: Payment gateway strategy](docs/architecture/adr/005-payment-gateway-strategy.md)
    - [ADR-006: Logging, health và config](docs/architecture/adr/006-operational-logging-health-config.md)
- [Sơ đồ kiến trúc](docs/diagrams/architecture-container.svg)
- [Sơ đồ deployment](docs/diagrams/deployment-production.svg)
- [Ma trận truy vết](docs/traceability-matrix.md)
- [Ghi chú deployment và rollback](docs/deployment.md)

## Phân công thành viên

| Thành viên | Task / tài liệu phụ trách | Phần code phụ trách |
|---|---|---|
| **TV1** | Task 3.1 và 3.2: deployment diagram và [tài liệu deployment](docs/deployment.md); Task 9: cấu trúc repository | Cấu hình Docker Compose; shared components và shared layout frontend |
| **TV2** | Task 1.1: bối cảnh, stakeholder và phạm vi trong [context-and-scope.md](docs/requirements/context-and-scope.md) | Product API (`GET /products`, `GET /products/:id`); seed sản phẩm mẫu |
| **TV3** | Task 1.2: [SRS](docs/requirements/srs.md); Task 1.3: đặc tả use case trọng tâm trong [usecase-checkout.md](docs/requirements/usecase-checkout.md) | Giao diện chi tiết sản phẩm; logic chọn size và topping |
| **TV4** | Task 8.1: [ma trận truy vết](docs/traceability-matrix.md) | Giao diện giỏ hàng; state giỏ hàng bằng Zustand/Context |
| **TV5** | Task 2.2: sequence diagram hoàn chỉnh (`.puml` và `.svg`) | Backend Auth API và JWT; form đăng ký/đăng nhập frontend |
| **TV6** | Task 2.1: activity diagram; Task 2.3: class diagram; Task 3.1: các ADR trong [`docs/architecture/adr/`](docs/architecture/adr/) | Backend Order/Payment, state machine, inventory và loyalty; frontend thanh toán, xác nhận đơn và lịch sử đơn |

## Definition of Done (DoD)

Một task chỉ được đánh dấu **hoàn thành** khi đáp ứng các tiêu chí phù hợp sau:

- [x] Đầu ra hoàn tất theo yêu cầu và tiêu chí chấp nhận; tài liệu hoặc sơ đồ nằm đúng vị trí trong repository.
- [x] Code đã tích hợp, tuân thủ cấu trúc dự án và không chứa secret hoặc cấu hình máy cá nhân.
- [x] Có test phù hợp với thay đổi và các test liên quan chạy qua. Nếu chưa có loại test phù hợp, ghi rõ giới hạn và việc cần làm tiếp.
- [x] Lint, kiểm tra TypeScript và build của phần bị ảnh hưởng đều thành công.
- [x] Đã kiểm tra luồng local khi thay đổi ảnh hưởng đến chức năng hoặc tích hợp frontend/backend/database.
- [x] README, tài liệu kiến trúc, migration và ma trận truy vết được cập nhật khi thay đổi ảnh hưởng đến chúng.
- [x] Thay đổi được thành viên khác review; góp ý quan trọng được xử lý trước khi merge.
- [x] Pull request được merge vào nhánh tích hợp của nhóm và trạng thái task được cập nhật.

## Đóng góp

Tạo branch riêng cho thay đổi, chạy các lệnh kiểm tra phù hợp và ghi rõ cấu hình hoặc migration đi kèm trong pull request.
