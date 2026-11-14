import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { MailService } from '../mail/mail.service';
import {
  OnlinePaymentGatewayService,
  PaymentGatewayResult,
} from './online-payment-gateway.service';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private paymentGateway: OnlinePaymentGatewayService,
    private loyaltyService: LoyaltyService,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}

  async processPayment(dto: CreatePaymentDto, userId: number) {
    if (dto.method !== 'VNPAY_QR') {
      throw new BadRequestException(
        'Phương thức thanh toán không được hỗ trợ.',
      );
    }

    // 1. Kiểm tra Idempotency Key
    const existingPayment = await this.prisma.payment.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
      include: { order: true },
    });

    if (existingPayment) {
      if (existingPayment.order?.userId !== userId) {
        throw new NotFoundException(
          `Không tìm thấy đơn hàng với ID: ${dto.orderId}`,
        );
      }

      if (
        existingPayment.orderId !== dto.orderId ||
        existingPayment.method !== dto.method ||
        existingPayment.amount !== dto.amount
      ) {
        throw new ConflictException(
          'Idempotency key đã được sử dụng cho yêu cầu thanh toán khác.',
        );
      }

      return {
        message: 'Giao dịch đã được xử lý trước đó (Idempotent)',
        orderId: existingPayment.orderId,
        status: existingPayment.order?.status || 'PAID',
        payment: existingPayment,
        paymentUrl: existingPayment.paymentUrl,
      };
    }

    // 2. Tìm đơn hàng
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { user: true },
    });

    if (!order) {
      throw new NotFoundException(
        `Không tìm thấy đơn hàng với ID: ${dto.orderId}`,
      );
    }

    if (order.userId !== userId) {
      throw new NotFoundException(
        `Không tìm thấy đơn hàng với ID: ${dto.orderId}`,
      );
    }


    const orderTotal = Number(order.total);
    console.log("So sánh tiền:", { guiLen: dto.amount, trongDB: orderTotal });
    if (!Number.isSafeInteger(orderTotal) || dto.amount !== orderTotal) {
      throw new BadRequestException(
        'Số tiền thanh toán không khớp với tổng tiền đơn hàng.',
      );
    }

    // 3. Cập nhật tên khách nếu có
    if (dto.customerName) {
      await this.prisma.order.update({
        where: { id: dto.orderId },
        data: { customerName: dto.customerName.trim() },
      });
    }

    // 4. Kiểm tra xem đơn đã có payment chưa
    const existingOrderPayment = await this.prisma.payment.findUnique({
      where: { orderId: dto.orderId },
    });

    if (existingOrderPayment) {
      if (
        existingOrderPayment.method === dto.method &&
        existingOrderPayment.status === 'PENDING' &&
        existingOrderPayment.paymentUrl
      ) {
        return {
          message: 'Giao dịch thanh toán đang chờ hoàn tất.',
          orderId: dto.orderId,
          status: 'PENDING',
          paymentUrl: existingOrderPayment.paymentUrl,
        };
      }

      throw new ConflictException(
        'Đơn hàng đã có giao dịch thanh toán. Vui lòng tạo đơn hàng mới nếu giao dịch trước đó thất bại.',
      );
    }

    const paymentUrl = await this.paymentGateway.createPaymentUrl(
      dto.orderId,
      order.total,
    );

    const payment = await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        amount: order.total,
        method: dto.method,
        idempotencyKey: dto.idempotencyKey,
        status: 'PENDING',
        paymentUrl,
      },
    });

    return {
      message: 'Đã tạo giao dịch VNPay. Đang chuyển đến cổng thanh toán.',
      orderId: dto.orderId,
      status: 'PENDING',
      paymentUrl,
      payment,
    };
  }

  async processGatewayResult(result: PaymentGatewayResult) {
    const order = await this.prisma.order.findUnique({
      where: { id: result.orderId },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng.');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { orderId: result.orderId },
    });

    if (
      !payment ||
      payment.method !== 'VNPAY_QR' ||
      payment.amount !== result.amount
    ) {
      throw new BadRequestException(
        'Giao dịch không khớp với đơn hàng hoặc phương thức thanh toán.',
      );
    }

    if (payment.status === 'SUCCESS') {
      const emailStatus = await this.sendConfirmationEmailIfNeeded(order, payment);
      return {
        success: true,
        alreadyProcessed: true,
        confirmationEmailSent: emailStatus === 'sent',
        confirmationEmailPending: emailStatus === 'pending',
      };
    }

    // Thanh toán thất bại
    if (!result.success) {
      const processed = await this.prisma.$transaction(async (tx) => {
        const transition = await tx.payment.updateMany({
          where: { orderId: result.orderId, status: 'PENDING' },
          data: { status: 'FAILED' },
        });

        if (transition.count === 0) return false;

        await tx.order.update({
          where: { id: result.orderId },
          data: { status: 'PAYMENT_FAILED' },
        });

        return true;
      });

      return {
        success: false,
        alreadyProcessed: !processed,
        confirmationEmailSent: false,
        confirmationEmailPending: false,
      };
    }

    // Thanh toán thành công
    const processed = await this.prisma.$transaction(async (tx) => {
      const transition = await tx.payment.updateMany({
        where: { orderId: result.orderId, status: 'PENDING' },
        data: {
          status: 'SUCCESS',
          transactionId: result.transactionId
            ? String(result.transactionId)
            : undefined,
        },
      });

      if (transition.count === 0) return false;

      await tx.order.update({
        where: { id: result.orderId },
        data: { status: 'PAID' },
      });

      await this.loyaltyService.addLoyaltyPoints(
        tx,
        order.userId,
        result.amount,
      );

      return true;
    });

    if (!processed) {
      const currentPayment = await this.prisma.payment.findUnique({
        where: { orderId: result.orderId },
      });

      const emailStatus =
        currentPayment?.status === 'SUCCESS'
          ? await this.sendConfirmationEmailIfNeeded(
              order,
              currentPayment,
            )
          : 'failed';

      return {
        success: currentPayment?.status === 'SUCCESS',
        alreadyProcessed: true,
        confirmationEmailSent: emailStatus === 'sent',
        confirmationEmailPending: emailStatus === 'pending',
      };
    }

    const updatedPayment = await this.prisma.payment.findUnique({
      where: { orderId: result.orderId },
    });

    const emailStatus = updatedPayment
      ? await this.sendConfirmationEmailIfNeeded(order, updatedPayment)
      : 'failed';

    return {
      success: true,
      alreadyProcessed: false,
      confirmationEmailSent: emailStatus === 'sent',
      confirmationEmailPending: emailStatus === 'pending',
    };
  }

  private async sendConfirmationEmailIfNeeded(
    order: {
      id: number;
      total: number;
      userId: number;
      user: { email: string };
      items: {
        qty: number;
        lineTotal: number;
        product: { name: string };
      }[];
    },
    payment: {
      orderId: number;
      confirmationEmailSentAt: Date | null;
    },
  ): Promise<'sent' | 'pending' | 'failed'> {
    if (payment.confirmationEmailSentAt) return 'sent';

    const claimTime = new Date();
    const confirmationToken = randomBytes(32).toString('hex');
    const confirmationTokenHash = createHash('sha256')
      .update(confirmationToken)
      .digest('hex');
    const confirmationTokenExpiresAt = new Date(
      claimTime.getTime() + 7 * 24 * 60 * 60 * 1000,
    );
    const claim = await this.prisma.payment.updateMany({
      where: {
        orderId: payment.orderId,
        status: 'SUCCESS',
        confirmationEmailSentAt: null,
        OR: [
          { confirmationEmailSendingAt: null },
          {
            confirmationEmailSendingAt: {
              lt: new Date(claimTime.getTime() - 2 * 60 * 1000),
            },
          },
        ],
      },
      data: {
        confirmationEmailSendingAt: claimTime,
        confirmationTokenHash,
        confirmationTokenExpiresAt,
      },
    });

    if (claim.count === 0) {
      const currentPayment = await this.prisma.payment.findUnique({
        where: { orderId: payment.orderId },
      });
      if (currentPayment?.confirmationEmailSentAt) return 'sent';
      return currentPayment?.confirmationEmailSendingAt ? 'pending' : 'failed';
    }

    try {
      const recipient = order.user?.email || process.env.PAYMENT_CONFIRMATION_EMAIL?.trim();
      if (!recipient) {
        throw new BadRequestException('Không có email nhận xác nhận đơn hàng.');
      }

      await this.mailService.sendOrderConfirmation(recipient, {
        orderId: order.id,
        total: order.total,
        pointsEarned: Math.floor(order.total / 10000),
        paymentMethod: 'VNPay',
        confirmationUrl: this.confirmationUrl(confirmationToken),
        items: order.items.map((item) => ({
          name: item.product.name,
          qty: item.qty,
          lineTotal: item.lineTotal,
        })),
      });

      await this.prisma.payment.update({
        where: { orderId: payment.orderId },
        data: {
          confirmationEmailSentAt: new Date(),
          confirmationEmailSendingAt: null,
        },
      });

      return 'sent';
    } catch (error) {
      try {
        await this.prisma.payment.updateMany({
          where: {
            orderId: payment.orderId,
            confirmationEmailSendingAt: claimTime,
          },
          data: { confirmationEmailSendingAt: null },
        });
      } catch (cleanupError) {
        console.error(
          `Không thể giải phóng trạng thái gửi email cho đơn #${order.id}:`,
          cleanupError,
        );
      }

      console.error(
        `Đơn #${order.id} đã thanh toán nhưng không gửi được email xác nhận:`,
        error,
      );
      return 'failed';
    }
  }

  async confirmOrderFromEmail(token: string): Promise<{
    orderId: number;
    total: number;
    pointsEarned: number;
    customerName: string | null;
    access_token: string;
    message?: string;
  }> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    
    // Tìm payment bằng token hash
    const payment = await this.prisma.payment.findUnique({
      where: { confirmationTokenHash: tokenHash },
      include: {
        order: { select: { id: true, total: true, customerName: true, userId: true } },
      },
    });

    // 🌟 1. NẾU KHÔNG TÌM THẤY HOẶC TOKEN ĐÃ BỊ HỦY/SỬ DỤNG TRƯỚC ĐÓ -> BÁO LỖI CHẶN LUÔN
    if (!payment || payment.status !== 'SUCCESS') {
      throw new BadRequestException(
        'Liên kết xác nhận này đã được sử dụng trước đó, không hợp lệ hoặc đơn hàng chưa thanh toán.',
      );
    }

    const accessToken = this.jwtService.sign({
      sub: payment.order.userId,
    });

    if (
      !payment.confirmationTokenExpiresAt ||
      payment.confirmationTokenExpiresAt <= new Date()
    ) {
      throw new BadRequestException(
        'Liên kết xác nhận đã hết hạn. Vui lòng liên hệ BrewLite để được hỗ trợ.',
      );
    }

    // 🌟 2. XÁC NHẬN THÀNH CÔNG LẦN ĐẦU: 
    // Vừa lưu thời gian confirmedAt, vừa "bẻ khóa" (xóa/đổi) token hash đi để không bao giờ dùng lại được nữa
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { 
        confirmedAt: new Date(),
        confirmationTokenHash: 'REVOKED_' + randomBytes(16).toString('hex'), // Vô hiệu hóa vĩnh viễn token này
      },
    });

    return {
      ...this.emailConfirmationResult(payment),
      access_token: accessToken,
    };
  }

  // Đảm bảo hàm phụ trợ emailConfirmationResult này nằm NGAY BÊN DƯỚI trong cùng class PaymentsService:
  private emailConfirmationResult(payment: {
    orderId: number;
    order: { total: number; customerName: string | null };
  }) {
    return {
      orderId: payment.orderId,
      total: payment.order.total,
      pointsEarned: Math.floor(payment.order.total / 10000),
      customerName: payment.order.customerName,
    };
  }

  private confirmationUrl(token: string): string {
    const baseUrl = (
      process.env.PAYMENT_FRONTEND_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000'
    ).replace(/\/+$/, '');
    const url = new URL('/payment-confirmation', baseUrl);
    url.searchParams.set('token', token);
    return url.toString(); 
  }
}