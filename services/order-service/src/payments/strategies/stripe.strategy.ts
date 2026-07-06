import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import type { IPaymentStrategy, PaymentResult } from './payment-strategy.interface';

@Injectable()
export class StripeStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(StripeStrategy.name);
  readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createIntent(amountInINR: number): Promise<{ clientSecret: string }> {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(amountInINR * 100),
      currency: 'inr',
      automatic_payment_methods: { enabled: true },
    });
    return { clientSecret: intent.client_secret! };
  }

  async process(
    amount: number,
    currency: string,
    idempotencyKey: string,
    paymentIntentId?: string,
  ): Promise<PaymentResult> {
    if (paymentIntentId) {
      const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return { paymentId: intent.id, status: intent.status === 'succeeded' ? 'paid' : 'pending' };
    }
    // Test-mode fallback: auto-charge without card form
    this.logger.log(`Stripe test mode: creating PaymentIntent for ${Math.round(amount * 100)} ${currency}`);
    const intent = await this.stripe.paymentIntents.create(
      {
        amount: Math.round(amount * 100),
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
