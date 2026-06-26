import { Injectable } from '@nestjs/common';
import { EmailService } from '../../email/email.service';
import type { INotificationChannel, NotificationPayload } from './notification-channel.interface';

@Injectable()
export class EmailChannel implements INotificationChannel {
  constructor(private readonly emailService: EmailService) {}

  async send(payload: NotificationPayload): Promise<void> {
    const { type, recipient, data } = payload;

    if (
      type === 'order_confirmation' &&
      data.orderId &&
      data.orderTotal !== undefined &&
      data.items
    ) {
      await this.emailService.sendOrderConfirmation(recipient.email, recipient.name, {
        id: data.orderId,
        total: data.orderTotal,
        items: data.items,
      });
    } else if (type === 'low_stock_alert' && data.productName) {
      await this.emailService.sendLowStockAlert(
        recipient.email,
        recipient.name,
        data.productName,
        data.currentStock ?? 0,
      );
    }
  }
}
