import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { NotificationModule } from '../notifications/notification.module';
import { MailerModule } from '../shared/utils/mailer/mailer.module';

@Module({
  imports: [NotificationModule, MailerModule],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {} 