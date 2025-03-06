import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Get('category/:id')
  findByCategory(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findByCategory(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
