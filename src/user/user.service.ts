/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleEnum } from '../common/enums/role.enum';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { username: createUserDto.username },
      });

      if (existingUser) {
        throw new BadRequestException('El nombre de usuario ya existe');
      }

      // Buscar o crear el rol
      const role = await this.prisma.role.upsert({
        where: { role: createUserDto.role as RoleEnum },
        create: { role: createUserDto.role as RoleEnum },
        update: {},
      });

      // Crear el usuario
      const user = await this.prisma.user.create({
        data: {
          username: createUserDto.username,
          password: createUserDto.password,
          role: {
            connect: {
              id: role.id,
            },
          },
        },
        include: {
          role: true,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al crear usuario: ${error.message || error}`,
      );
    }
  }

  async findAll() {
    try {
      const users = await this.prisma.user.findMany({
        include: {
          role: true,
        },
      });

      return users;
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener usuarios: ${error.message || error}`,
      );
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          role: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al obtener usuario: ${error.message || error}`,
      );
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      // Verificar si el usuario existe
      const existingUser = await this.findOne(id);

      // Si se está actualizando el username, verificar que no exista
      if (updateUserDto.username) {
        const userWithSameUsername = await this.prisma.user.findUnique({
          where: { username: updateUserDto.username },
        });

        if (userWithSameUsername && userWithSameUsername.id !== id) {
          throw new BadRequestException('El nombre de usuario ya existe');
        }
      }

      // Preparar los datos de actualización
      const updateData: any = {
        username: updateUserDto.username,
        password: updateUserDto.password,
      };

      // Si se está actualizando el rol
      if (updateUserDto.role) {
        const role = await this.prisma.role.upsert({
          where: { role: updateUserDto.role as RoleEnum },
          create: { role: updateUserDto.role as RoleEnum },
          update: {},
        });

        updateData.role = {
          connect: {
            id: role.id,
          },
        };
      }

      // Actualizar el usuario
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          role: true,
        },
      });

      return updatedUser;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al actualizar usuario: ${error.message || error}`,
      );
    }
  }

  async remove(id: number) {
    try {
      // Verificar si el usuario existe
      await this.findOne(id);

      // Eliminar el usuario
      await this.prisma.user.delete({
        where: { id },
      });

      return { message: `Usuario con ID ${id} eliminado correctamente` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al eliminar usuario: ${error.message || error}`,
      );
    }
  }
}
