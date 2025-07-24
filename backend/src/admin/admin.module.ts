import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MailerModule } from '../shared/utils/mailer/mailer.module';

@Module({
  imports: [MailerModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
