import { AddressResponseDto } from './address-response.dto';
import { NotificationPreferencesDto } from './notification-preferences.dto';

export class ClientProfileResponseDto {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  addresses: AddressResponseDto[];
  preferences: NotificationPreferencesDto;
}
