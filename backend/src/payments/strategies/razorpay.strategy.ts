import { Injectable, Logger } from '@nestjs/common';
import * as https from 'node:https';
import type { IPaymentStrategy, PaymentResult } from './payment-strategy.interface';

interface RazorpayOrder {
  id: string;
  status: string;
}

function razorpayRequest(
  path: string,
  body: object,
  keyId: string,
  keySecret: string,
): Promise<RazorpayOrder> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const options: https.RequestOptions = {
      hostname: 'api.razorpay.com',
      port: 443,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Authorization: `Basic ${auth}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => {
        data += chunk.toString();
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data) as RazorpayOrder);
        } catch (e) {
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      });
    });

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
      this.logger.warn('Razorpay credentials not set — simulating order creation in dev mode');
      return { paymentId: `rp_dev_${idempotencyKey.replace(/-/g, '')}`, status: 'pending' };
    }

    this.logger.log(`Razorpay: creating order for ${amount} ${currency.toUpperCase()}`);

    const order = await razorpayRequest(
      '/v1/orders',
      {
        amount: Math.round(amount * 100),
        currency: currency.toUpperCase(),
        receipt: idempotencyKey,
        notes: { idempotencyKey },
      },
      keyId,
      keySecret,
    );

    this.logger.log(`Razorpay order ${order.id} created`);
    return { paymentId: order.id, status: 'pending' };
  }
}
