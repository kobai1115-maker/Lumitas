'use client'

import { useEffect } from 'react'
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/types'

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  fetchProfile: () => Promise<void>;
  clearProfile: () => void;
}

const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: true,
  error: null,
  initialized: false,
  fetchProfile: async () => {
    set({ loading: true, error: null })
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒でタイムアウト

      const res = await fetch('/api/auth/me', { signal: controller.signal })
      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        set({ profile: data, error: null, initialized: true, loading: false })
      } else {
        const errorData = await res.json().catch(() => ({}))
        set({ profile: null, initialized: true, loading: false, error: errorData.error || `Profile fetch error: ${res.status}` })
        if (res.status === 401) {
          console.warn('User not authenticated (401)')
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.error('useProfile timeout error')
        set({ error: 'サーバーからの応答がありません（タイムアウト）', initialized: true, loading: false })
      } else {
        console.error('useProfile network error:', err)
        set({ error: 'ネットワークエラーが発生しました', initialized: true, loading: false })
      }
    }
  },
  clearProfile: () => set({ profile: null, loading: false, error: null, initialized: true })
}))

let authListenerRegistered = false;

export function useProfile() {
  const { profile, loading, error, initialized, fetchProfile } = useProfileStore()

  useEffect(() => {
    // 初回マウント時のみfetchする
    if (!initialized && typeof window !== 'undefined') {
      fetchProfile()
    }

    // Listenerもグローバルで1回だけ登録する
    if (!authListenerRegistered && typeof window !== 'undefined') {
      authListenerRegistered = true
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
        console.log('--- Auth Event ---', event)
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          useProfileStore.getState().fetchProfile()
        } else if (event === 'SIGNED_OUT') {
          useProfileStore.getState().clearProfile()
        }
      })
    }
  }, [initialized, fetchProfile])

  // 便利なショートカットプロパティ
  const isSystemAdmin = (profile?.role as string) === 'DEVELOPER'
  const isCorpAdmin = (profile?.role as string) === 'MAIN_ADMIN'
  const isFacilityManager = (profile?.role as string) === 'SUB_ADMIN'
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
