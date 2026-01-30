# Business System Architecture and Implementation Plan

This document defines a production-ready architecture and implementation plan
for a full-featured business system that includes CRM, online store, mobile
applications, GPS tracking, Kanban automation, and Nova Poshta integration.

The implementation is based on:
- Backend: Node.js (NestJS) with PostgreSQL and Redis
- API: REST + WebSocket (event-driven updates)
- Auth: JWT access and refresh tokens
- Deployment: Docker-based, environment-driven configuration

======================================================================
1. Database schema
======================================================================

The full DDL is in schema.sql. Key design points:
- PostgreSQL 15+ with extensions: pgcrypto, citext, postgis
- UUID primary keys for all tables
- Soft deletes for CRM and sales entities
- JSONB for event payloads and flexible integrations
- Strong indexing for CRM, orders, GPS, and notifications
- PostGIS geometry for geofences and geo queries

Core tables:
- users, user_profiles, manager_profiles, client_profiles
- crm_clients, crm_tags, crm_client_tags, addresses
- pipelines, pipeline_stages, deals, deal_stage_history, automation_rules
- tasks, task_links, comments, attachments, attachment_links, activities
- products, categories, product_categories, product_images, inventory
- carts, cart_items, orders, order_items, payments, deliveries
- nova_poshta_shipments, webhook_events
- gps_tracks, geofences, visits, route_sessions, visit_photos
- conversations, messages
- notifications, audit_logs

======================================================================
2. API structure
======================================================================

Base URL: /api/v1
All endpoints are versioned, stateless, and validated with DTOs.

Modules:
- AuthModule (JWT, refresh tokens, device sessions)
- UsersModule (RBAC, profiles)
- CRMModule (clients, deals, pipelines, stages, activity)
- KanbanModule (boards, stages, automation rules)
- TasksModule (tasks, assignments, comments, attachments)
- OrdersModule (orders, items, payments, deliveries)
- StoreModule (catalog, cart, checkout, client account)
- NovaPoshtaModule (TTN, pricing, tracking, webhooks)
- GPSModule (tracking, geofences, visits, routes)
- AnalyticsModule (reports, KPIs)
- NotificationsModule (in-app + push)
- FilesModule (S3/MinIO, signed URLs)
- ChatModule (client support)

WebSocket channels (JWT auth on connect):
- notifications:user:{id}
- kanban:pipeline:{id}
- deals:manager:{id}
- orders:client:{id}
- gps:manager:{id}
- chat:conversation:{id}

Events are also emitted through an internal event bus for async jobs and
cross-module triggers.

======================================================================
3. Entity relationships
======================================================================

High-level relationships:
- users 1..1 user_profiles
- users 1..0 manager_profiles
- users 1..0 client_profiles
- crm_clients 0..1 users (lead -> client user)
- crm_clients 1..n deals
- pipelines 1..n pipeline_stages
- pipeline_stages 1..n deals (current stage)
- deals 1..n deal_stage_history
- deals 0..n tasks (via task_links)
- orders 1..n order_items
- orders 1..n payments
- orders 1..1 deliveries
- deliveries 0..1 nova_poshta_shipments
- managers 1..n gps_tracks, visits, route_sessions
- crm_clients 1..n visits and geofences

ASCII relationship sketch:

users --< manager_profiles
users --< client_profiles
users --< crm_clients (optional)
crm_clients --< deals --< deal_stage_history
pipelines --< pipeline_stages --< deals
deals --< task_links >-- tasks
crm_clients --< orders --< order_items
orders --< payments
orders --< deliveries --< nova_poshta_shipments
crm_clients --< geofences
users (manager) --< gps_tracks --< visits

======================================================================
4. Folder structure
======================================================================

Monorepo layout:

/
  backend/
    src/
      app.module.ts
      config/
      common/
        guards/
        filters/
        interceptors/
        decorators/
        dto/
        utils/
      modules/
        auth/
        users/
        crm/
        kanban/
        tasks/
        orders/
        store/
        nova-poshta/
        gps/
        analytics/
        notifications/
        files/
        chat/
      infrastructure/
        database/
        cache/
        queues/
        storage/
      main.ts
    test/
  web/
    src/
      app/
      modules/
        crm/
        kanban/
        orders/
        store/
        analytics/
      components/
      hooks/
      services/
      styles/
  mobile/
    manager_app/
      lib/
        features/
        services/
        models/
    client_app/
      lib/
        features/
        services/
        models/
  infra/
    docker-compose.yml
    nginx/
    migrations/
  docs/
    openapi/

======================================================================
5. Example endpoints
======================================================================

Auth:
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout

CRM:
- GET /api/v1/crm/clients
- POST /api/v1/crm/clients
- GET /api/v1/crm/deals
- POST /api/v1/crm/deals
- PATCH /api/v1/crm/deals/:id/stage

Kanban:
- GET /api/v1/kanban/pipelines
- POST /api/v1/kanban/automation-rules

Tasks:
- GET /api/v1/tasks
- POST /api/v1/tasks
- POST /api/v1/tasks/:id/comments
- POST /api/v1/tasks/:id/attachments

Orders:
- POST /api/v1/orders (create from CRM or checkout)
- GET /api/v1/orders/:id
- PATCH /api/v1/orders/:id/status

Store:
- GET /api/v1/store/products
- GET /api/v1/store/categories
- POST /api/v1/store/cart/items
- POST /api/v1/store/checkout

Nova Poshta:
- POST /api/v1/nova-poshta/ttn
- GET /api/v1/nova-poshta/price
- POST /api/v1/nova-poshta/webhook
- GET /api/v1/nova-poshta/track/:ttn

GPS:
- POST /api/v1/gps/track
- POST /api/v1/gps/visits/:id/confirm
- GET /api/v1/gps/route-history

Analytics:
- GET /api/v1/analytics/sales
- GET /api/v1/analytics/manager-efficiency
- GET /api/v1/analytics/visit-tracking

======================================================================
6. Sample models (NestJS + TypeORM)
======================================================================

User entity (simplified):

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'citext', unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 32, unique: true, nullable: true })
  phone: string | null;

  @Column({ type: 'text' })
  passwordHash: string;

  @Column({ type: 'enum', enum: ['admin', 'manager', 'client', 'logistics'] })
  role: 'admin' | 'manager' | 'client' | 'logistics';

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}

Deal entity (simplified):

@Entity('deals')
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  clientId: string;

  @Column({ type: 'uuid' })
  pipelineId: string;

  @Column({ type: 'uuid' })
  stageId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  valueAmount: string | null;
}

DTO example:

export class CreateDealDto {
  title: string;
  clientId: string;
  pipelineId: string;
  stageId: string;
  valueAmount?: number;
  expectedCloseDate?: string;
  assignedManagerId?: string;
}

Order entity (simplified):

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 32, unique: true })
  orderNumber: string;

  @Column({ type: 'uuid' })
  clientId: string;

  @Column({ type: 'enum', enum: ['draft', 'pending_payment', 'paid', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'] })
  status: string;
}

GPS Track entity (simplified):

@Entity('gps_tracks')
export class GpsTrack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'timestamptz' })
  recordedAt: Date;

  @Column({ type: 'double precision' })
  lat: number;

  @Column({ type: 'double precision' })
  lng: number;
}

======================================================================
7. Authentication flow
======================================================================

1) User logs in with email/phone + password.
2) API validates credentials, checks status and role.
3) Access token (JWT, 15m) and refresh token (30d) are issued.
4) Refresh token hash stored in user_sessions with device metadata.
5) Access token sent via Authorization: Bearer token.
6) WebSocket handshake includes access token; server validates and authorizes.
7) Refresh endpoint rotates refresh tokens and revokes the old token.

RBAC:
- Guard validates role and optional permissions.
- Permission matrix is stored in DB (roles and permissions).
- Admin can override and delegate roles.

======================================================================
8. GPS logic
======================================================================

Tracking flow:
- Manager app runs background tracking with OS location services.
- Record coordinates every X minutes (configurable, default 2-5).
- Each record stores lat, lng, accuracy, speed, device id, and mock flag.
- Geofence logic:
  - Each client has a geofence (circle or polygon).
  - When a point enters the geofence for > N seconds, visit starts.
  - When a point exits for > N seconds, visit ends.
- Anti-fake protection:
  - Reject mocked locations (Android mock flag or iOS simulation).
  - Detect teleport speed or impossible jumps.
  - Device binding via device_sessions.
  - Server-side signature of tracking payload.

Visit confirmation:
- Manager confirms visit start/end with a photo or signature.
- Photos are uploaded as attachments and linked to visit.
- Visit summary includes distance, duration, and last known status.

======================================================================
9. Nova Poshta integration example
======================================================================

Integration flow:
1) Order is created with delivery provider = "nova_poshta".
2) System calls Nova Poshta API to calculate price and available branches.
3) On checkout confirmation, system creates TTN and stores it.
4) Webhook events update shipment status and order status.

Example API call sequence:

POST /api/v1/nova-poshta/price
-> NP API method: "InternetDocument/getDocumentPrice"

POST /api/v1/nova-poshta/ttn
-> NP API method: "InternetDocument/save"

POST /api/v1/nova-poshta/webhook
-> saves webhook_events, updates deliveries and orders

Pseudo service logic:

async createTtn(orderId) {
  const order = await ordersRepo.findOne(orderId);
  const request = mapOrderToNpRequest(order);
  const response = await npClient.call('InternetDocument', 'save', request);
  await shipmentsRepo.save(mapNpResponse(response));
  await deliveriesRepo.updateStatus(order.deliveryId, 'label_created');
}

======================================================================
10. Deployment instructions
======================================================================

Use Docker with environment-based configuration.

Steps:
1) Copy .env.example to .env and set DB, Redis, JWT secrets.
2) Run docker compose up -d
3) Run migrations and seed default pipelines and roles.
4) Access web CRM and admin panel through nginx.

Minimum services:
- api (NestJS)
- postgres (with postgis)
- redis
- web (React CRM)
- storage (MinIO or S3)
- worker (BullMQ queues)

Observability:
- Structured logging (pino or winston)
- Centralized logs (ELK/Loki)
- Tracing (OpenTelemetry)
- Metrics (Prometheus + Grafana)

