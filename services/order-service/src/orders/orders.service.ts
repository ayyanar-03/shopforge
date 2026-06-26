import {
  Injectable, BadRequestException, NotFoundException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { Order, OrderStatus, PaymentMethod, PaymentStatus } from './entities/order.entity';
import { PlaceOrderDto } from './dto/place-order.dto';
import { CatalogClientService } from '../catalog-client/catalog-client.service';
import { PaymentService } from '../payments/payment.service';
import { NOTIFICATION_QUEUE, INVENTORY_QUEUE, LOW_STOCK_THRESHOLD } from '../queue/queue.module';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    private readonly catalog: CatalogClientService,
    private readonly paymentService: PaymentService,
    @InjectQueue(NOTIFICATION_QUEUE) private readonly notificationQueue: Queue,
    @InjectQueue(INVENTORY_QUEUE) private readonly inventoryQueue: Queue,
  ) {}

  async placeOrder(userId: number, dto: PlaceOrderDto) {
    const paymentMethod = dto.paymentMethod ?? PaymentMethod.COD;
    const idempotencyKey = dto.idempotencyKey ?? crypto.randomUUID();

    // Idempotency: return existing order on duplicate requests
    const existing = await this.orderRepo.findOne({
      where: { idempotencyKey },
      relations: { items: true },
    });
    if (existing) return existing;

    const cartItems = await this.catalog.getCartItems(userId);
    if (!cartItems.length) throw new BadRequestException('Cart is empty');

    for (const item of cartItems) {
      const product = await this.catalog.getProduct(item.productId);
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      if (product.stock < item.quantity)
        throw new BadRequestException(`Insufficient stock for "${product.name}"`);
    }

    let subtotal = 0;
    const orderItems = cartItems.map((item) => {
      const line = Number(item.product.price) * item.quantity;
      subtotal += line;
      return { productId: item.productId, quantity: item.quantity, price: Number(item.product.price) };
    });

    let discount = 0;
    let appliedCode: string | null = null;
    if (dto.couponCode) {
      const result = await this.catalog.applyCoupon(dto.couponCode, subtotal);
      discount = result.discountAmount;
      appliedCode = result.code;
    }

    const total = parseFloat((subtotal - discount).toFixed(2));

    const { paymentId, status: paymentStatus } = await this.paymentService.process(
      paymentMethod, total, idempotencyKey,
    );

    // Decrement stock and collect updated stock levels for low-stock checks
    const stockUpdates: { productId: number; productName: string; newStock: number; sellerId: number }[] = [];
    for (const item of cartItems) {
      const updated = await this.catalog.decrementStock(item.productId, item.quantity);
      stockUpdates.push({
        productId: updated.id,
        productName: item.product.name,
        newStock: updated.stock,
        sellerId: item.product.sellerId,
      });
    }

    const order = this.orderRepo.create({
      userId, total, discount, couponCode: appliedCode,
      status: OrderStatus.PENDING,
      paymentMethod,
      paymentStatus: paymentStatus === 'paid' ? PaymentStatus.PAID : PaymentStatus.PENDING,
      paymentId, idempotencyKey,
      items: orderItems as never,
    });
    await this.orderRepo.save(order);

    await this.catalog.clearCart(userId);

    // Fan out async jobs — failures never block the order response
    const user = await this.catalog.getUser(userId);
    if (user) {
      void this.notificationQueue.add('send', {
        channels: ['email'],
        payload: {
          type: 'order_confirmation',
          recipient: { email: user.email, name: user.name },
          data: {
            orderId: order.id, orderTotal: total,
            items: cartItems.map((i) => ({
              name: i.product.name, quantity: i.quantity, price: Number(i.product.price),
            })),
          },
        },
      });

      for (const { productId, productName, newStock, sellerId } of stockUpdates) {
        if (newStock < LOW_STOCK_THRESHOLD) {
          const seller = await this.catalog.getUser(sellerId);
          if (seller) {
            void this.inventoryQueue.add('check', {
              productId, productName, newStock,
              sellerEmail: seller.email, sellerName: seller.name,
            });
          }
        }
      }
    }

    return order;
  }

  async getOrders(userId: number, page: number, limit: number) {
    const [data, total] = await this.orderRepo.findAndCount({
      where: { userId },
      relations: { items: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getOrder(id: number) {
    const order = await this.orderRepo.findOne({ where: { id }, relations: { items: true } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getStats() {
    const result = await this.orderRepo
      .createQueryBuilder('o')
      .select(['COUNT(*) AS totalOrders', 'COALESCE(SUM(o.total), 0) AS totalRevenue'])
      .getRawOne<{ totalOrders: string; totalRevenue: string }>();
    return {
      totalOrders: parseInt(result?.totalOrders ?? '0', 10),
      totalRevenue: parseFloat(result?.totalRevenue ?? '0'),
    };
  }
}
