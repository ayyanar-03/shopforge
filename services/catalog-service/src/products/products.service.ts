import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
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

  async create(dto: CreateProductDto, sellerId: number) {
    const product = await this.productRepo.create({ ...dto, sellerId });
    await this.cache.delByPattern('products:list:*');
    return product;
  }

  async update(id: number, dto: UpdateProductDto, userId: number, userRole: string) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    if (userRole === 'seller' && product.sellerId !== userId) {
      throw new ForbiddenException('You can only edit your own products');
    }
    const updated = await this.productRepo.update(id, dto);
    await this.cache.del(`products:detail:${id}`);
    await this.cache.delByPattern('products:list:*');
    return updated;
  }

  async remove(id: number, userId: number, userRole: string) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    if (userRole === 'seller' && product.sellerId !== userId) {
      throw new ForbiddenException('You can only delete your own products');
    }
    await this.productRepo.delete(id);
    await this.cache.del(`products:detail:${id}`);
    await this.cache.delByPattern('products:list:*');
  }
}
