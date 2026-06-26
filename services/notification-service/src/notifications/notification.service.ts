import { Injectable, Logger } from '@nestjs/common';
import { NotificationFactory, type ChannelType } from './notification.factory';
import type { NotificationPayload } from './channels/notification-channel.interface';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(private readonly factory: NotificationFactory) {}

  async send(channels: ChannelType[], payload: NotificationPayload): Promise<void> {
    await Promise.all(
      channels.map(async (ch) => {
        try { await this.factory.create(ch).send(payload); }
        catch (err) { this.logger.error(`Channel ${ch} failed`, err); }
      }),
    );
  }
}
