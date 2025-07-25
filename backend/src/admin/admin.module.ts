import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MailerModule } from '../shared/utils/mailer/mailer.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [MailerModule, PrismaModule],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
