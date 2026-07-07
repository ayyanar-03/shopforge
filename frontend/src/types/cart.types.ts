export interface CartProduct {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  category?: string | null;
}

export interface CartItem {
  id: number;
  quantity: number;
  product: CartProduct;
}

export interface CouponResult {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  discountAmount: number;
  finalTotal: number;
}

export type PaymentMethod = 'cod' | 'stripe' | 'razorpay';

export interface CheckoutPayload {
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
  couponCode?: string;
}
