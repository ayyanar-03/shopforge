import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
  Inject,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PRODUCTS_SERVICE } from './products.service.interface';
import type { IProductsService } from './products.service.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchDto } from './dto/search.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('products')
export class ProductsController {
  constructor(@Inject(PRODUCTS_SERVICE) private readonly productsService: IProductsService) {}

  @Get()
  @SkipThrottle()
  findAll(@Query() pagination: PaginationDto) {
    return this.productsService.findAll(pagination.page!, pagination.limit!);
  }

  @Get('search')
  @SkipThrottle()
  search(@Query() dto: SearchDto) {
    return this.productsService.search(dto);
  }

  @Get(':id')
  @SkipThrottle()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Get(':id/related')
  @SkipThrottle()
  findRelated(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findRelated(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  create(@Body() dto: CreateProductDto, @Request() req: AuthenticatedRequest) {
    return this.productsService.create(dto, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.productsService.update(id, dto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: AuthenticatedRequest) {
    return this.productsService.remove(id, req.user.id, req.user.role);
  }
}
