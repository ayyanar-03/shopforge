import { Injectable, Logger } from '@nestjs/common';
import * as https from 'node:https';
import type { IPaymentStrategy, PaymentResult } from './payment-strategy.interface';

interface RzpOrder { id: string; status: string }

function rzpRequest(path: string, body: object, keyId: string, keySecret: string): Promise<RzpOrder> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const req = https.request(
      {
        hostname: 'api.razorpay.com', port: 443, path, method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          Authorization: `Basic ${auth}`,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c: Buffer) => { data += c.toString(); });
        res.on('end', () => {
          try { resolve(JSON.parse(data) as RzpOrder); }
          catch (e) { reject(e instanceof Error ? e : new Error(String(e))); }
        });
      },
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

@Injectable()
export class RazorpayStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(RazorpayStrategy.name);

  async process(amount: number, currency: string, idempotencyKey: string): Promise<PaymentResult> {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      this.logger.warn('Razorpay credentials absent — dev stub');
      return { paymentId: `rp_dev_${idempotencyKey.replace(/-/g, '')}`, status: 'pending' };
    }
    const order = await rzpRequest(
      '/v1/orders',
      { amount: Math.round(amount * 100), currency: currency.toUpperCase(), receipt: idempotencyKey },
      keyId, keySecret,
    );
    return { paymentId: order.id, status: 'pending' };
  }
}
