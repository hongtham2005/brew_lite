# ADR-004: Xác thực bằng JWT (access token), mật khẩu băm bcrypt

- **Trạng thái:** Chấp nhận
- **Ngày:** 2026-11-11

## Quyết định
- Đăng ký/đăng nhập trả về access token JWT (hết hạn 1h), gửi qua header `Authorization: Bearer`.
- Mật khẩu băm bằng bcrypt; không log mật khẩu/token.
- Phân quyền theo vai trò `CUSTOMER`, `STAFF`, `ADMIN` bằng `RolesGuard`.
- `JWT_SECRET` chỉ lấy từ biến môi trường.

## Hệ quả
- (+) Stateless, dễ scale và test.
- (−) Không thu hồi token tức thì; chấp nhận cho MVP (token ngắn hạn). Refresh token để mở rộng sau.
