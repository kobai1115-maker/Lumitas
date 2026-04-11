import { Role, EvalStatus, IncidentType } from '@prisma/client'

// Prisma Types Re-exports (for ease of use)
export type { User, Evaluation, Goal, PeerBonus, IncidentReport, HealthLog, OneOnOneNote } from '@prisma/client'
export { Role, EvalStatus, IncidentType }

// Dashboard
export type DashboardMetrics = {
  completionRate?: number
  incidentReports?: number
  skillLevel?: number
  medicalCareCount?: number
  meetingCount?: number
  zeroErrorDays?: number
  coordinationCount?: number
  familyResponseCount?: number
  occupancyContribution?: number
  costReduction?: number
  hygieneCheckRate?: number
}

// 閲覧・編集権限の範囲
export type AuthorityLevel = 'ALL' | 'DEPARTMENT' | 'SUBORDINATES' | 'SELF'

// 役職（職位）の定義。法人が自由に追加・編集可能。
export type PositionDefinition = {
  id: string
  name: string           // 施設長, 主任, リーダー, etc.
  authority: AuthorityLevel // 閲覧可能な範囲
  rank: number           // 表示順や重要度
}

// 部署の定義
export type Department = {
  id: string
  name: string           // 介護課, 看護課, 事務局, etc.
}

// User Profile Extension (to avoid circular dependency or missing fields on UI)
export type UserProfile = {
  id: string
  staffId: string
  email: string
  fullName: string
  fullNameKana?: string
  role: Role
  corporationId?: string
  facilityId?: string
  divisionId?: string
  unitId?: string
  corporationName?: string
  facilityName?: string
  divisionName?: string
  unitName?: string
  positionId?: string    // Optional for now
  positionName?: string  // Optional for now
  departmentId?: string  // Optional for now
  departmentName?: string // Optional for now
  department: string     // Actual department field in DB
  gradeLevel: number
  experienceYears: number
  yearsOfService: number
  hireDate?: Date | string
  welfarePoints: number
  superiorId?: string    // 直属の上司ID (評価者)
}

// 既存の評価スコアなどの型
export type ScoringResult = {
  achievementScore: number
  competencyScore: number
  sentimentScore: number
  totalScore: number
  finalGrade: 'S' | 'A' | 'B' | 'C' | 'D'
}

export type GeminiEvalResult = {
  structuredText: string
  category: string
}

export type GeminiIncidentScoreResult = {
  points: number
  feedback: string
  riskCategory?: string // 例: 転倒・転落, 誤薬, 不穏, 異食など
  analysis?: string // AIによる詳細なリスク分析
}
