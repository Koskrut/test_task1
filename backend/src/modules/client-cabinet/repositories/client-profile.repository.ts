import { Address } from '@prisma/client';

export interface ClientProfileRepository {
  listAddresses(clientId: string): Promise<Address[]>;
}
