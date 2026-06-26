import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotificationProcessor } from './processors/notification.processor';
import { InventoryProcessor } from './processors/inventory.processor';

export const NOTIFICATION_QUEUE = 'notifications';
export const INVENTORY_QUEUE = 'inventory';

@Module({
  imports: [
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
    BullModule.registerQueue({ name: INVENTORY_QUEUE }),
    NotificationsModule,
  ],
  providers: [NotificationProcessor, InventoryProcessor],
  exports: [BullModule],
})
export class QueueModule {}
