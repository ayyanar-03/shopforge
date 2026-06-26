import { Injectable, Logger } from '@nestjs/common';
import type { IPaymentStrategy, PaymentResult } from './payment-strategy.interface';

@Injectable()
export class CodStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(CodStrategy.name);
  process(_amount: number, _currency: string, key: string): Promise<PaymentResult> {
    this.logger.log(`COD order (key=${key})`);
    return Promise.resolve({ paymentId: null, status: 'pending' });
  }
}
