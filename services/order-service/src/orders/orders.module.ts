import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CatalogClientModule } from '../catalog-client/catalog-client.module';
import { PaymentsModule } from '../payments/payments.module';
import { AuthModule } from '../auth/auth.module';
import { NOTIFICATION_QUEUE, INVENTORY_QUEUE } from '../queue/queue.module';
import { ORDERS_SERVICE } from './orders.service.interface';
import { ReturnsModule } from '../returns/returns.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
    BullModule.registerQueue({ name: INVENTORY_QUEUE }),
    CatalogClientModule,
    PaymentsModule,
    AuthModule,
    ReturnsModule,
  ],
  controllers: [OrdersController],
  providers: [{ provide: ORDERS_SERVICE, useClass: OrdersService }],
  exports: [ORDERS_SERVICE],
})
export class OrdersModule {}
