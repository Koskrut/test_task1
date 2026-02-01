-- Seed default admin, manager, client users

WITH admin_user AS (
  INSERT INTO users (
    email,
    password_hash,
    role,
    status,
    is_email_verified,
    created_at,
    updated_at
  ) VALUES (
    'admin@crm.local',
    '$2b$12$NveRCUFRGXMmXEFYhnBlPuqLLI5ILzWeB8mzw4IpaCgjrDHXbTH0q',
    'admin',
    'active',
    true,
    now(),
    now()
  )
  ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    is_email_verified = EXCLUDED.is_email_verified,
    updated_at = now()
  RETURNING id
),
manager_user AS (
  INSERT INTO users (
    email,
    password_hash,
    role,
    status,
    is_email_verified,
    created_at,
    updated_at
  ) VALUES (
    'manager@crm.local',
    '$2b$12$tmXoYXHwfcFoPum5gusGRO7ccceCA9JhQxIsIn2KGl.uxOuUhjYW2',
    'manager',
    'active',
    true,
    now(),
    now()
  )
  ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    is_email_verified = EXCLUDED.is_email_verified,
    updated_at = now()
  RETURNING id
),
client_user AS (
  INSERT INTO users (
    email,
    password_hash,
    role,
    status,
    is_email_verified,
    created_at,
    updated_at
  ) VALUES (
    'client@crm.local',
    '$2b$12$/OY7Vty5qIi5FGtWrs1ftOpwUXgOiLL4jCg1B.y5ha8DVWH8NU5xi',
    'client',
    'active',
    true,
    now(),
    now()
  )
  ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    is_email_verified = EXCLUDED.is_email_verified,
    updated_at = now()
  RETURNING id
)
INSERT INTO crm_clients (
  user_id,
  status,
  type,
  name,
  email,
  phone,
  assigned_manager_id,
  created_at,
  updated_at
)
SELECT
  client_user.id,
  'active',
  'person',
  'Client Test',
  'client@crm.local',
  '+380000000001',
  manager_user.id,
  now(),
  now()
FROM client_user, manager_user
WHERE NOT EXISTS (
  SELECT 1 FROM crm_clients WHERE user_id = client_user.id
);
