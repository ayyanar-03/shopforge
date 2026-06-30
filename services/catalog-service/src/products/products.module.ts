import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmProductRepository } from './repositories/product.repository';
import { PRODUCT_REPOSITORY } from './repositories/product.repository.interface';
import { PRODUCTS_SERVICE } from './products.service.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [
    { provide: PRODUCTS_SERVICE, useClass: ProductsService },
    { provide: PRODUCT_REPOSITORY, useClass: TypeOrmProductRepository },
  ],
  exports: [PRODUCTS_SERVICE, PRODUCT_REPOSITORY],
})
export class ProductsModule {}
