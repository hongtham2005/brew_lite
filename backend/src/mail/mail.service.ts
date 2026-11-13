import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    const port = Number(process.env.MAIL_PORT) || 587;
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS?.replace(/\s/g, ''),
      },
    });
  }

  async sendUserWelcome(to: string, name: string) {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || '"BrewLite" <no-reply@brewlite.com>',
      to,
      subject: 'Chào mừng đến với BrewLite!',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fafafa">
          <div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #eee">
            <h2 style="color:#8B4513;margin-top:0">Chào mừng đến với BrewLite!</h2>
            <p>Xin chào <strong>${escapeHtml(name)}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại hệ thống đặt đồ uống của chúng tôi.</p>
            <p style="color:#999;font-size:12px">BrewLite Coffee &amp; Tea</p>
          </div>
        </div>
      `,
    });
  }

  async sendOrderConfirmation(
    to: string,
    data: {
      orderId: number;
      total: number;
      pointsEarned: number;
      paymentMethod?: string;
      items?: { name: string; qty: number; lineTotal: number }[];
      confirmationUrl?: string;
    },
  ) {
    const itemsHtml = (data.items || [])
      .map(
        (item) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(item.name)}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.qty}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${item.lineTotal.toLocaleString('vi-VN')} đ</td>
          </tr>
        `,
      )
      .join('');
    const paymentMethod = data.paymentMethod
      ? `<p><strong>Phương thức:</strong> ${escapeHtml(data.paymentMethod)}</p>`
      : '';
    const itemsTable = itemsHtml
      ? `
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px;text-align:left">Món</th>
              <th style="padding:8px;text-align:center">SL</th>
              <th style="padding:8px;text-align:right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
      `
      : '';

    const statusMessage =
      'VNPay đã xác nhận thanh toán đơn hàng của bạn. Bấm nút bên dưới để xác nhận đơn hàng và xem kết quả.';
    const confirmationAction = data.confirmationUrl
      ? `
        <p style="text-align:center;margin:28px 0">
          <a href="${escapeHtml(data.confirmationUrl)}" style="display:inline-block;background:#8B4513;color:#fff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:bold">Xác nhận đơn hàng</a>
        </p>
        <p style="color:#666;font-size:13px">Liên kết xác nhận có hiệu lực trong 7 ngày. Sau khi mở liên kết, BrewLite sẽ tự động xác nhận đơn hàng và hiển thị kết quả.</p>
      `
      : '';

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || '"BrewLite" <no-reply@brewlite.com>',
      to,
      subject: `BrewLite – Vui lòng xác nhận đơn hàng #${data.orderId}`,
      text: `Thanh toán đơn hàng #${data.orderId} đã được VNPay xác nhận. Bấm vào liên kết sau để xác nhận đơn hàng và xem kết quả: ${data.confirmationUrl}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fafafa">
          <div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #eee">
            <h2 style="color:#8B4513;margin-top:0">BrewLite – Xác nhận đơn hàng</h2>
            <p>${statusMessage}</p>
            <p><strong>Mã đơn hàng:</strong> #${data.orderId}</p>
            ${paymentMethod}
            <p><strong>Tổng thanh toán:</strong> <span style="color:#b45309;font-size:18px;font-weight:bold">${data.total.toLocaleString('vi-VN')} đ</span></p>
            <p><strong>Điểm loyalty nhận được:</strong> +${data.pointsEarned} điểm</p>
            ${itemsTable}
            ${confirmationAction}
            <p style="color:#999;font-size:12px">BrewLite Coffee &amp; Tea</p>
          </div>
        </div>
      `,
    });
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}
