export type NotificationType = 'order_confirmation' | 'low_stock_alert';

export interface NotificationRecipient {
  email: string;
  name: string;
}

export interface NotificationPayload {
  type: NotificationType;
  recipient: NotificationRecipient;
  data: {
    orderId?: number;
    orderTotal?: number;
    items?: Array<{ name: string; quantity: number; price: number }>;
    productName?: string;
    currentStock?: number;
  };
}

export interface INotificationChannel {
  send(payload: NotificationPayload): Promise<void>;
}
