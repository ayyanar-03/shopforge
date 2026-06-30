import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { InternalGuard } from '../internal.guard';
import { PRODUCT_REPOSITORY } from '../../products/repositories/product.repository.interface';
import type { IProductRepository } from '../../products/repositories/product.repository.interface';

@Controller('internal/products')
@UseGuards(InternalGuard)
export class InternalProductsController {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly productRepo: IProductRepository) {}

  @Get(':id')
  async getProduct(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  @Patch(':id/decrement')
  async decrementStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    await this.productRepo.decrementStock(id, quantity);
    return this.productRepo.findById(id);
  }
}
