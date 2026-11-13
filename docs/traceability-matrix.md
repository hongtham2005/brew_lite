# Ma trận truy vết

| Mã yêu cầu | Use-case/User Story | Thiết kế/Sơ đồ | Code/API | Test |
|---|---|---|---|---|
| FR-01 | US-01 Xem menu | Activity-01, Class-01 | GET /products | API-T01 |
| FR-05 | UC-01 Thanh toán | Sequence-01 | POST /payments | INT-T03 |
| NFR-04 | Khả năng triển khai | Deployment-01, ADR-006, ADR-007 | `.github/workflows/cd.yml`, GET /health | SMOKE-T01 |
| NFR-02 | Bảo mật (JWT, secret) | ADR-004, ADR-008 | `AuthModule`, `JwtAuthGuard` | API-T05 |
