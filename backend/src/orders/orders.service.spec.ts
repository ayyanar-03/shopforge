import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ORDER_REPOSITORY } from './repositories/order.repository.interface';
import { CART_REPOSITORY } from '../cart/repositories/cart.repository.interface';
import { PRODUCT_REPOSITORY } from '../products/repositories/product.repository.interface';
import { OrderStatus } from './entities/order.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepo: any;
  let cartRepo: any;
  let productRepo: any;

  beforeEach(async () => {
    orderRepo = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
    };

    cartRepo = {
      findByUserId: jest.fn(),
      clearCart: jest.fn(),
    };

    productRepo = {
      findById: jest.fn(),
      decrementStock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: ORDER_REPOSITORY, useValue: orderRepo },
        { provide: CART_REPOSITORY, useValue: cartRepo },
        { provide: PRODUCT_REPOSITORY, useValue: productRepo },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('placeOrder', () => {
    it('should throw BadRequestException when cart is empty', async () => {
      cartRepo.findByUserId.mockResolvedValue([]);
      await expect(service.placeOrder(1)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      cartRepo.findByUserId.mockResolvedValue([
        { productId: 99, quantity: 1, product: { price: 10 } },
      ]);
      productRepo.findById.mockResolvedValue(null);

      await expect(service.placeOrder(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      cartRepo.findByUserId.mockResolvedValue([
        { productId: 1, quantity: 5, product: { price: 10, name: 'Widget' } },
      ]);
      productRepo.findById.mockResolvedValue({ id: 1, stock: 2, name: 'Widget' });

      await expect(service.placeOrder(1)).rejects.toThrow(BadRequestException);
    });

    it('should create order, decrement stock, and clear cart', async () => {
      const cartItems = [
        { productId: 1, quantity: 2, product: { id: 1, price: 25.5, name: 'Widget' } },
        { productId: 2, quantity: 1, product: { id: 2, price: 15.0, name: 'Gadget' } },
      ];

      cartRepo.findByUserId.mockResolvedValue(cartItems);
      productRepo.findById
        .mockResolvedValueOnce({ id: 1, stock: 10, name: 'Widget' })
        .mockResolvedValueOnce({ id: 2, stock: 5, name: 'Gadget' });

      const expectedOrder = {
        id: 1,
        userId: 1,
        total: 66,
        status: OrderStatus.CONFIRMED,
        items: [],
      };
      orderRepo.create.mockResolvedValue(expectedOrder);
      cartRepo.clearCart.mockResolvedValue(undefined);
      productRepo.decrementStock.mockResolvedValue(undefined);

      const result = await service.placeOrder(1);

      expect(productRepo.decrementStock).toHaveBeenCalledWith(1, 2);
      expect(productRepo.decrementStock).toHaveBeenCalledWith(2, 1);
      expect(cartRepo.clearCart).toHaveBeenCalledWith(1);
      expect(orderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          total: 66,
          status: OrderStatus.CONFIRMED,
        }),
      );
      expect(result).toEqual(expectedOrder);
    });
  });

  describe('getOrders', () => {
    it('should return orders for a user', async () => {
      const orders = [{ id: 1, userId: 1, total: 50 }];
      orderRepo.findByUserId.mockResolvedValue(orders);

      const result = await service.getOrders(1, 1, 20);
      expect(result).toEqual(orders);
      expect(orderRepo.findByUserId).toHaveBeenCalledWith(1, 1, 20);
    });
  });

  describe('getOrder', () => {
    it('should return an order by id', async () => {
      const order = { id: 1, userId: 1, total: 50 };
      orderRepo.findById.mockResolvedValue(order);

      const result = await service.getOrder(1);
      expect(result).toEqual(order);
    });

    it('should throw NotFoundException when order not found', async () => {
      orderRepo.findById.mockResolvedValue(null);
      await expect(service.getOrder(999)).rejects.toThrow(NotFoundException);
    });
  });
});
