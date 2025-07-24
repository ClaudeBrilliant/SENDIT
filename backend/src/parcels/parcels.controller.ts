import { Controller, Post, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { ParcelsService } from './parcels.service';

@Controller('parcels')
export class ParcelsController {
  constructor(private readonly parcelsService: ParcelsService) {}

  @Post()
  async createParcel(@Body() data: any) {
    return this.parcelsService.createParcel(data);
  }

  @Get('sent')
  async getSentParcels(@Query('userId') userId: string) {
    return this.parcelsService.getSentParcels(userId);
  }

  @Get('received')
  async getReceivedParcels(@Query('userId') userId: string) {
    return this.parcelsService.getReceivedParcels(userId);
  }

  @Get('assigned')
  async getAssignedParcels(@Query('courierId') courierId: string) {
    return this.parcelsService.getAssignedParcels(courierId);
  }

  @Get(':id')
  async getParcelById(@Param('id') parcelId: string) {
    return this.parcelsService.getParcelById(parcelId);
  }

  @Patch(':id/status')
  async updateParcelStatus(@Param('id') parcelId: string, @Body('currentStatusId') currentStatusId: string) {
    return this.parcelsService.updateParcelStatus(parcelId, currentStatusId);
  }
}
