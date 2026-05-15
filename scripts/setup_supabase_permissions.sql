-- =================================================================================
-- Supabase Security Setup Script (5月30日以降のデフォルト権限変更対応)
-- 
-- 目的:
-- 1. 今後作成されるテーブルに対するデフォルトのGRANT（権限付与）設定
-- 2. 既存の全テーブルに対するGRANT設定
-- 3. 全テーブルのRLS（Row Level Security）有効化
-- =================================================================================

-- ---------------------------------------------------------------------------------
-- 1. 今後作成されるテーブルに対するデフォルト権限の付与
-- （これ以降にPrismaでテーブルを作成した場合、自動的にこの権限が適用されます）
-- ---------------------------------------------------------------------------------
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO service_role;

-- ---------------------------------------------------------------------------------
-- 2. 既存の全テーブルに対する権限の付与
-- ---------------------------------------------------------------------------------
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ---------------------------------------------------------------------------------
-- 3. 全既存テーブルへのRLS有効化と基本ポリシーの適用（一括処理）
-- ---------------------------------------------------------------------------------
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        -- RLSの有効化
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);

        -- ※注意: Supabaseの `service_role` はデフォルトで `BYPASSRLS` を持つためポリシー不要ですが、
        -- 明示的にアクセスを保証したい場合のために記載しています。
        -- EXECUTE format('DROP POLICY IF EXISTS "service_role_all" ON public.%I;', r.tablename);
        -- EXECUTE format('CREATE POLICY "service_role_all" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true);', r.tablename);

        -- ====================================================================
        -- ⚠️ Yuna (Security) からの警告:
        -- 現在、全テーブルにRLSを有効化しました。クライアント（ブラウザ）の
        -- supabase-js からアクセスするには、テーブルごとに詳細なポリシー
        -- (例: user_id = auth.uid()) を設定する必要があります。
        -- バックエンド（Prisma / service_role）からのアクセスは影響を受けません。
        -- ====================================================================
    END LOOP;
END $$;
