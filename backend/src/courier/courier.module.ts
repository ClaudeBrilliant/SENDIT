import { Module } from '@nestjs/common';
import { CourierService } from './courier.service';
import { CourierController } from './courier.controller';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [AdminModule],
  providers: [CourierService],
  controllers: [CourierController],
  exports: [CourierService],
})
export class CourierModule {} 