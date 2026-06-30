import {
  Controller, Get, Patch, Query, Param, Body, ParseIntPipe, UseGuards, Inject,
} from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../orders/entities/order.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, ROLES_KEY } from '../auth/roles.guard';
import { ADMIN_ORDERS_SERVICE, type IAdminOrdersService } from './admin-orders.service.interface';

class UpdateStatusDto {
  @IsEnum(OrderStatus) status!: OrderStatus;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@SetMetadata(ROLES_KEY, ['admin'])
export class AdminOrdersController {
  constructor(
    @Inject(ADMIN_ORDERS_SERVICE) private readonly adminOrdersService: IAdminOrdersService,
  ) {}

  @Get('stats')
  getStats() {
    return this.adminOrdersService.getStats();
  }

  @Get('orders')
  getOrders(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.adminOrdersService.getOrders(page, limit);
  }

  @Patch('orders/:id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.adminOrdersService.updateStatus(id, dto.status);
  }
}
