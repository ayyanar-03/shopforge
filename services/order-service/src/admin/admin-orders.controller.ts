import {
  Controller, Get, Patch, Query, Param, Body, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, ROLES_KEY } from '../auth/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { CatalogClientService } from '../catalog-client/catalog-client.service';
import { IsEnum } from 'class-validator';

class UpdateStatusDto {
  @IsEnum(OrderStatus) status!: OrderStatus;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@SetMetadata(ROLES_KEY, ['admin'])
export class AdminOrdersController {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    private readonly catalog: CatalogClientService,
  ) {}

  @Get('stats')
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

  @Get('orders')
  async getOrders(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    const [data, total] = await this.orderRepo.findAndCount({
      relations: { items: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  @Patch('orders/:id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    const order = await this.orderRepo.findOneBy({ id });
    if (!order) return { error: 'Order not found' };
    order.status = dto.status;
    return this.orderRepo.save(order);
  }
}
