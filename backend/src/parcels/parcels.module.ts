import { Module } from '@nestjs/common';
import { ParcelsService } from './parcels.service';
import { ParcelsController } from './parcels.controller';
import { NotificationModule } from '../notifications/notification.module';
import { MailerModule } from '../shared/utils/mailer/mailer.module';

@Module({
  imports: [NotificationModule, MailerModule],
  controllers: [ParcelsController],
  providers: [ParcelsService],
  exports: [ParcelsService],
})
export class ParcelsModule {}
