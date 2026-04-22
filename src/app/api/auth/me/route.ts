import { NextResponse } from 'next/server'
import { getServerAuthUser } from '@/lib/auth-server'

export async function GET() {
  try {
    const { user, error } = await getServerAuthUser()

    if (error || !user) {
      return NextResponse.json({ 
        error: error || 'Unauthorized',
        details: 'User profile not found in database. Please contact administrator.'
      }, { status: 401 })
    }

    // クライアントに必要なプロファイル情報を整形して返す
    return NextResponse.json({
      id: user.id,
      staffId: user.staffId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      corporationId: user.corporationId,
      facilityId: user.facilityId,
      divisionId: user.divisionId,
      unitId: user.unitId,
      corporationName: user.corporation?.name,
      facilityName: user.facility?.name,
      divisionName: user.division?.name,
      unitName: user.unit?.name,
      department: user.department,
      gradeLevel: user.gradeLevel,
      experienceYears: user.experienceYears,
      yearsOfService: user.yearsOfService,
      welfarePoints: user.welfarePoints
    })
  } catch (error) {
    console.error('API /auth/me error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
