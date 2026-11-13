import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Size } from '../generated/prisma/client';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { InventoryService } from '../inventory/inventory.service';
import { OrderStateMachine, OrderStatus } from './order-state-machine';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private loyaltyService: LoyaltyService,
    private inventoryService: InventoryService,
  ) {}

  async create(userId: number, createOrderDto: CreateOrderDto) {
    return await this.prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const SIZE_EXTRA: Record<string, number> = {
        S: 0,
        M: 5000,
        L: 10000,
      };
      const TOPPING_PRICE: Record<string, number> = {
        'Trân châu đen': 5000,
        'Thạch dừa': 5000,
        'Kem Cheese': 10000,
        'Pudding Trứng': 8000,
      };

      const orderItemsData: {
        product: { connect: { id: number } };
        size: Size;
        qty: number;
        topping?: string;
        lineTotal: number;
      }[] = [];

      // 1. Duyệt qua từng item để tính giá và lấy thông tin sản phẩm
      for (const item of createOrderDto.items) {
        const productIdNum = Number(item.productId);

        // Lấy thông tin sản phẩm để lấy giá và tên
        const product = await tx.product.findUnique({
          where: { id: productIdNum },
        });

        if (!product) {
          throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${productIdNum}`);
        }

        const sizeExtra = SIZE_EXTRA[item.size] || 0;
        let toppingExtra = 0;
        if (item.topping) {
          const toppings = item.topping.split(',').map((t) => t.trim());
          toppingExtra = toppings.reduce((sum, name) => {
            return sum + (TOPPING_PRICE[name] || 0);
          }, 0);
        }

        const unitPrice = product.price + sizeExtra + toppingExtra;
        const lineTotal = unitPrice * item.qty;
        subtotal += lineTotal;

        orderItemsData.push({
          product: { connect: { id: product.id } },
          size: item.size,
          qty: item.qty,
          topping: item.topping || undefined,
          lineTotal,
        });
      }

      // 2. Trừ tồn kho nguyên liệu theo công thức (Recipe) cho toàn bộ giỏ hàng
      await this.inventoryService.deductStockByRecipe(tx, createOrderDto.items);

      // 3. Áp dụng mã giảm giá (PromoCode)
      const { discountAmount, promoCodeId } =
        await this.loyaltyService.applyPromoCode(
          tx,
          createOrderDto.promoCode,
          subtotal,
        );

      const total = Math.max(subtotal - discountAmount, 0);

      // 4. Tạo Order trong Database
      const order = await tx.order.create({
        data: {
          userId,
          total,
          discountAmount,
          promoCodeId,
          customerName: createOrderDto.customerName || 'Khách hàng',
          status: 'PENDING',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
          promoCode: true,
        },
      });

      return {
        message: 'Tạo đơn hàng thành công và cập nhật tồn kho nguyên liệu',
        orderId: order.id,
        status: order.status,
        subtotal,
        discountAmount,
        total: order.total,
        promoCode: order.promoCode?.code || null,
      };
    });
  }

  async findOne(id: number, userId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: { include: { product: true } },
        payment: {
          select: { method: true, status: true, confirmedAt: true },
        },
        promoCode: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với ID: ${id}`);
    }
    return order;
  }

  async getUserOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
        payment: {
          select: { method: true, status: true, confirmedAt: true },
        },
        promoCode: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelOrder(id: number, userId: number) {
    return await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id, userId },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundException(`Không tìm thấy đơn hàng với ID: ${id}`);
      }

      // Kiểm tra Order State Machine
      OrderStateMachine.assertTransition(
        order.status as OrderStatus,
        OrderStatus.CANCELLED,
      );

      await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      // Hoàn trả nguyên liệu vào kho theo công thức
      await this.inventoryService.restoreStockByRecipe(tx, order.items);

      await tx.payment.updateMany({
        where: { orderId: id },
        data: { status: 'FAILED' },
      });

      return {
        message: 'Đã hủy đơn hàng và hoàn trả nguyên liệu thành công.',
        orderId: id,
        status: 'CANCELLED',
      };
    });
  }
  async previewPromo(code: string, amount: number) {
    return this.loyaltyService.previewPromo(code, amount);
  }
}