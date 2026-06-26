import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NOTIFICATION_QUEUE } from '../queue.module';
import { NotificationService } from '../../notifications/notification.service';
import type { NotificationPayload } from '../../notifications/channels/notification-channel.interface';
import type { ChannelType } from '../../notifications/notification.factory';

interface NotificationJob { channels: ChannelType[]; payload: NotificationPayload }

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);
  constructor(private readonly service: NotificationService) { super(); }

  async process(job: Job<NotificationJob>): Promise<void> {
    this.logger.log(`Job ${job.id}: ${job.data.payload.type}`);
    await this.service.send(job.data.channels, job.data.payload);
  }
}
