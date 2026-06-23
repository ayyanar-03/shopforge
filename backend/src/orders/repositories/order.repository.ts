import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { IOrderRepository } from './order.repository.interface';
import type { PaginatedResult } from '../../products/repositories/product.repository.interface';

@Injectable()
export class TypeOrmOrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
  ) {}

  async create(data: Partial<Order>): Promise<Order> {
    const order = this.repo.create(data);
    return this.repo.save(order);
  }

  async findByUserId(userId: number, page: number, limit: number): Promise<PaginatedResult<Order>> {
    const [data, total] = await this.repo.findAndCount({
      where: { userId },
      relations: { items: { product: true } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: number): Promise<Order | null> {
    return this.repo.findOne({ where: { id }, relations: { items: { product: true } } });
  }
}
