import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { ORDER_REPOSITORY } from './repositories/order.repository.interface';
import type { IOrderRepository } from './repositories/order.repository.interface';
import { CART_REPOSITORY } from '../cart/repositories/cart.repository.interface';
import type { ICartRepository } from '../cart/repositories/cart.repository.interface';
import { PRODUCT_REPOSITORY } from '../products/repositories/product.repository.interface';
import type { IProductRepository } from '../products/repositories/product.repository.interface';
import { USER_REPOSITORY } from '../users/repositories/user.repository.interface';
import type { IUserRepository } from '../users/repositories/user.repository.interface';
import { OrderStatus } from './entities/order.entity';
import { EmailService } from '../email/email.service';
import { CouponsService } from '../coupons/coupons.service';

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
    private readonly emailService: EmailService,
    private readonly couponsService: CouponsService,
  ) {}

  async placeOrder(userId: number, couponCode?: string) {
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

    if (couponCode) {
      const result = await this.couponsService.applyAndIncrement(couponCode, subtotal);
      discount = result.discountAmount;
      appliedCode = result.code;
    }

    const total = parseFloat((subtotal - discount).toFixed(2));

    for (const item of cartItems) {
      await this.productRepo.decrementStock(item.productId, item.quantity);
    }

    const order = await this.orderRepo.create({
      userId,
      total,
      discount,
      couponCode: appliedCode,
      status: OrderStatus.PENDING,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      items: orderItems as any,
    });

    await this.cartRepo.clearCart(userId);

    const user = await this.userRepo.findById(userId);
    if (user) {
      void this.emailService.sendOrderConfirmation(user.email, user.name, {
        id: order.id,
        total,
        items: cartItems.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: Number(item.product.price),
        })),
      });
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
