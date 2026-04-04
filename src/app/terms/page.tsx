'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ChevronLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
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
          <div className="flex items-center gap-3 mb-8 text-primary">
            <ShieldCheck className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">利用規約</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-12 text-slate-600 font-medium leading-relaxed">
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                第1条（適用）
              </h2>
              <p>
                本利用規約（以下「本規約」といいます。）は、株式会社Lumitas（以下「当社」といいます。）が提供するサービス「CareGrow AI (Lumitas)」（以下「本サービス」といいます。）の利用条件を定めるものです。本サービスを利用する全ての事業所、法人、およびその職員（以下「ユーザー」といいます。）は、本規約に同意したものとみなされます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                第2条（サービスの内容と目的）
              </h2>
              <p>
                本サービスは、AIを活用したインシデント報告の分析、職員の活動記録のテキスト化、人事評価の補助、およびポイント付与システムの提供を目的としています。
              </p>
            </section>

            <section className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
              <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                第3条（AIによる分析結果の性質）
              </h2>
              <p className="text-slate-900 font-bold mb-4">
                ユーザーは、以下の事項を十分に理解し、承諾した上で本サービスを利用するものとします。
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>AIによる分析、提案、評価スコアなどは、人事判断を支援するための「補助的な参考情報」であり、絶対的な正確性や客観性を保証するものではありません。</li>
                <li>最終的な人事決定、職員評価、インシデント対策の策定は、必ず人間の管理者（施設長、人事担当者等）が確認し、自らの責任において行う必要があります。</li>
                <li>AIの判断過程における論理的根拠が常に明確であるとは限らず、特有のバイアスや誤作動の可能性があることを理解するものとします。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                第4条（禁止事項）
              </h2>
              <p>ユーザーは、以下の行為を行ってはなりません。</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>法令または公序良俗に違反する行為。</li>
                <li>本サービスの評価システムを不正に操作し、不当にポイントや評価を獲得する行為。</li>
                <li>本サービスを人事考課以外の不当な目的（ハラスメント、職員の不当な選別等）に利用する行為。</li>
                <li>本システムのネットワークまたはシステムを妨害する行為。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                第5条（データの所有権と利用）
              </h2>
              <p>
                1. ユーザーが本サービスに入力したデータ（以下「入力データ」といいます。）の所有権は、原則として入力したユーザーまたはその所属する法人に帰属します。<br/>
                2. 当社は、サービス品質の向上およびAIの精度向上のため、個人を特定できないよう匿名化した状態で、入力データを分析および利用することができるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                第6条（免責事項）
              </h2>
              <p>
                1. 当社は、本サービスに起因してユーザーに生じたあらゆる損害について、当社の故意または重大な過失による場合を除き、一切の責任を負いません。<br/>
                2. 本サービス、またはAIの分析結果に基づいて行われた人事決定、解雇、昇進、配置転換等により発生した紛争や不利益について、当社は一切関与せず、責任を負わないものとします。
              </p>
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
            © 2026 Lumitas Legal Team. All Rights Reserved.
        </p>
      </footer>
    </div>
  )
}
