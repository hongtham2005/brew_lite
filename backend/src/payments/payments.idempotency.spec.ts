import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { OnlinePaymentGatewayService } from './online-payment-gateway.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const mockPrismaService = {
    payment: {
      findUnique: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const mockPaymentGateway = {
    createPaymentUrl: jest.fn(),
  };
  const mockLoyaltyService = {
    addLoyaltyPoints: jest.fn(),
  };
  const mockMailService = {
    sendOrderConfirmation: jest.fn(),
  };
  let originalPaymentConfirmationEmail: string | undefined;

  beforeEach(async () => {
    originalPaymentConfirmationEmail =
      process.env.PAYMENT_CONFIRMATION_EMAIL;
    process.env.PAYMENT_CONFIRMATION_EMAIL =
      'hongthamnguyenle68@gmail.com';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: OnlinePaymentGatewayService, useValue: mockPaymentGateway },
        { provide: LoyaltyService, useValue: mockLoyaltyService },
        { provide: MailService, useValue: mockMailService },
        { provide: JwtService, useValue: { sign: jest.fn() } },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    jest.clearAllMocks();
    mockPrismaService.$transaction.mockImplementation(
      (callback: (tx: typeof mockPrismaService) => unknown) =>
        callback(mockPrismaService),
    );
  });

  afterEach(() => {
    if (originalPaymentConfirmationEmail === undefined) {
      delete process.env.PAYMENT_CONFIRMATION_EMAIL;
    } else {
      process.env.PAYMENT_CONFIRMATION_EMAIL =
        originalPaymentConfirmationEmail;
    }
  });

  it('returns an existing payment for a repeated idempotency key', async () => {
    const existingPayment = {
      id: 1,
      orderId: 1,
      idempotencyKey: 'test-key',
      amount: 45000,
      method: 'VNPAY_QR',
      status: 'PENDING',
      paymentUrl: 'https://sandbox.vnpayment.vn/payment/test',
      order: { status: 'PENDING', userId: 1 },
    };
    mockPrismaService.payment.findUnique.mockResolvedValue(existingPayment);

    const result = await service.processPayment(
      {
        orderId: 1,
        amount: 45000,
        method: 'VNPAY_QR',
        idempotencyKey: 'test-key',
      },
      1,
    );

    expect(result.paymentUrl).toBe(existingPayment.paymentUrl);
    expect(mockPrismaService.order.findUnique).not.toHaveBeenCalled();
  });

  it('creates only one provider payment for repeated requests', async () => {
    const paymentsByKey = new Map<string, Record<string, unknown>>();
    mockPrismaService.payment.findUnique.mockImplementation(
      async (args: { where: { idempotencyKey?: string } }) =>
        args.where.idempotencyKey
          ? paymentsByKey.get(args.where.idempotencyKey) ?? null
          : null,
    );
    mockPrismaService.payment.create.mockImplementation(
      async (args: { data: Record<string, unknown> }) => {
        const payment = {
          ...args.data,
          order: { userId: 1, status: 'PENDING' },
        };
        paymentsByKey.set(String(args.data.idempotencyKey), payment);
        return payment;
      },
    );
    mockPrismaService.order.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      total: 45000,
      status: 'PENDING',
    });
    mockPaymentGateway.createPaymentUrl.mockResolvedValue(
      'https://sandbox.vnpayment.vn/payment/test',
    );

    const request = {
      orderId: 1,
      amount: 45000,
      method: 'VNPAY_QR',
      idempotencyKey: 'same-key',
    };
    const first = await service.processPayment(request, 1);
    const second = await service.processPayment(request, 1);

    expect(first.paymentUrl).toBe('https://sandbox.vnpayment.vn/payment/test');
    expect(second.paymentUrl).toBe(first.paymentUrl);
    expect(mockPrismaService.payment.create).toHaveBeenCalledTimes(1);
    expect(mockPaymentGateway.createPaymentUrl).toHaveBeenCalledTimes(1);
  });

  it('rejects unsupported payment methods instead of marking orders paid', async () => {
    mockPrismaService.payment.findUnique.mockResolvedValue(null);
    mockPrismaService.order.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      total: 45000,
    });

    await expect(
      service.processPayment(
        {
          orderId: 1,
          amount: 45000,
          method: 'CARD',
          idempotencyKey: 'card-key',
        },
        1,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(mockPrismaService.payment.create).not.toHaveBeenCalled();
    expect(mockPrismaService.order.update).not.toHaveBeenCalled();
  });

  it('continues supporting VNPay checkout', async () => {
    mockPrismaService.order.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      total: 45000,
      status: 'PENDING',
    });
    mockPaymentGateway.createPaymentUrl.mockResolvedValue(
      'https://sandbox.vnpayment.vn/payment/test',
    );

    await service.processPayment(
      {
        orderId: 1,
        amount: 45000,
        method: 'VNPAY_QR',
        idempotencyKey: 'vnpay-key',
      },
      1,
    );

    expect(mockPaymentGateway.createPaymentUrl).toHaveBeenCalledTimes(1);
  });

  it('rejects payments for another user order', async () => {
    mockPrismaService.payment.findUnique.mockResolvedValue(null);
    mockPrismaService.order.findUnique.mockResolvedValue({
      id: 1,
      userId: 2,
      total: 45000,
    });

    await expect(
      service.processPayment(
        {
          orderId: 1,
          amount: 45000,
          method: 'VNPAY_QR',
          idempotencyKey: 'other-user-key',
        },
        1,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('finalizes VNPay payment and sends one confirmation email', async () => {
    const storedPayment = {
      orderId: 1,
      amount: 45000,
      method: 'VNPAY_QR',
      status: 'PENDING',
      confirmationEmailSentAt: null as Date | null,
      confirmationEmailSendingAt: null as Date | null,
    };
    mockPrismaService.order.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      total: 45000,
      user: { email: 'customer@example.test' },
      items: [
        {
          qty: 1,
          lineTotal: 45000,
          product: { name: 'Coffee' },
        },
      ],
    });
    mockPrismaService.payment.findUnique.mockResolvedValue(storedPayment);
    mockPrismaService.payment.updateMany.mockImplementation(
      async (args: {
        data: { status?: string; confirmationEmailSendingAt?: Date | null };
      }) => {
        if (args.data.status === 'SUCCESS') {
          if (storedPayment.status !== 'PENDING') return { count: 0 };
          storedPayment.status = 'SUCCESS';
          return { count: 1 };
        }
        if (args.data.confirmationEmailSendingAt instanceof Date) {
          storedPayment.confirmationEmailSendingAt =
            args.data.confirmationEmailSendingAt;
          return { count: 1 };
        }
        storedPayment.confirmationEmailSendingAt = null;
        return { count: 1 };
      },
    );
    mockPrismaService.payment.update.mockImplementation(
      async (args: { data: { confirmationEmailSentAt: Date } }) => {
        storedPayment.confirmationEmailSentAt =
          args.data.confirmationEmailSentAt;
        storedPayment.confirmationEmailSendingAt = null;
        return storedPayment;
      },
    );
    mockMailService.sendOrderConfirmation.mockResolvedValue(undefined);
    mockLoyaltyService.addLoyaltyPoints.mockResolvedValue(4);
    mockPrismaService.order.update.mockResolvedValue(undefined);

    const result = {
      orderId: 1,
      amount: 45000,
      success: true,
    };
    const first = await service.processGatewayResult(result);
    const duplicate = await service.processGatewayResult(result);

    expect(first).toEqual({
      success: true,
      alreadyProcessed: false,
      confirmationEmailSent: true,
      confirmationEmailPending: false,
    });
    expect(duplicate).toEqual({
      success: true,
      alreadyProcessed: true,
      confirmationEmailSent: true,
      confirmationEmailPending: false,
    });
    expect(mockLoyaltyService.addLoyaltyPoints).toHaveBeenCalledTimes(1);
    expect(mockMailService.sendOrderConfirmation).toHaveBeenCalledTimes(1);
    expect(mockMailService.sendOrderConfirmation).toHaveBeenCalledWith(
      'customer@example.test', 
      expect.objectContaining({
        paymentMethod: 'VNPay',
        confirmationUrl: expect.stringContaining('/payment-confirmation?token='),
      }),
    );
    expect(mockPrismaService.order.update).toHaveBeenCalledTimes(1);
  });
});
