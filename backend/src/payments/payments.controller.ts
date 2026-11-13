import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfirmPaymentEmailDto } from './dto/confirm-payment-email.dto';
import { OnlinePaymentGatewayService } from './online-payment-gateway.service';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentGateway: OnlinePaymentGatewayService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  processPayment(
    @Body() dto: CreatePaymentDto,
    @CurrentUser('userId') userId: number | undefined,
  ) {
    console.log("DEBUG userId nhận được từ token:", userId);
    
    if (
      typeof userId !== 'number' ||
      !Number.isInteger(userId) ||
      userId < 1
    ) {
      throw new UnauthorizedException(
        'Không xác định được người dùng đăng nhập.',
      );
    }
    return this.paymentsService.processPayment(dto, userId);
  }

  @Post('email/confirm')
  confirmOrderFromEmail(@Body() dto: ConfirmPaymentEmailDto) {
    return this.paymentsService.confirmOrderFromEmail(dto.token);
  }

  /**
   * IPN - Server to Server (VNPay gọi về)
   */
  @Post('vnpay/ipn')
  async handleVnPayIpn(
    @Body() payload: Record<string, any>,
    @Res() response: Response,
  ) {
    try {
      const result = this.paymentGateway.verifyVnPayCallback(payload);
      await this.paymentsService.processGatewayResult(result);

      // VNPay yêu cầu trả về đúng format này
      return response.status(200).json({ RspCode: '00', Message: 'Success' });
    } catch (error) {
      console.error('VNPay IPN bị từ chối:', error);
      return response
        .status(200)
        .json({ RspCode: '97', Message: 'Invalid signature' });
    }
  }

  /**
   * Return URL - User được redirect về sau khi thanh toán
   */
  @Get('vnpay/return')
  async handleVnPayReturn(
    @Query() query: Record<string, string>,
    @Res() response: Response,
  ) {
    try {
      const result = this.paymentGateway.verifyVnPayCallback(query);
      const processed = await this.paymentsService.processGatewayResult(
        result,
      );

      return response.redirect(
        this.checkoutUrl(
          result.orderId,
          processed.success,
          processed.confirmationEmailSent
            ? 'sent'
            : processed.confirmationEmailPending
              ? 'pending'
              : 'failed',
          result.success
            ? undefined
            : `VNPay từ chối thanh toán (mã ${result.resultCode}): ${result.message}`,
        ),
      );
    } catch (error) {
      console.error('Không xác minh được kết quả trả về từ VNPay:', error);
      return response.redirect(this.invalidCheckoutUrl());
    }
  }

  private checkoutUrl(
    orderId: number,
    success: boolean,
    emailStatus: 'sent' | 'pending' | 'failed',
    failureReason?: string,
  ): string {
    const url = new URL('/checkout', this.frontendUrl());
    url.searchParams.set('paymentReturn', 'vnpay');
    url.searchParams.set('orderId', String(orderId));
    url.searchParams.set('status', success ? 'success' : 'failed');
    url.searchParams.set('email', success ? emailStatus : 'not-applicable');
    if (failureReason) url.searchParams.set('reason', failureReason);
    return url.toString();
  }

  private invalidCheckoutUrl(): string {
    const url = new URL('/checkout', this.frontendUrl());
    url.searchParams.set('paymentReturn', 'vnpay');
    url.searchParams.set('status', 'invalid');
    return url.toString();
  }

  private frontendUrl(): string {
    return (
      process.env.PAYMENT_FRONTEND_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000'
    ).replace(/\/+$/, '');
  }
}