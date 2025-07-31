import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationTriggerService } from './notification-trigger.service';
import { MailerModule } from '../shared/utils/mailer/mailer.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [MailerModule, PrismaModule],
  providers: [NotificationsService, NotificationTriggerService],
  controllers: [NotificationsController],
  exports: [NotificationsService, NotificationTriggerService],
})
export class NotificationModule {}
