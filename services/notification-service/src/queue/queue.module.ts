import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotificationProcessor } from './processors/notification.processor';
import { InventoryProcessor } from './processors/inventory.processor';
import { NOTIFICATION_QUEUE, INVENTORY_QUEUE } from './queue.constants';

export { NOTIFICATION_QUEUE, INVENTORY_QUEUE } from './queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
    BullModule.registerQueue({ name: INVENTORY_QUEUE }),
    NotificationsModule,
  ],
  providers: [NotificationProcessor, InventoryProcessor],
})
export class QueueModule {}
