'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  CheckCircle2, 
  Printer, 
  ArrowLeft,
  ShieldCheck,
  Mic,
  Gift,
  Users,
  MessageSquare,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ServiceGuidePage() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-primary/20 print:bg-white print:p-0 print:m-0">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            color: #0f172a !important;
          }
          .print-break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>

      {/* Sidebar / Controls (Hidden in print) */}
      <div className="max-w-[210mm] mx-auto mb-8 flex justify-between items-center print:hidden">
        <Link href="/">
          <Button variant="ghost" className="rounded-full font-bold text-slate-500 hover:bg-white transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" />
            トップへ戻る
          </Button>
        </Link>
        <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white font-black rounded-full shadow-lg shadow-primary/20 group">
          <Printer className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
          PDFとして保存 / 印刷
        </Button>
      </div>

      {/* Main Document (A4 size context) */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-slate-200 print:shadow-none print:border-none print:rounded-none min-h-[297mm]">
        
        {/* Page 1: Hero / Cover */}
        <div className="p-16 md:p-24 lg:p-32 bg-slate-900 text-white relative overflow-hidden min-h-[297mm] flex flex-col justify-between print:bg-white print:text-slate-900 print:border-b-[12mm] print:border-primary">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -mr-48 -mt-48 print:hidden" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-20">
              <div className="bg-primary p-4 rounded-2xl text-white print:shadow-none">
                <Sparkles className="w-10 h-10" />
              </div>
              <span className="text-4xl font-black tracking-tighter uppercase print:text-slate-900">Lumitas</span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-7">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] mb-12 print:text-slate-900">
                  介護・医療・福祉の<br/>
                  「頑張り」を、<br/>
                  <span className="text-primary">未来の力へ。</span>
                </h1>
                
                <p className="text-xl md:text-2xl font-bold text-slate-400 max-w-2xl leading-relaxed mb-0 print:text-slate-600">
                  AIが現場の「気づき」と「行動」を可視化。
                  減点方式から加点方式へ、
                  人事評価の常識をアップデートします。
                </p>
              </div>

              <div className="lg:col-span-5 mt-12 lg:mt-0 print:mt-16">
                {/* AI Insight Card */}
                <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 shadow-2xl print:bg-slate-50 print:border-slate-200 print:shadow-none">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-500 rounded-xl text-white">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-black text-white uppercase print:text-slate-900 tracking-widest">AIからの気づき</span>
                  </div>
                  <p className="text-xl font-bold text-slate-300 leading-relaxed italic print:text-slate-500">
                    「改善案の質が高まっています。スタッフ全体の意識向上につながります。」
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 relative z-10 print:bg-slate-50 print:border-slate-200">
             <p className="text-xs font-black uppercase tracking-[0.6em] text-primary mb-4">Official Service Guide</p>
             <p className="text-lg md:text-xl font-bold text-slate-400 print:text-slate-600">
                介護・医療・福祉事業所 職員評価統合管理システム
             </p>
          </div>
        </div>

        {/* Page 2: Problem & Solution */}
        <div className="p-16 md:p-32 bg-white print:break-before-page print:px-[20mm] print:py-[25mm]">
          <div className="max-w-3xl mb-24">
            <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight mb-10">
               なぜ今、<br/>加点方式の評価が必要なのか。
            </h2>
            <p className="text-xl md:text-2xl font-medium text-slate-600 leading-relaxed">
              慢性的な人手不足、多様化するケアの質、そして評価への納得感。
              介護・医療・福祉現場が抱える課題に対し、Lumitasは「記録の負担軽減」と「公平な評価」を同時に実現します。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 print-break-inside-avoid">
             <div className="space-y-12">
                <div className="px-6 py-3 bg-slate-100 text-slate-900 rounded-full w-fit font-black text-xs uppercase tracking-[0.2em] border-2 border-slate-300">
                   【 × 従来の課題 】
                </div>
                <ul className="space-y-8 text-slate-600 font-bold text-xl">
                   <li className="flex items-start gap-5 leading-tight">
                     <span className="text-slate-400 font-bold text-3xl leading-none">×</span>
                     インシデント報告が「反省」で終わってしまう
                   </li>
                   <li className="flex items-start gap-5 leading-tight">
                     <span className="text-slate-400 font-bold text-3xl leading-none">×</span>
                     多忙で「できたこと」を記録する時間がない
                   </li>
                   <li className="flex items-start gap-5 leading-tight">
                     <span className="text-slate-400 font-bold text-3xl leading-none">×</span>
                     評価基準が曖昧で、職員の納得感が低い
                   </li>
                </ul>
             </div>
             <div className="space-y-12">
                <div className="px-6 py-3 bg-primary text-white rounded-full w-fit font-black text-xs uppercase tracking-[0.2em] border-2 border-primary shadow-xl shadow-primary/20 print:shadow-none">
                   【 ○ Lumitasの解決策 】
                </div>
                <ul className="space-y-8 text-slate-900 font-bold text-xl">
                   <li className="flex items-start gap-5 leading-tight">
                     <span className="text-primary font-black text-3xl leading-none">✓</span>
                     AIが改善提案を生成し、学びをポイント化
                   </li>
                   <li className="flex items-start gap-5 leading-tight">
                     <span className="text-primary font-black text-3xl leading-none">✓</span>
                     音声入力とAI要約で記録時間を40%削減
                   </li>
                   <li className="flex items-start gap-5 leading-tight">
                     <span className="text-primary font-black text-3xl leading-none">✓</span>
                     客観的なデータに基づいた加点評価
                   </li>
                </ul>
             </div>
          </div>
        </div>

        {/* Page 3: Key Features Detail */}
        <div className="p-16 md:p-32 bg-slate-50 print:break-before-page print:px-[20mm] print:py-[25mm] border-y border-slate-100 print:bg-white">
          <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Key Innovation</h2>
          <h3 className="text-5xl font-black text-slate-900 tracking-tight leading-tight mb-24">
            現場のポテンシャルを最大化する機能群
          </h3>

          <div className="space-y-24">
             <section className="flex gap-12 group print-break-inside-avoid">
                <div className="p-8 bg-white rounded-[2.5rem] shadow-xl text-primary h-fit border border-slate-100 print:shadow-none print:border-2">
                   <ShieldCheck className="w-12 h-12" />
                </div>
                <div className="max-w-2xl">
                   <h4 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">AIインシデント解析と改善支援</h4>
                   <p className="text-xl text-slate-500 font-bold leading-relaxed">
                      単なるミスの指摘ではなく、AIが「より良いケア」のための改善案を提案。
                      ヒヤリハットを宝に変え、提出した職員にポイントを付与します。
                   </p>
                </div>
             </section>

             <section className="flex gap-12 group print-break-inside-avoid">
                <div className="p-8 bg-white rounded-[2.5rem] shadow-xl text-teal-500 h-fit border border-slate-100 print:shadow-none print:border-2">
                   <Mic className="w-12 h-12" />
                </div>
                <div className="max-w-2xl">
                   <h4 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">ボイス・グロウ（音声成長記録）</h4>
                   <p className="text-xl text-slate-500 font-bold leading-relaxed">
                      「今、良いことがあった」と思ったらその場で音声メモ。
                      AIが公的な人事考課テキストへ自動変換し、記録の質と速度を向上させます。
                   </p>
                </div>
             </section>

             <section className="flex gap-12 group print-break-inside-avoid">
                <div className="p-8 bg-white rounded-[2.5rem] shadow-xl text-amber-500 h-fit border border-slate-100 print:shadow-none print:border-2">
                   <Gift className="w-12 h-12" />
                </div>
                <div className="max-w-2xl">
                   <h4 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">ウェルフェア・ポイントシステム</h4>
                   <p className="text-xl text-slate-500 font-bold leading-relaxed">
                      業務外のボランティア、健康づくり、自己研鑽。
                      あらゆる頑張りをポイント化し、福利厚生やボーナスとして還元します。
                   </p>
                </div>
             </section>
          </div>
        </div>

        {/* Page 4: Expectation & Contact */}
        <div className="p-16 md:p-32 bg-white print:break-before-page print:px-[20mm] print:py-[25mm]">
          <div className="text-center mb-32 print-break-inside-avoid">
             <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-16">
                すべての職員が、<br/>「やってよかった」と思える現場へ。
             </h2>
             <div className="grid grid-cols-3 gap-10">
                <div className="p-12 bg-slate-50 rounded-[3rem] border-2 border-slate-100 shadow-sm print:bg-white">
                   <p className="text-5xl font-black text-primary mb-4">92%</p>
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">定着率向上</p>
                </div>
                <div className="p-12 bg-slate-50 rounded-[3rem] border-2 border-slate-100 shadow-sm print:bg-white">
                   <p className="text-5xl font-black text-emerald-500 mb-4">-40%</p>
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">記録事務削減</p>
                </div>
                <div className="p-12 bg-slate-50 rounded-[3rem] border-2 border-slate-100 shadow-sm print:bg-white">
                   <p className="text-5xl font-black text-amber-500 mb-4">85%</p>
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">納得度向上</p>
                </div>
             </div>
          </div>

          <div className="bg-slate-900 text-white p-20 rounded-[4rem] relative overflow-hidden print-break-inside-avoid print:bg-white print:text-slate-900 print:border-4 print:border-slate-100 print:rounded-[2rem]">
             <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -mr-48 -mt-48 print:hidden" />
             <div className="relative z-10 flex flex-col items-center text-center">
                <Sparkles className="w-20 h-20 text-primary mb-10" />
                <h3 className="text-4xl font-black tracking-tight mb-12 leading-tight print:text-slate-900">導入のお問い合わせ・無料トライアル</h3>
                <div className="space-y-8 font-bold text-slate-400 text-xl print:text-slate-600">
                   <p>Lumitas カスタマーサポートチーム</p>
                   <p className="text-white text-3xl print:text-primary print:font-black">URL: https://lumitas.example.com</p>
                   <p className="text-[12px] uppercase tracking-[0.6em] text-primary pt-12 opacity-50 print:opacity-100 font-black">© 2026 Lumitas. All Rights Reserved.</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
