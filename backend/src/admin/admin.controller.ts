import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreateCouponDto } from '../coupons/dto/create-coupon.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@SkipThrottle()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers(@Query() pagination: PaginationDto) {
    return this.adminService.getUsers(pagination.page!, pagination.limit!);
  }

  @Get('orders')
  getOrders(@Query() pagination: PaginationDto) {
    return this.adminService.getOrders(pagination.page!, pagination.limit!);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderStatusDto) {
    return this.adminService.updateOrderStatus(id, dto.status);
  }

  @Get('coupons')
  getCoupons() {
    return this.adminService.getCoupons();
  }

  @Post('coupons')
  createCoupon(@Body() dto: CreateCouponDto) {
    return this.adminService.createCoupon(dto);
  }

  @Patch('coupons/:id/toggle')
  toggleCoupon(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleCoupon(id);
  }

  @Delete('coupons/:id')
  deleteCoupon(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCoupon(id);
  }
}
