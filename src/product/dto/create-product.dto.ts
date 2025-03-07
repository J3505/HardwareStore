import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  stock: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  min_stock: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  max_stock: number;

  // @IsNumber()
  // @IsNotEmpty()
  // @Type(() => Number)
  // category_id: number;

  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  category_name: string;

  @IsString()
  @IsOptional()
  image_url?: string;
}
