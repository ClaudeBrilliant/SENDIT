/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateParcelDto } from './dto/create-parcel.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('register')
  async registerAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.registerAdmin(dto);
  }

  // Dashboard Stats
  @Get('stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // Parcels
  @Post('parcels')
  async createParcel(@Body() dto: CreateParcelDto) {
    return this.adminService.createParcel(dto);
  }

  @Get('parcels')
  getAllParcels() {
    return this.adminService.getAllParcels();
  }

  @Get('parcels/recent')
  getRecentParcels() {
    return this.adminService.getRecentParcels();
  }

  @Get('parcels/:parcelId')
  getParcelById(@Param('parcelId') parcelId: string) {
    return this.adminService.getParcelById(parcelId);
  }

  @Patch('parcels/:parcelId/assign-courier')
  assignCourier(@Param('parcelId') parcelId: string, @Body() dto: any) {
    return this.adminService.assignCourier(parcelId, dto.courierId);
  }

  @Patch('parcels/:parcelId/status')
  updateParcelStatus(@Param('parcelId') parcelId: string, @Body() dto: any) {
    return this.adminService.updateParcelStatus(parcelId, dto.currentStatusId);
  }

  @Patch('parcels/:parcelId')
  updateParcel(@Param('parcelId') parcelId: string, @Body() dto: any) {
    return this.adminService.updateParcel(parcelId, dto);
  }

  @Delete('parcels/:parcelId')
  deleteParcel(@Param('parcelId') parcelId: string) {
    return this.adminService.deleteParcel(parcelId);
  }

  // Users
  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/recent')
  getRecentUsers() {
    return this.adminService.getRecentUsers();
  }

  @Get('users/:userId')
  getUserById(@Param('userId') userId: string) {
    return this.adminService.getUserById(userId);
  }

  @Patch('users/:userId')
  updateUser(@Param('userId') userId: string, @Body() dto: any) {
    return this.adminService.updateUser(userId, dto);
  }

  @Delete('users/:userId')
  deleteUser(@Param('userId') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  // Couriers
  @Get('couriers')
  getAllCouriers() {
    return this.adminService.getAllCouriers();
  }

  // Logs
  @Get('logs')
  getLogs() {
    return this.adminService.getLogs();
  }

  @Post('logs/sample')
  createSampleLogs() {
    return this.adminService.createSampleLogs();
  }

  // Analytics
  @Get('analytics')
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  // Tracking
  @Get('parcels/:parcelId/courier-location')
  getCourierLocation(@Param('parcelId') parcelId: string) {
    return this.adminService.getCourierLocation(parcelId);
  }

  @Get('parcels/:parcelId/tracking-history')
  getParcelTrackingHistory(@Param('parcelId') parcelId: string) {
    return this.adminService.getParcelTrackingHistory(parcelId);
  }
}
