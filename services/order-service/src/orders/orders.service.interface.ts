import type { PlaceOrderDto } from './dto/place-order.dto';

export const ORDERS_SERVICE = Symbol('ORDERS_SERVICE');

export interface IOrdersService {
  placeOrder(userId: number, dto: PlaceOrderDto): Promise<unknown>;
  getOrders(userId: number, page: number, limit: number): Promise<unknown>;
  getOrder(id: number): Promise<unknown>;
  cancelOrder(userId: number, orderId: number): Promise<unknown>;
}
