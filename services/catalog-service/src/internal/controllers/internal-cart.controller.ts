import { Controller, Get, Delete, Param, ParseIntPipe, HttpCode, UseGuards, Inject } from '@nestjs/common';
import { InternalGuard } from '../internal.guard';
import { CART_REPOSITORY } from '../../cart/repositories/cart.repository.interface';
import type { ICartRepository } from '../../cart/repositories/cart.repository.interface';

@Controller('internal/cart')
@UseGuards(InternalGuard)
export class InternalCartController {
  constructor(@Inject(CART_REPOSITORY) private readonly cartRepo: ICartRepository) {}

  @Get(':userId')
  getCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartRepo.findByUserId(userId);
  }

  @Delete(':userId')
  @HttpCode(204)
  clearCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartRepo.clearCart(userId);
  }
}
