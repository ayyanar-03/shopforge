export interface PaymentResult {
  paymentId: string | null;
  status: 'paid' | 'pending' | 'failed';
}
export interface IPaymentStrategy {
  process(amount: number, currency: string, idempotencyKey: string): Promise<PaymentResult>;
}
