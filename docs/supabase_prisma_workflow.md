# 🛡️ Prisma × Supabase 開発・運用ガイドライン (セキュリティ対応版)

## 背景
Supabaseの仕様変更により、**2026年5月30日以降に作成された新規プロジェクトの「public」スキーマのテーブルは、デフォルトでData API（supabase-js / PostgREST / GraphQL）に公開されなくなりました。**
このため、Prismaの `prisma migrate dev` で新しくテーブルを作成しただけでは、クライアントやAPIからの `supabase-js` を用いたアクセスが **権限エラー（Unauthorized）** で弾かれてしまいます。

本ガイドラインは、この仕様変更に対応しつつ、引き続きPrismaとSupabaseを安全かつ効率的に運用するためのフローを定めたものです。

---

## 開発フロー: 新規テーブルの追加・マイグレーション

今後、Prismaスキーマ（`schema.prisma`）に新しいモデル（テーブル）を追加した場合は、以下の手順に従ってマイグレーションを実施してください。

### Step 1: Prismaスキーマの変更
通常通り、`schema.prisma` に新しいモデルを定義します。

### Step 2: マイグレーションファイルの生成（適用はしない）
直接データベースに適用するのではなく、`--create-only` フラグを使ってマイグレーションSQLファイルだけを生成します。

```bash
npx prisma migrate dev --name add_new_table --create-only
```

### Step 3: 権限付与（GRANT）SQLの追記
生成された `prisma/migrations/XXXXXXXXXXXXXX_add_new_table/migration.sql` ファイルを開き、**ファイルの末尾に以下のSQLを追記**してください。

> 💡 **Tip:** 既存の `scripts/setup_supabase_permissions.sql` で `ALTER DEFAULT PRIVILEGES` を適用済みの環境では、一部のGRANTは自動適用されますが、明示的な追記を推奨します。

```sql
-- 対象テーブル名に合わせて 'YourNewTable' を変更してください

-- 1. Data API用の権限付与 (GRANT)
GRANT SELECT ON public."YourNewTable" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."YourNewTable" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."YourNewTable" TO service_role;

-- 2. RLS（Row Level Security）の有効化
ALTER TABLE public."YourNewTable" ENABLE ROW LEVEL SECURITY;

-- 3. (必要に応じて) RLSポリシーの追加
-- 例: 自分のデータのみ操作可能にする
-- CREATE POLICY "Users can manage their own data" ON public."YourNewTable"
-- FOR ALL TO authenticated
-- USING (auth.uid() = user_id)
-- WITH CHECK (auth.uid() = user_id);
```

### Step 4: マイグレーションの適用
追記が完了したら、通常通りマイグレーションを実行してデータベースに適用します。

```bash
npx prisma migrate dev
```

---

## 既存のテーブルに対する初期セットアップ
このガイドライン導入以前に作成されたテーブルに対して一括で権限設定やRLS有効化を行う場合や、別環境を構築する場合は、以下のスクリプトを実行してください。

```bash
# （Supabase SQL Editor上で実行、またはpsql等から実行）
# スクリプトパス: scripts/setup_supabase_permissions.sql
```

## 注意点 (Yunaからの警告 ⚠️)
- Prisma Client (`lib/prisma.ts`) 経由のアクセスは `postgres` （または `service_role` 相当の強力なロール）による直接接続のため、RLSの影響を受けません。
- しかし、Next.jsのクライアントコンポーネント等から `supabase-js` を利用して直接データを操作する場合は、各テーブルに対して**適切なRLSポリシー**を定義しないとアクセスが拒否されます。
- クライアントからの操作が前提となるテーブルを作成する場合は、**必ずStep 3の段階で厳格なRLSポリシーを一緒に定義**してください。
