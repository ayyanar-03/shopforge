import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product, Order]), CouponsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
