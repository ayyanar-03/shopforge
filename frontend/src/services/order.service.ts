import api from '../api';
import type { PagedOrders } from '../types/order.types';

export const orderService = {
  getOrders: () =>
    api.get<PagedOrders>('/api/orders').then((r) => r.data.data),

  getAdminOrders: (page: number, limit = 20) =>
    api.get<PagedOrders>('/api/admin/orders', { params: { page, limit } }).then((r) => r.data),

  updateOrderStatus: (orderId: number, status: string) =>
    api.patch<Order>(`/api/admin/orders/${orderId}/status`, { status }).then((r) => r.data),
};
