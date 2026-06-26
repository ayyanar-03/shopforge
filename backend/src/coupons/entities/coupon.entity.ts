import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'enum', enum: DiscountType })
  type: DiscountType;

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minOrderAmount: number | null;

  @Column({ nullable: true })
  maxUses: number | null;

  @Column({ default: 0 })
  usedCount: number;

  @Column({ nullable: true, type: 'datetime' })
  expiresAt: Date | null;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
