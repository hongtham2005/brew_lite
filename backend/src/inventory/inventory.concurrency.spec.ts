import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Size } from '../generated/prisma/client';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';

describe('Inventory concurrency', () => {
  let service: OrdersService;

  const product = {
    id: 1,
    name: 'Cappuccino',
    price: 45000,
    stock: 1,
    version: 0,
  };

  const tx = {
    product: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    order: {
      create: jest.fn(),
    },
  };
  const prisma = {
    $transaction: jest.fn(),
  };
  const loyaltyService = {
    applyPromoCode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: LoyaltyService, useValue: loyaltyService },
      ],
    }).compile();

    service = module.get(OrdersService);
    jest.clearAllMocks();

    prisma.$transaction.mockImplementation(
      (callback: (transaction: typeof tx) => Promise<unknown>) =>
        callback(tx),
    );
    loyaltyService.applyPromoCode.mockResolvedValue({
      discountAmount: 0,
      promoCodeId: null,
    });
  });

  it('does not allow concurrent orders to exceed available stock', async () => {
    let releaseReads!: () => void;
    const bothReadsCompleted = new Promise<void>((resolve) => {
      releaseReads = resolve;
    });
    let readCount = 0;
    let stock = product.stock;
    let version = product.version;

    tx.product.findUnique.mockImplementation(async () => {
      const observedProduct = { ...product, stock, version };
      readCount += 1;
      if (readCount === 2) {
        releaseReads();
      }
      await bothReadsCompleted;
      return observedProduct;
    });

    tx.product.updateMany.mockImplementation(
      async (args: {
        where: {
          id: number;
          version: number;
          stock: { gte: number };
        };
        data: {
          stock: { decrement: number };
          version: { increment: number };
        };
      }) => {
        if (
          args.where.id !== product.id ||
          args.where.version !== version ||
          stock < args.where.stock.gte
        ) {
          return { count: 0 };
        }

        stock -= args.data.stock.decrement;
        version += args.data.version.increment;
        return { count: 1 };
      },
    );
    tx.order.create.mockImplementation(async () => ({
      id: 1,
      status: 'PENDING',
      total: product.price,
    }));

    const request = {
      items: [{ productId: product.id, size: Size.S, qty: 1 }],
    };

    const results = await Promise.all([
      service.create(7, request).then(
        () => true,
        (error: unknown) => {
          expect(error).toBeInstanceOf(BadRequestException);
          return false;
        },
      ),
      service.create(8, request).then(
        () => true,
        (error: unknown) => {
          expect(error).toBeInstanceOf(BadRequestException);
          return false;
        },
      ),
    ]);

    expect(results.filter(Boolean)).toHaveLength(1);
    expect(tx.order.create).toHaveBeenCalledTimes(1);
    expect(stock).toBe(0);
    expect(stock).toBeGreaterThanOrEqual(0);
  });
});
