import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

export const NOTIFICATION_QUEUE = 'notifications';
export const INVENTORY_QUEUE = 'inventory';
export const LOW_STOCK_THRESHOLD = 5;

// Order-service is a producer only — processors live in notification-service.
@Module({
  imports: [
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
    BullModule.registerQueue({ name: INVENTORY_QUEUE }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
