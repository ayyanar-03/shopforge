import { BadRequestException, Injectable } from '@nestjs/common';
import { StripeStrategy } from './strategies/stripe.strategy';
import { RazorpayStrategy } from './strategies/razorpay.strategy';
import { CodStrategy } from './strategies/cod.strategy';
import type { IPaymentStrategy, PaymentResult } from './strategies/payment-strategy.interface';

export enum PaymentMethod {
  STRIPE = 'stripe',
  RAZORPAY = 'razorpay',
  COD = 'cod',
}

@Injectable()
export class PaymentService {
  private readonly strategies: Record<string, IPaymentStrategy>;

  constructor(
    private readonly stripe: StripeStrategy,
    private readonly razorpay: RazorpayStrategy,
    private readonly cod: CodStrategy,
  ) {
    this.strategies = {
      [PaymentMethod.STRIPE]: stripe,
      [PaymentMethod.RAZORPAY]: razorpay,
      [PaymentMethod.COD]: cod,
    };
  }

  process(method: PaymentMethod, amount: number, idempotencyKey: string): Promise<PaymentResult> {
    const strategy = this.strategies[method];
    if (!strategy) throw new BadRequestException(`Unknown payment method: ${method}`);
    return strategy.process(amount, 'USD', idempotencyKey);
  }
}
