import {
  Injectable, BadRequestException, NotFoundException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Repository, DeepPartial } from 'typeorm';
import { Queue } from 'bullmq';
import { Order, OrderStatus, PaymentMethod, PaymentStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { PlaceOrderDto } from './dto/place-order.dto';
import { CatalogClientService, CartItemDto } from '../catalog-client/catalog-client.service';
import { PaymentService } from '../payments/payment.service';
import { NOTIFICATION_QUEUE, INVENTORY_QUEUE, LOW_STOCK_THRESHOLD } from '../queue/queue.module';

interface LineItem {
  productId: number;
  quantity: number;
  price: number;
}

interface StockUpdate {
  productId: number;
  productName: string;
  newStock: number;
  sellerId: number;
}

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

    const existing = await this.orderRepo.findOne({
      where: { idempotencyKey },
      relations: { items: true },
    });
    if (existing) return existing;

    const cartItems = await this.catalog.getCartItems(userId);
    if (!cartItems.length) throw new BadRequestException('Cart is empty');

    this.validateStock(cartItems);

    const { lineItems, subtotal } = this.buildLineItems(cartItems);

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

    const stockUpdates = await this.decrementAllStock(cartItems);

    const order = this.orderRepo.create({
      userId, total, discount, couponCode: appliedCode,
      status: OrderStatus.PENDING,
      paymentMethod,
      paymentStatus: paymentStatus === 'paid' ? PaymentStatus.PAID : PaymentStatus.PENDING,
      paymentId, idempotencyKey,
      items: lineItems as DeepPartial<OrderItem>[],
    });
    await this.orderRepo.save(order);

    await this.catalog.clearCart(userId);

    void this.dispatchPostOrderJobs(userId, order, cartItems, stockUpdates);

    return order;
  }

  private validateStock(cartItems: CartItemDto[]): void {
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for "${item.product.name}"`);
      }
    }
  }

  private buildLineItems(cartItems: CartItemDto[]): { lineItems: LineItem[]; subtotal: number } {
    return cartItems.reduce(
      (acc, item) => {
        const price = Number(item.product.price);
        acc.lineItems.push({ productId: item.productId, quantity: item.quantity, price });
        acc.subtotal += price * item.quantity;
        return acc;
      },
      { lineItems: [] as LineItem[], subtotal: 0 },
    );
  }

  private async decrementAllStock(cartItems: CartItemDto[]): Promise<StockUpdate[]> {
    return Promise.all(
      cartItems.map(async (item) => {
        const updated = await this.catalog.decrementStock(item.productId, item.quantity);
        return {
          productId: updated.id,
          productName: item.product.name,
          newStock: updated.stock,
          sellerId: item.product.sellerId,
        };
      }),
    );
  }

  private async dispatchPostOrderJobs(
    userId: number,
    order: Order,
    cartItems: CartItemDto[],
    stockUpdates: StockUpdate[],
  ): Promise<void> {
    const user = await this.catalog.getUser(userId);
    if (user) {
      void this.notificationQueue.add('send', {
        channels: ['email'],
        payload: {
          type: 'order_confirmation',
          recipient: { email: user.email, name: user.name },
          data: {
            orderId: order.id,
            orderTotal: order.total,
            items: cartItems.map((i) => ({
              name: i.product.name,
              quantity: i.quantity,
              price: Number(i.product.price),
            })),
          },
        },
      });
    }

    const lowStock = stockUpdates.filter((s) => s.newStock < LOW_STOCK_THRESHOLD);
    for (const item of lowStock) {
      void this.inventoryQueue.add('check', item);
    }
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

  async cancelOrder(userId: number, orderId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId, userId }, relations: { items: true } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'pending') {
      throw new BadRequestException('Only pending orders can be cancelled');
    }
    order.status = OrderStatus.CANCELLED;
    return this.orderRepo.save(order);
  }

  async getStats() {
    const result = await this.orderRepo
      .createQueryBuilder('o')
      .select(['COUNT(*) AS totalorders', 'COALESCE(SUM(o.total), 0) AS totalrevenue'])
      .getRawOne<{ totalorders: string; totalrevenue: string }>();
    return {
      totalOrders: parseInt(result?.totalorders ?? '0', 10),
      totalRevenue: parseFloat(result?.totalrevenue ?? '0'),
    };
  }
}
