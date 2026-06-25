import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchDto } from './dto/search.dto';
import { PRODUCT_REPOSITORY } from './repositories/product.repository.interface';
import type { IProductRepository } from './repositories/product.repository.interface';
import { CacheService } from '../cache/cache.service';

const CACHE_TTL = 60;

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: IProductRepository,
    private readonly cache: CacheService,
  ) {}

  async findAll(page: number, limit: number) {
    const cacheKey = `products:list:${page}:${limit}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const result = await this.productRepo.findAll(page, limit);
    await this.cache.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async findOne(id: number) {
    const cacheKey = `products:detail:${id}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    await this.cache.set(cacheKey, product, CACHE_TTL);
    return product;
  }

  async search(dto: SearchDto) {
    return this.productRepo.search(dto);
  }

  async findRelated(id: number) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return this.productRepo.findRelated(product.category, id, 4);
  }

  async create(dto: CreateProductDto) {
    const product = await this.productRepo.create(dto);
    await this.cache.delByPattern('products:list:*');
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.productRepo.update(id, dto);
    if (!product) throw new NotFoundException('Product not found');
    await this.cache.del(`products:detail:${id}`);
    await this.cache.delByPattern('products:list:*');
    return product;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.productRepo.delete(id);
    await this.cache.del(`products:detail:${id}`);
    await this.cache.delByPattern('products:list:*');
  }
}
