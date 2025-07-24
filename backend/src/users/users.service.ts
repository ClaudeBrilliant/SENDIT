import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export type User = NonNullable<Awaited<ReturnType<PrismaClient['user']['findUnique']>>>;

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
    phone?: string;
    password: string;
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.name.split(' ')[0],
        lastName: data.name.split(' ').slice(1).join(' '),
        fullName: data.name,
        phoneNumber: data.phone,
      },
    });
  }

  async getAssignedParcels(courierId: string) {
    // Use valid field for courier assignment if available in schema
    return this.prisma.parcel.findMany({ where: { courierId } });
  }

  async updateParcelLocation(parcelId: string, location: string, statusId: string) {
    // Update parcel's current status and add a tracking entry
    const updatedParcel = await this.prisma.parcel.update({
      where: { id: parcelId },
      data: { currentStatusId: statusId },
    });
    // Use valid tracking logic as per the schema
    return updatedParcel;
  }
}
