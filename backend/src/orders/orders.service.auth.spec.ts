import { NotFoundException } from '@nestjs/common';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from './orders.service';

describe('OrdersService order ownership', () => {
  const findFirst = jest.fn();
  const service = new OrdersService(
    { order: { findFirst } } as unknown as PrismaService,
    {} as LoyaltyService,
  );

  beforeEach(() => {
    findFirst.mockReset();
  });

  it('loads an order only when it belongs to the authenticated user', async () => {
    const order = { id: 25, userId: 12 };
    findFirst.mockResolvedValue(order);

    await expect(service.findOne(25, 12)).resolves.toBe(order);
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 25, userId: 12 } }),
    );
  });

  it('does not disclose orders owned by another user', async () => {
    findFirst.mockResolvedValue(null);

    await expect(service.findOne(25, 12)).rejects.toThrow(NotFoundException);
  });
});
