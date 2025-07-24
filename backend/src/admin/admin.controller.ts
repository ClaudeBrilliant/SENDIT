import { Controller, Post, Patch, Get, Delete, Body, Param } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('parcels')
  async createParcel(@Body() data: any) {
    return this.adminService.createParcel(data);
  }

  // assignCourier endpoint removed: AdminService does not have this method.

  @Patch('parcels/:id/status')
  async updateParcelStatus(@Param('id') parcelId: string, @Body('statusId') statusId: string) {
    return this.adminService.updateParcelStatus(parcelId, statusId);
  }

  @Get('parcels')
  async listParcels() {
    return this.adminService.listParcels();
  }

  @Get('users')
  async listUsers() {
    return this.adminService.listUsers();
  }

  @Get('couriers')
  async listCouriers() {
    return this.adminService.listCouriers();
  }

  // Get user by ID
  @Get('users/:id')
  async getUserById(@Param('id') userId: string) {
    return this.adminService.getUserById(userId);
  }

  // Update user
  @Patch('users/:id')
  async updateUser(@Param('id') userId: string, @Body() data: any) {
    return this.adminService.updateUser(userId, data);
  }

  // Delete user
  @Delete('users/:id')
  async deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  // Get parcel by ID
  @Get('parcels/:id')
  async getParcelById(@Param('id') parcelId: string) {
    return this.adminService.getParcelById(parcelId);
  }

  // Update parcel
  @Patch('parcels/:id')
  async updateParcel(@Param('id') parcelId: string, @Body() data: any) {
    return this.adminService.updateParcel(parcelId, data);
  }

  // Delete parcel
  @Delete('parcels/:id')
  async deleteParcel(@Param('id') parcelId: string) {
    return this.adminService.deleteParcel(parcelId);
  }
}
