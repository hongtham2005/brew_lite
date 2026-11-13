import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

@Injectable()
export class MockPaymentGatewayService {
  constructor(private mailService: MailService) {}

  // 1. Cổng thanh toán nhận yêu cầu tạo giao dịch từ BrewLite
  async initiatePayment(data: { 
    orderId: number; 
    amount: number; 
    email: string; 
    customerName?: string; 
    items?: Array<{ name: string; size: string; qty: number; topping?: string }> 
  }) {
    console.log(`[MockPaymentGateway] Nhận yêu cầu thanh toán đơn hàng #${data.orderId} - Số tiền: ${data.amount}`);

    // Bên thứ 3 đứng ra gửi email xác nhận chi tiết cho khách hàng
    await this.sendGatewayEmail(
      data.email, 
      data.orderId, 
      data.amount, 
      data.customerName || 'Khách hàng', 
      data.items || []
    );

    return {
      success: true,
      message: 'Cổng thanh toán đã tiếp nhận và gửi email xác nhận cho khách hàng.',
    };
  }

  // 2. Gửi email chứa link xác nhận của bên thứ 3 kèm thông tin chi tiết đơn hàng
  private async sendGatewayEmail(
    to: string, 
    orderId: number, 
    amount: number, 
    customerName: string,
    items: Array<{ name: string; size: string; qty: number; topping?: string }>
  ) {
    const gatewayConfirmUrl = `http://localhost:3001/payments/gateway/confirm?orderId=${orderId}&amount=${amount}`;

    // Render danh sách món thành các thẻ HTML `<li>`
    const itemsHtml = items.length > 0 
      ? items.map(i => `<li><b>${i.qty}x</b> ${i.name} <span style="color:#666;">(Size: ${i.size})</span> ${i.topping ? `<br/><small style="color:#888;">Topping: ${i.topping}</small>` : ''}</li>`).join('')
      : '<li>Đơn hàng trực tuyến</li>';

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fafafa">
        <div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #eee;text-align:left">
          <h3 style="color:#2563eb;margin-top:0;text-align:center">🔒 Cổng thanh toán MockPay (Bên thứ 3)</h3>
          
          <div style="background:#f3f4f6;padding:14px;border-radius:8px;margin-bottom:16px;">
            <p style="margin:0 0 6px 0;font-size:13px;color:#374151;"><strong>👤 Khách hàng:</strong> ${customerName}</p>
            <p style="margin:0 0 6px 0;font-size:13px;color:#374151;"><strong>📦 Mã đơn hàng:</strong> #${orderId}</p>
            <p style="margin:0;font-size:13px;color:#374151;"><strong>💰 Tổng tiền:</strong> <span style="color:#b45309;font-weight:bold">${amount.toLocaleString('vi-VN')} đ</span></p>
          </div>

          <div style="margin-bottom:16px;">
            <p style="margin:0 0 6px 0;font-size:13px;font-weight:bold;color:#374151;">Chi tiết đồ uống:</p>
            <ul style="margin:0;padding-left:18px;font-size:13px;color:#4b5563;line-height:1.5;">
              ${itemsHtml}
            </ul>
          </div>

          <p style="font-size:13px;text-align:center;margin-top:20px;">Vui lòng bấm vào nút dưới đây để xác nhận giao dịch thành công qua cổng thanh toán:</p>
          
          <div style="margin:24px 0;text-align:center">
            <a href="${gatewayConfirmUrl}" style="background:#2563eb;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;font-size:15px;">
              ✓ Xác nhận đã thanh toán tiền
            </a>
          </div>
          
          <p style="color:#666;font-size:11px;text-align:center;margin-bottom:0">Hệ thống thanh toán giả lập bảo mật.</p>
        </div>
      </div>
    `;

    await (this.mailService as any).transporter.sendMail({
      from: '"MockPay Gateway" <gateway@brewlite.com>',
      to,
      subject: `[MockPay] Xác nhận thanh toán đơn hàng #${orderId}`,
      html,
    });
  }

  // 3. Sau khi khách bấm xác nhận trên email, Bên thứ 3 gửi Webhook về cho BrewLite
  async sendWebhookToBrewLite(orderId: number, amount: number) {
    console.log(`[MockPaymentGateway] Đang bắn Webhook báo cáo kết quả về server BrewLite cho đơn hàng #${orderId}...`);

    try {
      const response = await fetch('http://localhost:3001/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: Number(orderId),
          amount: Number(amount),
          status: 'SUCCESS',
          gatewaySignature: 'mock-sig-secure-key',
        }),
      });

      const result = await response.json();
      console.log('[MockPaymentGateway] BrewLite đã phản hồi Webhook:', result);
      return result;
    } catch (error) {
      console.error('[MockPaymentGateway] Lỗi gọi Webhook về BrewLite:', error);
      throw error;
    }
  }
}