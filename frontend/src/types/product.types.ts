import type { PagedResponse } from './common.types';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string | null;
  imageUrl: string | null;
  averageRating: number;
  reviewCount: number;
  sellerId?: number;
}

export type PagedProducts = PagedResponse<Product>;

export interface ProductSearchParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sort?: string;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  category?: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;
