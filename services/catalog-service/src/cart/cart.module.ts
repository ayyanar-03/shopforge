import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmCartRepository } from './repositories/cart.repository';
import { CART_REPOSITORY } from './repositories/cart.repository.interface';
import { CART_SERVICE } from './cart.service.interface';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem])],
  controllers: [CartController],
  providers: [
    { provide: CART_SERVICE, useClass: CartService },
    { provide: CART_REPOSITORY, useClass: TypeOrmCartRepository },
  ],
  exports: [CART_SERVICE, CART_REPOSITORY],
})
export class CartModule {}
