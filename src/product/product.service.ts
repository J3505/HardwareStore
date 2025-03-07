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

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      // Verificar si existe el producto
      const existingProduct = await this.findOne(id);

      // Si se está actualizando la categoría, verificar que exista
      if (updateProductDto.category_name) {
        const category = await this.prisma.category.findUnique({
          where: { name: updateProductDto.category_name },
        });

        if (!category) {
          throw new NotFoundException(
            `La categoría ${updateProductDto.category_name} no existe`,
          );
        }
      }

      // Validar stock si se están actualizando los valores relacionados
      const newMinStock = updateProductDto.min_stock ?? existingProduct.min_stock;
      const newMaxStock = updateProductDto.max_stock ?? existingProduct.max_stock;
      const newStock = updateProductDto.stock ?? existingProduct.stock;

      if (newMinStock > newMaxStock) {
        throw new BadRequestException(
          'El stock mínimo no puede ser mayor al stock máximo',
        );
      }

      if (newStock < newMinStock || newStock > newMaxStock) {
        throw new BadRequestException(
          'El stock debe estar entre el mínimo y máximo establecido',
        );
      }

      // Actualizar el producto
      const updateData: any = { ...updateProductDto };
      if (updateProductDto.category_name) {
        updateData.category = {
          connect: { name: updateProductDto.category_name },
        };
        delete updateData.category_name; // Eliminar para evitar conflicto con Prisma
      }

      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          salesDetail: true,
        },
      });

      return updatedProduct;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al actualizar producto: ${error.message || error}`,
      );
    }
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
