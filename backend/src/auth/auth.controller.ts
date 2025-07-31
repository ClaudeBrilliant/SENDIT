/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { JwtAuthGuard } from './guards/jwt/jwt.guard';
import {
  CurrentUser,
  CurrentUserData,
} from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: ' Register a new User' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registred succesfully',
    schema: {
      example: {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwM2IxYzBhYy0yZjBkLTRkNmItYTRiNC0zNDE2Y2Y5YzdjMTkiLCJlbWFpbCI6Im1tdWxpcm81OUBnbWFpbC5jb20iLCJyb2xlIjoiR1VFU1QiLCJpYXQiOjE3NDk3MTQ0NzksImV4cCI6MTc0OTgwMDg3OX0.FnKDtM8eKktBIvurE8QpIIVmZNFp6AxL0kGCUo2qqrw',
        user: {
          id: '03b1c0ac-2f0d-4d6b-a4b4-3416cf9c7c19',
          name: 'Juma Muliro',
          email: 'mmuliro59@gmail.com',
          role: 'USER',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset code sent if email exists',
    schema: {
      example: {
        message: 'If an account with this email exists, you will receive a password reset code.',
      },
    },
  })
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with reset code' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      example: {
        message: 'Password reset successfully. You can now log in with your new password.',
      },
    },
  })
  async resetPassword(@Body() body: { email: string; resetCode: string; newPassword: string }) {
    return this.authService.resetPassword(body.email, body.resetCode, body.newPassword);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: CurrentUserData) {
    return user;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Headers('authorization') authHeader: string) {
    const token = authHeader?.substring(7); // Remove 'Bearer ' prefix
    return this.authService.refreshToken(token);
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async validateToken(@CurrentUser() user: CurrentUserData) {
    return { valid: true, user };
  }
}
