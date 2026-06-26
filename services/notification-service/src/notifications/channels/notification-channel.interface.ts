export type NotificationType = 'order_confirmation' | 'low_stock_alert';
export interface NotificationPayload {
  type: NotificationType;
  recipient: { email: string; name: string };
  data: {
    orderId?: number; orderTotal?: number;
    items?: { name: string; quantity: number; price: number }[];
    productName?: string; currentStock?: number;
  };
}
export interface INotificationChannel {
  send(payload: NotificationPayload): Promise<void>;
}
