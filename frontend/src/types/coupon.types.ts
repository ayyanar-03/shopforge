export type CouponType = 'percentage' | 'fixed';

export interface Coupon {
  id: number;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

export interface CreateCouponPayload {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  expiresAt?: string;
}
