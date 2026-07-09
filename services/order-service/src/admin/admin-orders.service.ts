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
    const [orderStats, statusRows, catalogStats] = await Promise.all([
      this.orderRepo
        .createQueryBuilder('o')
        .select(['COUNT(*) AS totalorders', 'COALESCE(SUM(o.total), 0) AS totalrevenue'])
        .getRawOne<{ totalorders: string; totalrevenue: string }>(),
      this.orderRepo
        .createQueryBuilder('o')
        .select(['o.status AS status', 'COUNT(*) AS count'])
        .groupBy('o.status')
        .getRawMany<{ status: string; count: string }>(),
      this.catalog.getCatalogStats(),
    ]);

    const countByStatus = new Map(statusRows.map((r) => [r.status, parseInt(r.count, 10)]));
    const ordersByStatus = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(
      (status) => ({ status, count: countByStatus.get(status) ?? 0 }),
    );

    return {
      ...catalogStats,
      totalOrders: parseInt(orderStats?.totalorders ?? '0', 10),
      totalRevenue: parseFloat(orderStats?.totalrevenue ?? '0'),
      ordersByStatus,
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
