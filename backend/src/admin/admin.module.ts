import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { NotificationModule } from '../notifications/notification.module';
import { MailerModule } from '../shared/utils/mailer/mailer.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [NotificationModule, MailerModule, PrismaModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
