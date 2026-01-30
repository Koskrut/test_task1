import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeliveryStatus } from '@prisma/client';
import { NovaPoshtaClient } from './nova-poshta.client';
import {
  CreateTtnInput,
  CreateTtnResult,
  TrackStatusResult,
} from './nova-poshta.types';

@Injectable()
export class NovaPoshtaService {
  private readonly senderRef: string;
  private readonly senderContactRef: string;
  private readonly senderPhone: string;
  private readonly senderCityRef: string;

  constructor(
    private readonly client: NovaPoshtaClient,
    private readonly configService: ConfigService,
  ) {
    this.senderRef = this.configService.get<string>('novaPoshta.senderRef') ?? '';
    this.senderContactRef =
      this.configService.get<string>('novaPoshta.senderContactRef') ?? '';
    this.senderPhone =
      this.configService.get<string>('novaPoshta.senderPhone') ?? '';
    this.senderCityRef =
      this.configService.get<string>('novaPoshta.senderCityRef') ?? '';
  }

  async createTtn(input: CreateTtnInput): Promise<CreateTtnResult> {
    if (!this.senderRef || !this.senderContactRef || !this.senderPhone || !this.senderCityRef) {
      throw new BadRequestException('Nova Poshta sender config is missing');
    }

    const payload = {
      PayerType: input.payerType ?? 'Recipient',
      PaymentMethod: 'Cash',
      CargoType: 'Cargo',
      Weight: input.weightKg,
      ServiceType: 'WarehouseWarehouse',
      SeatsAmount: input.seatsAmount,
      Description: input.description ?? input.orderNumber ?? 'Order',
      Cost: input.cost,
      CitySender: this.senderCityRef,
      Sender: this.senderRef,
      SenderAddress: input.senderWarehouseRef,
      ContactSender: this.senderContactRef,
      SendersPhone: this.senderPhone,
      CityRecipient: input.recipientCityRef,
      RecipientAddress: input.recipientWarehouseRef,
      RecipientName: input.recipientName,
      RecipientType: 'PrivatePerson',
      RecipientsPhone: input.recipientPhone,
      Reference: input.orderNumber ?? undefined,
    };

    const response = await this.client.call<Record<string, unknown>>(
      'InternetDocument',
      'save',
      payload,
    );

    const data = response.data?.[0] ?? {};
    const ttn = (data['IntDocNumber'] as string) ?? '';
    const ref = (data['Ref'] as string) ?? '';
    const cost =
      typeof data['CostOnSite'] === 'number'
        ? (data['CostOnSite'] as number)
        : null;

    if (!ttn) {
      throw new BadRequestException('Nova Poshta did not return TTN');
    }

    return {
      ttn,
      ref,
      cost,
      raw: data as Record<string, unknown>,
    };
  }

  async getStatus(ttn: string): Promise<TrackStatusResult> {
    const response = await this.client.call<Record<string, unknown>>(
      'TrackingDocument',
      'getStatusDocuments',
      {
        Documents: [
          {
            DocumentNumber: ttn,
          },
        ],
      },
    );

    const data = response.data?.[0] ?? {};
    return {
      ttn,
      status: (data['Status'] as string) ?? null,
      statusCode: (data['StatusCode'] as string) ?? null,
      raw: data as Record<string, unknown>,
    };
  }

  mapDeliveryStatus(statusCode: string | null, statusText: string | null): DeliveryStatus {
    if (!statusCode && !statusText) {
      return DeliveryStatus.in_transit;
    }

    const code = statusCode ?? '';
    const text = (statusText ?? '').toLowerCase();

    if (code === '9' || code === '10' || code === '11' || text.includes('delivered')) {
      return DeliveryStatus.delivered;
    }
    if (code === '2' || code === '102' || text.includes('return')) {
      return DeliveryStatus.returned;
    }
    if (code === '1' || text.includes('not found')) {
      return DeliveryStatus.failed;
    }

    return DeliveryStatus.in_transit;
  }
}
