import { Test } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PRODUCT_REPOSITORY } from './repositories/product.repository.interface';
import { CacheService } from '../cache/cache.service';
import type { IProductRepository } from './repositories/product.repository.interface';
import type { Product } from './entities/product.entity';

const mockProduct: Product = {
  id: 1,
  name: 'Test Shoe',
  description: 'A shoe',
  category: 'footwear',
  price: 99.99,
  stock: 10,
  imageUrl: null,
  sellerId: 7,
  averageRating: 0,
  reviewCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRepo: jest.Mocked<IProductRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  search: jest.fn(),
  findRelated: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  decrementStock: jest.fn(),
};

const mockCache = { get: jest.fn(), set: jest.fn(), del: jest.fn(), delByPattern: jest.fn() };

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PRODUCT_REPOSITORY, useValue: mockRepo },
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();
    service = module.get(ProductsService);
  });

  describe('findAll', () => {
    it('returns cached result when available', async () => {
      const cached = { data: [mockProduct], total: 1, page: 1, limit: 10, totalPages: 1 };
      mockCache.get.mockResolvedValue(cached);
      const result = await service.findAll(1, 10);
      expect(result).toBe(cached);
      expect(mockRepo.findAll).not.toHaveBeenCalled();
    });

    it('fetches from repo and caches when cache misses', async () => {
      const fresh = { data: [mockProduct], total: 1, page: 1, limit: 10, totalPages: 1 };
      mockCache.get.mockResolvedValue(null);
      mockRepo.findAll.mockResolvedValue(fresh);
      const result = await service.findAll(1, 10);
      expect(result).toBe(fresh);
      expect(mockCache.set).toHaveBeenCalledWith('products:list:1:10', fresh, 60);
    });
  });

  describe('findOne', () => {
    it('returns product from cache', async () => {
      mockCache.get.mockResolvedValue(mockProduct);
      const result = await service.findOne(1);
      expect(result).toBe(mockProduct);
      expect(mockRepo.findById).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when product does not exist', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('fetches from repo, caches, and returns product', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepo.findById.mockResolvedValue(mockProduct);
      const result = await service.findOne(1);
      expect(result).toBe(mockProduct);
      expect(mockCache.set).toHaveBeenCalledWith('products:detail:1', mockProduct, 60);
    });
  });

  describe('create', () => {
    it('creates product and invalidates list cache', async () => {
      mockRepo.create.mockResolvedValue(mockProduct);
      const result = await service.create(
        { name: 'Test Shoe', description: 'A shoe', price: 99.99, stock: 10 },
        7,
      );
      expect(result).toBe(mockProduct);
      expect(mockCache.delByPattern).toHaveBeenCalledWith('products:list:*');
    });
  });

  describe('update', () => {
    it('throws NotFoundException when product does not exist', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.update(999, { name: 'X' }, 1, 'admin')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when seller edits another seller product', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepo.findById.mockResolvedValue(mockProduct); // sellerId = 7
      await expect(service.update(1, { name: 'X' }, 99, 'seller')).rejects.toThrow(ForbiddenException);
    });

    it('allows seller to edit own product', async () => {
      const updated = { ...mockProduct, name: 'Updated' };
      mockCache.get.mockResolvedValue(null);
      mockRepo.findById.mockResolvedValue(mockProduct);
      mockRepo.update.mockResolvedValue(updated);
      const result = await service.update(1, { name: 'Updated' }, 7, 'seller');
      expect(result).toEqual(updated);
      expect(mockCache.del).toHaveBeenCalledWith('products:detail:1');
    });

    it('allows admin to edit any product', async () => {
      const updated = { ...mockProduct, name: 'Admin edit' };
      mockCache.get.mockResolvedValue(null);
      mockRepo.findById.mockResolvedValue(mockProduct);
      mockRepo.update.mockResolvedValue(updated);
      const result = await service.update(1, { name: 'Admin edit' }, 999, 'admin');
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when product does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.remove(999, 1, 'admin')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when seller deletes another product', async () => {
      mockRepo.findById.mockResolvedValue(mockProduct);
      await expect(service.remove(1, 99, 'seller')).rejects.toThrow(ForbiddenException);
    });

    it('deletes product and clears cache', async () => {
      mockRepo.findById.mockResolvedValue(mockProduct);
      mockRepo.delete.mockResolvedValue(undefined);
      await service.remove(1, 7, 'seller');
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
      expect(mockCache.del).toHaveBeenCalledWith('products:detail:1');
      expect(mockCache.delByPattern).toHaveBeenCalledWith('products:list:*');
    });
  });
});
