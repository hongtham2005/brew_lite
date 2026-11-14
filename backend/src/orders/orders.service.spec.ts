import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Size } from '../generated/prisma/client';
import { OrdersService } from './orders.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { InventoryService } from '../inventory/inventory.service';

describe('OrdersService', () => {
  let service: OrdersService;
  const tx = {
    product: { findUnique: jest.fn() },
    order: { create: jest.fn() },
  };
  const prisma = {
    $transaction: jest.fn((callback) => callback(tx)),
  };
  const loyaltyService = {
    applyPromoCode: jest.fn().mockResolvedValue({ discountAmount: 0, promoCodeId: null }),
  };
  const inventoryService = {
    deductStockByRecipe: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: LoyaltyService, useValue: loyaltyService },
        { provide: InventoryService, useValue: inventoryService },
      ],
    }).compile();
    service = module.get(OrdersService);
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback) => callback(tx));
  });

  it('creates a pending order using database prices and item options', async () => {
    tx.product.findUnique.mockResolvedValue({ id: 4, name: 'Cappuccino', price: 45000 });
    tx.order.create.mockResolvedValue({ id: 12, total: 90000, status: 'PENDING' });
    
    const result = await service.create(7, {
      items: [
        { productId: 4, size: Size.M, qty: 2, topping: 'Kem Cheese' },
      ],
    });
    expect(result.orderId).toEqual(12);
  });

  it('rejects an empty cart', async () => {
    await expect(service.create(7, { items: [] })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects unknown products', async () => {
    tx.product.findUnique.mockResolvedValue(null);
    await expect(
      service.create(7, {
        items: [{ productId: 9, size: Size.M, qty: 1 }],
      }),
    ).rejects.toThrow(NotFoundException);
  });
});