import { CartItem } from '../entities/cart-item.entity';

export const CART_REPOSITORY = Symbol('CART_REPOSITORY');

export interface ICartRepository {
  findByUserId(userId: number): Promise<CartItem[]>;
  findItem(userId: number, productId: number): Promise<CartItem | null>;
  addItem(data: Partial<CartItem>): Promise<CartItem>;
  updateQuantity(id: number, quantity: number): Promise<void>;
  removeItem(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
}
