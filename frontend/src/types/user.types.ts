export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface OrderStatusCount {
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  count: number;
}

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: OrderStatusCount[];
}
