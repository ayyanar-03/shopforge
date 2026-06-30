import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalGuard } from '../internal.guard';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Controller('internal')
@UseGuards(InternalGuard)
export class InternalStatsController {
  constructor(
    @InjectRepository(User) private readonly userOrmRepo: Repository<User>,
    @InjectRepository(Product) private readonly productOrmRepo: Repository<Product>,
  ) {}

  @Get('stats')
  async getStats() {
    const [totalUsers, totalProducts] = await Promise.all([
      this.userOrmRepo.count(),
      this.productOrmRepo.count(),
    ]);
    return { totalUsers, totalProducts };
  }
}
