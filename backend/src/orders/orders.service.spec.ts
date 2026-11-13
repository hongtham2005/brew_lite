import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { Size } from '../generated/prisma/client';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  const tx = {
    product: { findMany: jest.fn() },
    order: { create: jest.fn() },
  };
  const prisma = {
    $transaction: jest.fn((callback) => callback(tx)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(OrdersService);
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback) => callback(tx));
  });

  it('creates a pending order using database prices and item options', async () => {
    tx.product.findMany.mockResolvedValue([
      { id: 4, name: 'Cappuccino', price: 45000, stock: 5 },
    ]);
    tx.order.create.mockResolvedValue({ id: 12, total: 90000 });

    const result = await service.create(7, {
      items: [
        { productId: 4, size: Size.M, qty: 2, topping: 'Kem' },
      ],
    });

    expect(result).toEqual({ id: 12, total: 90000 });
    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          user: { connect: { id: 7 } },
          total: 90000,
          items: {
            create: [
              expect.objectContaining({
                qty: 2,
                size: Size.M,
                topping: 'Kem',
                lineTotal: 90000,
              }),
            ],
          },
        }),
      }),
    );
  });

  it('rejects an empty cart', async () => {
    await expect(service.create(7, { items: [] })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects invalid quantities before creating an order', async () => {
    tx.product.findMany.mockResolvedValue([
      { id: 4, name: 'Cappuccino', price: 45000, stock: 5 },
    ]);

    await expect(
      service.create(7, {
        items: [{ productId: 4, size: Size.M, qty: 0 }],
      }),
    ).rejects.toThrow(BadRequestException);
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('rejects unknown products and quantities exceeding available stock', async () => {
    tx.product.findMany.mockResolvedValue([
      { id: 4, name: 'Cappuccino', price: 45000, stock: 1 },
    ]);

    await expect(
      service.create(7, {
        items: [{ productId: 9, size: Size.M, qty: 1 }],
      }),
    ).rejects.toThrow(NotFoundException);

    await expect(
      service.create(7, {
        items: [
          { productId: 4, size: Size.M, qty: 1 },
          { productId: 4, size: Size.L, qty: 1 },
        ],
      }),
    ).rejects.toThrow(BadRequestException);
  });

});
