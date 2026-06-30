import api from '../api';
import type { Product, PagedProducts, ProductSearchParams, CreateProductPayload, UpdateProductPayload } from '../types/product.types';

export const productService = {
  getProducts: (params: ProductSearchParams = {}) =>
    api.get<PagedProducts>('/products', { params }).then((r) => r.data),

  searchProducts: (params: ProductSearchParams) =>
    api.get<PagedProducts>('/products/search', { params }).then((r) => r.data),

  getProduct: (id: number) =>
    api.get<Product>(`/products/${id}`).then((r) => r.data),

  getRelated: (id: number) =>
    api.get<Product[]>(`/products/${id}/related`).then((r) => r.data),

  createProduct: (payload: CreateProductPayload) =>
    api.post<Product>('/products', payload).then((r) => r.data),

  updateProduct: (id: number, payload: UpdateProductPayload) =>
    api.put<Product>(`/products/${id}`, payload).then((r) => r.data),

  deleteProduct: (id: number) =>
    api.delete(`/products/${id}`),
};
