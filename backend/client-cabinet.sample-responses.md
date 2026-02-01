# Client Cabinet - Sample API Responses

All endpoints require:
```
Authorization: Bearer <JWT>
```

## GET /api/v1/client/dashboard
```json
{
  "activeOrders": [
    {
      "id": "c9a1c2c2-6c0a-4f70-9e8f-7c8f0d7d1f9a",
      "orderNumber": "ORD-1738259200000-123",
      "status": "processing",
      "paymentStatus": "paid",
      "totalAmount": "2500.00",
      "currency": "UAH",
      "createdAt": "2026-01-30T09:10:15.000Z",
      "deliveryStatus": "in_transit",
      "ttn": "20400011122233",
      "providerStatus": "В дорозі"
    }
  ],
  "stats": {
    "totalOrders": 12,
    "activeOrders": 3
  }
}
```

## GET /api/v1/client/orders?page=1&limit=20
```json
{
  "items": [
    {
      "id": "c9a1c2c2-6c0a-4f70-9e8f-7c8f0d7d1f9a",
      "orderNumber": "ORD-1738259200000-123",
      "status": "processing",
      "paymentStatus": "paid",
      "totalAmount": "2500.00",
      "currency": "UAH",
      "createdAt": "2026-01-30T09:10:15.000Z",
      "deliveryStatus": "in_transit",
      "ttn": "20400011122233",
      "providerStatus": "В дорозі"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 12
}
```

## GET /api/v1/client/orders/:id
```json
{
  "id": "c9a1c2c2-6c0a-4f70-9e8f-7c8f0d7d1f9a",
  "orderNumber": "ORD-1738259200000-123",
  "status": "processing",
  "paymentStatus": "paid",
  "totalAmount": "2500.00",
  "currency": "UAH",
  "createdAt": "2026-01-30T09:10:15.000Z",
  "deliveryStatus": "in_transit",
  "ttn": "20400011122233",
  "providerStatus": "В дорозі",
  "items": [
    {
      "id": "c1b2c3d4-1111-2222-3333-444444444444",
      "productId": "c2c2c2c2-3333-4444-5555-666666666666",
      "qty": 2,
      "priceAmount": "1200.00",
      "totalAmount": "2400.00"
    }
  ]
}
```

## POST /api/v1/client/orders/:id/repeat
```json
{
  "id": "f1a1c2c2-6c0a-4f70-9e8f-7c8f0d7d1f9a",
  "orderNumber": "ORD-1738259300000-456",
  "status": "pending_payment",
  "paymentStatus": "unpaid",
  "totalAmount": "2500.00",
  "currency": "UAH",
  "createdAt": "2026-01-30T09:15:15.000Z",
  "deliveryStatus": null,
  "ttn": null,
  "items": [
    {
      "id": "b1b2c3d4-1111-2222-3333-444444444444",
      "productId": "c2c2c2c2-3333-4444-5555-666666666666",
      "qty": 2,
      "priceAmount": "1200.00",
      "totalAmount": "2400.00"
    }
  ]
}
```

## GET /api/v1/client/documents
```json
{
  "items": [
    {
      "id": "9d3f5e1a-2b2c-4f1f-8f34-9fae11b1a1c3",
      "title": "Invoice #1234",
      "documentType": "invoice",
      "createdAt": "2026-01-30T09:10:15.000Z",
      "fileName": "invoice_1234.pdf",
      "mimeType": "application/pdf",
      "sizeBytes": "54321"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

## GET /api/v1/client/documents/:id/download
```json
{
  "id": "9d3f5e1a-2b2c-4f1f-8f34-9fae11b1a1c3",
  "fileName": "invoice_1234.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": "54321",
  "downloadUrl": "minio://bucket/invoices/invoice_1234.pdf"
}
```

## GET /api/v1/client/support/tickets
```json
{
  "items": [
    {
      "id": "ae2f5e1a-2b2c-4f1f-8f34-9fae11b1a1c3",
      "status": "open",
      "createdAt": "2026-01-30T09:10:15.000Z",
      "lastMessageAt": "2026-01-30T09:15:15.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

## POST /api/v1/client/support/tickets
```json
{
  "id": "ae2f5e1a-2b2c-4f1f-8f34-9fae11b1a1c3",
  "status": "open",
  "createdAt": "2026-01-30T09:10:15.000Z",
  "lastMessageAt": "2026-01-30T09:10:15.000Z"
}
```

## GET /api/v1/client/support/tickets/:id/messages
```json
{
  "items": [
    {
      "id": "be2f5e1a-2b2c-4f1f-8f34-9fae11b1a1c3",
      "senderId": "0a3f5e1a-2b2c-4f1f-8f34-9fae11b1a1c3",
      "body": "Please help with my delivery.",
      "attachmentId": null,
      "createdAt": "2026-01-30T09:10:15.000Z"
    }
  ],
  "page": 1,
  "limit": 50,
  "total": 1
}
```

## GET /api/v1/client/profile
```json
{
  "id": "c6b9c2c2-6c0a-4f70-9e8f-7c8f0d7d1f9a",
  "name": "Ivan Petrenko",
  "companyName": "Petrenko LLC",
  "email": "ivan@example.com",
  "phone": "+380501234567",
  "addresses": [
    {
      "id": "2c2a1d33-20be-4fe1-9a8e-6c0fcbf1a1ff",
      "label": "Home",
      "country": "UA",
      "region": "Kyiv",
      "city": "Kyiv",
      "street": "Khreshchatyk",
      "house": "10",
      "apartment": "15",
      "postalCode": "01001",
      "lat": 50.4501,
      "lng": 30.5234
    }
  ],
  "preferences": {
    "emailEnabled": true,
    "smsEnabled": false,
    "pushEnabled": true,
    "inAppEnabled": true
  }
}
```
