import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { StripeStrategy } from './strategies/stripe.strategy';
import { RazorpayStrategy } from './strategies/razorpay.strategy';
import { CodStrategy } from './strategies/cod.strategy';
import { PaymentMethod } from '../orders/entities/order.entity';

describe('PaymentService', () => {
  let service: PaymentService;
  let stripe: jest.Mocked<Pick<StripeStrategy, 'process'>>;
  let razorpay: jest.Mocked<Pick<RazorpayStrategy, 'process'>>;
  let cod: jest.Mocked<Pick<CodStrategy, 'process'>>;

  beforeEach(async () => {
    stripe = { process: jest.fn().mockResolvedValue({ paymentId: 'pi_test', status: 'paid' }) };
    razorpay = { process: jest.fn().mockResolvedValue({ paymentId: 'rz_test', status: 'pending' }) };
    cod = { process: jest.fn().mockResolvedValue({ paymentId: null, status: 'pending' }) };

    const module = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: StripeStrategy, useValue: stripe },
        { provide: RazorpayStrategy, useValue: razorpay },
        { provide: CodStrategy, useValue: cod },
      ],
    }).compile();

    service = module.get(PaymentService);
  });

  it('routes STRIPE to StripeStrategy with USD currency', async () => {
    const result = await service.process(PaymentMethod.STRIPE, 100, 'key-1');
    expect(stripe.process).toHaveBeenCalledWith(100, 'USD', 'key-1');
    expect(result).toEqual({ paymentId: 'pi_test', status: 'paid' });
  });

  it('routes RAZORPAY to RazorpayStrategy', async () => {
    const result = await service.process(PaymentMethod.RAZORPAY, 50, 'key-2');
    expect(razorpay.process).toHaveBeenCalledWith(50, 'USD', 'key-2');
    expect(result).toEqual({ paymentId: 'rz_test', status: 'pending' });
  });

  it('routes COD to CodStrategy with no external call', async () => {
    const result = await service.process(PaymentMethod.COD, 200, 'key-3');
    expect(cod.process).toHaveBeenCalledWith(200, 'USD', 'key-3');
    expect(result).toEqual({ paymentId: null, status: 'pending' });
  });

  it('throws BadRequestException for unknown payment method', async () => {
    await expect(
      service.process('paypal' as PaymentMethod, 100, 'key-4'),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.process('paypal' as PaymentMethod, 100, 'key-4'),
    ).rejects.toThrow('Unknown payment method: paypal');
  });

  it('does not call other strategies when one is selected', async () => {
    await service.process(PaymentMethod.COD, 10, 'k');
    expect(stripe.process).not.toHaveBeenCalled();
    expect(razorpay.process).not.toHaveBeenCalled();
  });
});
