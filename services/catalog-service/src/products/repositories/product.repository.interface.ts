import { Product } from '../entities/product.entity';
import { SearchDto } from '../dto/search.dto';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IProductRepository {
  findAll(page: number, limit: number): Promise<PaginatedResult<Product>>;
  findById(id: number): Promise<Product | null>;
  search(dto: SearchDto): Promise<PaginatedResult<Product>>;
  findRelated(category: string | null, excludeId: number, limit: number): Promise<Product[]>;
  create(product: Partial<Product>): Promise<Product>;
  update(id: number, data: Partial<Product>): Promise<Product | null>;
  delete(id: number): Promise<void>;
  decrementStock(id: number, quantity: number): Promise<void>;
}
