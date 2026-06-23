import { Controller, Get, Post, Param, Query, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  placeOrder(@Request() req: any) {
    return this.ordersService.placeOrder(req.user.id);
  }

  @Get()
  getOrders(@Request() req: any, @Query() pagination: PaginationDto) {
    return this.ordersService.getOrders(req.user.id, pagination.page!, pagination.limit!);
  }

  @Get(':id')
  getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrder(id);
  }
}
