import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { PRODUCT_REPOSITORY } from '../products/repositories/product.repository.interface';
import type { IProductRepository } from '../products/repositories/product.repository.interface';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: IProductRepository,
  ) {}

  async create(userId: number, productId: number, dto: CreateReviewDto) {
    const product = await this.productRepo.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.reviewRepo.findOne({ where: { userId, productId } });
    if (existing) throw new ConflictException('You have already reviewed this product');

    const review = this.reviewRepo.create({ userId, productId, ...dto });
    await this.reviewRepo.save(review);

    await this.recalcRating(productId);

    return this.reviewRepo.findOne({ where: { id: review.id }, relations: { user: true } });
  }

  async findByProduct(productId: number, page: number, limit: number) {
    const [data, total] = await this.reviewRepo.findAndCount({
      where: { productId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const stats = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.productId = :productId', { productId })
      .getRawOne<{ avg: string; count: string }>();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      averageRating: stats?.avg ? parseFloat(parseFloat(stats.avg).toFixed(1)) : 0,
      reviewCount: parseInt(stats?.count ?? '0', 10),
    };
  }

  private async recalcRating(productId: number) {
    const stats = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.productId = :productId', { productId })
      .getRawOne<{ avg: string; count: string }>();

    await this.reviewRepo.manager.query(
      'UPDATE products SET averageRating = ?, reviewCount = ? WHERE id = ?',
      [
        stats?.avg ? parseFloat(parseFloat(stats.avg).toFixed(2)) : 0,
        parseInt(stats?.count ?? '0', 10),
        productId,
      ],
    );
  }
}
