import { useState } from 'react'
import { CreateSpecialEventData, SpecialEventType } from '../types'

interface UseCreateSpecialEventProps {
  isOpen: boolean
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function useCreateSpecialEvent({ isOpen, onSuccess, onError }: UseCreateSpecialEventProps) {
  const [eventType, setEventType] = useState<SpecialEventType>('YOKLAMA')
  const [eventTitle, setEventTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(1)
  const [dayOfWeek, setDayOfWeek] = useState<number | null>(5) // Varsayılan Cuma
  const [slotIndex, setSlotIndex] = useState<number | null>(1) // Varsayılan 1. ders
  const [requiresInstructor, setRequiresInstructor] = useState(false)
  const [allClassesTogether, setAllClassesTogether] = useState(false)
  const [countsTowardCurriculum, setCountsTowardCurriculum] = useState(false)
  const [managedBy, setManagedBy] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Event type'a göre varsayılan değerleri ayarla
  const updateDefaultsByEventType = (type: SpecialEventType) => {
    switch (type) {
      case 'YOKLAMA':
        setEventTitle('Haftalık Yoklama')
        setDescription('Çevremizi Tanıyalım, Okul Kuralları ve Dilekçe Yazma')
        setDuration(1)
        setDayOfWeek(5) // Cuma
        setSlotIndex(1) // 1. ders
        setRequiresInstructor(false)
        setAllClassesTogether(true)
        setCountsTowardCurriculum(false)
        setManagedBy('Eğitmen Gözetmenliği')
        break
      case 'MANAGEMENT':
        setEventTitle('Müdüriyet Toplantısı')
        setDescription('Haftalık değerlendirme ve duyurular')
        setDuration(1)
        setDayOfWeek(5) // Cuma
        setSlotIndex(7) // 7. ders
        setRequiresInstructor(false)
        setAllClassesTogether(true)
        setCountsTowardCurriculum(false)
        setManagedBy('Okul Müdürü')
        break
      case 'SOCIAL_SPORTS':
        setEventTitle('Sosyal ve Sportif Faaliyetler')
        setDescription('Öğrencilerin sosyal ve sportif gelişimi')
        setDuration(2)
        setDayOfWeek(null)
        setSlotIndex(null)
        setRequiresInstructor(false)
        setAllClassesTogether(false)
        setCountsTowardCurriculum(false)
        setManagedBy('')
        break
      default:
        // Diğer tipler için temizle
        if (eventTitle === 'Haftalık Yoklama' || eventTitle === 'Müdüriyet Toplantısı' || eventTitle === 'Sosyal ve Sportif Faaliyetler') {
          setEventTitle('')
        }
        break
    }
  }

  const handleEventTypeChange = (type: SpecialEventType) => {
    setEventType(type)
    updateDefaultsByEventType(type)
  }

  const resetForm = () => {
    setEventType('YOKLAMA')
    setEventTitle('')
    setDescription('')
    setDuration(1)
    setDayOfWeek(5)
    setSlotIndex(1)
    setRequiresInstructor(false)
    setAllClassesTogether(false)
    setCountsTowardCurriculum(false)
    setManagedBy('')
    setNotes('')
  }

  const handleSubmit = async () => {
    if (!eventTitle.trim()) {
      onError('Etkinlik başlığı zorunludur')
      return
    }

    setIsSubmitting(true)
    try {
      const data: CreateSpecialEventData = {
        eventType,
        eventTitle: eventTitle.trim(),
        description: description.trim() || undefined,
        duration,
        dayOfWeek,
        slotIndex,
        requiresInstructor,
        allClassesTogether,
        countsTowardCurriculum,
        managedBy: managedBy.trim() || null,
        notes: notes.trim() || null,
      }

      const res = await fetch('/api/special-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (res.ok) {
        onSuccess('Özel etkinlik başarıyla oluşturuldu')
        resetForm()
      } else {
        onError(result.error || 'Özel etkinlik oluşturulamadı')
      }
    } catch (error) {
      console.error('Create special event error:', error)
      onError('Sunucu hatası')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Modal açıldığında formu sıfırla
  useState(() => {
    if (isOpen) {
      resetForm()
    }
  })

  return {
    eventType,
    eventTitle,
    description,
    duration,
    dayOfWeek,
    slotIndex,
    requiresInstructor,
    allClassesTogether,
    countsTowardCurriculum,
    managedBy,
    notes,
    isSubmitting,
    setEventType: handleEventTypeChange,
    setEventTitle,
    setDescription,
    setDuration,
    setDayOfWeek,
    setSlotIndex,
    setRequiresInstructor,
    setAllClassesTogether,
    setCountsTowardCurriculum,
    setManagedBy,
    setNotes,
    handleSubmit,
    resetForm,
  }
}
