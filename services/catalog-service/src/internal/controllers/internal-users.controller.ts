import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { InternalGuard } from '../internal.guard';
import { USER_REPOSITORY } from '../../users/repositories/user.repository.interface';
import type { IUserRepository } from '../../users/repositories/user.repository.interface';

@Controller('internal/users')
@UseGuards(InternalGuard)
export class InternalUsersController {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository) {}

  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return { id: user.id, email: user.email, name: user.name };
  }
}
