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

// User Profile Extension (to avoid circular dependency or missing fields on UI)
export type UserProfile = {
  id: string
  email: string
  fullName: string
  role: Role
  gradeLevel: number
  department: string
  welfarePoints: number
}

// System Responses
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
