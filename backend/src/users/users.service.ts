/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { DeliveryStatusEnum } from '@prisma/client';

export type User = NonNullable<
  Awaited<ReturnType<PrismaClient['user']['findUnique']>>
>;

@Injectable()
export class UsersService {
  private prisma = new PrismaClient();

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
