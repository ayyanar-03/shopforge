export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: { name: string };
}

export interface Order {
  id: number;
  total: number;
  status: OrderStatus;
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
