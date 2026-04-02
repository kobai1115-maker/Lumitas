# Vercelデプロイ計画 (CareGrow AI / Lumitas)

CareGrow AI（Lumitas）をCloudflare PagesからVercelへ移行・デプロイするための準備が整いました。

## 実施した変更
1. **`package.json`の更新**:
   - `build`スクリプトを `prisma generate && next build` に変更しました。これにより Vercel でのビルド時に Prisma Client が自動生成されます。
2. **`next.config.ts`のクリーンアップ**:
   - Cloudflare Pages用のWebpackエイリアスを削除しました。Vercel（標準ランタイム）ではこれらは不要です。

## Vercelでのデプロイ手順

### 1. Vercelプロジェクトの作成
ターミナルで以下のコマンドを実行してください。

```bash
npx vercel
```

- **Set up and deploy?** [Y/n] → `y`
- **Which scope?** → あなたのアカウントを選択
- **Link to existing project?** [y/N] → `n`
- **Project name?** → `care-grow-ai`（任意）
- **In which directory is your code located?** → `./`
- **Want to modify these settings?** [y/N] → `n` (Next.jsが自動適用されます)

### 2. 環境変数の設定
Vercel Dashboard のプロジェクト詳細ページ（Settings > Environment Variables）で以下の4つの変数を追加してください。

| 名前 | 値 |
| :--- | :--- |
| DATABASE_URL | `postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/postgres?pgbouncer=true` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[PROJECT_REF].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `[YOUR_ANON_KEY]` |
| `SUPABASE_SERVICE_ROLE_KEY` | `[YOUR_SERVICE_ROLE_KEY]` |

### 3. デプロイの確定
環境変数設定後、再度以下のコマンドで本番ビルドを完了させます。

```bash
npx vercel --prod
```
