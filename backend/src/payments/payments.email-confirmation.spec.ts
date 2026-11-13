import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { OnlinePaymentGatewayService } from './online-payment-gateway.service';
import { PaymentsService } from './payments.service';

describe('PaymentsService email confirmation', () => {
  let service: PaymentsService;
  const payment = {
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: { payment } },
        { provide: OnlinePaymentGatewayService, useValue: {} },
        { provide: LoyaltyService, useValue: {} },
        { provide: MailService, useValue: {} },
      ],
    }).compile();

    service = module.get(PaymentsService);
    jest.clearAllMocks();
  });

  it('confirms a paid order using the email token', async () => {
    const token = 'email-confirmation-token';
    const tokenHash = createHash('sha256').update(token).digest('hex');
    payment.findUnique.mockResolvedValue({
      orderId: 42,
      status: 'SUCCESS',
      confirmedAt: null,
      confirmationTokenExpiresAt: new Date(Date.now() + 60_000),
      order: { total: 125000, customerName: 'Khoa' },
    });
    payment.updateMany.mockResolvedValue({ count: 1 });

    await expect(service.confirmOrderFromEmail(token)).resolves.toEqual({
      orderId: 42,
      total: 125000,
      pointsEarned: 12,
      customerName: 'Khoa',
    });
    expect(payment.findUnique).toHaveBeenCalledWith({
      where: { confirmationTokenHash: tokenHash },
      include: {
        order: { select: { total: true, customerName: true } },
      },
    });
    expect(payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          orderId: 42,
          status: 'SUCCESS',
          confirmationTokenHash: tokenHash,
        }),
        data: { confirmedAt: expect.any(Date) },
      }),
    );
  });

  it('rejects expired email confirmation tokens', async () => {
    payment.findUnique.mockResolvedValue({
      orderId: 42,
      status: 'SUCCESS',
      confirmedAt: null,
      confirmationTokenExpiresAt: new Date(Date.now() - 60_000),
      order: { total: 125000, customerName: 'Khoa' },
    });

    await expect(
      service.confirmOrderFromEmail('expired-token'),
    ).rejects.toThrow(BadRequestException);
    expect(payment.updateMany).not.toHaveBeenCalled();
  });
});
