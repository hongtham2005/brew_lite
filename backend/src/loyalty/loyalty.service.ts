import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Áp dụng mã giảm giá (dùng trong transaction)
   */
  async applyPromoCode(
    tx: any,
    code: string | undefined,
    subtotal: number,
  ) {
    if (!code || code.trim() === '') {
      return { discountAmount: 0, promoCodeId: null, promoCode: null };
    }

    const promo = await tx.promoCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!promo) {
      throw new BadRequestException('Mã giảm giá không tồn tại');
    }

    if (!promo.isActive) {
      throw new BadRequestException('Mã giảm giá đã bị vô hiệu hóa');
    }

    const now = new Date();
    if (promo.startsAt && now < promo.startsAt) {
      throw new BadRequestException('Mã giảm giá chưa đến thời gian áp dụng');
    }
    if (promo.expiresAt && now > promo.expiresAt) {
      throw new BadRequestException('Mã giảm giá đã hết hạn');
    }

    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
    }

    if (subtotal < promo.minOrderAmount) {
      throw new BadRequestException(
        `Đơn hàng phải từ ${promo.minOrderAmount.toLocaleString('vi-VN')}đ trở lên mới dùng được mã này`,
      );
    }

    let discountAmount = 0;
    if (promo.discountType === 'PERCENT') {
      discountAmount = Math.floor((subtotal * promo.discountValue) / 100);
    } else {
      discountAmount = promo.discountValue;
    }

    discountAmount = Math.min(discountAmount, subtotal);

    await tx.promoCode.update({
      where: { id: promo.id },
      data: { usedCount: { increment: 1 } },
    });

    return {
      discountAmount,
      promoCodeId: promo.id,
      promoCode: promo.code,
    };
  }

  /**
   * Cộng điểm loyalty (10.000đ = 1 điểm)
   */
  async addLoyaltyPoints(tx: any, userId: number, amount: number): Promise<number> {
    const pointsEarned = Math.floor(amount / 10000);
    if (pointsEarned <= 0) return 0;

    await tx.user.update({
      where: { id: userId },
      data: {
        loyaltyPoints: { increment: pointsEarned },
      },
    });

    return pointsEarned;
  }

  /**
   * Xem trước mã giảm giá (không tăng usedCount)
   */
  async previewPromo(code: string, amount: number) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!promo || !promo.isActive) {
      throw new NotFoundException('Mã giảm giá không hợp lệ');
    }

    const now = new Date();
    if (promo.expiresAt && now > promo.expiresAt) {
      throw new BadRequestException('Mã giảm giá đã hết hạn');
    }

    if (amount < promo.minOrderAmount) {
      throw new BadRequestException(
        `Đơn tối thiểu ${promo.minOrderAmount.toLocaleString('vi-VN')}đ`,
      );
    }

    let discountAmount = 0;
    if (promo.discountType === 'PERCENT') {
      discountAmount = Math.floor((amount * promo.discountValue) / 100);
    } else {
      discountAmount = promo.discountValue;
    }

    discountAmount = Math.min(discountAmount, amount);

    return {
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount,
      finalAmount: amount - discountAmount,
    };
  }
}