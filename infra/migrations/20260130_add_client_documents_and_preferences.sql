-- Client cabinet tables

CREATE TABLE IF NOT EXISTS client_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES crm_clients(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  document_type varchar(64),
  attachment_id uuid NOT NULL REFERENCES attachments(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_documents_client ON client_documents(client_id);

CREATE TABLE IF NOT EXISTS client_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL UNIQUE REFERENCES crm_clients(id) ON DELETE CASCADE,
  email_enabled boolean NOT NULL DEFAULT true,
  sms_enabled boolean NOT NULL DEFAULT false,
  push_enabled boolean NOT NULL DEFAULT true,
  in_app_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
