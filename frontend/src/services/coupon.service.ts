import api from '../api';
import type { Coupon, CreateCouponPayload } from '../types/coupon.types';

export const couponService = {
  getCoupons: () =>
    api.get<Coupon[]>('/admin/coupons').then((r) => r.data),

  createCoupon: (payload: CreateCouponPayload) =>
    api.post<Coupon>('/admin/coupons', payload).then((r) => r.data),

  deleteCoupon: (id: number) =>
    api.delete(`/admin/coupons/${id}`),

  toggleCoupon: (id: number) =>
    api.patch(`/admin/coupons/${id}/toggle`).then((r) => r.data),
};
