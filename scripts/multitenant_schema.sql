-- ==========================================
-- マルチテナントSaaS - コア機能 実装コード案（無限ループ回避版）
-- ==========================================

-- 1. テーブル作成
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_tenants (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'employee',
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, tenant_id)
);

-- 2. 補助関数の作成（無限ループ回避用）
CREATE OR REPLACE FUNCTION get_my_tenant_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_system_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND staff_id = '0xx0001'
  );
$$;

-- 3. RLS (Row Level Security) の有効化
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tenants ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーがあれば一旦削除（再帰的実行のための安全策）
DROP POLICY IF EXISTS "Tenants - Select" ON tenants;
DROP POLICY IF EXISTS "SystemAdmin - All Access" ON tenants;
DROP POLICY IF EXISTS "Users - Select" ON users;
DROP POLICY IF EXISTS "SystemAdmin - All Access" ON users;
DROP POLICY IF EXISTS "UserTenants - Select" ON user_tenants;
DROP POLICY IF EXISTS "SystemAdmin - All Access" ON user_tenants;

-- 【Tenants】の参照権限
CREATE POLICY "Tenants - Select" ON tenants FOR SELECT
USING (
  is_system_admin() OR 
  id IN (SELECT get_my_tenant_ids())
);

-- 【Users】の参照権限
CREATE POLICY "Users - Select" ON users FOR SELECT
USING (
  is_system_admin() OR 
  id = auth.uid() OR 
  id IN (
    SELECT user_id FROM user_tenants
    WHERE tenant_id IN (SELECT get_my_tenant_ids())
  )
);

-- 【User_Tenants】の参照権限
CREATE POLICY "UserTenants - Select" ON user_tenants FOR SELECT
USING (
  is_system_admin() OR 
  tenant_id IN (SELECT get_my_tenant_ids())
);

-- 【システム管理者用フルアクセス】
CREATE POLICY "SystemAdmin - All Access" ON tenants FOR ALL USING (is_system_admin());
CREATE POLICY "SystemAdmin - All Access" ON users FOR ALL USING (is_system_admin());
CREATE POLICY "SystemAdmin - All Access" ON user_tenants FOR ALL USING (is_system_admin());
