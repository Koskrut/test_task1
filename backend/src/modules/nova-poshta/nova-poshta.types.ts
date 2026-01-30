export interface NovaPoshtaResponse<T> {
  success: boolean;
  data: T[];
  errors: string[];
  warnings: string[];
  info: string[];
}

export interface CreateTtnInput {
  senderWarehouseRef: string;
  recipientCityRef: string;
  recipientWarehouseRef: string;
  recipientName: string;
  recipientPhone: string;
  weightKg: number;
  cost: number;
  seatsAmount: number;
  description?: string;
  payerType?: 'Sender' | 'Recipient';
  orderNumber?: string;
}

export interface CreateTtnResult {
  ttn: string;
  ref: string;
  cost: number | null;
  raw: Record<string, unknown>;
}

export interface TrackStatusResult {
  ttn: string;
  status: string | null;
  statusCode: string | null;
  raw: Record<string, unknown>;
}

export const EXAMPLE_CREATE_TTN_REQUEST: CreateTtnInput = {
  senderWarehouseRef: '6b2b7c3e-2fa9-11e5-88b2-0050568002cf',
  recipientCityRef: 'db5c88f0-391c-11dd-90d9-001a92567626',
  recipientWarehouseRef: '841339c7-591a-42e2-8233-7a0a00f0ed6f',
  recipientName: 'Ivan Petrenko',
  recipientPhone: '+380501234567',
  weightKg: 2.5,
  cost: 1200,
  seatsAmount: 1,
  description: 'Order #1234',
  payerType: 'Recipient',
  orderNumber: 'ORD-1700000000000-123',
};
