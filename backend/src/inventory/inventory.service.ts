import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Trừ tồn kho nguyên liệu theo công thức (Recipe) với Optimistic Locking (Task 10)
   */
  async deductStockByRecipe(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    items: { productId: number; qty: number }[],
  ) {
    for (const item of items) {
      // 1. Lấy danh sách nguyên liệu và định lượng của sản phẩm này từ bảng RecipeItem
      const recipeItems = await tx.recipeItem.findMany({
        where: { productId: item.productId },
        include: { ingredient: true },
      });

      // Nếu sản phẩm không cấu hình công thức nguyên liệu, bỏ qua hoặc xử lý tùy ý
      if (recipeItems.length === 0) continue;

      // 2. Duyệt qua từng nguyên liệu cần dùng cho số lượng ly khách đặt (item.qty)
      for (const recipe of recipeItems) {
        const totalNeeded = recipe.quantity * item.qty; // Tổng lượng nguyên liệu cần trừ
        const currentIng = recipe.ingredient;

        // Kiểm tra xem kho nguyên liệu có đủ không
        if (currentIng.stock < totalNeeded) {
          raiseNotEnoughStock(currentIng.name, currentIng.stock, totalNeeded);
        }

        // 3. Trừ kho nguyên liệu kèm Optimistic Locking (dựa vào version và stock)
        const updated = await tx.ingredient.updateMany({
          where: {
            id: currentIng.id,
            version: currentIng.version, // Khớp phiên bản hiện tại
            stock: { gte: totalNeeded },  // Đảm bảo vẫn đủ hàng
          },
          data: {
            stock: { decrement: totalNeeded },
            version: { increment: 1 },    // Tăng version chống xung đột đồng thời
          },
        });

        // Nếu updateMany trả về count === 0 -> Xảy ra tranh chấp đồng thời
        if (updated.count === 0) {
          throw new BadRequestException(
            `Nguyên liệu "${currentIng.name}" đang bị tranh chấp hoặc không đủ kho. Vui lòng thử lại!`,
          );
        }
      }
    }
  }

  /**
   * Hoàn trả nguyên liệu kho khi hủy đơn hàng
   */
  async restoreStockByRecipe(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    orderItems: { productId: number; qty: number }[],
  ) {
    for (const item of orderItems) {
      const recipeItems = await tx.recipeItem.findMany({
        where: { productId: item.productId },
        include: { ingredient: true },
      });

      for (const recipe of recipeItems) {
        const totalToRestore = recipe.quantity * item.qty;
        
        await tx.ingredient.update({
          where: { id: recipe.ingredientId },
          data: {
            stock: { increment: totalToRestore },
            version: { increment: 1 },
          },
        });
      }
    }
  }
}

function raiseNotEnoughStock(name: string, current: number, needed: number) {
  throw new BadRequestException(
    `Nguyên liệu "${name}" trong kho không đủ (Hiện còn: ${current}, Cần: ${needed}).`,
  );
}