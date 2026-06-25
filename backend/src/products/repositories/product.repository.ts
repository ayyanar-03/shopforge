import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { IProductRepository, PaginatedResult } from './product.repository.interface';
import { SearchDto, SortBy, SortOrder } from '../dto/search.dto';

@Injectable()
export class TypeOrmProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  async findAll(page: number, limit: number): Promise<PaginatedResult<Product>> {
    const [data, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: number): Promise<Product | null> {
    return this.repo.findOne({ where: { id } });
  }

  async search(dto: SearchDto): Promise<PaginatedResult<Product>> {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      sortBy = SortBy.RELEVANCE,
      sortOrder = SortOrder.DESC,
      page = 1,
      limit = 20,
    } = dto;

    const qb = this.repo.createQueryBuilder('p');

    const trimmed = q?.trim() ?? '';
    if (trimmed.length >= 3) {
      const boolQ = trimmed
        .split(/\s+/)
        .map((w) => `+${w}*`)
        .join(' ');
      qb.where('MATCH(p.name, p.description) AGAINST (:boolQ IN BOOLEAN MODE)', { boolQ });
    } else if (trimmed.length > 0) {
      qb.where('(p.name LIKE :like OR p.description LIKE :like)', { like: `%${trimmed}%` });
    }

    if (category) qb.andWhere('p.category = :category', { category });
    if (minPrice != null) qb.andWhere('p.price >= :minPrice', { minPrice });
    if (maxPrice != null) qb.andWhere('p.price <= :maxPrice', { maxPrice });

    const so = sortOrder === SortOrder.ASC ? 'ASC' : ('DESC' as const);
    switch (sortBy) {
      case SortBy.PRICE:
        qb.orderBy('p.price', so);
        break;
      case SortBy.NAME:
        qb.orderBy('p.name', so);
        break;
      default:
        qb.orderBy('p.createdAt', 'DESC');
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findRelated(category: string | null, excludeId: number, limit: number): Promise<Product[]> {
    if (!category) return [];
    return this.repo.find({
      where: { category, id: Not(excludeId) },
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: Partial<Product>): Promise<Product> {
    const product = this.repo.create(data);
    return this.repo.save(product);
  }

  async update(id: number, data: Partial<Product>): Promise<Product | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async decrementStock(id: number, quantity: number): Promise<void> {
    await this.repo.decrement({ id }, 'stock', quantity);
  }
}
