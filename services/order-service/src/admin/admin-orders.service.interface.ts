import type { OrderStatus } from '../orders/entities/order.entity';

export const ADMIN_ORDERS_SERVICE = Symbol('ADMIN_ORDERS_SERVICE');

export interface IAdminOrdersService {
  getStats(): Promise<unknown>;
  getOrders(page: number, limit: number): Promise<unknown>;
  updateStatus(id: number, status: OrderStatus): Promise<unknown>;
}
