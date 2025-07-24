import { Module } from '@nestjs/common';
import { CourierService } from './courier.service';
import { CourierController } from './courier.controller';

@Module({
  providers: [CourierService],
  controllers: [CourierController],
  exports: [CourierService],
})
export class CourierModule {} 