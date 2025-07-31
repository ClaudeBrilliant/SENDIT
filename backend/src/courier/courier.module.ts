import { Module } from '@nestjs/common';
import { CourierController } from './courier.controller';
import { CourierService } from './courier.service';
import { AdminModule } from '../admin/admin.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [AdminModule, NotificationModule],
  controllers: [CourierController],
  providers: [CourierService],
  exports: [CourierService],
})
export class CourierModule {} 