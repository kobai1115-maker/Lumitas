import edgeClient from './prisma.edge'
import nodeClient from './prisma.node'

/**
 * 実行環境 (Edge / Node.js) に応じて最適な Prisma クライアントを切り替えます。
 * これにより、Cloudflare のビルドプロセスが Node.js 専用の依存関係 (pg 等) に
 * 接触することを物理的に防止します。
 */
const prisma = process.env.NEXT_RUNTIME === 'edge' ? edgeClient : nodeClient

export default prisma
