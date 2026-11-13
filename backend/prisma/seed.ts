import { config } from 'dotenv';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

config({ path: resolve(__dirname, '../../.env') });
config({ path: resolve(__dirname, '../.env') });

const connectionString = 'postgresql://brewlite:password@localhost:5432/brewlite?schema=public';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function seed() {
  // 1. Seed danh sách sản phẩm
  const products = [
    {
      id: 1,
      name: 'Cà phê sữa',
      price: 35000,
      imageUrl:
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=600&fit=crop',
    },
    {
      id: 2,
      name: 'Americano',
      price: 40000,
      imageUrl:
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop',
    },
    {
      id: 3,
      name: 'Cappuccino',
      price: 45000,
      imageUrl:
        'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=600&fit=crop',
    },
    {
      id: 4,
      name: 'Trà đào',
      price: 39000,
      imageUrl:
        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=600&fit=crop',
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: { name: p.name, price: p.price, imageUrl: p.imageUrl },
      create: p,
    });
  }

  // 2. Seed danh sách Nguyên liệu thô (Ingredient)
  const coffeeBean = await prisma.ingredient.upsert({
    where: { name: 'Hạt cà phê' },
    update: {},
    create: { name: 'Hạt cà phê', unit: 'gram', stock: 5000, version: 1 },
  });

  const milk = await prisma.ingredient.upsert({
    where: { name: 'Sữa tươi' },
    update: {},
    create: { name: 'Sữa tươi', unit: 'ml', stock: 10000, version: 1 },
  });

  const condensedMilk = await prisma.ingredient.upsert({
    where: { name: 'Sữa đặc' },
    update: {},
    create: { name: 'Sữa đặc', unit: 'ml', stock: 3000, version: 1 },
  });

  const tea = await prisma.ingredient.upsert({
    where: { name: 'Trà đen' },
    update: {},
    create: { name: 'Trà đen', unit: 'gram', stock: 2000, version: 1 },
  });

  const peachSyrup = await prisma.ingredient.upsert({
    where: { name: 'Siro đào' },
    update: {},
    create: { name: 'Siro đào', unit: 'ml', stock: 4000, version: 1 },
  });

  // 3. Seed Công thức định lượng (RecipeItem) cho từng sản phẩm
  const recipes = [
    { productId: 1, ingredientId: coffeeBean.id, quantity: 20 },
    { productId: 1, ingredientId: condensedMilk.id, quantity: 30 },
    { productId: 1, ingredientId: milk.id, quantity: 50 },
    { productId: 2, ingredientId: coffeeBean.id, quantity: 25 },
    { productId: 3, ingredientId: coffeeBean.id, quantity: 20 },
    { productId: 3, ingredientId: milk.id, quantity: 120 },
    { productId: 4, ingredientId: tea.id, quantity: 15 },
    { productId: 4, ingredientId: peachSyrup.id, quantity: 35 },
  ];

  for (const r of recipes) {
    await prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId: r.productId,
          ingredientId: r.ingredientId,
        },
      },
      update: { quantity: r.quantity },
      create: r,
    });
  }

  // 4. Seed mã giảm giá (PromoCode)
  const promos = [
    {
      code: 'BREW10',
      description: 'Giảm 10% toàn đơn',
      discountType: 'PERCENT',
      discountValue: 10,
      minOrderAmount: 50000,
      maxUses: 100,
      isActive: true,
      usedCount: 0,
    },
    {
      code: 'FREESHIP',
      description: 'Giảm cố định 15.000đ',
      discountType: 'FIXED',
      discountValue: 15000,
      minOrderAmount: 80000,
      maxUses: 50,
      isActive: true,
      usedCount: 0,
    },
    {
      code: 'WELCOME20',
      description: 'Giảm 20% cho khách mới',
      discountType: 'PERCENT',
      discountValue: 20,
      minOrderAmount: 0,
      maxUses: null,
      isActive: true,
      usedCount: 0,
    },
  ];

  for (const promo of promos) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: promo,
      create: promo,
    });
  }

  // 5. Reset sequence cho bảng Product
  await prisma.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence('"Product"', 'id'),
      COALESCE((SELECT MAX(id) FROM "Product"), 1),
      true
    )
  `;

  console.log('✅ Seed dữ liệu sản phẩm, nguyên liệu và công thức thành công!');
}

seed()
  .catch((error: unknown) => {
    console.error('Failed to seed the database:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });