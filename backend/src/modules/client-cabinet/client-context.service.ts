import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_IDENTITY_REPOSITORY } from './client-cabinet.tokens';
import { ClientIdentity } from './repositories/client-identity.repository';
import { ClientIdentityRepository } from './repositories/client-identity.repository';

@Injectable()
export class ClientContextService {
  constructor(
    @Inject(CLIENT_IDENTITY_REPOSITORY)
    private readonly identityRepo: ClientIdentityRepository,
  ) {}

  async requireClient(userId: string): Promise<ClientIdentity> {
    const client = await this.identityRepo.findByUserId(userId);
    if (!client) {
      throw new NotFoundException('Client profile not found');
    }
    return client;
  }
}
