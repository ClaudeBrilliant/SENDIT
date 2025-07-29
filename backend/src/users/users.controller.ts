import { Controller, Get, Param, Patch, Post, Delete, UseInterceptors, UploadedFile, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get(':id')
  async getUserById(@Param('id') userId: string) {
    console.log('Getting user by ID:', userId);
    const user = await this.usersService.findOne(userId);
    console.log('Found user:', user);
    return user;
  }

  @Get()
  async listUsers() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateProfile(
    @Param('id') userId: string,
    @Body() data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    }
  ) {
    return this.usersService.updateProfile(userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(
    @Param('id') userId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    console.log('Upload request received for user:', userId);
    console.log('File details:', {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
      buffer: file?.buffer ? 'Buffer present' : 'No buffer'
    });

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Check if file is an image
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    // Check file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 2MB');
    }

    const result = await this.usersService.uploadProfileImage(userId, file);
    console.log('Upload result:', result);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/profile-image')
  async deleteProfileImage(@Param('id') userId: string) {
    return this.usersService.deleteProfileImage(userId);
  }
}
