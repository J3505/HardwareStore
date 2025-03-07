import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SaleService {
  constructor(private prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto) {
    try {
      // Verificar que el usuario existe
      const user = await this.prisma.user.findUnique({
        where: { id: createSaleDto.userId },
      });

      if (!user) {
        throw new NotFoundException(
          `Usuario con ID ${createSaleDto.userId} no encontrado`,
        );
      }

      // Verificar que el cliente existe
      const customer = await this.prisma.customer.findUnique({
        where: { id: createSaleDto.customerId },
      });

      if (!customer) {
        throw new NotFoundException(
          `Cliente con ID ${createSaleDto.customerId} no encontrado`,
        );
      }

      // Verificar que todos los productos existan y tengan stock suficiente
      const productPromises = createSaleDto.items.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(
            `Producto con ID ${item.productId} no encontrado`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para el producto ${product.name}. Stock disponible: ${product.stock}`,
          );
        }

        return {
          product,
          quantity: item.quantity,
        };
      });

      const productsToSell = await Promise.all(productPromises);

      // Calcular el total de la venta
      const total = productsToSell.reduce(
        (sum, { product, quantity }) => 
          sum.plus(new Decimal(product.price).times(new Decimal(quantity))),
        new Decimal(0)
      );

      // Crear la venta y sus detalles en una transacción
      const sale = await this.prisma.$transaction(async (prisma) => {
        // Crear la venta
        const newSale = await prisma.sale.create({
          data: {
            total,
            user: {
              connect: { id: createSaleDto.userId },
            },
            customer: {
              connect: { id: createSaleDto.customerId },
            },
            salesDetail: {
              create: productsToSell.map(({ product, quantity }) => ({
                quantity,
                unit_price: product.price,
                subtotal: new Decimal(product.price).times(new Decimal(quantity)),
                product: {
                  connect: { id: product.id },
                },
              })),
            },
          },
          include: {
            salesDetail: {
              include: {
                product: true,
              },
            },
            user: true,
            customer: true,
          },
        });

        // Actualizar el stock de los productos
        for (const { product, quantity } of productsToSell) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              stock: product.stock - quantity,
            },
          });
        }

        return newSale;
      });

      return sale;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al crear la venta: ${error.message || error}`,
      );
    }
  }

  async findAll() {
    return this.prisma.sale.findMany({
      include: {
        salesDetail: {
          include: {
            product: true,
          },
        },
        user: true,
        customer: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        salesDetail: {
          include: {
            product: true,
          },
        },
        user: true,
        customer: true,
      },
    });

    if (!sale) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return sale;
  }
}
