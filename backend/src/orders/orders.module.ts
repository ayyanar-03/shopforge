import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmOrderRepository } from './repositories/order.repository';
import { ORDER_REPOSITORY } from './repositories/order.repository.interface';
import { CartModule } from '../cart/cart.module';
import { ProductsModule } from '../products/products.module';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    CartModule,
    ProductsModule,
    EmailModule,
    UsersModule,
    CouponsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, { provide: ORDER_REPOSITORY, useClass: TypeOrmOrderRepository }],
})
export class OrdersModule {}
