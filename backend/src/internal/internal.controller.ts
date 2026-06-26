import {
  Controller,
  Get,
  Delete,
  Patch,
  Post,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  NotFoundException,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalGuard } from './internal.guard';
import { CART_REPOSITORY } from '../cart/repositories/cart.repository.interface';
import type { ICartRepository } from '../cart/repositories/cart.repository.interface';
import { PRODUCT_REPOSITORY } from '../products/repositories/product.repository.interface';
import type { IProductRepository } from '../products/repositories/product.repository.interface';
import { USER_REPOSITORY } from '../users/repositories/user.repository.interface';
import type { IUserRepository } from '../users/repositories/user.repository.interface';
import { CouponsService } from '../coupons/coupons.service';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';

@Controller('internal')
@UseGuards(InternalGuard)
export class InternalController {
  constructor(
    @Inject(CART_REPOSITORY) private readonly cartRepo: ICartRepository,
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: IProductRepository,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    private readonly couponsService: CouponsService,
    @InjectRepository(User) private readonly userOrmRepo: Repository<User>,
    @InjectRepository(Product) private readonly productOrmRepo: Repository<Product>,
  ) {}

  @Get('stats')
  async getStats() {
    const [totalUsers, totalProducts] = await Promise.all([
      this.userOrmRepo.count(),
      this.productOrmRepo.count(),
    ]);
    return { totalUsers, totalProducts };
  }

  @Get('cart/:userId')
  getCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartRepo.findByUserId(userId);
  }

  @Delete('cart/:userId')
  @HttpCode(204)
  clearCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartRepo.clearCart(userId);
  }

  @Get('products/:id')
  async getProduct(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  @Patch('products/:id/decrement')
  async decrementStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    await this.productRepo.decrementStock(id, quantity);
    return this.productRepo.findById(id);
  }

  @Get('users/:id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return { id: user.id, email: user.email, name: user.name };
  }

  @Post('coupons/apply')
  applyCoupon(@Body('code') code: string, @Body('total') total: number) {
    return this.couponsService.applyAndIncrement(code, total);
  }
}
