'use client'

import { useEffect, useState } from 'react'
import { Role } from '@prisma/client'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/types'

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setError(null)
      } else {
        setProfile(null)
        if (res.status === 401) {
          console.warn('User not authenticated (401)')
        } else {
          setError(`Profile fetch error: ${res.status}`)
        }
      }
    } catch (err) {
      console.error('useProfile network error:', err)
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    // 初期取得
    fetchProfile()

    // 認証状態の変化を監視（ログイン成功時などに再取得）
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
      console.log('--- Auth Event ---', event)
      if (mounted) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          fetchProfile()
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // 便利なショートカットプロパティ
  const isSystemAdmin = (profile?.role as string) === 'SYSTEM_ADMIN'
  const isCorpAdmin = (profile?.role as string) === 'ADMIN'
  const isFacilityManager = (profile?.role as string) === 'MANAGER'
  const isStaff = profile?.role?.startsWith('STAFF_')

  return {
    profile,
    loading,
    error,
    isSystemAdmin,
    isCorpAdmin,
    isFacilityManager,
    isStaff,
    refresh: fetchProfile
  }
}
