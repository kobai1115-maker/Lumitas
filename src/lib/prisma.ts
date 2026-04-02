import edgeClient from './prisma.edge'

/**
 * 実行環境に応じて Prisma クライアントを切り替えます。
 * 静的インポートを排除し、ビルドツールの「深追い」を完全に遮断します。
 */
const prisma = process.env.NEXT_RUNTIME === 'edge' 
  ? edgeClient 
  : (typeof window === 'undefined' ? require('./prisma.node').default : edgeClient)

export default prisma
