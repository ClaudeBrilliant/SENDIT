import { Module } from '@nestjs/common';
import { ParcelsService } from './parcels.service';
import { ParcelsController } from './parcels.controller';
import { MailerModule } from '../shared/utils/mailer/mailer.module';

@Module({
  imports: [MailerModule],
  providers: [ParcelsService],
  controllers: [ParcelsController],
  exports: [ParcelsService],
})
export class ParcelsModule {}
