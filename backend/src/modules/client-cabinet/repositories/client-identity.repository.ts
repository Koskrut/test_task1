export interface ClientIdentity {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  companyName: string | null;
}

export interface ClientIdentityRepository {
  findByUserId(userId: string): Promise<ClientIdentity | null>;
}
