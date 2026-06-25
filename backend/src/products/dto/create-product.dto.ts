import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
