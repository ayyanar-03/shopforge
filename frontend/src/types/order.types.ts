export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: { name: string };
}

export type PaymentMethod = 'cod' | 'stripe' | 'razorpay';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface Order {
  id: number;
  userId: number;
  total: number;
  discount: number;
  couponCode: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  items: OrderItem[];
  user?: { name: string; email: string };
}

export interface PagedOrders {
  data: Order[];
  total: number;
  page: number;
  totalPages: number;
}
