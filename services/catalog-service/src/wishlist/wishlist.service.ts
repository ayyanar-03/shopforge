import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist) private readonly wishlistRepo: Repository<Wishlist>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
  ) {}

  async getWishlist(userId: number) {
    const items = await this.wishlistRepo.find({
      where: { userId },
      relations: { product: true },
      order: { createdAt: 'DESC' },
    });
    return items.map((w) => w.product);
  }

  async getIds(userId: number): Promise<number[]> {
    const items = await this.wishlistRepo.find({
      where: { userId },
      select: { productId: true },
    });
    return items.map((w) => w.productId);
  }

  async add(userId: number, productId: number) {
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.wishlistRepo.findOneBy({ userId, productId });
    if (existing) return { added: false };

    await this.wishlistRepo.save(this.wishlistRepo.create({ userId, productId }));
    return { added: true };
  }

  async remove(userId: number, productId: number) {
    await this.wishlistRepo.delete({ userId, productId });
  }
}
