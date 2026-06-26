import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@SkipThrottle()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@Request() req: AuthenticatedRequest) {
    return this.wishlistService.getWishlist(req.user.id);
  }

  @Get('ids')
  getIds(@Request() req: AuthenticatedRequest) {
    return this.wishlistService.getIds(req.user.id);
  }

  @Post(':productId')
  add(@Request() req: AuthenticatedRequest, @Param('productId', ParseIntPipe) productId: number) {
    return this.wishlistService.add(req.user.id, productId);
  }

  @Delete(':productId')
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistService.remove(req.user.id, productId);
  }
}
