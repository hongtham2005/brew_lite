import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../backend/src/app.module';
import { PrismaService } from '../../backend/src/prisma/prisma.service';

describe('BrewLite Integration Tests (Orders & Payments API)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let testProductId: number;
  let createdOrderId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // 0. Update stock nguyên liệu để không bị lỗi thiếu kho
    await prismaService.ingredient.updateMany({
      data: { stock: 10000 },
    });

    // 1. Đăng nhập tài khoản test để lấy Token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'hongthamnguyenle68@gmail.com',
        password: '123456',
      });

    if (loginResponse.status === 200 || loginResponse.status === 201) {
      authToken = loginResponse.body.access_token || loginResponse.body.token;
    }

    // 2. Lấy sản phẩm mẫu từ Database
    const products = await prismaService.product.findMany({ take: 1 });
    if (products.length > 0) {
      testProductId = products[0].id;
    }
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu đơn hàng test trong DB
    if (createdOrderId) {
      try {
        await prismaService.order.delete({ where: { id: createdOrderId } });
      } catch (e) {
        // Bỏ qua nếu đã xóa
      }
    }
    await app.close();
  });

  it('1. [Integration] Kiểm tra kết nối Database và lấy Menu từ Prisma', async () => {
    const productsFromDb = await prismaService.product.findMany();
    expect(Array.isArray(productsFromDb)).toBe(true);

    const response = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    expect(response.body.length).toEqual(productsFromDb.length);
  });

  it('2. [Integration] API Tạo đơn hàng lưu thành công vào Database (POST /orders)', async () => {
    if (!testProductId) {
      console.warn('⚠️ Không tìm thấy sản phẩm trong DB, bỏ qua test tạo đơn.');
      return;
    }

    const orderPayload = {
      items: [
        {
          productId: testProductId,
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
    
    console.log('📦 Status Orders:', response.status);
    console.log('📦 Body Orders:', response.body);
    expect([200, 201]).toContain(response.status);

    if (response.body) {
      createdOrderId = response.body.orderId || response.body.id || response.body._id;
      console.log('🆔 createdOrderId =', createdOrderId);
      
      expect(createdOrderId).toBeDefined();

      // Kiểm tra thực tế trong Database
      const dbOrder = await prismaService.order.findUnique({
        where: { id: createdOrderId },
      });
      expect(dbOrder).not.toBeNull();
    }
  });

  it('3. [Integration] API Thanh toán khởi tạo thành công giao dịch (POST /payments)', async () => {
    if (!createdOrderId) {
      console.warn('⚠️ Không có orderId tích hợp, bỏ qua test thanh toán.');
      return;
    }

    const paymentPayload = {
      orderId: createdOrderId,
      amount: 40000,
      method: 'VNPAY_QR', // Đã sửa chính xác theo đoạn check `if (dto.method !== 'VNPAY_QR')` trong PaymentsService
      bankCode: 'VNPAY',
      idempotencyKey: `test-payment-${Date.now()}-${Math.random()}`,
    };

    const req = request(app.getHttpServer())
      .post('/payments')
      .send(paymentPayload);
      
    if (authToken) {
      req.set('Authorization', `Bearer ${authToken}`);
    }

    const response = await req;
    
    console.log('📦 Status Payments:', response.status);
    console.log('📦 Body Payments:', response.body);

    if (response.status !== 200 && response.status !== 201) {
      console.log('🚨 Lỗi thanh toán Integration:', response.body);
    }

    expect([200, 201]).toContain(response.status);
  });

  it('4. [Negative] Tạo đơn hàng thất bại khi tồn kho nguyên liệu không đủ (400)', async () => {
    // Tạm thời hạ stock của nguyên liệu xuống 0 để kích hoạt cơ chế chặn đơn hàng
    await prismaService.ingredient.updateMany({
      data: { stock: 0 },
    });

    const orderPayload = {
      items: [
        {
          productId: testProductId,
          qty: 5,
          size: 'M',
        },
      ],
    };

    const req = request(app.getHttpServer()).post('/orders').send(orderPayload);
    if (authToken) {
      req.set('Authorization', `Bearer ${authToken}`);
    }

    const response = await req;
    
    expect(response.status).toEqual(400);
    expect(response.body.message).toContain('không đủ');

    // Khôi phục lại stock an toàn cho các test case sau
    await prismaService.ingredient.updateMany({
      data: { stock: 10000 },
    });
  });

  it('5. [Negative] Thanh toán thất bại với phương thức không được hỗ trợ (400)', async () => {
    if (!createdOrderId) {
      console.warn('⚠️ Không có orderId, bỏ qua test.');
      return;
    }

    const paymentPayload = {
      orderId: createdOrderId,
      amount: 40000,
      method: 'CASH_INVALID', // Vi phạm logic kiểm tra phương thức trong PaymentsService (chỉ nhận 'VNPAY_QR')[cite: 6]
      bankCode: 'VNPAY',
      idempotencyKey: `test-invalid-method-${Date.now()}`,
    };

    const req = request(app.getHttpServer())
      .post('/payments')
      .send(paymentPayload);
      
    if (authToken) {
      req.set('Authorization', `Bearer ${authToken}`);
    }

    const response = await req;
    
    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual('Phương thức thanh toán không được hỗ trợ.')
  });

  it('6. [Negative] Chặn truy cập khi gọi API tạo đơn hàng mà thiếu Token xác thực (401)', async () => {
    const orderPayload = {
      items: [
        {
          productId: testProductId,
          qty: 1,
          size: 'M',
        },
      ],
    };

    // Gửi request KHÔNG đính kèm header Authorization
    const response = await request(app.getHttpServer())
      .post('/orders')
      .send(orderPayload);

    // Hệ thống phải trả về lỗi Unauthorized
    expect(response.status).toEqual(401);
  });
});