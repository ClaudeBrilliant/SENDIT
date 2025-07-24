/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsOptional, IsUUID, Min } from 'class-validator';
import { IsNumber } from 'class-validator/types/decorator/typechecker/IsNumber';

export class CreateParcelDto {
  @IsUUID()
  senderId: string;

  @IsUUID()
  receiverId: string;

  @IsUUID()
  @IsOptional()
  courierId?: string;

  @IsNumber()
  @Min(0.1)
  weight: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsUUID()
  pickupLocationId: string;

  @IsUUID()
  deliveryLocationId: string;

  @IsUUID()
  currentStatusId: string;
}
