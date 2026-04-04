'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ChevronLeft, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary/20 selection:text-primary">
      {/* Simple Header */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">Lumitas</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-full font-bold text-slate-500">
                <ChevronLeft className="w-4 h-4 mr-1" />
                トップへ戻る
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-16"
        >
          <div className="flex items-center gap-3 mb-8 text-emerald-500">
            <Lock className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">プライバシーポリシー</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-12 text-slate-600 font-medium leading-relaxed">
            <p className="border-l-4 border-emerald-500 pl-6 text-lg font-bold text-slate-900 leading-relaxed italic">
              「CareGrow AI (Lumitas)」では、職員の皆様のプライバシーならびに個人情報の重要性を認識し、安全かつ透明性の高いデータ管理を徹底しております。
            </p>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                第1条（収集する情報の種類）
              </h2>
              <p>本サービスにおいて、当社は以下の情報を収集する場合があります。</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>ユーザー情報（氏名、役職、部署、連絡先等）</li>
                <li>活動記録（音声入力によるメモ、インシデント報告、研修記録等）</li>
                <li>評価データ（AI分析スコア、管理者からのフィードバック等）</li>
                <li>利用ログ（アクセス日時、利用機能の履歴等）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                第2条（利用目的）
              </h2>
              <p>収集した情報は、以下の目的で利用されます。</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>公正な人事評価およびポイント付与の支援。</li>
                <li>AIによる業務分析およびリスク予測の精度向上。</li>
                <li>本サービスに関するお問い合わせ対応。</li>
                <li>不具合の調査およびシステムの保守管理。</li>
              </ul>
            </section>

            <section className="bg-slate-900 text-slate-100 p-8 rounded-[2.5rem] shadow-2xl">
              <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                第3条（AIによるデータ処理）
              </h2>
              <p className="mb-4 text-slate-300">
                本サービスでは、LLM（大規模言語モデル）を活用してテキストの要約やインシデント判定を行います。
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm font-bold text-slate-400">
                <li>AI処理のために入力されたデータは、匿名または適切な識別子のみを使用し、個人が特定される形での外部共有は行いません。</li>
                <li>入力されたデータそのものがAIの学習データとして一般公開されることはありません。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                第4条（第三者提供の制限）
              </h2>
              <p>
                当社は、法令に基づく場合、または緊急時の人命保護等の場合を除き、ユーザーの同意を得ることなく第三者に個人情報を開示することはありません。ただし、導入事業所（雇用主である法人等）には、サービスの性質上、所定の範囲内で活動データが開示されます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                第5条（安全管理およびセキュリティ）
              </h2>
              <p>
                当社は、収集したデータの改ざん、紛失、漏洩を防ぐため、最新の暗号化技術および厳重なアクセス管理、監視体制を構築しております。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                第6条（お問い合わせ窓口）
              </h2>
              <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm italic text-slate-500">
                本ポリシーに関するご質問、または個人情報の開示・訂正をご希望の場合は、以下の窓口までご連絡ください。<br/><br/>
                名称：CareGrow AI (Lumitas) カスタマー・プライバシー・チーム<br/>
                Email：privacy@example.com (ダミー)
              </div>
            </section>

            <section className="pt-8 border-t border-slate-100">
              <p className="text-sm font-bold text-slate-400">
                2026年4月4日 制定
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <footer className="py-12 bg-white border-t border-slate-100 text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            © 2026 Lumitas Security Team. All Rights Reserved.
        </p>
      </footer>
    </div>
  )
}
