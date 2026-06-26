import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ORDER_REPOSITORY } from './repositories/order.repository.interface';
import type { IOrderRepository } from './repositories/order.repository.interface';
import { CART_REPOSITORY } from '../cart/repositories/cart.repository.interface';
import type { ICartRepository } from '../cart/repositories/cart.repository.interface';
import { PRODUCT_REPOSITORY } from '../products/repositories/product.repository.interface';
import type { IProductRepository } from '../products/repositories/product.repository.interface';
import { USER_REPOSITORY } from '../users/repositories/user.repository.interface';
import type { IUserRepository } from '../users/repositories/user.repository.interface';
import { OrderStatus, PaymentMethod, PaymentStatus } from './entities/order.entity';
import { PaymentService } from '../payments/payment.service';
import { CouponsService } from '../coupons/coupons.service';
import { NOTIFICATION_QUEUE, INVENTORY_QUEUE } from '../queue/queue.module';
import type { NotificationJob } from '../queue/processors/notification.processor';
import type { InventoryJob } from '../queue/processors/inventory.processor';
import { LOW_STOCK_THRESHOLD } from '../queue/processors/inventory.processor';
import type { PlaceOrderDto } from './dto/place-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepo: IOrderRepository,
    @Inject(CART_REPOSITORY)
    private readonly cartRepo: ICartRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: IProductRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    private readonly paymentService: PaymentService,
    private readonly couponsService: CouponsService,
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly notificationQueue: Queue,
    @InjectQueue(INVENTORY_QUEUE)
    private readonly inventoryQueue: Queue,
  ) {}

  async placeOrder(userId: number, dto: PlaceOrderDto) {
    const paymentMethod = dto.paymentMethod ?? PaymentMethod.COD;
    const idempotencyKey = dto.idempotencyKey ?? crypto.randomUUID();

    // Idempotency: return existing order for duplicate requests
    const existing = await this.orderRepo.findByIdempotencyKey(idempotencyKey);
    if (existing) return existing;

    const cartItems = await this.cartRepo.findByUserId(userId);
    if (cartItems.length === 0) throw new BadRequestException('Cart is empty');

    for (const item of cartItems) {
      const product = await this.productRepo.findById(item.productId);
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      if (product.stock < item.quantity)
        throw new BadRequestException(`Insufficient stock for "${product.name}"`);
    }

    let subtotal = 0;
    const orderItems = cartItems.map((item) => {
      const lineTotal = Number(item.product.price) * item.quantity;
      subtotal += lineTotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.product.price),
      };
    });

    let discount = 0;
    let appliedCode: string | null = null;
    if (dto.couponCode) {
      const result = await this.couponsService.applyAndIncrement(dto.couponCode, subtotal);
      discount = result.discountAmount;
      appliedCode = result.code;
    }

    const total = parseFloat((subtotal - discount).toFixed(2));

    // Process payment — throws on failure, preventing order creation
    const { paymentId, status: paymentStatus } = await this.paymentService.process(
      paymentMethod,
      total,
      idempotencyKey,
    );

    for (const item of cartItems) {
      await this.productRepo.decrementStock(item.productId, item.quantity);
    }

    const order = await this.orderRepo.create({
      userId,
      total,
      discount,
      couponCode: appliedCode,
      status: OrderStatus.PENDING,
      paymentMethod,
      paymentStatus: paymentStatus === 'paid' ? PaymentStatus.PAID : PaymentStatus.PENDING,
      paymentId,
      idempotencyKey,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      items: orderItems as any,
    });

    await this.cartRepo.clearCart(userId);

    const user = await this.userRepo.findById(userId);
    if (user) {
      // Queue confirmation email (async, non-blocking)
      await this.notificationQueue.add('send', {
        channels: ['email'],
        payload: {
          type: 'order_confirmation',
          recipient: { email: user.email, name: user.name },
          data: {
            orderId: order.id,
            orderTotal: total,
            items: cartItems.map((item) => ({
              name: item.product.name,
              quantity: item.quantity,
              price: Number(item.product.price),
            })),
          },
        },
      } satisfies NotificationJob);

      // Queue low-stock checks for each purchased product
      for (const item of cartItems) {
        const product = await this.productRepo.findById(item.productId);
        if (!product) continue;
        const newStock = product.stock;
        if (newStock < LOW_STOCK_THRESHOLD) {
          const seller = await this.userRepo.findById(product.sellerId);
          if (seller) {
            await this.inventoryQueue.add('check', {
              productId: product.id,
              productName: product.name,
              newStock,
              sellerEmail: seller.email,
              sellerName: seller.name,
            } satisfies InventoryJob);
          }
        }
      }
    }

    return order;
  }

  async getOrders(userId: number, page: number, limit: number) {
    return this.orderRepo.findByUserId(userId, page, limit);
  }

  async getOrder(id: number) {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
