import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    try {
      // Verificar si existe la categoría
      const category = await this.prisma.category.findUnique({
        where: { name: createProductDto.category_name },
      });

      if (!category) {
        throw new NotFoundException(
          // `La categoría con ID ${createProductDto.category_id} no existe`,
          `La categoría con ID ${createProductDto.category_name} no existe`,
        );
      }

      // Validar stock
      if (createProductDto.min_stock > createProductDto.max_stock) {
        throw new BadRequestException(
          'El stock mínimo no puede ser mayor al stock máximo',
        );
      }

      if (
        createProductDto.stock < createProductDto.min_stock ||
        createProductDto.stock > createProductDto.max_stock
      ) {
        throw new BadRequestException(
          'El stock debe estar entre el mínimo y máximo establecido',
        );
      }

      const product = await this.prisma.product.create({
        data: {
          name: createProductDto.name,
          description: createProductDto.description,
          price: createProductDto.price,
          stock: createProductDto.stock,
          min_stock: createProductDto.min_stock,
          max_stock: createProductDto.max_stock,
          image_url: createProductDto.image_url,
          category: {
            connect: {
              // id: createProductDto.category_id,
              name: createProductDto.category_name,
            },
          },
        },
        include: {
          category: true,
          salesDetail: true,
        },
      });
      return product;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al crear producto: ${error.message || error}`,
      );
    }
  }

  async findAll() {
    return this.prisma.product.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        category: true,
        salesDetail: true,
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        salesDetail: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }

  async findByCategory(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Categoría con ID ${categoryId} no encontrada`,
      );
    }

    return this.prisma.product.findMany({
      where: {
        category_id: categoryId,
      },
      include: {
        category: true,
        salesDetail: true,
      },
    });
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    try {
      await this.findOne(id);
      return this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al eliminar producto: ${error.message || error}`,
      );
    }
  }
}
