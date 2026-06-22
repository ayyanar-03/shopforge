import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../entities/cart-item.entity';
import { ICartRepository } from './cart.repository.interface';

@Injectable()
export class TypeOrmCartRepository implements ICartRepository {
  constructor(
    @InjectRepository(CartItem)
    private readonly repo: Repository<CartItem>,
  ) {}

  async findByUserId(userId: number): Promise<CartItem[]> {
    return this.repo.find({ where: { userId }, relations: ['product'] });
  }

  async findItem(userId: number, productId: number): Promise<CartItem | null> {
    return this.repo.findOne({ where: { userId, productId } });
  }

  async addItem(data: Partial<CartItem>): Promise<CartItem> {
    const item = this.repo.create(data);
    return this.repo.save(item);
  }

  async updateQuantity(id: number, quantity: number): Promise<void> {
    await this.repo.update(id, { quantity });
  }

  async removeItem(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async clearCart(userId: number): Promise<void> {
    await this.repo.delete({ userId });
  }
}
