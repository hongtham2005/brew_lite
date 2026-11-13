# Triển khai & Rollback (Task 3.2 / 5.4)

Sơ đồ: [`diagrams/deployment-production.svg`](diagrams/deployment-production.svg) (nguồn `.puml` cùng thư mục).

## 1. Nền tảng
| Thành phần | Dịch vụ | Ghi chú |
|---|---|---|
| Web (Next.js) | Render Web Service `brewlite-web` (Docker image) | Qua Render Edge: TLS + CDN cho asset tĩnh |
| API (NestJS) | Render Web Service `brewlite-api` (Docker image) | Health check path: `/health` |
| Database | Render PostgreSQL 16 | Persistent disk, chỉ dùng Internal URL |
| Registry | GitHub Container Registry (GHCR) | `ghcr.io/<org>/brewlite-api`, `brewlite-web` |
| CI/CD | GitHub Actions | `ci.yml` (PR), `cd.yml` (tag `v*.*.*`) |

> Nếu nhóm đổi nền tảng, phải cập nhật diagram, tài liệu này và ADR-006.

## 2. Cổng và giao thức
| Kết nối | Giao thức / cổng |
|---|---|
| Người dùng → Render Edge | HTTPS 443 |
| Edge → web | HTTP 3000 (mạng nội bộ) |
| Edge → api | HTTP 4000 (mạng nội bộ) |
| api → PostgreSQL | TCP 5432 (private network, TLS) |
| CI → GHCR / Render deploy hook | HTTPS 443 |

## 3. Biến môi trường và secret
| Biến | Nơi lưu | Dùng bởi |
|---|---|---|
| `DATABASE_URL` (Internal URL) | Render env (secret) | api |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Render env (secret) | api |
| `CORS_ORIGIN` | Render env | api |
| `PAYMENT_MOCK_MODE` | Render env | api |
| `NEXT_PUBLIC_API_URL` | Build arg/Render env | web |
| `RENDER_DEPLOY_HOOK_API`, `RENDER_DEPLOY_HOOK_WEB` | GitHub Actions secrets | cd.yml |
| `PROD_API_URL` | GitHub Actions secrets | cd.yml (smoke test) |

Không commit secret; không `echo` secret trong log CI.

## 4. Thiết lập lần đầu (một lần)
1. Tạo Render PostgreSQL; chép **Internal Database URL**.
2. Tạo hai Web Service kiểu *Existing image* trỏ tới GHCR (thêm registry credential nếu image private).
3. Đặt biến môi trường theo mục 3; đặt Health Check Path của API là `/health`.
4. Lấy **Deploy Hook URL** của từng service → lưu vào GitHub Actions secrets.
5. Tạo environment `production` trong GitHub (tuỳ chọn: bật required reviewer).

## 5. Quy trình deploy
1. Merge vào `main` qua PR (CI xanh).
2. `git tag vX.Y.Z && git push origin vX.Y.Z`.
3. `cd.yml`: lint/test/build → build image (tag `sha` và `vX.Y.Z`) → push GHCR → gọi deploy hook với `?imgURL=<image:sha>` → smoke test `GET /health`.
4. Migration chạy khi container API khởi động (ADR-007). Migration lỗi → container không lên, Render giữ bản cũ.
5. Smoke test lỗi → pipeline dừng ở trạng thái failed.

## 6. Rollback
1. Mở Render → service → *Deploys* → chọn deploy trước → *Rollback*; **hoặc** chạy lại workflow `cd` với tag ổn định trước đó (deploy hook với image tag cũ).
2. Kiểm tra: `curl --fail https://<api-url>/health`.
3. Schema tương thích ngược nhờ expand/contract; chỉ khi bắt buộc mới chạy `migration:revert` thủ công.
4. Ghi sự cố vào release notes / Sprint Retrospective.
