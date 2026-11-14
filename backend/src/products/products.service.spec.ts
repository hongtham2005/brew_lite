import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';

const mockProductList = [
  {
    id: 1,
    name: 'Cà phê sữa',
    price: 35000,
    imageUrl: '/images/ca-phe-sua.jpg',
    stock: 50,
    version: 0,
    recipes: [], // Bổ sung recipes để tránh lỗi undefined length
  },
  {
    id: 2,
    name: 'Americano',
    price: 40000,
    imageUrl: '/images/americano.jpg',
    stock: 20,
    version: 0,
    recipes: [], // Bổ sung recipes
  },
];

describe('ProductsService', () => {
  let service: ProductsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      product: {
        findMany: jest.fn().mockResolvedValue(mockProductList),
        findUnique: jest.fn(),
      },
    };
    service = new ProductsService(mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const result = await service.findAll();
      expect(result[0].id).toEqual(mockProductList[0].id);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        include: {
          recipes: {
            include: { ingredient: true },
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a product when a valid id is provided', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProductList[0]);
      const result = await service.findOne(1);
      expect(result.id).toEqual(mockProductList[0].id);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          recipes: {
            include: { ingredient: true },
          },
        },
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: {
          recipes: {
            include: { ingredient: true },
          },
        },
      });
    });
  });
});