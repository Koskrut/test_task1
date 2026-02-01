export enum VisitStatus {
  planned = 'planned',
  started = 'started',
  completed = 'completed',
  skipped = 'skipped',
}

export enum OrderStatus {
  draft = 'draft',
  pending_payment = 'pending_payment',
  paid = 'paid',
  processing = 'processing',
  packed = 'packed',
  shipped = 'shipped',
  delivered = 'delivered',
  cancelled = 'cancelled',
  returned = 'returned',
}

export enum PaymentStatus {
  unpaid = 'unpaid',
  paid = 'paid',
  refunded = 'refunded',
  partial = 'partial',
}

export enum DeliveryStatus {
  pending = 'pending',
  label_created = 'label_created',
  in_transit = 'in_transit',
  delivered = 'delivered',
  failed = 'failed',
  returned = 'returned',
}
