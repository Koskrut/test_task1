import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USERS_REPOSITORY } from '../../common/constants/tokens';
import { hashPassword } from '../../common/utils/password';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersRepository } from './repositories/users.repository';
import { UserEntity, UserStatus } from './users.types';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly usersRepo: UsersRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const passwordHash = await hashPassword(dto.password);
    const user = await this.usersRepo.create({
      email: dto.email ?? null,
      phone: dto.phone ?? null,
      passwordHash,
      role: dto.role,
      status: UserStatus.Active,
    });

    return this.toResponse(user);
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toResponse(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const existing = await this.usersRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const passwordHash = dto.password
      ? await hashPassword(dto.password)
      : undefined;

    const user = await this.usersRepo.update(id, {
      email: dto.email ?? undefined,
      phone: dto.phone ?? undefined,
      passwordHash,
      role: dto.role ?? undefined,
      status: dto.status ?? undefined,
    });

    return this.toResponse(user);
  }

  async findByIdentifier(identifier: string): Promise<UserEntity | null> {
    return this.usersRepo.findByEmailOrPhone(identifier);
  }

  private toResponse(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
