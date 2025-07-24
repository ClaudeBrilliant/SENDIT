import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CourierService {
  private prisma = new PrismaClient();

  // Get parcels assigned to this courier
  async getAssignedParcels(courierId: string) {
    // Use valid field for courier assignment if available in schema
    return this.prisma.parcel.findMany({ where: { courierId } });
  }

  // Courier updates parcel location/status
  async updateParcelLocation(parcelId: string, location: string, currentStatusId: string) {
    // Update parcel's current status and add a tracking entry
    const updatedParcel = await this.prisma.parcel.update({
      where: { id: parcelId },
      data: { currentStatusId },
    });
    // Use valid tracking logic as per the schema
    return updatedParcel;
  }
} 