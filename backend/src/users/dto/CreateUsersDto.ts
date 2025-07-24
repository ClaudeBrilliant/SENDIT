/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Role } from '@prisma/client';
import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  password: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role = Role.USER;
}
