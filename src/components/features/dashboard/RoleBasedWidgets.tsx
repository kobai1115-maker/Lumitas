import { Role } from '@prisma/client'
import { DashboardMetrics } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { ClipboardCheck, Stethoscope, Users, Briefcase, FileText, Activity, ShieldCheck, TrendingUp, ChevronRight } from 'lucide-react'
import Link from 'next/link'

type Props = {
  role: Role
  metrics: DashboardMetrics
}

export default function RoleBasedWidgets({ role, metrics }: Props) {
  // 職務ごとのウィジェット定義
  const renderWidgets = () => {
    switch (role) {
      case 'GENERAL':
        return (
          <>
            <WidgetCard title="読書・Off-JT達成状況" value={`${metrics.completionRate}%`} desc="目標: 100%" icon={ClipboardCheck} color="bg-indigo-50 text-indigo-600" href="/training" />
            <WidgetCard title="グッドキャッチ報告数" value={`${metrics.incidentReports}件`} desc="今月の報告（目標:3件）" icon={FileText} color="bg-yellow-50 text-yellow-600" href="/incident" />
            <WidgetCard title="身体介助スキル習熟度" value={`レベル ${metrics.skillLevel}`} desc="リーダー評価(1-5)" icon={Activity} color="bg-blue-50 text-blue-600" href="/evaluation" />
          </>
        )
      case 'GENERAL':
        return (
          <>
            <WidgetCard title="医療的ケア実施件数" value={`${metrics.medicalCareCount || 0}件`} icon={Stethoscope} color="bg-red-50 text-red-500" href="/medical" />
            <WidgetCard title="多職種連携会議参加" value={`${metrics.meetingCount || 0}回`} icon={Users} color="bg-indigo-50 text-indigo-600" href="/meetings" />
            <WidgetCard title="服薬エラーゼロ日数" value={`${metrics.zeroErrorDays || 0}日`} desc="継続中！" icon={ShieldCheck} color="bg-emerald-50 text-emerald-600" href="/safety" />
          </>
        )
      case 'GENERAL':
        return (
          <>
            <WidgetCard title="入退所調整完了数" value={`${metrics.coordinationCount || 0}件`} icon={Briefcase} color="bg-purple-50 text-purple-600" href="/coordination" />
            <WidgetCard title="家族対応件数" value={`${metrics.familyResponseCount || 0}件`} icon={Users} color="bg-orange-50 text-orange-500" href="/family-response" />
            <WidgetCard title="稼働率維持貢献" value={`${metrics.occupancyContribution || 0}%`} icon={TrendingUp} color="bg-blue-50 text-blue-600" href="/occupancy" />
          </>
        )
      default:
        return (
          <>
            <WidgetCard title="コスト削減達成率" value={`${metrics.costReduction || 0}%`} icon={TrendingUp} color="bg-teal-50 text-teal-600" href="/admin/cost" />
            <WidgetCard title="衛生チェック完了" value={`${metrics.hygieneCheckRate || 0}%`} icon={ClipboardCheck} color="bg-green-50 text-green-600" href="/hygiene" />
            <WidgetCard title="ミスゼロ連続日数" value={`${metrics.zeroErrorDays || 0}日`} icon={ShieldCheck} color="bg-emerald-50 text-emerald-600" href="/safety" />
          </>
        )
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {renderWidgets()}
    </div>
  )
}

function WidgetCard({ title, value, desc, icon: Icon, color, href }: {
  title: string;
  value: string | number;
  desc?: string;
  icon: React.ElementType;
  color: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="shadow-sm border-gray-100 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer h-full">
        <CardContent className="p-4 flex flex-col justify-between h-full relative">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-2 rounded-xl ${color.split(' ')[0]} ${color.split(' ')[1]} transition-colors group-hover:bg-primary/10 group-hover:text-primary`}>
              <Icon className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          
          <div>
            <p className="text-[11px] font-bold text-gray-400 mb-1">
              {title}
            </p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">{value}</h3>
              {desc && <p className="text-[9px] font-bold text-gray-400 mb-0.5">{desc}</p>}
            </div>
          </div>
          
          {/* 下部の装飾ライン */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:via-primary/50 transition-all duration-500" />
        </CardContent>
      </Card>
    </Link>
  )
}

