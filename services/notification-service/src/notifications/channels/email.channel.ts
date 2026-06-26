import { Injectable } from '@nestjs/common';
import { EmailService } from '../../email/email.service';
import type { INotificationChannel, NotificationPayload } from './notification-channel.interface';

@Injectable()
export class EmailChannel implements INotificationChannel {
  constructor(private readonly email: EmailService) {}

  async send({ type, recipient, data }: NotificationPayload): Promise<void> {
    if (type === 'order_confirmation' && data.orderId && data.orderTotal !== undefined && data.items) {
      await this.email.sendOrderConfirmation(recipient.email, recipient.name, {
        id: data.orderId, total: data.orderTotal, items: data.items,
      });
    } else if (type === 'low_stock_alert' && data.productName) {
      await this.email.sendLowStockAlert(recipient.email, recipient.name, data.productName, data.currentStock ?? 0);
    }
  }
}
