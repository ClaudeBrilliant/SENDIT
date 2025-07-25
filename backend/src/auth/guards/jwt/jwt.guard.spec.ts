import { JwtAuthGuard } from './jwt.guard';
import { Reflector } from '@nestjs/core';
import { JwtService } from '../../../shared/utils/jwt.service';
import { UsersService } from '../../../users/users.service';

describe('JwtAuthGuard', () => {
  it('should be defined', () => {
    expect(
      new JwtAuthGuard(
        new Reflector(),
        {} as JwtService,
        {} as UsersService
      )
    ).toBeDefined();
  });
});
