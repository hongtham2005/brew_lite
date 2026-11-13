import { UnauthorizedException } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController authentication', () => {
  let controller: OrdersController;
  let ordersService: {
    create: jest.Mock;
    getUserOrders: jest.Mock;
    findOne: jest.Mock;
  };

  beforeEach(() => {
    ordersService = {
      create: jest.fn(),
      getUserOrders: jest.fn(),
      findOne: jest.fn(),
    };
    controller = new OrdersController(ordersService as unknown as OrdersService);
  });

  it('uses the JWT userId when creating an order', () => {
    const dto = { items: [] };

    controller.create(dto, 12);

    expect(ordersService.create).toHaveBeenCalledWith(12, dto);
  });

  it('uses the JWT userId when loading the current user orders', async () => {
    await controller.getMyOrders(12);

    expect(ordersService.getUserOrders).toHaveBeenCalledWith(12);
  });

  it('rejects a missing userId instead of passing NaN to Prisma', () => {
    expect(() => controller.create({ items: [] }, undefined)).toThrow(UnauthorizedException);
    expect(ordersService.create).not.toHaveBeenCalled();
  });

  it('passes the authenticated userId when reading one order', async () => {
    await controller.findOne(25, 12);

    expect(ordersService.findOne).toHaveBeenCalledWith(25, 12);
  });
});
