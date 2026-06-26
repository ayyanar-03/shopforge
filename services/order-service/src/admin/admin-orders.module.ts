import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { AdminOrdersController } from './admin-orders.controller';
import { CatalogClientModule } from '../catalog-client/catalog-client.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), CatalogClientModule, AuthModule],
  controllers: [AdminOrdersController],
})
export class AdminOrdersModule {}
