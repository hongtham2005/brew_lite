// [TV2] Task 2
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
  },
  {
    id: 2,
    name: 'Americano',
    price: 40000,
    imageUrl: '/images/americano.jpg',
    stock: 20,
    version: 0,
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
    it('should return an array of products sorted by id', async () => {
      const result = await service.findAll();
      expect(result).toEqual(mockProductList);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a product when a valid id is provided', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProductList[0]);

      const result = await service.findOne(1);
      expect(result).toEqual(mockProductList[0]);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });
// TODO: Unit test

  describe('ProductsService', () => {
    it.todo('returns the available product catalog');
  });
})