import { Inject, Injectable } from '@nestjs/common';
import { AUDIT_LOGS_REPOSITORY } from '../../common/constants/tokens';
import { AuditLogsRepository } from '../../common/repositories/audit-logs.repository';
import { ClientContextService } from './client-context.service';
import {
  CLIENT_PREFERENCES_REPOSITORY,
  CLIENT_PROFILE_REPOSITORY,
} from './client-cabinet.tokens';
import { AddressResponseDto } from './dto/address-response.dto';
import { ClientProfileResponseDto } from './dto/client-profile-response.dto';
import { NotificationPreferencesDto } from './dto/notification-preferences.dto';
import { ClientPreferencesRepository } from './repositories/client-preferences.repository';
import { ClientProfileRepository } from './repositories/client-profile.repository';

@Injectable()
export class ClientProfileService {
  constructor(
    private readonly clientContext: ClientContextService,
    @Inject(CLIENT_PROFILE_REPOSITORY)
    private readonly profileRepo: ClientProfileRepository,
    @Inject(CLIENT_PREFERENCES_REPOSITORY)
    private readonly preferencesRepo: ClientPreferencesRepository,
    @Inject(AUDIT_LOGS_REPOSITORY)
    private readonly auditRepo: AuditLogsRepository,
  ) {}

  async getProfile(userId: string): Promise<ClientProfileResponseDto> {
    const client = await this.clientContext.requireClient(userId);
    const addresses = await this.profileRepo.listAddresses(client.id);
    const preferences =
      (await this.preferencesRepo.getByClientId(client.id)) ?? {
        clientId: client.id,
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        inAppEnabled: true,
      };

    return {
      id: client.id,
      name: client.name,
      companyName: client.companyName,
      email: client.email,
      phone: client.phone,
      addresses: addresses.map(
        (address): AddressResponseDto => ({
          id: address.id,
          label: address.label,
          country: address.country,
          region: address.region,
          city: address.city,
          street: address.street,
          house: address.house,
          apartment: address.apartment,
          postalCode: address.postalCode,
          lat: address.lat,
          lng: address.lng,
        }),
      ),
      preferences: {
        emailEnabled: preferences.emailEnabled,
        smsEnabled: preferences.smsEnabled,
        pushEnabled: preferences.pushEnabled,
        inAppEnabled: preferences.inAppEnabled,
      },
    };
  }

  async listAddresses(userId: string): Promise<AddressResponseDto[]> {
    const client = await this.clientContext.requireClient(userId);
    const addresses = await this.profileRepo.listAddresses(client.id);
    return addresses.map((address) => ({
      id: address.id,
      label: address.label,
      country: address.country,
      region: address.region,
      city: address.city,
      street: address.street,
      house: address.house,
      apartment: address.apartment,
      postalCode: address.postalCode,
      lat: address.lat,
      lng: address.lng,
    }));
  }

  async getPreferences(userId: string): Promise<NotificationPreferencesDto> {
    const client = await this.clientContext.requireClient(userId);
    const preferences =
      (await this.preferencesRepo.getByClientId(client.id)) ?? {
        clientId: client.id,
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        inAppEnabled: true,
      };

    return {
      emailEnabled: preferences.emailEnabled,
      smsEnabled: preferences.smsEnabled,
      pushEnabled: preferences.pushEnabled,
      inAppEnabled: preferences.inAppEnabled,
    };
  }

  async updatePreferences(
    userId: string,
    dto: NotificationPreferencesDto,
  ): Promise<NotificationPreferencesDto> {
    const client = await this.clientContext.requireClient(userId);
    const updated = await this.preferencesRepo.upsert(client.id, {
      clientId: client.id,
      emailEnabled: dto.emailEnabled,
      smsEnabled: dto.smsEnabled,
      pushEnabled: dto.pushEnabled,
      inAppEnabled: dto.inAppEnabled,
    });

    await this.auditRepo.create({
      actorId: userId,
      action: 'client.preferences.update',
      entityType: 'client_notification_preferences',
      entityId: updated.clientId,
    });

    return {
      emailEnabled: updated.emailEnabled,
      smsEnabled: updated.smsEnabled,
      pushEnabled: updated.pushEnabled,
      inAppEnabled: updated.inAppEnabled,
    };
  }
}
