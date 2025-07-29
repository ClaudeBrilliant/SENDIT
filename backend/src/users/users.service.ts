/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { DeliveryStatusEnum } from '@prisma/client';
import { CloudinaryService, SenditUploadType } from '../shared/utils/cloudinary/cloudinary.service';
import { AdminService } from '../admin/admin.service';

export type User = NonNullable<
  Awaited<ReturnType<PrismaClient['user']['findUnique']>>
>;

@Injectable()
export class UsersService {
  private prisma = new PrismaClient();

  constructor(
    private cloudinaryService: CloudinaryService,
    private adminService: AdminService
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async create(data: {
    name: string;
    email: string;
    phone: string; // <-- Remove the "?" to make it required
    password: string;
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const [firstName, ...rest] = data.name.split(' ');
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName,
        lastName: rest.join(' '),
        phone: data.phone, // always defined
      },
    });
  }

  async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }): Promise<User> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being updated and if it's already taken
    if (data.email && data.email !== user.email) {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      },
    });

    // Log the profile update
    await this.adminService.createLog({
      action: 'PROFILE_UPDATED',
      details: `User ${user.firstName} ${user.lastName} updated their profile`,
      userId: userId
    });

    return updatedUser;
  }

  async uploadProfileImage(userId: string, file: Express.Multer.File): Promise<{ imageUrl: string }> {
    console.log('Starting upload for user:', userId);
    console.log('File received:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    const user = await this.findOne(userId);
    if (!user) {
      console.error('User not found:', userId);
      throw new NotFoundException('User not found');
    }

    console.log('User found, uploading to Cloudinary...');

    // Upload to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadFile(
      file,
      SenditUploadType.USER_PROFILE,
      userId
    );

    console.log('Cloudinary upload successful:', uploadResult);

    // Update user with new profile image URL
    await this.prisma.user.update({
      where: { id: userId },
      data: { profileImage: uploadResult.secure_url }
    });

    // Log the profile image upload
    await this.adminService.createLog({
      action: 'PROFILE_IMAGE_UPLOADED',
      details: `User ${user.firstName} ${user.lastName} uploaded a new profile image`,
      userId: userId
    });

    return { imageUrl: uploadResult.secure_url };
  }

  async deleteProfileImage(userId: string): Promise<void> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.profileImage) {
      // Remove profile image from user
      await this.prisma.user.update({
        where: { id: userId },
        data: { profileImage: null }
      });

      // Log the profile image deletion
      await this.adminService.createLog({
        action: 'PROFILE_IMAGE_DELETED',
        details: `User ${user.firstName} ${user.lastName} deleted their profile image`,
        userId: userId
      });
    }
  }

  async getAssignedParcels(courierId: string) {
    // Use valid field for courier assignment if available in schema
    return this.prisma.parcel.findMany({ where: { courierId } });
  }

  async updateParcelLocation(
    parcelId: string,
    location: string,
    currentStatus: string,
  ) {
    const updatedParcel = await this.prisma.parcel.update({
      where: { id: parcelId },
      data: { currentStatus: currentStatus as DeliveryStatusEnum },
    });
    await this.prisma.parcelTracking.create({
      data: {
        parcelId,
        location,
        // timestamp will be set by default
      },
    });
    return updatedParcel;
  }
}
