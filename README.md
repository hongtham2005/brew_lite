# ☕ BrewLite

Ứng dụng đặt đồ uống mobile-first/PWA — **Assignment 2: Requirements to Deployment**
Môn **Công nghệ Phần mềm** · Khoa CNTT · Đại học Sài Gòn · HK I, 2026–2027

**Luồng nghiệp vụ:** Xem menu → Chọn tùy chọn → Giỏ hàng → Đặt đơn → Thanh toán → Theo dõi đơn

## 🔗 Liên kết

| Thành phần            | URL                                              |
| --------------------- | ------------------------------------------------ |
| Frontend (production) | https://<ten-app-frontend-cua-nhom>.onrender.com |
| API (production)      | https://brewlite-api-jac6.onrender.com           |
| Health check          | https://brewlite-api-jac6.onrender.com/health    |
| Video demo            | <link-google-drive-hoac-youtube-video-demo>      |

## 🧱 Công nghệ

- **Frontend:** Next.js (mobile-first / PWA)
- **Backend:** NestJS (module theo domain)
- **Database:** PostgreSQL (migration + seed)
- **DevOps:** Docker, Docker Compose, GitHub Actions (CI/CD), GHCR, Render (production)

## 📁 Cấu trúc repository

```
brewlite/
├── backend/                 # NestJS + Prisma ORM (API)
├── frontend/                # Next.js mobile-first/PWA (Web)
├── docs/
│   ├── requirements/        # Task 1: context, SRS, use-case
│   ├── diagrams/            # Task 2: activity, sequence, class, deployment (.puml + .svg)
│   ├── architecture/        # Task 3: mô tả kiến trúc + adr/
│   ├── traceability-matrix.md
│   └── deployment.md
├── tests/                   # Integration / E2E
├── .github/workflows/       # ci.yml, cd.yml
├── docker-compose.yml
├── .env.example
└── README.md
```

## 📚 Tài liệu

| Task | Tạo phẩm                            | Vị trí                                                                                 |
| ---- | ----------------------------------- | -------------------------------------------------------------------------------------- |
| 1    | Bối cảnh, stakeholder, phạm vi      | [`docs/requirements/context-and-scope.md`](docs/requirements/context-and-scope.md)     |
| 1    | SRS (FR/NFR, MoSCoW)                | [`docs/requirements/srs.md`](docs/requirements/srs.md)                                 |
| 1    | Đặc tả use-case đặt & thanh toán    | [`docs/requirements/usecase-checkout.md`](docs/requirements/usecase-checkout.md)       |
| 2    | Activity / Sequence / Class diagram | [`docs/diagrams/`](docs/diagrams)                                                      |
| 3.1  | Mô tả kiến trúc                     | [`docs/architecture/architecture.md`](docs/architecture/architecture.md)               |
| 3.1  | ADR-001 … ADR-009                   | [`docs/architecture/adr/`](docs/architecture/adr)                                      |
| 3.1  | Sơ đồ kiến trúc                     | [`docs/diagrams/architecture-container.svg`](docs/diagrams/architecture-container.svg) |
| 3.2  | Deployment diagram                  | [`docs/diagrams/deployment-production.svg`](docs/diagrams/deployment-production.svg)   |
| —    | Ma trận truy vết                    | [`docs/traceability-matrix.md`](docs/traceability-matrix.md)                           |
| —    | Triển khai & rollback               | [`docs/deployment.md`](docs/deployment.md)                                             |

## ✅ Yêu cầu hệ thống

- Node.js ≥ 20, npm ≥ 10
- Docker & Docker Compose v2
- Git

## 🚀 Chạy local

### Cách 1: Docker Compose (khuyến nghị)

```bash
git clone <repo-url> brew_lite && cd brew_lite
cp .env.example .env          # sửa các giá trị cần thiết
docker compose up --build -d
npm --prefix backend ci
npm --prefix backend run prisma:seed   # nạp dữ liệu sản phẩm, nguyên liệu, mã giảm giá
```

- Web: http://localhost:3000
- API: http://localhost:3001
- Health: http://localhost:3001/health

### Cách 2: Chạy từng phần

```bash
# Database
docker compose up -d db

# API (Backend)
cd backend
npm ci
npx prisma generate
npx prisma db push
npm run prisma:seed           # nạp dữ liệu mẫu
npm run start:dev

# Web (terminal khác)
cd apps/web
npm ci
npm run dev
```

## 🧪 Kiểm thử

```bash
# Unit test (Backend)
cd backend && npm test

# Integration test (API tạo đơn/thanh toán)
cd backend && npm run test:integration

# End-to-end test (menu -> xác nhận đơn)
cd backend && npm run test:e2e
```

````

## 🏗️ Build

```bash
cd backend && npm run build
cd frontend && npm run build

# Docker image
docker build -t brewlite-api ./backend
docker build -t brewlite-web ./frontend
````

## 🔄 CI/CD

| Pipeline          | Kích hoạt                | Các bước                                                               |
| ----------------- | ------------------------ | ---------------------------------------------------------------------- |
| **CI** (`ci.yml`) | Mở/cập nhật Pull Request | Install → Lint → Unit Test → Build                                     |
| **CD** (`cd.yml`) | Push tag `vX.Y.Z`        | Lint & Test → Build Docker image → Push registry → Deploy → Smoke test |

- PR **không được merge** nếu lint/test/build thất bại (bật branch protection cho `main`).
- Image được gắn tag bằng commit SHA và version.

## 🚢 Deploy & Rollback

Chi tiết xem [`docs/deployment.md`](docs/deployment.md).

```bash
# Deploy: tạo release tag, CD tự chạy
git tag v1.0.0 && git push origin v1.0.0

# Rollback: Render -> service -> Deploys -> Rollback
# (hoặc deploy lại image tag ổn định trước đó), rồi kiểm tra
curl --fail https://<api-url>/health
```

## 🌿 Quy ước làm việc

Xem [`CONTRIBUTING.md`](CONTRIBUTING.md): chiến lược branch, PR, Conventional Commits, Definition of Done.

## 🔐 Bảo mật

- Không commit `.env`; chỉ commit `.env.example`.
- Secret production nằm trong GitHub Actions secrets / biến môi trường của nền tảng.
- Database production không public trực tiếp.

## 🗓️ Tiến độ

- [x] Task 1 – Khai thác & đặc tả yêu cầu
- [x] Task 2 – Mô hình hóa hệ thống
- [x] Task 3 – Thiết kế kiến trúc (3.1 kiến trúc + ADR, 3.2 deployment diagram)
- [x] Task 4 – Sprint 1 (repo, tài liệu, CI, MVP menu)
- [x] Task 5 – Sprint 2, CI/CD, production, bàn giao

## 👥 Nhóm thực hiện

| MSSV | Họ tên | Vai trò |
| ---- | ------ | ------- |
| ...  | ...    | ...     |

Giảng viên: Từ Lãng Phiêu
