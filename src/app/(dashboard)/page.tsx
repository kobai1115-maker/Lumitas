'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { UserProfile, DashboardMetrics } from '@/types'
import { supabase } from '@/lib/supabase'

import ProgressOverview from '@/components/features/dashboard/ProgressOverview'
import RoleBasedWidgets from '@/components/features/dashboard/RoleBasedWidgets'

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  
  // 仮のデータ: 実際の運用時はDB/APIからフェッチする
  const [metrics] = useState<DashboardMetrics>({
    completionRate: 85,
    incidentReports: 2,
    skillLevel: 4,
  })

  useEffect(() => {
    // ユーザー情報の取得モック（本来はSupabaseから取得）
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      // 仮のユーザープロフィールをセット（デモ用）
      setProfile({
        id: session?.user?.id || 'demo-id',
        email: session?.user?.email || 'demo@example.com',
        fullName: '山田 太郎',
        role: 'STAFF_CAREGIVER', // ここを変えるとウィジェットの表示が変わる
        gradeLevel: 2,
        department: '特養 東館',
        welfarePoints: 120,
      })
    }

    fetchUser()
  }, [])

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-gray-500">データを読み込み中...</div>
      </div>
    )
  }

  // 評価スコア（計算済みと仮定）
  const scoreData = {
    achievementScore: 35.5,
    competencyScore: 24.0,
    sentimentScore: 28.5,
    totalScore: 88.0,
    finalGrade: 'A' as const
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          こんにちは、{profile.fullName} さん
        </h1>
        <p className="text-sm text-gray-500">
          {profile.department} / 等級: {profile.gradeLevel}
        </p>
      </div>

      <ProgressOverview profile={profile} scoreData={scoreData} />
      
      <div className="pt-4 border-t border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 tracking-tight">
          現在のKPI・業務指標
        </h2>
        <RoleBasedWidgets role={profile.role} metrics={metrics} />
      </div>
    </motion.div>
  )
}
