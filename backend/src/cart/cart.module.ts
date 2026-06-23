import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmCartRepository } from './repositories/cart.repository';
import { CART_REPOSITORY } from './repositories/cart.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem])],
  controllers: [CartController],
  providers: [
    CartService,
    { provide: CART_REPOSITORY, useClass: TypeOrmCartRepository },
  ],
  exports: [CART_REPOSITORY],
})
export class CartModule {}
