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
} 