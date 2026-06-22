import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PRODUCT_REPOSITORY, IProductRepository } from './repositories/product.repository.interface';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: IProductRepository,
  ) {}

  findAll() {
    return this.productRepo.findAll();
  }

  async findOne(id: number) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  create(dto: CreateProductDto) {
    return this.productRepo.create(dto);
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.productRepo.update(id, dto);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.productRepo.delete(id);
  }
}
