/**
 * useEditTerm Hook
 * Dönem düzenleme state ve işlem yönetimi
 */

import { useState, useEffect } from 'react'
import type { Term } from '../types'

interface UseEditTermProps {
  term: Term | null
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function useEditTerm({ term, onSuccess, onError }: UseEditTermProps) {
  const [formData, setFormData] = useState({
    termNumber: 0,
    termType: 'POLICE' as 'POLICE' | 'FIRE',
    duration: 'FOUR_MONTHS' as 'FOUR_MONTHS' | 'SIX_MONTHS',
    startDate: '',
    endDate: '',
    status: 'ACTIVE' as 'ACTIVE' | 'PAUSED' | 'ARCHIVED',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Term değiştikçe formu doldur
  useEffect(() => {
    if (term) {
      setFormData({
        termNumber: term.termNumber,
        termType: term.termType,
        duration: term.duration,
        startDate: term.startDate.split('T')[0],
        endDate: term.endDate.split('T')[0],
        status: term.status,
      })
    }
  }, [term])

  const handleSubmit = async () => {
    if (!term) {
      onError('Düzenlenecek dönem bulunamadı')
      return false
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/terms/${term.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        onSuccess('Dönem başarıyla güncellendi')
        return true
      }

      const error = await res.json()
      onError(error.error || 'Dönem güncellenemedi')
      return false
    } catch (error) {
      console.error('Edit error:', error)
      onError('Sunucu hatası')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    setFormData,
    isSubmitting,
    handleSubmit,
  }
}
