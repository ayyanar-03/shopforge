import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
  ) {}

  async getStats() {
    const [totalUsers, totalProducts, totalOrders, revenueResult] = await Promise.all([
      this.userRepo.count(),
      this.productRepo.count(),
      this.orderRepo.count(),
      this.orderRepo
        .createQueryBuilder('o')
        .select('COALESCE(SUM(o.total), 0)', 'revenue')
        .getRawOne<{ revenue: string }>(),
    ]);
    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: parseFloat(revenueResult?.revenue ?? '0'),
    };
  }

  async getUsers(page: number, limit: number) {
    const [data, total] = await this.userRepo.findAndCount({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getOrders(page: number, limit: number) {
    const [data, total] = await this.orderRepo.findAndCount({
      relations: { items: { product: true }, user: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateOrderStatus(id: number, status: OrderStatus) {
    const order = await this.orderRepo.findOneBy({ id });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return this.orderRepo.save(order);
  }
}
