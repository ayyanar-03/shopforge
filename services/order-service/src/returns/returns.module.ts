import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnRequest } from './entities/return-request.entity';
import { Order } from '../orders/entities/order.entity';
import { ReturnsService } from './returns.service';
import { AdminReturnsController } from './admin-returns.controller';
import { AuthModule } from '../auth/auth.module';
import { CatalogClientModule } from '../catalog-client/catalog-client.module';
import { RETURNS_SERVICE } from './returns.service.interface';

@Module({
  imports: [TypeOrmModule.forFeature([ReturnRequest, Order]), AuthModule, CatalogClientModule],
  controllers: [AdminReturnsController],
  providers: [{ provide: RETURNS_SERVICE, useClass: ReturnsService }],
  exports: [RETURNS_SERVICE],
})
export class ReturnsModule {}
