import { Product } from '../entities/product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: number): Promise<Product | null>;
  create(product: Partial<Product>): Promise<Product>;
  update(id: number, data: Partial<Product>): Promise<Product | null>;
  delete(id: number): Promise<void>;
  decrementStock(id: number, quantity: number): Promise<void>;
}
