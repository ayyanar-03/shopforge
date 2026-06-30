import api from '../api';
import type { Product } from '../types/product.types';

export const wishlistService = {
  getWishlist: () =>
    api.get<Product[]>('/wishlist').then((r) => r.data),

  // Returns array of product IDs currently in the user's wishlist
  getWishlistIds: () =>
    api.get<number[]>('/wishlist/ids').then((r) => r.data),

  addToWishlist: (productId: number) =>
    api.post(`/wishlist/${productId}`),

  removeFromWishlist: (productId: number) =>
    api.delete(`/wishlist/${productId}`),
};
