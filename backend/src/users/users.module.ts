import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from '../auth/auth.module';
import { AdminModule } from '../admin/admin.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CloudinaryService } from '../shared/utils/cloudinary/cloudinary.service';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      storage: undefined, // We'll use Cloudinary directly
    }),
    forwardRef(() => AuthModule),
    AdminModule,
  ],
  providers: [UsersService, CloudinaryService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
