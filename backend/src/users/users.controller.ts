import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getUserById(@Param('id') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Get()
  async listUsers() {
    return this.usersService.findAll();
  }
}
