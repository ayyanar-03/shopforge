import { Injectable } from '@nestjs/common';
import { EmailChannel } from './channels/email.channel';
import type { INotificationChannel } from './channels/notification-channel.interface';

export type ChannelType = 'email';

@Injectable()
export class NotificationFactory {
  constructor(private readonly email: EmailChannel) {}
  create(channel: ChannelType): INotificationChannel {
    switch (channel) {
      case 'email': return this.email;
      default: {
        const _: never = channel;
        throw new Error(`Unknown channel: ${String(_)}`);
      }
    }
  }
}
