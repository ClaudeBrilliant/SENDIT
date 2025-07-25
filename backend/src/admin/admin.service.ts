/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaClient, NotificationType, DeliveryStatusEnum } from '@prisma/client';
import {
  MailerService,
  ParcelInfo,
} from '../shared/utils/mailer/mailer.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  private prisma = new PrismaClient();

  constructor(
    private readonly mailerService: MailerService,
    private prismaService: PrismaService,
  ) {}

  // Create a new parcel
  async createParcel(data: any) {
    const parcel = await this.prisma.parcel.create({
      data,
      include: {
        pickupLocation: true,
        deliveryLocation: true,
      },
    });
    const receiver = await this.prisma.user.findUnique({
      where: { id: parcel.receiverId },
    });
    if (receiver) {
      const parcelInfo: ParcelInfo = {
        trackingNumber: parcel.id,
        pickupLocation: parcel.pickupLocation.address,
        deliveryLocation: parcel.deliveryLocation.address,
      };
      await this.mailerService.sendOrderCreatedEmail(
        receiver.email,
        parcelInfo,
      );
    }
    return parcel;
  }

  // Update parcel status
  async updateParcelStatus(parcelId: string, status: string) {
    const parcel = await this.prisma.parcel.update({
      where: { id: parcelId },
      data: { currentStatus: status as DeliveryStatusEnum },
      include: {
        pickupLocation: true,
        deliveryLocation: true,
      },
    });
    const receiver = await this.prisma.user.findUnique({
      where: { id: parcel.receiverId },
    });
    if (receiver) {
      const parcelInfo: ParcelInfo = {
        trackingNumber: parcel.id,
        pickupLocation: parcel.pickupLocation ? parcel.pickupLocation.address : parcel.pickupLocationId,
        deliveryLocation: parcel.deliveryLocation ? parcel.deliveryLocation.address : parcel.deliveryLocationId,
      };
      await this.mailerService.sendStatusUpdateEmail(
        receiver.email,
        parcelInfo,
        status,
      );
      if (status.toLowerCase() === 'delivered') {
        await this.mailerService.sendDeliveryNotification(
          receiver.email,
          parcelInfo,
        );
      }
    }
    return parcel;
  }

  // List all parcels
  async listParcels() {
    return this.prisma.parcel.findMany({
      include: {
        sender: true,
        receiver: true,
        pickupLocation: true,
        deliveryLocation: true,
      },
    });
  }

  // List all users
  async listUsers() {
    return this.prisma.user.findMany();
  }

  // List all couriers
  async listCouriers() {
    return this.prisma.user.findMany({
      where: { role: 'COURIER' },
    });
  }

  // Get user by ID
  async getUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  // Update user
  async updateUser(userId: string, data: any) {
    // Map 'name' to firstName and lastName if present
    const updateData: any = { ...data };
    if (updateData.name) {
      const [firstName, ...rest] = updateData.name.split(' ');
      updateData.firstName = firstName;
      updateData.lastName = rest.join(' ');
      delete updateData.name;
    }
    if (updateData.phone) {
      updateData.phone = updateData.phone;
    }
    // Only allow valid fields
    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'password', 'role'];
    Object.keys(updateData).forEach(key => {
      if (!allowedFields.includes(key)) delete updateData[key];
    });
    return this.prisma.user.update({ where: { id: userId }, data: updateData });
  }

  // Delete user
  async deleteUser(userId: string) {
    return this.prisma.user.delete({ where: { id: userId } });
  }

  // Get parcel by ID
  async getParcelById(parcelId: string) {
    return this.prisma.parcel.findUnique({
      where: { id: parcelId },
      include: {
        sender: true,
        receiver: true,
        pickupLocation: true,
        deliveryLocation: true,
      },
    });
  }

  // Update parcel
  async updateParcel(parcelId: string, data: any) {
    return this.prisma.parcel.update({ where: { id: parcelId }, data });
  }

  // Delete parcel
  async deleteParcel(parcelId: string) {
    return this.prisma.parcel.delete({ where: { id: parcelId } });
  }

  // Create a notification
  async createNotification(userId: string, message: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.EMAIL, // or SMS or PUSH
        content: message,
      },
    });
  }

  async registerAdmin(dto: CreateAdminDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone,
        role: 'ADMIN',
      },
    });
  }

  // Parcels
  async getAllParcels() {
    return this.prisma.parcel.findMany();
  }

  async assignCourier(parcelId: string, courierId: string) {
    return this.prisma.parcel.update({
      where: { id: parcelId },
      data: { courierId },
    });
  }

  // Users
  async getAllUsers() {
    return this.prisma.user.findMany();
  }

  // Couriers
  async getAllCouriers() {
    return this.prisma.user.findMany({ where: { role: 'COURIER' } });
  }
}
