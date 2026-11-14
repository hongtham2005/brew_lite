import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { OnlinePaymentGatewayService } from './online-payment-gateway.service';
import { PaymentsService } from './payments.service';
import { JwtService } from '@nestjs/jwt';

describe('PaymentsService email confirmation', () => {
  let service: PaymentsService;
  const payment = {
    findUnique: jest.fn(),
    updateMany: jest.fn(),
    update: jest.fn(), // ← Bổ sung hàm update cho service
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: { payment } },
        { provide: OnlinePaymentGatewayService, useValue: {} },
        { provide: LoyaltyService, useValue: {} },
        { provide: MailService, useValue: {} },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('mock-jwt-token') } },
      ],
    }).compile();

    service = module.get(PaymentsService);
    jest.clearAllMocks();
  });

  it('confirms a paid order using the email token', async () => {
    const token = 'email-confirmation-token';
    const tokenHash = createHash('sha256').update(token).digest('hex');

    payment.findUnique.mockResolvedValue({
      id: 1, // Bổ sung id để service gọi where: { id: payment.id }
      orderId: 42,
      status: 'SUCCESS',
      confirmedAt: null,
      confirmationTokenExpiresAt: new Date(Date.now() + 60_000),
      order: { id: 42, total: 125000, customerName: 'Khoa', userId: 1 },
    });
    payment.update.mockResolvedValue({ id: 1 });

    const result = await service.confirmOrderFromEmail(token);
    
    expect(result).toEqual({
      orderId: 42,
      total: 125000,
      pointsEarned: 12,
      customerName: 'Khoa',
      access_token: 'mock-jwt-token',
    });

    expect(payment.findUnique).toHaveBeenCalledWith({
      where: { confirmationTokenHash: tokenHash },
      include: {
        order: { select: { id: true, total: true, customerName: true, userId: true } },
      },
    });

    expect(payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({
          confirmedAt: expect.any(Date),
        }),
      }),
    );
  });

  it('rejects expired email confirmation tokens', async () => {
    payment.findUnique.mockResolvedValue({
      id: 1,
      orderId: 42,
      status: 'SUCCESS',
      confirmedAt: null,
      confirmationTokenExpiresAt: new Date(Date.now() - 60_000),
      order: { id: 42, total: 125000, customerName: 'Khoa', userId: 1 },
    });

    await expect(
      service.confirmOrderFromEmail('expired-token'),
    ).rejects.toThrow(BadRequestException);

    expect(payment.update).not.toHaveBeenCalled();
  });
});