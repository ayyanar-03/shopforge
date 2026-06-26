import { Injectable } from '@nestjs/common';
import { EmailChannel } from './channels/email.channel';
import type { INotificationChannel } from './channels/notification-channel.interface';

export type ChannelType = 'email';

@Injectable()
export class NotificationFactory {
  constructor(private readonly emailChannel: EmailChannel) {}

  create(channel: ChannelType): INotificationChannel {
    switch (channel) {
      case 'email':
        return this.emailChannel;
      default: {
        const _exhaustive: never = channel;
        throw new Error(`Unknown notification channel: ${String(_exhaustive)}`);
      }
    }
  }
}
