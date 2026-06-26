import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NOTIFICATION_QUEUE } from '../queue.module';
import { NotificationService } from '../../notifications/notification.service';
import type { NotificationPayload } from '../../notifications/channels/notification-channel.interface';
import type { ChannelType } from '../../notifications/notification.factory';

export interface NotificationJob {
  channels: ChannelType[];
  payload: NotificationPayload;
}

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  async process(job: Job<NotificationJob>): Promise<void> {
    const { channels, payload } = job.data;
    this.logger.log(
      `Processing notification job ${job.id}: type=${payload.type} channels=${channels.join(',')}`,
    );
    await this.notificationService.send(channels, payload);
    this.logger.log(`Notification job ${job.id} completed`);
  }
}
