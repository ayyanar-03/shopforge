import { BadRequestException, Injectable } from '@nestjs/common';
import { StripeStrategy } from './strategies/stripe.strategy';
import { RazorpayStrategy } from './strategies/razorpay.strategy';
import { CodStrategy } from './strategies/cod.strategy';
import { PaymentMethod } from '../orders/entities/order.entity';
import type { IPaymentStrategy, PaymentResult } from './strategies/payment-strategy.interface';

@Injectable()
export class PaymentService {
  private readonly strategies: Record<string, IPaymentStrategy>;
  constructor(stripe: StripeStrategy, razorpay: RazorpayStrategy, cod: CodStrategy) {
    this.strategies = { [PaymentMethod.STRIPE]: stripe, [PaymentMethod.RAZORPAY]: razorpay, [PaymentMethod.COD]: cod };
  }
  process(method: PaymentMethod, amount: number, key: string): Promise<PaymentResult> {
    const s = this.strategies[method];
    if (!s) throw new BadRequestException(`Unknown payment method: ${method}`);
    return s.process(amount, 'usd', key);
  }
}
