/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '../shared/utils/jwt.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { AuthResponse, JwtPayload } from './interfaces/auth.interface';
import * as bcrypt from 'bcryptjs';
import { MailerService } from 'src/shared/utils/mailer/mailer.service';
import { AdminService } from '../admin/admin.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private adminService: AdminService,
    private prisma: PrismaService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(
        registerDto.email,
      );
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      // If user not found, continue with registration
    }

    try {
      // Create user
      const user = await this.usersService.create({
        name: registerDto.name,
        email: registerDto.email,
        phone: registerDto.phone,
        password: registerDto.password,
      });

      try {
        await this.mailerService.sendWelcomeEmail(user.email, {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        });
      } catch (emailError) {
        console.warn(
          `Failed to send welcome email to ${user.email}:`,
          emailError.message,
        );
      }

      // Generate JWT token
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
      };

      const access_token = this.jwtService.generateToken(payload);

      // Log the registration activity
      await this.adminService.createLog({
        action: 'USER_CREATED',
        details: `New user account created: ${user.firstName} ${user.lastName} (${user.email})`,
        userId: user.id
      });

      return {
        access_token,
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await this.usersService.findByEmail(loginDto.email);

      if (!user || !user.password) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate JWT token
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
      };

      const access_token = this.jwtService.generateToken(payload);

      // Log the login activity
      await this.adminService.createLog({
        action: 'USER_LOGIN',
        details: `User logged in: ${user.firstName} ${user.lastName} (${user.email})`,
        userId: user.id
      });

      return {
        access_token,
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      // Find user by email
      const user = await this.usersService.findByEmail(email);

      if (!user) {
        // Don't reveal if user exists or not for security
        return { message: 'If an account with this email exists, you will receive a password reset code.' };
      }

      // Generate a 6-digit reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store reset code in database with expiration (15 minutes)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await this.prisma.passwordReset.create({
        data: {
          userId: user.id,
          resetCode,
          expiresAt,
        },
      });

      // Send reset code email
      try {
        await this.mailerService.sendEmail({
          to: user.email,
          subject: 'Password Reset Code - SendIT',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #FB9F3E 0%, #e88a35 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
              </div>
              
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear <strong>${user.firstName} ${user.lastName}</strong>,</p>
                
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">We received a request to reset your password for your SendIT account.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                  <h3 style="color: #FB9F3E; margin-top: 0;">Your Reset Code</h3>
                  <div style="background: #FB9F3E; color: white; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 10px 0;">
                    ${resetCode}
                  </div>
                  <p style="font-size: 14px; color: #666; margin: 10px 0;">This code will expire in 15 minutes.</p>
                </div>
                
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Enter this code in the password reset form to create a new password.</p>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                  <p style="margin: 0; color: #856404;">
                    <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                  </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Best regards,</p>
                <p style="font-size: 14px; color: #666; margin-bottom: 10px;"><strong>The SendIT Team</strong></p>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
                  <p style="font-size: 12px; color: #666; margin: 0;">
                    <strong>Need Help?</strong><br>
                    📧 support@sendit.com<br>
                    📞 +1 (555) 123-4567
                  </p>
                </div>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        throw new InternalServerErrorException('Failed to send reset code');
      }

      // Log the password reset request
      await this.adminService.createLog({
        action: 'PASSWORD_RESET_REQUESTED',
        details: `Password reset requested for user: ${user.firstName} ${user.lastName} (${user.email})`,
        userId: user.id
      });

      return { message: 'If an account with this email exists, you will receive a password reset code.' };
    } catch (error) {
      console.error('Forgot password error:', error);
      throw new InternalServerErrorException('Failed to process password reset request');
    }
  }

  async resetPassword(email: string, resetCode: string, newPassword: string): Promise<{ message: string }> {
    try {
      // Find user by email
      const user = await this.usersService.findByEmail(email);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Find valid reset code
      const passwordReset = await this.prisma.passwordReset.findFirst({
        where: {
          userId: user.id,
          resetCode,
          expiresAt: {
            gt: new Date(),
          },
          used: false,
        },
      });

      if (!passwordReset) {
        throw new UnauthorizedException('Invalid or expired reset code');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      // Mark reset code as used
      await this.prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { used: true },
      });

      // Log the password reset
      await this.adminService.createLog({
        action: 'PASSWORD_RESET_COMPLETED',
        details: `Password reset completed for user: ${user.firstName} ${user.lastName} (${user.email})`,
        userId: user.id
      });

      return { message: 'Password reset successfully. You can now log in with your new password.' };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verifyToken(token);
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(token: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verifyToken(token);
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
      };

      const access_token = this.jwtService.generateToken(newPayload);

      return { access_token };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
