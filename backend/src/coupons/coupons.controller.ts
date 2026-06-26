import {
  Controller,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { CouponsService } from './coupons.service';
import { ValidateCouponDto } from './dto/create-coupon.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('coupons')
@SkipThrottle()
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  validate(@Body() dto: ValidateCouponDto) {
    return this.couponsService.validate(dto.code, dto.total);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.remove(id);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard)
  toggle(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.toggle(id);
  }
}
