import { Injectable, Inject } from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CART_REPOSITORY } from './repositories/cart.repository.interface';
import type { ICartRepository } from './repositories/cart.repository.interface';

@Injectable()
export class CartService {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepo: ICartRepository,
  ) {}

  getCart(userId: number) {
    return this.cartRepo.findByUserId(userId);
  }

  async addItem(userId: number, dto: AddToCartDto) {
    const existing = await this.cartRepo.findItem(userId, dto.productId);
    if (existing) {
      await this.cartRepo.updateQuantity(existing.id, existing.quantity + dto.quantity);
      return this.cartRepo.findByUserId(userId);
    }

    await this.cartRepo.addItem({ userId, productId: dto.productId, quantity: dto.quantity });
    return this.cartRepo.findByUserId(userId);
  }

  async removeItem(itemId: number) {
    await this.cartRepo.removeItem(itemId);
  }

  async clearCart(userId: number) {
    await this.cartRepo.clearCart(userId);
  }
}
