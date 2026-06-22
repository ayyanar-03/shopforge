import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { IOrderRepository } from './order.repository.interface';

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

  async findByUserId(userId: number): Promise<Order[]> {
    return this.repo.find({ where: { userId }, relations: ['items', 'items.product'], order: { createdAt: 'DESC' } });
  }

  async findById(id: number): Promise<Order | null> {
    return this.repo.findOne({ where: { id }, relations: ['items', 'items.product'] });
  }
}
