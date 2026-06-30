import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { Coupon, DiscountType } from './entities/coupon.entity';

const now = new Date();
const future = new Date(now.getTime() + 86400_000);
const past = new Date(now.getTime() - 86400_000);

const activeCoupon: Coupon = {
  id: 1,
  code: 'SAVE10',
  type: DiscountType.PERCENTAGE,
  value: 10,
  minOrderAmount: null,
  maxUses: null,
  usedCount: 0,
  expiresAt: null,
  active: true,
  createdAt: now,
};

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  remove: jest.fn(),
  increment: jest.fn(),
};

describe('CouponsService', () => {
  let service: CouponsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CouponsService,
        { provide: getRepositoryToken(Coupon), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(CouponsService);
  });

  describe('create', () => {
    it('uppercases and trims the code', async () => {
      mockRepo.create.mockReturnValue({ ...activeCoupon, code: 'SAVE10' });
      mockRepo.save.mockResolvedValue(activeCoupon);
      await service.create({ code: ' save10 ', type: DiscountType.PERCENTAGE, value: 10 });
      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ code: 'SAVE10' }));
    });
  });

  describe('toggle', () => {
    it('throws NotFoundException for unknown coupon', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);
      await expect(service.toggle(999)).rejects.toThrow(NotFoundException);
    });

    it('flips active flag', async () => {
      mockRepo.findOneBy.mockResolvedValue({ ...activeCoupon, active: true });
      mockRepo.save.mockResolvedValue({ ...activeCoupon, active: false });
      const result = await service.toggle(1);
      expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ active: false }));
      expect(result.active).toBe(false);
    });
  });

  describe('validate', () => {
    it('throws for unknown code', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);
      await expect(service.validate('NOPE', 100)).rejects.toThrow(BadRequestException);
    });

    it('throws for inactive coupon', async () => {
      mockRepo.findOneBy.mockResolvedValue({ ...activeCoupon, active: false });
      await expect(service.validate('SAVE10', 100)).rejects.toThrow(BadRequestException);
    });

    it('throws for expired coupon', async () => {
      mockRepo.findOneBy.mockResolvedValue({ ...activeCoupon, expiresAt: past });
      await expect(service.validate('SAVE10', 100)).rejects.toThrow(BadRequestException);
    });

    it('throws when usage limit reached', async () => {
      mockRepo.findOneBy.mockResolvedValue({ ...activeCoupon, maxUses: 5, usedCount: 5 });
      await expect(service.validate('SAVE10', 100)).rejects.toThrow(BadRequestException);
    });

    it('throws when order total below minimum', async () => {
      mockRepo.findOneBy.mockResolvedValue({ ...activeCoupon, minOrderAmount: 200 });
      await expect(service.validate('SAVE10', 100)).rejects.toThrow(BadRequestException);
    });

    it('calculates percentage discount correctly', async () => {
      mockRepo.findOneBy.mockResolvedValue(activeCoupon); // 10% off
      const result = await service.validate('SAVE10', 100);
      expect(result.discountAmount).toBe(10);
      expect(result.finalTotal).toBe(90);
    });

    it('calculates fixed discount correctly', async () => {
      mockRepo.findOneBy.mockResolvedValue({ ...activeCoupon, type: DiscountType.FIXED, value: 15 });
      const result = await service.validate('SAVE10', 100);
      expect(result.discountAmount).toBe(15);
      expect(result.finalTotal).toBe(85);
    });

    it('caps percentage discount at total', async () => {
      mockRepo.findOneBy.mockResolvedValue({ ...activeCoupon, type: DiscountType.PERCENTAGE, value: 200 });
      const result = await service.validate('SAVE10', 50);
      expect(result.discountAmount).toBe(50);
      expect(result.finalTotal).toBe(0);
    });

    it('accepts valid future expiry', async () => {
      mockRepo.findOneBy.mockResolvedValue({ ...activeCoupon, expiresAt: future });
      const result = await service.validate('SAVE10', 100);
      expect(result.valid).toBe(true);
    });
  });

  describe('applyAndIncrement', () => {
    it('increments usedCount after validation', async () => {
      mockRepo.findOneBy.mockResolvedValue(activeCoupon);
      mockRepo.increment.mockResolvedValue(undefined);
      await service.applyAndIncrement('SAVE10', 100);
      expect(mockRepo.increment).toHaveBeenCalledWith({ code: 'SAVE10' }, 'usedCount', 1);
    });
  });
});
