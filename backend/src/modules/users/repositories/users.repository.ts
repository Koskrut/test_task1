import { CreateUserInput, UpdateUserInput, UserEntity } from '../users.types';

export interface UsersRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmailOrPhone(identifier: string): Promise<UserEntity | null>;
  create(data: CreateUserInput): Promise<UserEntity>;
  update(id: string, data: UpdateUserInput): Promise<UserEntity>;
}
