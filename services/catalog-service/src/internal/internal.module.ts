import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from '../cart/cart.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { CouponsModule } from '../coupons/coupons.module';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { InternalGuard } from './internal.guard';
import { InternalStatsController } from './controllers/internal-stats.controller';
import { InternalCartController } from './controllers/internal-cart.controller';
import { InternalProductsController } from './controllers/internal-products.controller';
import { InternalUsersController } from './controllers/internal-users.controller';
import { InternalCouponsController } from './controllers/internal-coupons.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Product]),
    CartModule,
    ProductsModule,
    UsersModule,
    CouponsModule,
  ],
  controllers: [
    InternalStatsController,
    InternalCartController,
    InternalProductsController,
    InternalUsersController,
    InternalCouponsController,
  ],
  providers: [InternalGuard],
})
export class InternalModule {}
