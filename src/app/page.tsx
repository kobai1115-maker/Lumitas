'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Zap, 
  Heart, 
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Mic,
  Gift
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { clsx } from 'clsx'

const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
}

const fadeInView = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, ease: "easeOut" }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Lumitas</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">機能</a>
              <a href="#benefits" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">メリット</a>
              <Link href="/login">
                <Button className="rounded-2xl font-black bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all hover:scale-[1.05] active:scale-95">
                  ログイン
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-primary/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="initial"
              animate="animate"
              variants={stagger}
              className="text-left"
            >
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/5 border border-slate-900/10 mb-6 group cursor-default">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500 group-hover:animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">AIによる次世代型 介護・医療・福祉マネジメント</span>
              </motion.div>
              
              <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] mb-8">
                介護・医療・福祉の「頑張り」を、<br/>
                <span className="text-primary relative inline-block">
                  AIと共に
                  <svg className="absolute -bottom-2 left-0 w-full h-2 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                  </svg>
                </span>未来の力へ。
              </motion.h1>
              
              <motion.p variants={fadeIn} className="text-lg font-bold text-slate-500 max-w-lg mb-10 leading-relaxed">
                Lumitas（ルミタス）は、忙しい介護・医療・福祉現場での「気づき」や「成長」をAIで可視化。減点方式ではない、加点方式の人事考課を実現します。
              </motion.p>
              
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button className="h-16 px-10 rounded-[2rem] text-lg font-black bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/30 group">
                    無料で体験する
                    <ChevronRight className="w-6 h-6 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/docs/service-guide">
                  <Button variant="ghost" className="h-16 px-10 rounded-[2rem] text-lg font-black text-slate-600 hover:bg-slate-100">
                    資料をダウンロード
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative lg:mt-0 mt-12"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/50 blur-[100px] rounded-full -z-10" />
              <div className="relative">
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.12)] border border-white/20 bg-white z-10">
                  <Image 
                    src="/assets/hero_visual.png" 
                    alt="CareGrow AI Concept Visual" 
                    width={1200} 
                    height={900}
                    className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                    priority
                  />
                </div>
                
                {/* Floating Card: AI Insight */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute bottom-6 left-6 right-6 lg:bottom-10 lg:-left-12 lg:right-auto bg-white/95 backdrop-blur-md p-5 lg:p-6 rounded-3xl shadow-2xl border border-white/20 max-w-none lg:max-w-[320px] z-20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                      <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5" />
                    </div>
                    <span className="text-[10px] lg:text-xs font-black text-slate-900 uppercase">AIによる気づき</span>
                  </div>
                  <p className="text-xs lg:text-sm font-bold text-slate-600 leading-relaxed italic" style={{ fontFamily: '"Meiryo", sans-serif' }}>
                    「スタッフの表情が明るくなり、利用者様への声かけの質が目に見えて向上しています。AIによる加点評価が自信に繋がっているようです。」
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 lg:py-40 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 text-center">Core Features</h2>
            <p className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-6 text-center">
              現場の「感情」と「行動」をAIが繋ぐ、<br/>
              新しい評価体験。
            </p>
            <p className="text-slate-500 font-bold text-center">
              単なる記録ツールではありません。AIがスタッフ一人ひとりの頑張りを理解し、応援します。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="AIインシデント判定"
              description="ヒヤリハット報告をAIが解析。リスクの評価だけでなく、前向きな改善提案をAIがフィードバックし、ポイントを付与します。"
              color="blue"
            />
            <FeatureCard 
              icon={<Mic className="w-6 h-6" />}
              title="音声メモでの成長記録"
              description="忙しい業務の合間に、音声で「できたこと」を記録。AIが人事考課に最適な客観的テキストへ自動的に変換します。"
              color="teal"
            />
            <FeatureCard 
              icon={<Gift className="w-6 h-6" />}
              title="福利厚生ポイント"
              description="研修への参加、健康活動、趣味の充実。仕事以外の頑張りも見える化し、福利厚生ポイントとして職員に還元します。"
              color="amber"
            />
          </div>
        </div>
      </section>

      {/* Activity Showcase Section (New) */}
      <section className="py-20 lg:py-40 bg-white border-t border-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Daily Plus Activities</h2>
              <p className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                日常のあらゆる瞬間が、<br/>
                キャリアへのプラスに。
              </p>
            </div>
            <p className="text-slate-500 font-bold max-w-sm">
              記録に残りにくい「目に見えない貢献」を可視化。会話、助け合い、地域活動。Lumitasは全ての「良い行い」を評価します。
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <ActivityCard 
              image="/assets/lp_1on1.png"
              title="成長を分かち合う1on1面談"
              description="スタッフの『やりたい』や『できた』に徹底して耳を傾けます。AIが対話の本質を汲み取り、客観的な成長の記録として蓄積。納得感のあるキャリア形成を支えます。"
              delay={0}
            />
            <ActivityCard 
              image="/assets/lp_support.png"
              title="チームを活気づける助け合い"
              description="忙しい時間帯のフォローや、感謝の言葉。これまで『見えなかった貢献』をAIが可視化。チームワークを支える行動が、しっかり評価と報酬に繋がります。"
              delay={0.2}
            />
            <ActivityCard 
              image="/assets/lp_volunteer.png"
              title="地域に愛される活動"
              description="施設内にとどまらない、地域清掃や交流イベント。社会福祉法人としての価値を高めるボランティア活動も、Lumitasなら確かな貢献実績としてカウントします。"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 lg:py-40 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  なぜLumitasが選ばれるのか。
                </h2>
                <p className="text-lg font-bold text-slate-500">
                  公平で納得感のある評価は、職員の定着率を劇的に向上させます。
                </p>
              </div>

              <div className="space-y-8">
                <BenefitItem 
                  title="「できなかった」ではなく「できた」に注目"
                  description="日々の小さな成長を見逃さない加点方式。自己肯定感を高めます。"
                />
                <BenefitItem 
                  title="記録業務を劇的にスピードアップ"
                  description="AIとの対話形式で、時間がかかる考課用文章の作成を自動化。"
                />
                <BenefitItem 
                  title="透明性の高いフィードバックサイクル"
                  description="AIによる客観的な評価指標により、納得感のある1on1を実現。"
                />
              </div>
            </div>

            <div className="relative">
              <div className="bg-primary/5 rounded-[3rem] p-12 border border-primary/10">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-8 rounded-3xl shadow-xl transition-all hover:-translate-y-2">
                      <p className="text-4xl font-black text-primary mb-2">92%</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">定着率の向上</p>
                   </div>
                   <div className="bg-white p-8 rounded-3xl shadow-xl mt-8 transition-all hover:-translate-y-2">
                      <p className="text-4xl font-black text-emerald-500 mb-2">-40%</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">記録事務時間の削減</p>
                   </div>
                   <div className="bg-white p-8 rounded-3xl shadow-xl -mt-4 transition-all hover:-translate-y-2">
                      <p className="text-4xl font-black text-amber-500 mb-2">+150</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">月間改善提案数</p>
                   </div>
                   <div className="bg-white p-8 rounded-3xl shadow-xl mt-4 transition-all hover:-translate-y-2">
                      <p className="text-4xl font-black text-indigo-500 mb-2">85%</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">評価への納得度向上</p>
                   </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-40 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter mb-10 leading-tight">
              すべての介護・医療・福祉現場で働く職員が、<br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-500">
                正当に報われる明日へ。
              </span>
            </h2>
            <Link href="/login">
                <Button className="h-20 px-16 rounded-[2.5rem] text-xl font-black bg-slate-900 text-white hover:bg-slate-800 shadow-[0_30px_60px_rgba(0,0,0,0.2)] transition-all hover:scale-[1.03] active:scale-95 group">
                  今すぐ Lumitas をはじめる
                  <ArrowRight className="w-7 h-7 ml-3 group-hover:translate-x-2 transition-transform" />
                </Button>
            </Link>
            <p className="mt-8 text-sm font-bold text-slate-400">
                初期導入費用無料・14日間のフリートライアル実施中
            </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-50 pb-12 mb-12">
            <div className="grid md:grid-cols-4 gap-12">
                <div className="space-y-4 text-left">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <span className="text-lg font-black tracking-tight text-slate-900 uppercase">Lumitas</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">介護・医療・福祉事業所職員評価統合管理システム</p>
                </div>
                <div className="text-left">
                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6">Service</h4>
                    <ul className="space-y-4 text-sm font-bold text-slate-500">
                       <li><Link href="/terms" className="hover:text-primary transition-colors">利用規約</Link></li>
                       <li><Link href="/privacy" className="hover:text-primary transition-colors">プライバシーポリシー</Link></li>
                    </ul>
                </div>
                <div className="text-left">
                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6">Company</h4>
                   <ul className="space-y-4 text-sm font-bold text-slate-500">
                      <li><a href="#" className="hover:text-primary transition-colors">運営会社</a></li>
                      <li><a href="#" className="hover:text-primary transition-colors">お問い合わせ</a></li>
                   </ul>
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
            © 2026 AXLINK. All Rights Reserved.
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: 'blue' | 'teal' | 'amber' }) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    teal: "bg-teal-50 text-teal-600 ring-teal-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100"
  }
  
  return (
    <motion.div 
      variants={fadeInView}
      whileHover={{ y: -8 }}
      className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 group"
    >
      <div className={clsx("p-4 rounded-2xl w-fit mb-8 ring-8 transition-all group-hover:scale-110", colorStyles[color])}>
        {icon}
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
      <p className="text-sm font-bold text-slate-500 leading-relaxed mb-6">
        {description}
      </p>
      <div className="pt-4 border-t border-slate-100/50">
        <span className="text-[10px] font-black tracking-widest text-primary uppercase flex items-center gap-1 group-hover:gap-2 transition-all">
          Learn More <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  )
}

function BenefitItem({ title, description }: { title: string, description: string }) {
  return (
    <motion.div 
      variants={fadeInView}
      className="flex gap-6 group"
    >
      <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-primary h-fit group-hover:bg-primary group-hover:text-white transition-all duration-300">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <div className="space-y-1 text-left">
        <h4 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors text-left">{title}</h4>
        <p className="text-sm font-bold text-slate-500 leading-relaxed text-left">{description}</p>
      </div>
    </motion.div>
  )
}

function ActivityCard({ image, title, description, delay }: { image: string, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <Image 
          src={image} 
          alt={title} 
          width={600} 
          height={400}
          className="h-full w-full object-cover transform transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="p-8 space-y-4">
        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm font-bold text-slate-500 leading-relaxed" style={{ fontFamily: '"Meiryo", sans-serif' }}>
          {description}
        </p>
      </div>
      <div className="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-primary/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Activity View
        </div>
      </div>
    </motion.div>
  )
}
