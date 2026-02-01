export interface ClientPreferencesRecord {
  clientId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
}

export interface ClientPreferencesRepository {
  getByClientId(clientId: string): Promise<ClientPreferencesRecord | null>;
  upsert(
    clientId: string,
    data: Partial<ClientPreferencesRecord>,
  ): Promise<ClientPreferencesRecord>;
}
