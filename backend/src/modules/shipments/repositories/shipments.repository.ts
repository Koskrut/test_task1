export interface ShipmentEntity {
  id: string;
  deliveryId: string;
  ttn: string | null;
  npRef: string | null;
  status: string | null;
  raw: Record<string, unknown>;
  createdAt: Date;
}

export interface CreateShipmentInput {
  deliveryId: string;
  ttn: string | null;
  npRef: string | null;
  status: string | null;
  costAmount?: number | null;
  raw: Record<string, unknown>;
}

export interface ShipmentsRepository {
  create(data: CreateShipmentInput): Promise<ShipmentEntity>;
  findByTtn(ttn: string): Promise<ShipmentEntity | null>;
  updateByTtn(
    ttn: string,
    data: { status?: string | null; raw?: Record<string, unknown> },
  ): Promise<ShipmentEntity>;
}
