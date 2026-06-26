import { Module } from '@nestjs/common';
import { StripeStrategy } from './strategies/stripe.strategy';
import { RazorpayStrategy } from './strategies/razorpay.strategy';
import { CodStrategy } from './strategies/cod.strategy';
import { PaymentService } from './payment.service';

@Module({
  providers: [StripeStrategy, RazorpayStrategy, CodStrategy, PaymentService],
  exports: [PaymentService],
})
export class PaymentsModule {}
