import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [SellerController],
  providers: [SellerService],
})
export class SellerModule {}
