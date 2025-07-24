import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MailerModule } from '../shared/utils/mailer/mailer.module'; // <-- Add this import

@Module({
  imports: [MailerModule], // <-- Add this line
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationModule {}
