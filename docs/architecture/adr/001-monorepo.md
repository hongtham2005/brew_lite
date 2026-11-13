# ADR-001: Dùng monorepo (apps/web, apps/api)

- **Trạng thái:** Chấp nhận
- **Ngày:** 2026-11-11

## Bối cảnh
Nhóm cần quản lý frontend, backend, tài liệu, test và CI/CD với lịch sử thay đổi thống nhất; đề yêu cầu cấu trúc `apps/web`, `apps/api`, `docs`.

## Quyết định
Một repository duy nhất. Mỗi app có `package.json` riêng (không dùng workspace tool phức tạp để giảm cấu hình).

## Hệ quả
- (+) Một PR đổi được code + tài liệu + test; dễ truy vết.
- (+) CI/CD tập trung, dùng matrix theo app.
- (−) Pipeline sẽ chậm hơn khi repo lớn (giảm thiểu bằng cache npm và path filter).
