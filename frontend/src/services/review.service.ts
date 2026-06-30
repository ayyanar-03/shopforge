import api from '../api';
import type { ReviewsResponse } from '../types/review.types';

export const reviewService = {
  // Reviews live under the product route: GET /products/:id/reviews
  getProductReviews: (productId: number, limit = 20) =>
    api.get<ReviewsResponse>(`/products/${productId}/reviews`, { params: { limit } }).then((r) => r.data),

  // POST /products/:id/reviews
  createReview: (productId: number, rating: number, comment?: string) =>
    api.post(`/products/${productId}/reviews`, { rating, comment }).then((r) => r.data),
};
