import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon, DiscountType } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(@InjectRepository(Coupon) private readonly couponRepo: Repository<Coupon>) {}

  async create(dto: CreateCouponDto) {
    const coupon = this.couponRepo.create({
      ...dto,
      code: dto.code.toUpperCase().trim(),
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      minOrderAmount: dto.minOrderAmount ?? null,
      maxUses: dto.maxUses ?? null,
    });
    return this.couponRepo.save(coupon);
  }

  async findAll() {
    return this.couponRepo.find({ order: { createdAt: 'DESC' } });
  }

  async toggle(id: number) {
    const coupon = await this.couponRepo.findOneBy({ id });
    if (!coupon) throw new NotFoundException('Coupon not found');
    coupon.active = !coupon.active;
    return this.couponRepo.save(coupon);
  }

  async remove(id: number) {
    const coupon = await this.couponRepo.findOneBy({ id });
    if (!coupon) throw new NotFoundException('Coupon not found');
    await this.couponRepo.remove(coupon);
  }

  async validate(code: string, total: number) {
    const coupon = await this.couponRepo.findOneBy({ code: code.toUpperCase().trim() });

    if (!coupon || !coupon.active) {
      throw new BadRequestException('Invalid or expired coupon code');
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new BadRequestException('This coupon has expired');
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }
    if (coupon.minOrderAmount !== null && total < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(
        `Minimum order amount of $${Number(coupon.minOrderAmount).toFixed(2)} required`,
      );
    }

    const discountAmount =
      coupon.type === DiscountType.PERCENTAGE
        ? Math.min(total, (total * Number(coupon.value)) / 100)
        : Math.min(total, Number(coupon.value));

    return {
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalTotal: parseFloat((total - discountAmount).toFixed(2)),
    };
  }

  async applyAndIncrement(code: string, total: number) {
    const result = await this.validate(code, total);
    await this.couponRepo.increment({ code: code.toUpperCase().trim() }, 'usedCount', 1);
    return result;
  }
}
