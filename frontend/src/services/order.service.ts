import api from '../api';
import type { Order, PagedOrders } from '../types/order.types';

export const orderService = {
  getOrders: () =>
    api.get<Order[]>('/orders').then((r) => r.data),

  getAdminOrders: (page: number, limit = 20) =>
    api.get<PagedOrders>('/admin/orders', { params: { page, limit } }).then((r) => r.data),

  updateOrderStatus: (orderId: number, status: string) =>
    api.patch<Order>(`/admin/orders/${orderId}/status`, { status }).then((r) => r.data),
};
