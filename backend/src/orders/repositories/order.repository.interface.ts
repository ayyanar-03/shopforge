import { Order } from '../entities/order.entity';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface IOrderRepository {
  create(order: Partial<Order>): Promise<Order>;
  findByUserId(userId: number): Promise<Order[]>;
  findById(id: number): Promise<Order | null>;
}
