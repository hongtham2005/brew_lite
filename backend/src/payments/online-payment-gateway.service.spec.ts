import { OnlinePaymentGatewayService } from './online-payment-gateway.service';

describe('OnlinePaymentGatewayService', () => {
  const service = new OnlinePaymentGatewayService();
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should create a valid VNPay payment URL', async () => {
    process.env.VNPAY_TMN_CODE = 'OCBGZ8WJ';
    process.env.VNPAY_HASH_SECRET = 'ZSDZWONVURMDODJMZUUEGFMEJEYQGHSK';
    process.env.VNPAY_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    process.env.VNPAY_RETURN_URL = 'http://localhost:3001/payments/vnpay/return';

    const url = await service.createPaymentUrl(42, 12500);

    expect(url).toContain('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
    expect(url).toContain('vnp_TmnCode=OCBGZ8WJ');
    expect(url).toContain('vnp_Amount=1250000'); // 12500 * 100
    expect(url).toContain('vnp_SecureHash=');
  });

  it('should throw error when missing config', async () => {
    process.env.VNPAY_TMN_CODE = '';
    process.env.VNPAY_HASH_SECRET = '';

    await expect(service.createPaymentUrl(42, 12500)).rejects.toThrow(
      'Thiếu cấu hình VNPay. Hãy điền VNPAY_TMN_CODE và VNPAY_HASH_SECRET trong file .env ở thư mục gốc rồi khởi động lại backend.',
    );
  });
});