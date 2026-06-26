import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmOrderRepository } from './repositories/order.repository';
import { ORDER_REPOSITORY } from './repositories/order.repository.interface';
import { CartModule } from '../cart/cart.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { CouponsModule } from '../coupons/coupons.module';
import { PaymentsModule } from '../payments/payments.module';
import { NOTIFICATION_QUEUE, INVENTORY_QUEUE } from '../queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
    BullModule.registerQueue({ name: INVENTORY_QUEUE }),
    CartModule,
    ProductsModule,
    UsersModule,
    CouponsModule,
    PaymentsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, { provide: ORDER_REPOSITORY, useClass: TypeOrmOrderRepository }],
})
export class OrdersModule {}
