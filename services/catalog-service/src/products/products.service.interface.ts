import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';
import type { SearchDto } from './dto/search.dto';

export const PRODUCTS_SERVICE = Symbol('PRODUCTS_SERVICE');

export interface IProductsService {
  findAll(page: number, limit: number): Promise<unknown>;
  findOne(id: number): Promise<unknown>;
  search(dto: SearchDto): Promise<unknown>;
  findRelated(id: number): Promise<unknown>;
  create(dto: CreateProductDto, sellerId: number): Promise<unknown>;
  update(id: number, dto: UpdateProductDto, userId: number, userRole: string): Promise<unknown>;
  remove(id: number, userId: number, userRole: string): Promise<void>;
}
