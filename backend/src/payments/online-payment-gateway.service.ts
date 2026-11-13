import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as qs from 'qs';

export interface PaymentGatewayResult {
  orderId: number;
  amount: number;
  success: boolean;
  transactionId?: string;
  resultCode?: string;
  message?: string;
}

@Injectable()
export class OnlinePaymentGatewayService {
  private vnpUrl =
    process.env.VNPAY_URL ||
    'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  private returnUrl =
    process.env.VNPAY_RETURN_URL ||
    'http://localhost:3001/payments/vnpay/return';

  async createPaymentUrl(
    orderId: number,
    amount: number,
    ipAddr: string = '127.0.0.1',
  ): Promise<string> {
    const tmnCode = process.env.VNPAY_TMN_CODE || '';
    const hashSecret = process.env.VNPAY_HASH_SECRET || '';
    if (!tmnCode || !hashSecret) {
      throw new BadRequestException(
        'Thiếu cấu hình VNPay. Hãy điền VNPAY_TMN_CODE và VNPAY_HASH_SECRET trong file .env ở thư mục gốc rồi khởi động lại backend.',
      );
    }

    const date = new Date();
    const createDate = this.formatDate(date);
    const txnRef = `${orderId}_${Date.now()}`;

    let vnp_Params: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    vnp_Params = this.sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl =
      this.vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });

    console.log('=== VNPAY DEBUG ===');
    console.log('signData:', signData);
    console.log('paymentUrl:', paymentUrl);

    return paymentUrl;
  }

  verifyVnPayCallback(query: any): PaymentGatewayResult {
    const hashSecret = process.env.VNPAY_HASH_SECRET || '';
    if (!hashSecret) {
      throw new BadRequestException(
        'Thiếu cấu hình VNPay. Hãy điền VNPAY_HASH_SECRET trong file .env ở thư mục gốc rồi khởi động lại backend.',
      );
    }

    const secureHash = query['vnp_SecureHash'];
    delete query['vnp_SecureHash'];
    delete query['vnp_SecureHashType'];

    const sorted = this.sortObject(query);
    const signData = qs.stringify(sorted, { encode: false });
    const hmac = crypto.createHmac('sha512', hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash !== signed) {
      throw new BadRequestException('Chữ ký callback từ VNPay không hợp lệ.');
    }

    const responseCode = String(query['vnp_ResponseCode'] || '');
    const txnRef = String(query['vnp_TxnRef'] || '');
    const amount = Number(query['vnp_Amount'] || 0) / 100;
    const transactionId = String(query['vnp_TransactionNo'] || '');
    const orderId = Number(txnRef.split('_')[0]);

    return {
      orderId,
      amount,
      success: responseCode === '00',
      transactionId,
      resultCode: responseCode,
      message:
        responseCode === '00'
          ? 'Giao dịch thành công'
          : `Giao dịch thất bại (mã ${responseCode})`,
    };
  }

  private sortObject(obj: any) {
    const sorted: any = {};
    const str: string[] = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return (
      date.getFullYear() +
      '' +
      pad(date.getMonth() + 1) +
      '' +
      pad(date.getDate()) +
      '' +
      pad(date.getHours()) +
      '' +
      pad(date.getMinutes()) +
      '' +
      pad(date.getSeconds())
    );
  }
}