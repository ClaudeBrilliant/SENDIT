import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { ParcelsModule } from './parcels/parcels.module';
import { UsersModule } from './users/users.module';
import { CourierModule } from './courier/courier.module';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './notifications/notification.module';

@Module({
  imports: [AdminModule, ParcelsModule, UsersModule, CourierModule, AuthModule, NotificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
