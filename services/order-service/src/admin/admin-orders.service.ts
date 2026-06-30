import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { CatalogClientService } from '../catalog-client/catalog-client.service';

@Injectable()
export class AdminOrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    private readonly catalog: CatalogClientService,
  ) {}

  async getStats() {
    const [orderStats, catalogStats] = await Promise.all([
      this.orderRepo
        .createQueryBuilder('o')
        .select(['COUNT(*) AS totalOrders', 'COALESCE(SUM(o.total), 0) AS totalRevenue'])
        .getRawOne<{ totalOrders: string; totalRevenue: string }>(),
      this.catalog.getCatalogStats(),
    ]);
    return {
      ...catalogStats,
      totalOrders: parseInt(orderStats?.totalOrders ?? '0', 10),
      totalRevenue: parseFloat(orderStats?.totalRevenue ?? '0'),
    };
  }

  async getOrders(page: number, limit: number) {
    const [data, total] = await this.orderRepo.findAndCount({
      relations: { items: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(id: number, status: OrderStatus) {
    const order = await this.orderRepo.findOneBy({ id });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return this.orderRepo.save(order);
  }
}
