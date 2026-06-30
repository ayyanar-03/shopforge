import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { CatalogClientModule } from '../catalog-client/catalog-client.module';
import { AuthModule } from '../auth/auth.module';
import { ADMIN_ORDERS_SERVICE } from './admin-orders.service.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), CatalogClientModule, AuthModule],
  controllers: [AdminOrdersController],
  providers: [{ provide: ADMIN_ORDERS_SERVICE, useClass: AdminOrdersService }],
})
export class AdminOrdersModule {}
