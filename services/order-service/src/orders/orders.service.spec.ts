import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order, OrderStatus, PaymentMethod, PaymentStatus } from './entities/order.entity';
import { CatalogClientService } from '../catalog-client/catalog-client.service';
import { PaymentService } from '../payments/payment.service';
import { NOTIFICATION_QUEUE, INVENTORY_QUEUE } from '../queue/queue.module';

const makeCartItem = (overrides: Partial<{ productId: number; quantity: number; stock: number; price: number }> = {}) => ({
  id: 10,
  productId: overrides.productId ?? 1,
  quantity: overrides.quantity ?? 2,
  product: {
    id: overrides.productId ?? 1,
    name: 'Widget',
    price: overrides.price ?? 10,
    stock: overrides.stock ?? 5,
    sellerId: 7,
  },
});

const makeOrder = (overrides: Record<string, unknown> = {}): Order => ({
  id: 99,
  userId: 1,
  total: 20,
  discount: 0,
  couponCode: null,
  status: OrderStatus.PENDING,
  paymentMethod: PaymentMethod.COD,
  paymentStatus: PaymentStatus.PENDING,
  paymentId: null,
  idempotencyKey: 'abc-123',
  items: [],
  createdAt: new Date(),
  ...overrides,
} as Order);

describe('OrdersService', () => {
  let service: OrdersService;
  let mockOrderRepo: Record<string, jest.Mock>;
  let mockCatalog: jest.Mocked<Partial<CatalogClientService>>;
  let mockPayment: jest.Mocked<Partial<PaymentService>>;
  let mockNotifQueue: { add: jest.Mock };
  let mockInvQueue: { add: jest.Mock };

  beforeEach(async () => {
    const qb = {
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ totalOrders: '5', totalRevenue: '499.95' }),
    };

    mockOrderRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
      create: jest.fn().mockReturnValue(makeOrder()),
      save: jest.fn().mockImplementation((o: Order) => Promise.resolve(o)),
      createQueryBuilder: jest.fn().mockReturnValue(qb),
    };

    mockCatalog = {
      getCartItems: jest.fn().mockResolvedValue([makeCartItem()]),
      getProduct: jest.fn(),
      applyCoupon: jest.fn(),
      decrementStock: jest.fn().mockResolvedValue({ id: 1, name: 'Widget', price: 10, stock: 3, sellerId: 7 }),
      clearCart: jest.fn().mockResolvedValue(undefined),
      getUser: jest.fn().mockResolvedValue({ id: 1, email: 'buyer@test.com', name: 'Buyer' }),
    };

    mockPayment = {
      process: jest.fn().mockResolvedValue({ paymentId: null, status: 'pending' }),
    };

    mockNotifQueue = { add: jest.fn().mockResolvedValue(undefined) };
    mockInvQueue = { add: jest.fn().mockResolvedValue(undefined) };

    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: CatalogClientService, useValue: mockCatalog },
        { provide: PaymentService, useValue: mockPayment },
        { provide: getQueueToken(NOTIFICATION_QUEUE), useValue: mockNotifQueue },
        { provide: getQueueToken(INVENTORY_QUEUE), useValue: mockInvQueue },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  describe('placeOrder', () => {
    it('returns existing order immediately on duplicate idempotency key', async () => {
      const existing = makeOrder();
      mockOrderRepo.findOne.mockResolvedValue(existing);

      const result = await service.placeOrder(1, { idempotencyKey: 'abc-123' });

      expect(result).toBe(existing);
      expect(mockCatalog.getCartItems).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when cart is empty', async () => {
      mockCatalog.getCartItems.mockResolvedValue([]);
      await expect(service.placeOrder(1, {})).rejects.toThrow(BadRequestException);
      await expect(service.placeOrder(1, {})).rejects.toThrow('Cart is empty');
    });

    it('throws BadRequestException when product has insufficient stock', async () => {
      mockCatalog.getCartItems.mockResolvedValue([makeCartItem({ quantity: 10, stock: 3 })]);
      await expect(service.placeOrder(1, {})).rejects.toThrow('Insufficient stock');
    });

    it('never calls catalog.getProduct during stock validation (N+1 fix)', async () => {
      const order = makeOrder();
      mockOrderRepo.create.mockReturnValue(order);
      mockOrderRepo.save.mockResolvedValue(order);

      await service.placeOrder(1, {});

      expect(mockCatalog.getProduct).not.toHaveBeenCalled();
    });

    it('creates a COD order and clears the cart', async () => {
      const order = makeOrder();
      mockOrderRepo.create.mockReturnValue(order);
      mockOrderRepo.save.mockResolvedValue(order);

      const result = await service.placeOrder(1, { paymentMethod: PaymentMethod.COD });

      expect(mockOrderRepo.save).toHaveBeenCalled();
      expect(mockCatalog.clearCart).toHaveBeenCalledWith(1);
      expect(result).toBe(order);
    });

    it('applies coupon and adjusts total', async () => {
      mockCatalog.applyCoupon.mockResolvedValue({
        code: 'SAVE5', discountAmount: 5, finalTotal: 15, type: 'fixed', value: 5,
      });
      const order = makeOrder({ total: 15, discount: 5, couponCode: 'SAVE5' });
      mockOrderRepo.create.mockReturnValue(order);
      mockOrderRepo.save.mockResolvedValue(order);

      const result = await service.placeOrder(1, { couponCode: 'SAVE5' });

      expect(mockCatalog.applyCoupon).toHaveBeenCalledWith('SAVE5', 20);
      expect(result.discount).toBe(5);
      expect(result.couponCode).toBe('SAVE5');
    });

    it('marks paymentStatus as PAID when Stripe succeeds', async () => {
      mockPayment.process.mockResolvedValue({ paymentId: 'pi_xyz', status: 'paid' });
      const order = makeOrder({ paymentStatus: PaymentStatus.PAID, paymentId: 'pi_xyz' });
      mockOrderRepo.create.mockReturnValue(order);
      mockOrderRepo.save.mockResolvedValue(order);

      const result = await service.placeOrder(1, { paymentMethod: PaymentMethod.STRIPE });

      expect(result.paymentStatus).toBe(PaymentStatus.PAID);
    });

    it('decrements stock for all items in parallel', async () => {
      const multiCart = [
        makeCartItem({ productId: 1, quantity: 2, stock: 5 }),
        makeCartItem({ productId: 2, quantity: 1, stock: 8, price: 20 }),
      ];
      mockCatalog.getCartItems.mockResolvedValue(multiCart);
      mockCatalog.decrementStock
        .mockResolvedValueOnce({ id: 1, stock: 3, name: 'Widget', price: 10, sellerId: 7 })
        .mockResolvedValueOnce({ id: 2, stock: 7, name: 'Widget', price: 20, sellerId: 7 });
      const order = makeOrder({ total: 40 });
      mockOrderRepo.create.mockReturnValue(order);
      mockOrderRepo.save.mockResolvedValue(order);

      await service.placeOrder(1, {});

      expect(mockCatalog.decrementStock).toHaveBeenCalledTimes(2);
      expect(mockCatalog.decrementStock).toHaveBeenCalledWith(1, 2);
      expect(mockCatalog.decrementStock).toHaveBeenCalledWith(2, 1);
    });

    it('enqueues low-stock inventory jobs in parallel when stock falls below threshold', async () => {
      mockCatalog.decrementStock.mockResolvedValue({ id: 1, stock: 2, name: 'Widget', price: 10, sellerId: 7 });
      const sellerUser = { id: 7, email: 'seller@test.com', name: 'Seller' };
      mockCatalog.getUser
        .mockResolvedValueOnce({ id: 1, email: 'buyer@test.com', name: 'Buyer' })
        .mockResolvedValueOnce(sellerUser);
      const order = makeOrder();
      mockOrderRepo.create.mockReturnValue(order);
      mockOrderRepo.save.mockResolvedValue(order);

      await service.placeOrder(1, {});
      // Allow microtask queue to flush dispatchPostOrderJobs
      await new Promise(process.nextTick);

      expect(mockInvQueue.add).toHaveBeenCalledWith('check', expect.objectContaining({
        newStock: 2,
        sellerEmail: 'seller@test.com',
      }));
    });
  });

  describe('getOrders', () => {
    it('returns paginated orders with correct metadata', async () => {
      const orders = [makeOrder()];
      mockOrderRepo.findAndCount.mockResolvedValue([orders, 25]);

      const result = await service.getOrders(1, 2, 10);

      expect(result.data).toEqual(orders);
      expect(result.total).toBe(25);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(3);
    });

    it('applies correct skip offset for page 2', async () => {
      mockOrderRepo.findAndCount.mockResolvedValue([[], 0]);
      await service.getOrders(1, 2, 10);
      expect(mockOrderRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 10 }));
    });
  });

  describe('getOrder', () => {
    it('returns order when found', async () => {
      const order = makeOrder();
      mockOrderRepo.findOne.mockResolvedValue(order);
      expect(await service.getOrder(99)).toBe(order);
    });

    it('throws NotFoundException when order does not exist', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);
      await expect(service.getOrder(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('returns parsed integer and float from raw query', async () => {
      const result = await service.getStats();
      expect(result).toEqual({ totalOrders: 5, totalRevenue: 499.95 });
    });

    it('returns zeros when query returns null (empty table)', async () => {
      const emptyQb = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };
      mockOrderRepo.createQueryBuilder.mockReturnValue(emptyQb);
      const result = await service.getStats();
      expect(result).toEqual({ totalOrders: 0, totalRevenue: 0 });
    });
  });
});
