import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { ORDER_REPOSITORY } from './repositories/order.repository.interface';
import type { IOrderRepository } from './repositories/order.repository.interface';
import { CART_REPOSITORY } from '../cart/repositories/cart.repository.interface';
import type { ICartRepository } from '../cart/repositories/cart.repository.interface';
import { PRODUCT_REPOSITORY } from '../products/repositories/product.repository.interface';
import type { IProductRepository } from '../products/repositories/product.repository.interface';
import { OrderStatus } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepo: IOrderRepository,
    @Inject(CART_REPOSITORY)
    private readonly cartRepo: ICartRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: IProductRepository,
  ) {}

  async placeOrder(userId: number) {
    const cartItems = await this.cartRepo.findByUserId(userId);
    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    for (const item of cartItems) {
      const product = await this.productRepo.findById(item.productId);
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for "${product.name}"`);
      }
    }

    let total = 0;
    const orderItems = cartItems.map((item) => {
      const lineTotal = Number(item.product.price) * item.quantity;
      total += lineTotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.product.price),
      };
    });

    for (const item of cartItems) {
      await this.productRepo.decrementStock(item.productId, item.quantity);
    }

    const order = await this.orderRepo.create({
      userId,
      total,
      status: OrderStatus.CONFIRMED,
      items: orderItems as any,
    });

    await this.cartRepo.clearCart(userId);

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
