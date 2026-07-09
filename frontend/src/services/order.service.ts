import api from '../api';
import type { Order, PagedOrders, PagedReturnRequests, ReturnRequest, ReturnRequestStatus } from '../types/order.types';

export const orderService = {
  getOrders: () =>
    api.get<PagedOrders>('/api/orders').then((r) => r.data.data),

  cancelOrder: (orderId: number) =>
    api.patch<Order>(`/api/orders/${orderId}/cancel`).then((r) => r.data),

  requestReturn: (orderId: number, reason: string, details?: string) =>
    api.post<ReturnRequest>(`/api/orders/${orderId}/return`, { reason, details }).then((r) => r.data),

  getAdminOrders: (page: number, limit = 20) =>
    api.get<PagedOrders>('/api/admin/orders', { params: { page, limit } }).then((r) => r.data),

  updateOrderStatus: (orderId: number, status: string) =>
    api.patch<Order>(`/api/admin/orders/${orderId}/status`, { status }).then((r) => r.data),

  getReturnRequests: (page: number, limit = 20) =>
    api.get<PagedReturnRequests>('/api/admin/returns', { params: { page, limit } }).then((r) => r.data),

  verifyReturnRequest: (id: number, status: Exclude<ReturnRequestStatus, 'pending'>) =>
    api.patch<ReturnRequest>(`/api/admin/returns/${id}/verify`, { status }).then((r) => r.data),
};
