import api from '../api';
import type { PagedProducts } from '../types/product.types';

interface SellerStats {
  totalProducts: number;
  totalReviews: number;
  averageRating: number;
}

export const sellerService = {
  getProducts: (page: number, limit = 20) =>
    api.get<PagedProducts>('/seller/products', { params: { page, limit } }).then((r) => r.data),

  getStats: () =>
    api.get<SellerStats>('/seller/stats').then((r) => r.data),
};
