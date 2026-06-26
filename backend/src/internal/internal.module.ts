import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from '../cart/cart.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { CouponsModule } from '../coupons/coupons.module';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { InternalController } from './internal.controller';
import { InternalGuard } from './internal.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Product]),
    CartModule,
    ProductsModule,
    UsersModule,
    CouponsModule,
  ],
  controllers: [InternalController],
  providers: [InternalGuard],
})
export class InternalModule {}
