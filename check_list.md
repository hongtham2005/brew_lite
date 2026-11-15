# Checklist Đánh Giá Dự Án BrewLite – Assignment 2 (Requirements to Deployment)

Bảng đánh giá chi tiết mức độ hoàn thành của dự án **BrewLite** hiện tại so với đề bài **Assignment 2 – Requirements to Deployment**, được phân loại theo:

- `[x]` **Đã đạt**: Đã có đầy đủ tạo phẩm/code đáp ứng yêu cầu.
- `[ ]` **Chưa đạt / Đạt một phần (Cần bổ sung hoặc sửa đổi)**: Thiếu file, thiếu nội dung bắt buộc, hoặc mâu thuẫn giữa tài liệu và code thực tế.

---

## 1. Task 1 – Khai thác và đặc tả yêu cầu (2 điểm)

### 1.1 Task 1.1 – Bối cảnh, stakeholder và phạm vi

- [x] **Tệp bắt buộc**: Đã có [`docs/requirements/context-and-scope.md`](docs/requirements/context-and-scope.md).
- [x] **Vấn đề nghiệp vụ BrewLite cần giải quyết**: Đã mô tả rõ (xếp hàng giờ cao điểm, theo dõi đơn, tự động tính điểm loyalty).
- [x] **Bảng 6 stakeholder chính + mục tiêu & kỳ vọng**: Đã có đủ (Khách hàng, Nhân viên quầy, Quản lý cửa hàng, Giảng viên/khách hàng nghiệm thu, Nhóm phát triển, Đơn vị thanh toán).
- [x] **Phạm vi In-scope (MVP), Mở rộng và Out-of-scope**: Đã phân chia rõ ràng.
- [x] **Giả định, ràng buộc và bảng rủi ro ban đầu**: Đã có đầy đủ.

### 1.2 Task 1.2 – Yêu cầu chức năng và phi chức năng (SRS rút gọn)

- [x] **Tài liệu SRS rút gọn**: Đã có tại [`docs/requirements/srs.md`](docs/requirements/srs.md).
- [x] **Yêu cầu chức năng (`FR-01` .. `FR-08`) & phi chức năng (`NFR-01` .. `NFR-04`)**: Đã có đầy đủ các nhóm tối thiểu (menu, chi tiết sản phẩm, giỏ hàng, xác thực, đặt đơn, thanh toán, lịch sử đơn, quản lý trạng thái đơn, hiệu năng, bảo mật, khả dụng, khả năng triển khai).
- [x] **Mức ưu tiên MoSCoW & Tiêu chí chấp nhận**: Đã có cho từng yêu cầu.
- [ ] **Sơ đồ Use-case tổng quát của toàn hệ thống**:
  - **Chưa đạt**: Trong [`docs/requirements/srs.md`](docs/requirements/srs.md) có ghi `Xem docs/diagrams/usecase-overview.puml`, nhưng **file này chưa tồn tại** trong thư mục `docs/diagrams/` (cả file nguồn `.puml` lẫn ảnh `.svg`/`.png`).

### 1.3 Task 1.3 – Đặc tả một use-case trọng tâm

- [x] **Tài liệu đặc tả Use-case (Đặt và thanh toán đơn hàng)**: Đã có tại [`docs/requirements/usecase-checkout.md`](docs/requirements/usecase-checkout.md) với Actor, Trigger, Tiền/Hậu điều kiện, Luồng chính, Luồng thay thế, Luồng ngoại lệ và Liên kết mã yêu cầu (`FR-03`..`FR-06`, `NFR-02`).
- [ ] **Vẽ Use-case diagram cho phạm vi use-case đã chọn**:
  - **Chưa đạt**: Chưa có sơ đồ Use-case diagram trong file [`docs/requirements/usecase-checkout.md`](docs/requirements/usecase-checkout.md) cũng như trong `docs/diagrams/`.
- [ ] **Chi tiết luồng ngoại lệ còn thiếu ý nhỏ**:
  - Trong tiêu đề mục Luồng ngoại lệ (`docs/requirements/usecase-checkout.md`) có liệt kê _(hết hàng, chưa đăng nhập, thanh toán thất bại, gửi lại yêu cầu)_ nhưng phần nội dung `E1`, `E2`, `E3` bên dưới mới mô tả chưa đăng nhập, sản phẩm không hợp lệ và lỗi kết nối VNPay — **chưa viết rõ nhánh hết hàng (out-of-stock) và gửi lại yêu cầu (idempotency)**.

---

## 2. Task 2 – Mô hình hóa hệ thống (2 điểm)

> **Lưu ý bắt buộc của Task 2**: Phải lưu **cả tệp nguồn (`.puml`) và ảnh/PDF kết xuất (`.svg`/`.png`)** trong `docs/diagrams/`, và **3 loại sơ đồ không được mâu thuẫn với SRS, use-case hoặc mô hình dữ liệu**. Hiện tại thư mục `docs/diagrams/` mới chỉ có sơ đồ của Task 3 (`architecture-container` và `deployment`), **thiếu toàn bộ sơ đồ của Task 2**.

### 2.1 Task 2.1 – Activity diagram

- [ ] **File nguồn và ảnh kết xuất Activity Diagram**: **Chưa có** trong `docs/diagrams/` (trong [`docs/traceability-matrix.md`](docs/traceability-matrix.md) có nhắc tới `Activity-01` nhưng chưa có file).
- [ ] **Nội dung bắt buộc trong sơ đồ**: Cần vẽ đủ điểm đầu/cuối, swimlane (User / Hệ thống), decision/merge và đủ 3 trường hợp: **hết hàng**, **chưa đăng nhập**, **thanh toán thất bại**.

### 2.2 Task 2.2 – Sequence diagram

- [ ] **File nguồn và ảnh kết xuất Sequence Diagram** (ví dụ `docs/diagrams/sequence-checkout.puml` và `docs/diagrams/sequence-checkout.svg`): **Chưa có** trong `docs/diagrams/`.
- [ ] **Nội dung bắt buộc trong sơ đồ**:
  - Lifeline tối thiểu: `Customer → Next.js UI → NestJS API → Database → Payment Service`
  - Kiểm tra JWT & validate dữ liệu
  - Transaction tạo đơn & cập nhật tồn kho
  - Nhánh `alt` thanh toán thành công / thất bại
  - Cơ chế `idempotency` khi client gửi lại yêu cầu thanh toán
  - Thông báo kết quả cuối cùng cho người dùng

### 2.3 Task 2.3 – Class diagram

- [ ] **File nguồn và ảnh kết xuất Class Diagram**: **Chưa có** trong `docs/diagrams/`.
- [ ] **Các lớp bắt buộc ở mức domain & sự đồng bộ với Database Schema**:
  - Đề yêu cầu tối thiểu 7 lớp: `User`, `Product`, `Order`, `OrderItem`, `Payment`, `Promotion` và `LoyaltyTransaction` (kèm thuộc tính, quan hệ, multiplicity, enum trạng thái).
  - Trong [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma) hiện tại:
    - Đã có `User`, `Product`, `Order`, `OrderItem`, `Payment`, `PromoCode` (tương ứng `Promotion`), `Ingredient`, `RecipeItem` và enum `OrderStatus`, `Size`.
    - **Thiếu model/lớp `LoyaltyTransaction`** trong `schema.prisma` (mặc dù backend có thư mục `backend/src/loyalty/`, nhưng `User` chỉ lưu `loyaltyPoints Int @default(0)` chứ chưa có bảng/lớp `LoyaltyTransaction` để đồng bộ với Class Diagram).

---

## 3. Task 3 – Thiết kế kiến trúc (2 điểm)

### 3.1 Task 3.1 – Phương pháp và quyết định kiến trúc

- [x] **Tài liệu mô tả kiến trúc**: Đã có [`docs/architecture/architecture.md`](docs/architecture/architecture.md) và sơ đồ container [`docs/diagrams/architecture-container.puml`](docs/diagrams/architecture-container.puml) + [`docs/diagrams/architecture-container.svg`](docs/diagrams/architecture-container.svg).
- [x] **Danh sách ADR trong `docs/architecture/adr/`**: Đã có đầy đủ 9 file ADR từ [`001-monorepo.md`](docs/architecture/adr/001-monorepo.md) đến [`009-nextjs-pwa-client-cart.md`](docs/architecture/adr/009-nextjs-pwa-client-cart.md).
- [ ] **Đồng bộ nội dung kiến trúc / ADR với mã nguồn thực tế (Đạt một phần - có mâu thuẫn)**:
  - **Mâu thuẫn ORM**: [`docs/architecture/architecture.md`](docs/architecture/architecture.md) và [`docs/architecture/adr/003-postgresql-typeorm-migrations.md`](docs/architecture/adr/003-postgresql-typeorm-migrations.md) ghi sử dụng **TypeORM**, nhưng code thực tế trong `backend/` sử dụng **Prisma ORM** ([`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)).
  - **Mâu thuẫn đường dẫn thư mục**: `docs/architecture/architecture.md` và các ADR ghi đường dẫn là `apps/web` và `apps/api`, nhưng repo thực tế đang đặt là `frontend/` và `backend/`.

### 3.2 Task 3.2 – Deployment diagram

- [x] **Có file nguồn và ảnh kết xuất**: Đã có [`docs/diagrams/deployment.puml`](docs/diagrams/deployment.puml) và [`docs/diagrams/UML_Deployment.svg`](docs/diagrams/UML_Deployment.svg).
- [ ] **Đặt tên file và liên kết bị lệch (Broken link)**:
  - Trong [`README.md`](README.md), [`docs/architecture/architecture.md`](docs/architecture/architecture.md) và [`docs/deployment.md`](docs/deployment.md) đều trỏ tới `docs/diagrams/deployment-production.svg`, nhưng tên file thực tế là `UML_Deployment.svg` và `deployment.puml`.
- [ ] **Nội dung bắt buộc trong Deployment Diagram (`docs/diagrams/deployment.puml`)**:
  - [x] Có Client Device (Web Browser/PWA), CI/CD Pipeline, Frontend Hosting, Backend Hosting, PostgreSQL + Persistent Volume, HTTPS/TCP ports, Note về Health Check/Secrets/Logs.
  - [ ] **Thiếu Container Registry (GHCR)** trên sơ đồ `deployment.puml` (dù `cd.yml` và `deployment.md` có dùng GHCR).
  - [ ] **Thiếu ranh giới Local** (đề yêu cầu thể hiện ranh giới giữa **local, CI và production**).
  - [ ] Cổng và đường dẫn trên sơ đồ (`[Port: 3000]`, `/api/health`) đang lệch với thực tế code (`Port: 3001`, `/health`) và `deployment.md` (`HTTP 4000`).

---

## 4. Task 4 – Triển khai Sprint 1 (2 điểm)

### 4.1 Task 4.1 – Thiết lập repository

- [x] **Có `README.md`, `.gitignore`, `.env.example`**: Đã có tại thư mục gốc ([`README.md`](README.md), [`.gitignore`](.gitignore), [`.env.example`](.env.example)).
- [ ] **Cấu trúc thư mục `apps/web`, `apps/api`, `docs`**:
  - **Chưa khớp đề bài**: Đề bài (Mục 6.1 và Mục 9) yêu cầu cấu trúc `apps/web` và `apps/api`. Hiện tại dự án đang dùng `frontend/` và `backend/` (ngay trong [`README.md`](README.md) dòng 95 vẫn còn sót lệnh `cd apps/web`).
- [ ] **Quy ước commit, chiến lược branch/PR và Definition of Done**:
  - **Chưa đạt**: Trong [`README.md`](README.md) dòng 151 có dẫn link tới file `CONTRIBUTING.md`, nhưng **file `CONTRIBUTING.md` chưa tồn tại** trong repo.
- [ ] **Issue board / Product Backlog cho Sprint 1 và Sprint 2**:
  - Cần kiểm tra trên GitHub Projects/Issues của nhóm hoặc bổ sung tài liệu/link backlog vào `README.md`/`docs/`.

### 4.2 Task 4.2 – Quản lý tài liệu

- [x] Tài liệu đặt trong thư mục `docs/` có quản lý qua Git.
- [ ] Cần đảm bảo các thay đổi tài liệu đi qua Pull Request và có commit message rõ lý do (một số commit gần đây như `fix CD`, `fix CD_1`, `xong 5.3`, `chinh sua README.md` chưa theo chuẩn Conventional Commits).

### 4.3 Task 4.3 – MVP Sprint 1

- [x] **API `GET /products` và `GET /products/:id`**: Đã hiện thực trong [`backend/src/products/products.controller.ts`](backend/src/products/products.controller.ts).
- [x] **Màn hình menu mobile-first bằng Next.js**: Đã có tại [`frontend/src/app/menu/page.tsx`](frontend/src/app/menu/page.tsx) và [`frontend/src/components/menu/ProductGrid.tsx`](frontend/src/components/menu/ProductGrid.tsx).
- [x] **Trạng thái loading, empty và error**: Đã có trong `frontend/src/app/loading.tsx`, `error.tsx`, và xử lý trong `menu/page.tsx` / `ProductGrid.tsx`.
- [x] **Dữ liệu mẫu / database seed**: Đã có tại [`backend/prisma/seed.ts`](backend/prisma/seed.ts).
- [ ] **Kiểm thử tối thiểu cho API và component/luồng chính**:
  - Backend đã có unit test ([`backend/src/products/products.service.spec.ts`](backend/src/products/products.service.spec.ts)).
  - **Frontend chưa có bất kỳ file test hay script test nào** (trong [`.github/workflows/ci.yml`](.github/workflows/ci.yml) đang comment bỏ qua bước test của frontend).

### 4.4 Task 4.4 – Continuous Integration

- [x] **Pipeline CI (`Install → Lint → Unit Test → Build`)**: Đã thiết lập tại [`.github/workflows/ci.yml`](.github/workflows/ci.yml) chạy khi mở PR vào `main`, `master`, `develop`.
- [ ] **Frontend Unit Test trong CI**: Đang bị comment trong `.github/workflows/ci.yml`.
- [ ] **Minh chứng bắt buộc**: Cần chuẩn bị (trong báo cáo/README/docs) link PR đã chạy CI, ảnh chụp hoặc log của **1 lần pipeline thành công** và **1 lần pipeline phát hiện lỗi**, đồng thời bật Branch Protection trên GitHub.

---

## 5. Task 5 – Triển khai Sprint 2, CI/CD và Delivery (2 điểm)

### 5.1 Task 5.1 – Hoàn thiện MVP

- [x] **Chi tiết sản phẩm, size và topping**: Đã có tại [`frontend/src/app/products/[id]/page.tsx`](frontend/src/app/products/[id]/page.tsx).
- [x] **Giỏ hàng và tính tổng tiền**: Đã có tại [`frontend/src/stores/cartStore.ts`](frontend/src/stores/cartStore.ts) và [`frontend/src/app/cart/page.tsx`](frontend/src/app/cart/page.tsx).
- [x] **Đăng ký, đăng nhập và JWT**: Đã có ở cả Backend (`backend/src/auth/`) và Frontend (`frontend/src/app/(auth)/`).
- [x] **Tạo đơn hàng**: Đã có tại `backend/src/orders/` và `frontend/src/app/checkout/page.tsx`.
- [x] **Thanh toán Ví/Thẻ mô phỏng (VNPay / Mock + Email confirmation)**: Đã có tại `backend/src/payments/` và `frontend/src/app/payment-confirmation/page.tsx`.
- [x] **Xác nhận, trạng thái và lịch sử đơn**: Đã có tại [`frontend/src/app/orders/page.tsx`](frontend/src/app/orders/page.tsx) và `orders.controller.ts`.
- [x] **Xử lý lỗi và validate ở cả frontend/backend**: Đã dùng `ValidationPipe`, `class-validator` DTO và `HttpExceptionFilter`.
- [ ] **Tính năng PWA (Progressive Web App)**:
  - Đề bài và [`docs/architecture/architecture.md`](docs/architecture/architecture.md) yêu cầu Next.js theo hướng mobile-first/PWA (`manifest.json`, Service Worker), nhưng trong `frontend/public/` hoặc `frontend/src/app/` **chưa có `manifest.json` / `manifest.ts` và Service Worker**.

### 5.2 Task 5.2 – Tích hợp và kiểm thử

- [x] **Unit test cho nghiệp vụ quan trọng**: Đã có 6 file `.spec.ts` trong `backend/src/` (`auth`, `products`, `orders`, `inventory.concurrency`, `payments.idempotency`, `payments.email-confirmation`, `online-payment-gateway`).
- [x] **Integration test cho API tạo đơn/thanh toán**: Đã có tại [`tests/integration/order-payment.integration-spec.ts`](tests/integration/order-payment.integration-spec.ts).
- [x] **End-to-end test cho luồng từ menu đến xác nhận đơn**: Đã có tại [`tests/e2e/app.e2e-spec.ts`](tests/e2e/app.e2e-spec.ts).
- [x] **Migration/seed có thể tái tạo database**: Đã có thư mục `backend/prisma/migrations/` và `backend/prisma/seed.ts`.
- [x] **`docker-compose.yml` chạy web, API và database ở local**: Đã có tại [`docker-compose.yml`](docker-compose.yml).
- [x] **Health endpoint (`GET /health`)**: Đã có tại [`backend/src/app.controller.ts`](backend/src/app.controller.ts).

### 5.3 Task 5.3 – Continuous Delivery/Deployment

- [x] **File workflow CD**: Đã có tại [`.github/workflows/cd.yml`](.github/workflows/cd.yml).
- [ ] **Các điểm chưa đạt trong `cd.yml` cần khắc phục**:
  1. **Quality Gate thiếu bước chạy Test**: Trong `.github/workflows/cd.yml`, job `quality-gate` mới chỉ chạy `lint` và `build`, **chưa có bước chạy `npm test`** (đề bài mục 7.3 ý 1 bắt buộc: _chạy quality gate: lint, test và build_).
  2. **Chỉ mới build/push Docker image cho Backend, thiếu Frontend**: `cd.yml` hiện chỉ đóng gói `./backend/Dockerfile` và chưa kiểm tra/build frontend.
  3. **Migration an toàn**: Trong [`backend/Dockerfile`](backend/Dockerfile) dòng cuối đang dùng `npx prisma db push` thay vì `npx prisma migrate deploy` (dùng `db push` trên production có rủi ro mất dữ liệu hoặc không bám sát lịch sử file migration).
  4. **Cơ chế thông báo/hướng dẫn rollback tự động trong pipeline**: Khi smoke test thất bại ở cuối `cd.yml`, nên in rõ hướng dẫn/lệnh rollback trong log CI theo yêu cầu ý 7 mục 7.3.

### 5.4 Task 5.4 – Triển khai và bàn giao

- [x] **URL API và health check production**: Đã điền trong [`README.md`](README.md) (`https://brewlite-api-jac6.onrender.com` và `/health`).
- [x] **README hướng dẫn chạy local, test, build, deploy và rollback**: Đã có trong [`README.md`](README.md) và [`docs/deployment.md`](docs/deployment.md).
- [ ] **URL Frontend production**:
  - **Chưa đạt**: Trong [`README.md`](README.md) dòng 12 vẫn đang để placeholder `https://<ten-app-frontend-cua-nhom>.onrender.com`. _(Lưu ý đề bài: "Nếu không có URL production hoạt động tại thời điểm chấm, phần triển khai của Task 5 không được tính là hoàn thành")_.
- [ ] **Secret không xuất hiện trong repository**:
  - **Cảnh báo**: File [`note`](note) và [`.env.example`](.env.example) đang chứa trực tiếp `VNPAY_TMN_CODE=OCBGZ8WJ` và `VNPAY_HASH_SECRET=ZSDZWONVURMDODJMZUUEGFMEJEYQGHSK`, đồng thời có các file rác như `backend/npm`, `backend/package.json.before-repair`, `backend/package-lock.json.before-repair` và `backend/src/generated/prisma/` đang được track trong Git. Nên dọn dẹp và thay secret trong `.env.example` bằng placeholder.
- [ ] **Release / Tag phiên bản và Release Notes**:
  - **Chưa có**: Kiểm tra `git tag` hiện tại chưa có tag nào (ví dụ `v1.0.0`) và chưa có tài liệu/mục Release Notes.
- [ ] **Video/demo trực tiếp luồng end-to-end**:
  - **Chưa có**: Trong [`README.md`](README.md) dòng 15 vẫn đang là placeholder `<link-google-drive-hoac-youtube-video-demo>`.
- [ ] **Sprint Review và Sprint Retrospective**:
  - **Chưa có**: Chưa có tài liệu ghi nhận Sprint Review & Sprint Retrospective cho Sprint 1 và Sprint 2 trong `docs/` hoặc `README.md`.
- [ ] **Thông tin thành viên nhóm**:
  - Bảng Nhóm thực hiện ở cuối [`README.md`](README.md) vẫn đang để `... | ... | ...`.

---

## 6. Mục 8 – Truy vết bắt buộc (`docs/traceability-matrix.md`)

- [x] **Đã có file [`docs/traceability-matrix.md`](docs/traceability-matrix.md)** đúng cấu trúc 5 cột của đề bài.
- [ ] **Nội dung ma trận truy vết còn sơ sài và chưa khớp thực tế**:
  - Hiện tại bảng chỉ mới liệt kê **4 dòng** (`FR-01`, `FR-05`, `NFR-04`, `NFR-02`), trong khi [`docs/requirements/srs.md`](docs/requirements/srs.md) có tới **8 FR (`FR-01`..`FR-08`) và 4 NFR (`NFR-01`..`NFR-04`)**.
  - Các mã sơ đồ trong bảng (`Activity-01`, `Class-01`, `Sequence-01`) chưa có file thực tế tương ứng trong `docs/diagrams/`.

---

## 7. Tổng hợp Checklist nộp bài cuối cùng (Mục 9.1 của đề)

| Trạng thái | Hạng mục theo Checklist 9.1                             | Đánh giá nhanh & Việc cần làm ngay                                                                                                                                                                                                                      |
| :--------: | :------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|   `[ ]`    | **1. Link repository và quyền truy cập cho giảng viên** | Bổ sung thông tin MSSV/Họ tên nhóm vào `README.md`, thêm `CONTRIBUTING.md`, dọn file rác (`note`, `*.before-repair`).                                                                                                                                   |
|   `[ ]`    | **2. SRS, đặc tả use-case và ma trận truy vết**         | Vẽ bổ sung sơ đồ Use-case tổng quát (`usecase-overview.puml` + `.svg`), Use-case checkout diagram, và điền đủ `FR-01`..`FR-08`, `NFR-01`..`NFR-04` vào `traceability-matrix.md`.                                                                        |
|   `[ ]`    | **3. Activity, sequence, class và deployment diagram**  | **Quan trọng nhất:** Bổ sung 3 sơ đồ Task 2 (`activity`, `sequence-checkout`, `class`) gồm cả `.puml` + `.svg`. Sửa lại `deployment.puml` (thêm GHCR, Local boundary) và xuất ra `deployment-production.svg`. Đồng bộ `ADR-003` từ TypeORM sang Prisma. |
|   `[x]`    | **4. Source code frontend, backend và migration**       | Đã hoàn thiện tốt. (Tuỳ chọn: bổ sung `manifest.json` cho PWA, thêm model `LoyaltyTransaction`, và cân nhắc đổi tên hoặc tạo symlink/cập nhật docs giữa `frontend/backend` và `apps/web`, `apps/api`).                                                  |
|   `[x]`    | **5. Unit, integration và end-to-end test**             | Đã có đủ 3 cấp độ test ở `backend/` và `tests/`. (Nên thêm ít nhất 1 test ở `frontend/` để bật step test trong `ci.yml`).                                                                                                                               |
|   `[ ]`    | **6. Pipeline CI/CD chạy thành công**                   | Thêm bước chạy `npm test` vào `quality-gate` của `cd.yml`, bổ sung minh chứng CI pass/fail PR.                                                                                                                                                          |
|   `[ ]`    | **7. URL production, API và health check**              | Đã có URL API & Health check; **cần deploy Frontend lên Render/Vercel và điền URL thực tế vào `README.md`**.                                                                                                                                            |
|   `[ ]`    | **8. Release notes, README và hướng dẫn rollback**      | Đã có README và hướng dẫn rollback; **cần tạo Git tag `v1.0.0` và viết Release Notes**.                                                                                                                                                                 |
|   `[ ]`    | **9. Video/demo và Sprint Retrospective**               | **Cần bổ sung** tài liệu Sprint Review & Retrospective và điền link Video Demo vào `README.md`.                                                                                                                                                         |
