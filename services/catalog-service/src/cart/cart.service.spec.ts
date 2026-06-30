import { Test } from '@nestjs/testing';
import { CartService } from './cart.service';
import { CART_REPOSITORY } from './repositories/cart.repository.interface';
import type { ICartRepository } from './repositories/cart.repository.interface';
import type { CartItem } from './entities/cart-item.entity';

const mockItem = (overrides: Partial<CartItem> = {}): CartItem =>
  ({ id: 1, userId: 1, productId: 1, quantity: 2, ...overrides } as CartItem);

describe('CartService', () => {
  let service: CartService;
  let mockRepo: jest.Mocked<ICartRepository>;

  beforeEach(async () => {
    mockRepo = {
      findByUserId: jest.fn().mockResolvedValue([mockItem()]),
      findItem: jest.fn().mockResolvedValue(null),
      addItem: jest.fn().mockResolvedValue(mockItem()),
      updateQuantity: jest.fn().mockResolvedValue(undefined),
      removeItem: jest.fn().mockResolvedValue(undefined),
      clearCart: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      providers: [CartService, { provide: CART_REPOSITORY, useValue: mockRepo }],
    }).compile();

    service = module.get(CartService);
  });

  describe('getCart', () => {
    it('returns all cart items for the user', async () => {
      const items = [mockItem(), mockItem({ id: 2, productId: 2 })];
      mockRepo.findByUserId.mockResolvedValue(items);
      const result = await service.getCart(1);
      expect(mockRepo.findByUserId).toHaveBeenCalledWith(1);
      expect(result).toEqual(items);
    });

    it('returns an empty array when cart is empty', async () => {
      mockRepo.findByUserId.mockResolvedValue([]);
      const result = await service.getCart(1);
      expect(result).toEqual([]);
    });
  });

  describe('addItem', () => {
    it('inserts a new row when the product is not yet in the cart', async () => {
      const updatedCart = [mockItem()];
      mockRepo.findByUserId.mockResolvedValue(updatedCart);

      const result = await service.addItem(1, { productId: 1, quantity: 2 });

      expect(mockRepo.addItem).toHaveBeenCalledWith({ userId: 1, productId: 1, quantity: 2 });
      expect(mockRepo.updateQuantity).not.toHaveBeenCalled();
      expect(result).toEqual(updatedCart);
    });

    it('increments quantity when the product is already in the cart', async () => {
      const existing = mockItem({ id: 5, quantity: 3 });
      mockRepo.findItem.mockResolvedValue(existing);
      const updatedCart = [mockItem({ quantity: 5 })];
      mockRepo.findByUserId.mockResolvedValue(updatedCart);

      const result = await service.addItem(1, { productId: 1, quantity: 2 });

      expect(mockRepo.updateQuantity).toHaveBeenCalledWith(5, 5);
      expect(mockRepo.addItem).not.toHaveBeenCalled();
      expect(result).toEqual(updatedCart);
    });

    it('returns the refreshed cart state after adding', async () => {
      const fresh = [mockItem({ id: 99 })];
      mockRepo.findByUserId.mockResolvedValue(fresh);
      const result = await service.addItem(1, { productId: 5, quantity: 1 });
      expect(result).toBe(fresh);
    });
  });

  describe('removeItem', () => {
    it('delegates to the repository with the correct item id', async () => {
      await service.removeItem(42);
      expect(mockRepo.removeItem).toHaveBeenCalledWith(42);
    });
  });

  describe('clearCart', () => {
    it('clears all items for the given user', async () => {
      await service.clearCart(7);
      expect(mockRepo.clearCart).toHaveBeenCalledWith(7);
    });
  });
});
