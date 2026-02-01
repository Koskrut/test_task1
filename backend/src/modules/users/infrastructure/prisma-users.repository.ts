import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  CreateUserInput,
  UpdateUserInput,
  UserEntity,
} from '../users.types';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmailOrPhone(identifier: string): Promise<UserEntity | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });
  }

  async create(data: CreateUserInput): Promise<UserEntity> {
    return this.prisma.user.create({
      data: {
        email: data.email ?? null,
        phone: data.phone ?? null,
        passwordHash: data.passwordHash,
        role: data.role,
        status: data.status ?? undefined,
      },
    });
  }

  async update(id: string, data: UpdateUserInput): Promise<UserEntity> {
    return this.prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
        role: data.role,
        status: data.status,
      },
    });
  }
}
