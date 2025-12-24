/**
 * useCreateTerm Hook
 * Yeni dönem oluşturma state ve logic yönetimi
 */

import { useState, useEffect } from 'react'

interface UseCreateTermProps {
  isOpen: boolean
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function useCreateTerm({ isOpen, onSuccess, onError }: UseCreateTermProps) {
  const [selectedType, setSelectedType] = useState<'POLICE' | 'FIRE'>('POLICE')
  const [suggestedNumber, setSuggestedNumber] = useState<number>(1)
  const [currentTermNumber, setCurrentTermNumber] = useState<number>(0)
  const [selectedDuration, setSelectedDuration] = useState<'FOUR_MONTHS' | 'SIX_MONTHS'>('FOUR_MONTHS')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dönem tipi değiştiğinde öneri al
  useEffect(() => {
    if (isOpen) {
      fetchSuggestion(selectedType)
    }
  }, [selectedType, isOpen])

  // Başlangıç tarihi veya süre değiştiğinde bitiş tarihini hesapla
  useEffect(() => {
    if (startDate && selectedDuration) {
      calculateEndDate(startDate, selectedDuration)
    }
  }, [startDate, selectedDuration])

  const fetchSuggestion = async (type: 'POLICE' | 'FIRE') => {
    try {
      const res = await fetch(`/api/terms/suggest?termType=${type}`)
      const data = await res.json()
      const suggested = data.suggestedNumber
      
      if (suggested === null) {
        setSuggestedNumber(0)
        setCurrentTermNumber(0)
      } else {
        setSuggestedNumber(suggested || 1)
        setCurrentTermNumber(suggested || 1)
      }
    } catch (error) {
      console.error('Öneri alınamadı:', error)
      setSuggestedNumber(0)
      setCurrentTermNumber(0)
    }
  }

  const calculateEndDate = (start: string, duration: 'FOUR_MONTHS' | 'SIX_MONTHS') => {
    const startDateObj = new Date(start)
    const endDateObj = new Date(startDateObj)
    
    if (duration === 'FOUR_MONTHS') {
      endDateObj.setMonth(endDateObj.getMonth() + 4)
    } else {
      endDateObj.setMonth(endDateObj.getMonth() + 6)
    }
    
    setEndDate(endDateObj.toISOString().split('T')[0])
  }

  const handleSubmit = async () => {
    if (!startDate || currentTermNumber <= 0) {
      onError('Lütfen tüm alanları doldurun')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          termNumber: currentTermNumber,
          termType: selectedType,
          duration: selectedDuration,
          startDate,
          endDate,
          isActive: true,
        }),
      })

      if (res.ok) {
        const termName = `${currentTermNumber}. ${selectedType === 'POLICE' ? 'Polis' : 'İtfaiye'} Temel Eğitimi`
        onSuccess(`${termName} başarıyla oluşturuldu`)
        resetForm()
      } else {
        const error = await res.json()
        onError(error.error || 'Dönem oluşturulamadı')
      }
    } catch (error) {
      console.error('Dönem oluşturma hatası:', error)
      onError('Sunucu hatası')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setStartDate('')
    setEndDate('')
    setCurrentTermNumber(suggestedNumber)
  }

  return {
    // State
    selectedType,
    suggestedNumber,
    currentTermNumber,
    selectedDuration,
    startDate,
    endDate,
    isSubmitting,

    // Actions
    setSelectedType,
    setCurrentTermNumber,
    setSelectedDuration,
    setStartDate,
    setEndDate,
    handleSubmit,
    resetForm,
  }
}
