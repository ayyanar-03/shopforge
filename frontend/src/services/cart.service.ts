import api from '../api';
import type { CartItem, CouponResult, CheckoutPayload } from '../types/cart.types';

export const cartService = {
  getCart: () =>
    api.get<CartItem[]>('/cart').then((r) => r.data),

  addItem: (productId: number, quantity: number) =>
    api.post<CartItem[]>('/cart', { productId, quantity }).then((r) => r.data),

  removeItem: (itemId: number) =>
    api.delete(`/cart/${itemId}`),

  clearCart: () =>
    api.delete('/cart'),

  validateCoupon: (code: string, total: number) =>
    api.post<CouponResult>('/coupons/validate', { code, total }).then((r) => r.data),

  checkout: (payload: CheckoutPayload) =>
    api.post('/api/orders', payload).then((r) => r.data),
};
