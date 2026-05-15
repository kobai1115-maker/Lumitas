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
    // すでに読み込み中の場合はスキップ
    set({ loading: true, error: null })
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const res = await fetch('/api/auth/me', { signal: controller.signal })
      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        // キャッシュ保存
        if (typeof window !== 'undefined') {
          localStorage.setItem('lumitas_profile_cache', JSON.stringify(data))
        }
        set({ profile: data, error: null, initialized: true, loading: false })
      } else {
        const errorData = await res.json().catch(() => ({}))
        set({ profile: null, initialized: true, loading: false, error: errorData.error || `Profile fetch error: ${res.status}` })
        if (res.status === 401) {
          localStorage.removeItem('lumitas_profile_cache')
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        set({ error: 'Timeout', initialized: true, loading: false })
      } else {
        set({ error: 'Network Error', initialized: true, loading: false })
      }
    }
  },
  clearProfile: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lumitas_profile_cache')
    }
    set({ profile: null, loading: false, error: null, initialized: true })
  }
}))

// --- 初期化時にキャッシュを復元 ---
if (typeof window !== 'undefined') {
  const cache = localStorage.getItem('lumitas_profile_cache')
  if (cache) {
    try {
      const parsed = JSON.parse(cache)
      useProfileStore.setState({ profile: parsed, loading: false, initialized: true })
    } catch (e) {
      localStorage.removeItem('lumitas_profile_cache')
    }
  }
}

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
