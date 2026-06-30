import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { InternalGuard } from '../internal.guard';
import { CouponsService } from '../../coupons/coupons.service';

@Controller('internal/coupons')
@UseGuards(InternalGuard)
export class InternalCouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('apply')
  applyCoupon(@Body('code') code: string, @Body('total') total: number) {
    return this.couponsService.applyAndIncrement(code, total);
  }
}
