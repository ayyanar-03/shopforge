import type { AddToCartDto } from './dto/add-to-cart.dto';

export const CART_SERVICE = Symbol('CART_SERVICE');

export interface ICartService {
  getCart(userId: number): Promise<unknown>;
  addItem(userId: number, dto: AddToCartDto): Promise<unknown>;
  removeItem(itemId: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
}
