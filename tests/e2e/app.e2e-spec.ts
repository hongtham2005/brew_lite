import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../backend/src/app.module';

describe('BrewLite E2E Business Flow (Menu -> Order -> Payment -> Confirmation)', () => {
  let app: INestApplication;
  let sampleProductId: number;
  let createdOrderId: number;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('0. [Auth] Đăng nhập tài khoản test để lấy Token (POST /auth/login)', async () => {
    const loginPayload = {
      email: 'hongthamnguyenle68@gmail.com',
      password: '123456',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginPayload);

    if (response.status === 200 || response.status === 201) {
      authToken = response.body.access_token || response.body.token;
    }
  });

  it('1. [Menu] Lấy danh sách sản phẩm từ menu (GET /products)', async () => {
    const response = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    if (response.body.length > 0) {
      sampleProductId = response.body[0]?.id || response.body[0]?._id;
    }
  });

  it('2. [Order] Gửi yêu cầu tạo đơn hàng mới có đính kèm Token (POST /orders)', async () => {
    if (!sampleProductId) {
      console.warn('⚠️ Không tìm thấy sản phẩm mẫu trong DB, bỏ qua bước tạo đơn.');
      return;
    }

    const orderPayload = {
      items: [
        {
          productId: sampleProductId,
          qty: 1,
          size: 'M',
        },
      ],
    };

    const req = request(app.getHttpServer()).post('/orders').send(orderPayload);
    if (authToken) {
      req.set('Authorization', `Bearer ${authToken}`);
    }

    const response = await req;
    
    if (response.status !== 201 && response.status !== 200) {
      console.log('🚨 Lỗi phản hồi từ API Orders:', response.body);
    }

    expect([200, 201]).toContain(response.status);
    
    if (response.body) {
      // 🌟 SỬA ĐÚNG: Lấy orderId theo cấu trúc thực tế trả về của backend
      createdOrderId = response.body.orderId || response.body.id || response.body._id;
    }
    
    expect(createdOrderId).toBeDefined();
  });

  it('3. [Payment] Khởi tạo giao dịch thanh toán VNPay Sandbox (POST /payments)', async () => {
    if (!createdOrderId) {
      console.warn('⚠️ Không có orderId hợp lệ, bỏ qua bước thanh toán.');
      return;
    }

    const paymentPayload = {
      orderId: createdOrderId,
      amount: 40000,
      method: 'VNPAY_QR', // 🌟 Bổ sung bắt buộc theo DTO và PaymentsService
      bankCode: 'VNPAY',
      idempotencyKey: `e2e-payment-${Date.now()}-${Math.random()}`, // 🌟 Bổ sung chống trùng lặp
    };

    const req = request(app.getHttpServer()).post('/payments').send(paymentPayload);
    if (authToken) {
      req.set('Authorization', `Bearer ${authToken}`);
    }

    const response = await req;

    if (response.status !== 201 && response.status !== 200) {
      console.log('🚨 Lỗi phản hồi từ API Payments:', response.body);
    }

    expect([200, 201]).toContain(response.status);
  });

  it('4. [Confirmation] Kiểm tra thông tin chi tiết đơn hàng (GET /orders/:id)', async () => {
    if (!createdOrderId) {
      return;
    }

    const req = request(app.getHttpServer()).get(`/orders/${createdOrderId}`);
    if (authToken) {
      req.set('Authorization', `Bearer ${authToken}`);
    }

    const response = await req.expect(200);
    expect(response.body).toBeDefined();
  });
});