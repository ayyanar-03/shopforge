import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { EmailChannel } from './channels/email.channel';
import { NotificationFactory } from './notification.factory';
import { NotificationService } from './notification.service';

@Module({
  imports: [EmailModule],
  providers: [EmailChannel, NotificationFactory, NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
