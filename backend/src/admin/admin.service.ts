import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { CouponsService } from '../coupons/coupons.service';
import { CreateCouponDto } from '../coupons/dto/create-coupon.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    private readonly couponsService: CouponsService,
  ) {}

  async getStats() {
    const [totalUsers, totalProducts, orderStats] = await Promise.all([
      this.userRepo.count(),
      this.productRepo.count(),
      // Delegate order stats to order-service; fail silently when it is not reachable
      fetch(`${process.env.ORDER_SERVICE_URL ?? 'http://localhost:3002'}/internal/stats`, {
        headers: { 'x-internal-token': process.env.INTERNAL_TOKEN ?? 'shopforge_internal' },
      })
        .then((r) => r.json() as Promise<{ totalOrders: number; totalRevenue: number }>)
        .catch(() => ({ totalOrders: 0, totalRevenue: 0 })),
    ]);
    return { totalUsers, totalProducts, ...orderStats };
  }

  async getUsers(page: number, limit: number) {
    const [data, total] = await this.userRepo.findAndCount({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  getCoupons() {
    return this.couponsService.findAll();
  }

  createCoupon(dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  toggleCoupon(id: number) {
    return this.couponsService.toggle(id);
  }

  deleteCoupon(id: number) {
    return this.couponsService.remove(id);
  }
}
