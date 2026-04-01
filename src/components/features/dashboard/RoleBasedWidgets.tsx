import { Role } from '@prisma/client'
import { DashboardMetrics } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { ClipboardCheck, Stethoscope, Users, Briefcase, FileText, Activity } from 'lucide-react'

type Props = {
  role: Role
  metrics: DashboardMetrics
}

export default function RoleBasedWidgets({ role, metrics }: Props) {
  // 職務ごとのウィジェット定義
  const renderWidgets = () => {
    switch (role) {
      case 'STAFF_CAREGIVER':
        return (
          <>
            <WidgetCard title="ケア記録完了率" value={`${metrics.completionRate}%`} desc="目標: 100%" icon={ClipboardCheck} color="text-green-500" />
            <WidgetCard title="ヒヤリハット報告数" value={`${metrics.incidentReports}件`} desc="今月の報告（目標:3件）" icon={FileText} color="text-yellow-500" />
            <WidgetCard title="身体介助スキル習熟度" value={`LV.${metrics.skillLevel}`} desc="リーダー評価(1-5)" icon={Activity} color="text-blue-500" />
          </>
        )
      case 'STAFF_NURSE':
        return (
          <>
            <WidgetCard title="医療的ケア実施件数" value={`${metrics.medicalCareCount || 0}件`} icon={Stethoscope} color="text-red-400" />
            <WidgetCard title="多職種連携会議参加" value={`${metrics.meetingCount || 0}回`} icon={Users} color="text-indigo-400" />
            <WidgetCard title="服薬エラーゼロ日数" value={`${metrics.zeroErrorDays || 0}日`} desc="継続中！" icon={ShieldCheck} color="text-emerald-500" />
          </>
        )
      case 'STAFF_SOCIAL_WORKER':
        return (
          <>
            <WidgetCard title="入退所調整完了数" value={`${metrics.coordinationCount || 0}件`} icon={Briefcase} color="text-purple-500" />
            <WidgetCard title="家族対応件数" value={`${metrics.familyResponseCount || 0}件`} icon={Users} color="text-orange-400" />
            <WidgetCard title="稼働率維持貢献" value={`${metrics.occupancyContribution || 0}%`} icon={TrendingUp} color="text-blue-500" />
          </>
        )
      case 'STAFF_OFFICE':
      case 'STAFF_NUTRITIONIST':
        return (
          <>
            <WidgetCard title="コスト削減達成率" value={`${metrics.costReduction || 0}%`} icon={TrendingUp} color="text-teal-500" />
            <WidgetCard title="衛生チェック完了" value={`${metrics.hygieneCheckRate || 0}%`} icon={ClipboardCheck} color="text-green-500" />
            <WidgetCard title="ミスゼロ連続日数" value={`${metrics.zeroErrorDays || 0}日`} icon={ShieldCheck} color="text-emerald-500" />
          </>
        )
      default:
        return (
          <div className="text-gray-500 text-sm py-4 text-center">
            この職位固有のウィジェットは現在ありません。
          </div>
        )
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {renderWidgets()}
    </div>
  )
}

function WidgetCard({ title, value, desc, icon: Icon, color }: {
  title: string;
  value: string | number;
  desc?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="shadow-sm border-gray-100/50">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="flex items-start justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500 leading-tight">
            {title}
          </p>
          <Icon className={`w-4 h-4 ${color} shrink-0 opacity-80`} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">{value}</h3>
          {desc && <p className="text-[10px] text-gray-400 mt-1">{desc}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

// 足りないアイコンの補完インポート
import { ShieldCheck, TrendingUp } from 'lucide-react'
