import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AdminModule } from '../admin/admin.module';
import { JwtService } from '../shared/utils/jwt.service';
import { JwtAuthGuard } from './guards/jwt/jwt.guard';
import { RolesGuard } from './guards/roles/roles.guard';
import { PermissionGuard } from './guards/permission/permission.guard';
import { ResourceActionGuard } from './guards/resource-action/resource-action.guard';
import { ResourceOwnerGuard } from './guards/resource-owner/resource-owner.guard';
import { PermissionService } from './services/permission.service';
import { PermissionController } from './controllers/permission.controller';
import { MailerService } from 'src/shared/utils/mailer/mailer.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UsersModule),
    AdminModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [
    AuthService,
    JwtService,
    PermissionService,
    JwtAuthGuard,
    RolesGuard,
    PermissionGuard,
    ResourceActionGuard,
    ResourceOwnerGuard,
    MailerService,
  ],
  controllers: [AuthController, PermissionController],
  exports: [
    AuthService,
    JwtService,
    PermissionService,
    JwtAuthGuard,
    RolesGuard,
    PermissionGuard,
    ResourceActionGuard,
    ResourceOwnerGuard,
    JwtModule,
  ],
})
export class AuthModule {}
