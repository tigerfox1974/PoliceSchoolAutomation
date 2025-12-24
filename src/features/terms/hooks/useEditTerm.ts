/**
 * useEditTerm Hook
 * Dönem düzenleme state ve logic yönetimi
 */

import { useState, useEffect } from 'react'
import type { Term } from '../types'

interface EditFormData {
  termNumber: number
  termType: 'POLICE' | 'FIRE'
  duration: 'FOUR_MONTHS' | 'SIX_MONTHS'
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
}

interface UseEditTermProps {
  term: Term | null
  isOpen: boolean
  onSuccess: (message: string) => void
  onError: (message: string) => void
  onClose: () => void
}

export function useEditTerm({ term, isOpen, onSuccess, onError, onClose }: UseEditTermProps) {
  const [formData, setFormData] = useState<EditFormData>({
    termNumber: 0,
    termType: 'POLICE',
    duration: 'FOUR_MONTHS',
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Term değiştiğinde form verilerini güncelle
  useEffect(() => {
    if (term && isOpen) {
      setFormData({
        termNumber: term.termNumber,
        termType: term.termType,
        duration: term.duration,
        startDate: term.startDate.split('T')[0],
        endDate: term.endDate.split('T')[0],
        status: term.status,
      })
    }
  }, [term, isOpen])

  // Bitiş tarihini otomatik hesapla
  const calculateEndDate = (startDate: string, duration: 'FOUR_MONTHS' | 'SIX_MONTHS'): string => {
    if (!startDate) return ''
    const start = new Date(startDate)
    const months = duration === 'FOUR_MONTHS' ? 4 : 6
    const end = new Date(start.setMonth(start.getMonth() + months))
    return end.toISOString().split('T')[0]
  }

  // Form alanlarını güncelleme fonksiyonları
  const updateTermNumber = (value: number) => {
    setFormData({ ...formData, termNumber: value })
  }

  const updateTermType = (value: 'POLICE' | 'FIRE') => {
    setFormData({ ...formData, termType: value })
  }

  const updateDuration = (value: 'FOUR_MONTHS' | 'SIX_MONTHS') => {
    const newEndDate = formData.startDate ? calculateEndDate(formData.startDate, value) : formData.endDate
    setFormData({ ...formData, duration: value, endDate: newEndDate })
  }

  const updateStartDate = (value: string) => {
    const newEndDate = calculateEndDate(value, formData.duration)
    setFormData({ ...formData, startDate: value, endDate: newEndDate })
  }

  const updateEndDate = (value: string) => {
    setFormData({ ...formData, endDate: value })
  }

  const updateStatus = (value: 'ACTIVE' | 'PAUSED' | 'ARCHIVED') => {
    setFormData({ ...formData, status: value })
  }

  // Form submit işlemi
  const handleSubmit = async () => {
    if (!term) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/terms/${term.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        onSuccess('Dönem başarıyla güncellendi')
        onClose()
      } else {
        const error = await res.json()
        onError(error.error || 'Dönem güncellenemedi')
      }
    } catch (error) {
      console.error('Dönem düzenleme hatası:', error)
      onError('Sunucu hatası')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    // State
    formData,
    isSubmitting,

    // Actions
    updateTermNumber,
    updateTermType,
    updateDuration,
    updateStartDate,
    updateEndDate,
    updateStatus,
    handleSubmit,
  }
}
