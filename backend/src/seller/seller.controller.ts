import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { SellerService } from './seller.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { PaginationDto } from '../common/dto/pagination.dto';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('seller')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SELLER)
@SkipThrottle()
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('stats')
  getStats(@Request() req: AuthenticatedRequest) {
    return this.sellerService.getStats(req.user.id);
  }

  @Get('products')
  getProducts(@Request() req: AuthenticatedRequest, @Query() pagination: PaginationDto) {
    return this.sellerService.getProducts(req.user.id, pagination.page!, pagination.limit!);
  }
}
