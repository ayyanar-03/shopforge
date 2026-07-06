import {
  Controller, Get, Post, Param, Body, Query, ParseIntPipe, UseGuards, Request, Inject,
} from '@nestjs/common';
import { PlaceOrderDto } from './dto/place-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ORDERS_SERVICE, type IOrdersService } from './orders.service.interface';

interface Req { user: { id: number; email: string; role: string } }

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(@Inject(ORDERS_SERVICE) private readonly ordersService: IOrdersService) {}

  @Post()
  placeOrder(@Request() req: Req, @Body() dto: PlaceOrderDto) {
    return this.ordersService.placeOrder(req.user.id, dto);
  }

  @Get()
  getOrders(
    @Request() req: Req,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.ordersService.getOrders(req.user.id, page, limit);
  }

  @Get(':id')
  getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrder(id);
  }
}
