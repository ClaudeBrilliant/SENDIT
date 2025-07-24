import { ResourceOwnerGuard } from './resource-owner.guard';

describe('ResourceOwnerGuard', () => {
  it('should be defined', () => {
    expect(new ResourceOwnerGuard()).toBeDefined();
  });
});
