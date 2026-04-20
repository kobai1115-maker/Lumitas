-- 【Position】テーブル向けポリシー
-- 事前に enable-rls.js で RLS を有効にしてから実行してください

DROP POLICY IF EXISTS "Position - Select" ON "public"."Position";
DROP POLICY IF EXISTS "SystemAdmin - All Access" ON "public"."Position";
DROP POLICY IF EXISTS "SystemAdmin - All Access Position" ON "public"."Position";

-- 【Position】の参照権限
CREATE POLICY "Position - Select" ON "public"."Position" FOR SELECT
USING (
  is_system_admin() OR 
  "corporationId" IN (
    SELECT "corporationId" FROM "public"."User"
    WHERE id = auth.uid()::text
  )
);

-- 【システム管理者用フルアクセス】
CREATE POLICY "SystemAdmin - All Access Position" ON "public"."Position" FOR ALL USING (is_system_admin());
