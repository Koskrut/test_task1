-- PostgreSQL schema for the business system

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'client', 'logistics');
CREATE TYPE user_status AS ENUM ('active', 'blocked', 'pending');
CREATE TYPE crm_client_status AS ENUM ('lead', 'active', 'inactive', 'archived');
CREATE TYPE crm_client_type AS ENUM ('person', 'company');
CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'blocked', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE order_status AS ENUM (
  'draft', 'pending_payment', 'paid', 'processing', 'packed',
  'shipped', 'delivered', 'cancelled', 'returned'
);
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded', 'partial');
CREATE TYPE delivery_status AS ENUM ('pending', 'label_created', 'in_transit', 'delivered', 'failed', 'returned');
CREATE TYPE visit_status AS ENUM ('planned', 'started', 'completed', 'skipped');
CREATE TYPE gps_source AS ENUM ('background', 'manual', 'visit_start', 'visit_end');
CREATE TYPE notification_type AS ENUM ('system', 'task', 'deal', 'order', 'delivery', 'message');
CREATE TYPE notification_channel AS ENUM ('in_app', 'push', 'email', 'sms');
CREATE TYPE automation_trigger AS ENUM ('stage_changed');
CREATE TYPE automation_action AS ENUM ('create_task', 'send_notification', 'create_order');

-- Users and profiles
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext UNIQUE,
  phone varchar(32) UNIQUE,
  password_hash text NOT NULL,
  role user_role NOT NULL,
  status user_status NOT NULL DEFAULT 'active',
  is_email_verified boolean NOT NULL DEFAULT false,
  is_phone_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  first_name varchar(80),
  last_name varchar(80),
  avatar_url text,
  locale varchar(16),
  timezone varchar(64)
);

CREATE TABLE IF NOT EXISTS manager_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  employee_code varchar(64),
  department varchar(80),
  position varchar(80),
  hired_at date
);

CREATE TABLE IF NOT EXISTS client_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name varchar(255),
  tax_id varchar(64),
  notes text,
  preferred_contact_channel varchar(32)
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash text NOT NULL,
  device_id varchar(128),
  ip_address inet,
  user_agent text,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS device_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id varchar(128) NOT NULL,
  platform varchar(32),
  app_version varchar(32),
  push_token text,
  is_trusted boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, device_id)
);

-- CRM clients
CREATE TABLE IF NOT EXISTS crm_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  status crm_client_status NOT NULL DEFAULT 'lead',
  type crm_client_type NOT NULL DEFAULT 'person',
  name varchar(255) NOT NULL,
  company_name varchar(255),
  email varchar(255),
  phone varchar(32),
  source varchar(64),
  assigned_manager_id uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS crm_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(64) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS crm_client_tags (
  client_id uuid NOT NULL REFERENCES crm_clients(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES crm_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (client_id, tag_id)
);

CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_client_id uuid REFERENCES crm_clients(id) ON DELETE CASCADE,
  label varchar(64),
  country varchar(2) NOT NULL DEFAULT 'UA',
  region varchar(128),
  city varchar(128),
  street varchar(255),
  house varchar(32),
  apartment varchar(32),
  postal_code varchar(16),
  lat double precision,
  lng double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Pipelines and deals
CREATE TABLE IF NOT EXISTS pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  name varchar(120) NOT NULL,
  position int NOT NULL,
  wip_limit int,
  color varchar(16),
  is_won_stage boolean NOT NULL DEFAULT false,
  is_lost_stage boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES crm_clients(id),
  pipeline_id uuid NOT NULL REFERENCES pipelines(id),
  stage_id uuid NOT NULL REFERENCES pipeline_stages(id),
  title varchar(255) NOT NULL,
  description text,
  value_amount numeric(12, 2),
  currency varchar(3) NOT NULL DEFAULT 'UAH',
  probability int,
  expected_close_date date,
  assigned_manager_id uuid REFERENCES users(id),
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS deal_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  from_stage_id uuid REFERENCES pipeline_stages(id),
  to_stage_id uuid NOT NULL REFERENCES pipeline_stages(id),
  changed_by uuid REFERENCES users(id),
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  stage_id uuid NOT NULL REFERENCES pipeline_stages(id) ON DELETE CASCADE,
  trigger_type automation_trigger NOT NULL,
  action_type automation_action NOT NULL,
  action_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tasks, comments, attachments
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  description text,
  status task_status NOT NULL DEFAULT 'open',
  priority task_priority NOT NULL DEFAULT 'normal',
  due_at timestamptz,
  created_by uuid REFERENCES users(id),
  assigned_to uuid REFERENCES users(id),
  client_id uuid REFERENCES crm_clients(id),
  deal_id uuid REFERENCES deals(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS task_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  entity_type varchar(64) NOT NULL,
  entity_id uuid NOT NULL
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES users(id),
  entity_type varchar(64) NOT NULL,
  entity_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name varchar(255) NOT NULL,
  mime_type varchar(128),
  size_bytes bigint,
  storage_provider varchar(32) NOT NULL DEFAULT 'minio',
  storage_key text NOT NULL,
  checksum_sha256 varchar(64),
  uploaded_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attachment_links (
  attachment_id uuid NOT NULL REFERENCES attachments(id) ON DELETE CASCADE,
  entity_type varchar(64) NOT NULL,
  entity_id uuid NOT NULL,
  PRIMARY KEY (attachment_id, entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES users(id),
  entity_type varchar(64) NOT NULL,
  entity_id uuid NOT NULL,
  action varchar(64) NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  channel notification_channel NOT NULL DEFAULT 'in_app',
  title varchar(255),
  body text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Store and products
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  parent_id uuid REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku varchar(64) UNIQUE NOT NULL,
  name varchar(255) NOT NULL,
  description text,
  price_amount numeric(12, 2) NOT NULL,
  currency varchar(3) NOT NULL DEFAULT 'UAH',
  status varchar(32) NOT NULL DEFAULT 'active',
  weight_kg numeric(8, 3),
  length_cm numeric(8, 2),
  width_cm numeric(8, 2),
  height_cm numeric(8, 2),
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_categories (
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  position int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  address_id uuid REFERENCES addresses(id)
);

CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id uuid NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  qty_on_hand int NOT NULL DEFAULT 0,
  qty_reserved int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, warehouse_id)
);

-- Cart and orders
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES crm_clients(id),
  status varchar(32) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  qty int NOT NULL,
  price_amount numeric(12, 2) NOT NULL,
  currency varchar(3) NOT NULL DEFAULT 'UAH'
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number varchar(32) UNIQUE NOT NULL,
  client_id uuid NOT NULL REFERENCES crm_clients(id),
  source varchar(32) NOT NULL DEFAULT 'store',
  status order_status NOT NULL DEFAULT 'draft',
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  total_amount numeric(12, 2) NOT NULL DEFAULT 0,
  currency varchar(3) NOT NULL DEFAULT 'UAH',
  created_from_deal_id uuid REFERENCES deals(id),
  manager_id uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  qty int NOT NULL,
  price_amount numeric(12, 2) NOT NULL,
  total_amount numeric(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider varchar(64) NOT NULL,
  amount numeric(12, 2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'unpaid',
  transaction_id varchar(128),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  provider varchar(64) NOT NULL DEFAULT 'nova_poshta',
  status delivery_status NOT NULL DEFAULT 'pending',
  address_id uuid REFERENCES addresses(id),
  shipping_cost numeric(12, 2) NOT NULL DEFAULT 0,
  ttn varchar(64),
  provider_ref varchar(128),
  estimated_delivery_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS delivery_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  status delivery_status NOT NULL,
  raw_status varchar(128),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nova_poshta_shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  np_ref varchar(128),
  ttn varchar(64),
  status varchar(64),
  cost_amount numeric(12, 2),
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider varchar(64) NOT NULL,
  event_type varchar(64) NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at timestamptz,
  status varchar(32) NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- GPS and visits
CREATE TABLE IF NOT EXISTS route_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id uuid NOT NULL REFERENCES users(id),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

CREATE TABLE IF NOT EXISTS gps_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  route_session_id uuid REFERENCES route_sessions(id),
  recorded_at timestamptz NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  accuracy_m double precision,
  speed_kmh double precision,
  heading double precision,
  source gps_source NOT NULL DEFAULT 'background',
  is_mocked boolean NOT NULL DEFAULT false,
  device_id varchar(128)
);

CREATE TABLE IF NOT EXISTS geofences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES crm_clients(id) ON DELETE CASCADE,
  name varchar(120) NOT NULL,
  center_lat double precision,
  center_lng double precision,
  radius_m double precision,
  geom geometry(Polygon, 4326),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id uuid NOT NULL REFERENCES users(id),
  client_id uuid NOT NULL REFERENCES crm_clients(id),
  planned_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  status visit_status NOT NULL DEFAULT 'planned',
  start_gps_id uuid REFERENCES gps_tracks(id),
  end_gps_id uuid REFERENCES gps_tracks(id),
  distance_m double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS visit_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  attachment_id uuid NOT NULL REFERENCES attachments(id) ON DELETE CASCADE
);

-- Client support chat
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES crm_clients(id),
  manager_id uuid REFERENCES users(id),
  status varchar(32) NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id),
  body text,
  attachment_id uuid REFERENCES attachments(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES users(id),
  action varchar(64) NOT NULL,
  entity_type varchar(64),
  entity_id uuid,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_crm_clients_status ON crm_clients(status);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status_due ON tasks(status, due_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_gps_tracks_user_time ON gps_tracks(user_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_visits_manager_time ON visits(manager_id, planned_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read_at);
