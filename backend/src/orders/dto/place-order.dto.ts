import { IsOptional, IsString } from 'class-validator';

export class PlaceOrderDto {
  @IsOptional()
  @IsString()
  couponCode?: string;
}
