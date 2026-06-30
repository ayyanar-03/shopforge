import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class SellerService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getStats(sellerId: number) {
    const result = await this.productRepo
      .createQueryBuilder('p')
      .select('COUNT(*)', 'totalProducts')
      .addSelect('COALESCE(SUM(p.reviewCount), 0)', 'totalReviews')
      .addSelect(
        'COALESCE(AVG(CASE WHEN p.reviewCount > 0 THEN p.averageRating ELSE NULL END), 0)',
        'averageRating',
      )
      .where('p.sellerId = :sellerId', { sellerId })
      .getRawOne<{ totalProducts: string; totalReviews: string; averageRating: string }>();

    return {
      totalProducts: parseInt(result?.totalProducts ?? '0', 10),
      totalReviews: parseInt(result?.totalReviews ?? '0', 10),
      averageRating: parseFloat(parseFloat(result?.averageRating ?? '0').toFixed(1)),
    };
  }

  async getProducts(sellerId: number, page: number, limit: number) {
    const [data, total] = await this.productRepo.findAndCount({
      where: { sellerId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
