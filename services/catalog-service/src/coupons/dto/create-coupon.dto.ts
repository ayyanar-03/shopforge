import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsDateString,
  Min,
} from 'class-validator';
import { DiscountType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsEnum(DiscountType)
  type: DiscountType;

  @IsNumber()
  @IsPositive()
  value: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxUses?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class ValidateCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  total: number;
}
