export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string };
}

export interface ReviewsResponse {
  data: Review[];
  total: number;
  averageRating: number;
  reviewCount: number;
}

export interface CreateReviewPayload {
  productId: number;
  rating: number;
  comment?: string;
}
