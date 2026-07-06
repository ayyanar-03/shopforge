import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import type { IPaymentStrategy, PaymentResult } from './payment-strategy.interface';

@Injectable()
export class StripeStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(StripeStrategy.name);
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async process(amount: number, currency: string, idempotencyKey: string): Promise<PaymentResult> {
    const amountInCents = Math.round(amount * 100);
    this.logger.log(`Stripe: creating PaymentIntent for ${amountInCents} ${currency.toUpperCase()}`);
    const intent = await this.stripe.paymentIntents.create(
      {
        amount: amountInCents,
        currency: currency.toLowerCase(),
        payment_method: 'pm_card_visa',
        confirm: true,
        return_url: 'https://shopforge.dev/orders',
      },
      { idempotencyKey },
    );
    return { paymentId: intent.id, status: intent.status === 'succeeded' ? 'paid' : 'pending' };
  }
}
