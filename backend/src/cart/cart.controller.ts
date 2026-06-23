import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Post()
  addItem(@Request() req: any, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(req.user.id, dto);
  }

  @Delete(':id')
  removeItem(@Param('id', ParseIntPipe) id: number) {
    return this.cartService.removeItem(id);
  }

  @Delete()
  clearCart(@Request() req: any) {
    return this.cartService.clearCart(req.user.id);
  }
}
