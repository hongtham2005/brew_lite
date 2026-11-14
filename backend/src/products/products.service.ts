// [TV2] Task 2
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductResponseDto } from './dto/product-response.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const products = await this.prisma.product.findMany({
      include: {
        recipes: {
          include: { ingredient: true },
        },
      },
    });

    // Tính toán số lượng ly tối đa có thể pha (stock) dựa trên nguyên liệu thô
    return products.map((product) => {
      let stock = 0;
      if (product.recipes.length === 0) {
        stock = 0;
      } else {
        let minServings = Infinity;
        for (const recipe of product.recipes) {
          if (recipe.quantity <= 0) continue;
          const possibleServings = Math.floor(recipe.ingredient.stock / recipe.quantity);
          if (possibleServings < minServings) {
            minServings = possibleServings;
          }
        }
        stock = minServings === Infinity ? 0 : minServings;
      }

      const { ...rest } = product;
      return {
        ...rest,
        stock,
      };
    });
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        recipes: {
          include: { ingredient: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Tính toán số lượng ly tối đa cho sản phẩm này
    let stock = 0;
    if (product.recipes.length > 0) {
      let minServings = Infinity;
      for (const recipe of product.recipes) {
        if (recipe.quantity <= 0) continue;
        const possibleServings = Math.floor(recipe.ingredient.stock / recipe.quantity);
        if (possibleServings < minServings) {
          minServings = possibleServings;
        }
      }
      stock = minServings === Infinity ? 0 : minServings;
    }

    const { ...rest } = product;
    return {
      ...rest,
      stock,
    };
  }
}