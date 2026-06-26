import { Order } from '../entities/order.entity';
import type { PaginatedResult } from '../../products/repositories/product.repository.interface';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface IOrderRepository {
  create(order: Partial<Order>): Promise<Order>;
  findByUserId(userId: number, page: number, limit: number): Promise<PaginatedResult<Order>>;
  findById(id: number): Promise<Order | null>;
  findByIdempotencyKey(key: string): Promise<Order | null>;
}
