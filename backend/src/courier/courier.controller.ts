import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { CourierService } from './courier.service';

@Controller('courier')
export class CourierController {
  constructor(private readonly courierService: CourierService) {}

  @Get('assigned')
  async getAssignedParcels(@Query('courierId') courierId: string) {
    return this.courierService.getAssignedParcels(courierId);
  }

  @Patch('parcels/:id/location')
  async updateParcelLocation(
    @Param('id') parcelId: string,
    @Body('location') location: string,
    @Body('currentStatusId') currentStatusId: string
  ) {
    return this.courierService.updateParcelLocation(parcelId, location, currentStatusId);
  }

  @Get('parcels/:id/tracking')
  async getParcelTrackingHistory(@Param('id') parcelId: string) {
    return this.courierService.getParcelTrackingHistory(parcelId);
  }

  @Patch('location')
  async updateCourierLocation(
    @Body('courierId') courierId: string,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
    @Body('address') address: string
  ) {
    return this.courierService.updateCourierLocation(courierId, latitude, longitude, address);
  }

  @Get('location/:courierId')
  async getCourierLocation(@Param('courierId') courierId: string) {
    return this.courierService.getCourierLatestLocation(courierId);
  }
} 