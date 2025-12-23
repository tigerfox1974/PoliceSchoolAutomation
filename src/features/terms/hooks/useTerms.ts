/**
 * useTerms Hook
 * Dönem listesi yönetimi ve API işlemleri
 */

import { useState, useEffect, useCallback } from 'react'
import type { Term } from '../types'

export function useTerms() {
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTerms = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/terms')
      const data = await res.json()
      setTerms(data)
    } catch (error) {
      console.error('Dönem yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteTerm = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/terms/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchTerms()
        return { success: true }
      } else {
        const error = await res.json()
        return { success: false, error: error.error || 'Dönem silinemedi' }
      }
    } catch (error) {
      console.error('Silme hatası:', error)
      return { success: false, error: 'Sunucu hatası' }
    }
  }, [fetchTerms])

  const updateTermStatus = useCallback(async (
    id: string,
    status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
  ) => {
    try {
      const res = await fetch(`/api/terms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        await fetchTerms()
        return { success: true }
      } else {
        const error = await res.json()
        return { success: false, error: error.error || 'Durum güncellenemedi' }
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error)
      return { success: false, error: 'Sunucu hatası' }
    }
  }, [fetchTerms])

  useEffect(() => {
    fetchTerms()
  }, [fetchTerms])

  return {
    terms,
    loading,
    fetchTerms,
    deleteTerm,
    updateTermStatus,
  }
}
