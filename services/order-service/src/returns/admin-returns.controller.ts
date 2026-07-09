import {
  Controller, Get, Patch, Query, Param, Body, ParseIntPipe, UseGuards, Inject, SetMetadata,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, ROLES_KEY } from '../auth/roles.guard';
import { RETURNS_SERVICE, type IReturnsService } from './returns.service.interface';
import { VerifyReturnRequestDto } from './dto/verify-return-request.dto';

@Controller('admin/returns')
@UseGuards(JwtAuthGuard, RolesGuard)
@SetMetadata(ROLES_KEY, ['admin'])
export class AdminReturnsController {
  constructor(@Inject(RETURNS_SERVICE) private readonly returnsService: IReturnsService) {}

  @Get()
  getReturnRequests(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.returnsService.getReturnRequests(page, limit);
  }

  @Patch(':id/verify')
  verifyReturnRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerifyReturnRequestDto,
  ) {
    return this.returnsService.verifyReturnRequest(id, dto.status);
  }
}
