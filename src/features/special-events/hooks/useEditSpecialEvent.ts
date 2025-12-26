import { useState, useEffect } from 'react'
import { SpecialEvent, EditSpecialEventData, SpecialEventType } from '../types'

interface UseEditSpecialEventProps {
  isOpen: boolean
  specialEvent: SpecialEvent | null
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function useEditSpecialEvent({ isOpen, specialEvent, onSuccess, onError }: UseEditSpecialEventProps) {
  const [eventType, setEventType] = useState<SpecialEventType>('YOKLAMA')
  const [eventTitle, setEventTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(1)
  const [dayOfWeek, setDayOfWeek] = useState<number | null>(null)
  const [slotIndex, setSlotIndex] = useState<number | null>(null)
  const [requiresInstructor, setRequiresInstructor] = useState(false)
  const [allClassesTogether, setAllClassesTogether] = useState(false)
  const [countsTowardCurriculum, setCountsTowardCurriculum] = useState(false)
  const [managedBy, setManagedBy] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // SpecialEvent değiştiğinde formu doldur
  useEffect(() => {
    if (specialEvent && isOpen) {
      setEventType(specialEvent.eventType)
      setEventTitle(specialEvent.eventTitle)
      setDescription(specialEvent.description || '')
      setDuration(specialEvent.duration)
      setDayOfWeek(specialEvent.dayOfWeek)
      setSlotIndex(specialEvent.slotIndex)
      setRequiresInstructor(specialEvent.requiresInstructor)
      setAllClassesTogether(specialEvent.allClassesTogether)
      setCountsTowardCurriculum(specialEvent.countsTowardCurriculum)
      setManagedBy(specialEvent.managedBy || '')
      setNotes(specialEvent.notes || '')
    }
  }, [specialEvent, isOpen])

  const resetForm = () => {
    if (specialEvent) {
      setEventType(specialEvent.eventType)
      setEventTitle(specialEvent.eventTitle)
      setDescription(specialEvent.description || '')
      setDuration(specialEvent.duration)
      setDayOfWeek(specialEvent.dayOfWeek)
      setSlotIndex(specialEvent.slotIndex)
      setRequiresInstructor(specialEvent.requiresInstructor)
      setAllClassesTogether(specialEvent.allClassesTogether)
      setCountsTowardCurriculum(specialEvent.countsTowardCurriculum)
      setManagedBy(specialEvent.managedBy || '')
      setNotes(specialEvent.notes || '')
    }
  }

  const handleSubmit = async () => {
    if (!specialEvent) return

    if (!eventTitle.trim()) {
      onError('Etkinlik başlığı zorunludur')
      return
    }

    setIsSubmitting(true)
    try {
      const data: EditSpecialEventData = {
        id: specialEvent.id,
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

      const res = await fetch(`/api/special-events/${specialEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (res.ok) {
        onSuccess('Özel etkinlik başarıyla güncellendi')
      } else {
        onError(result.error || 'Özel etkinlik güncellenemedi')
      }
    } catch (error) {
      console.error('Edit special event error:', error)
      onError('Sunucu hatası')
    } finally {
      setIsSubmitting(false)
    }
  }

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
    setEventType,
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
