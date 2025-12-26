import { useState, useEffect } from 'react'
import { CreateConferenceData, ConferenceStatus } from '../types'

interface UseCreateConferenceProps {
  isOpen: boolean
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function useCreateConference({ isOpen, onSuccess, onError }: UseCreateConferenceProps) {
  const [conferenceTitle, setConferenceTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [externalSpeakerId, setExternalSpeakerId] = useState<string | null>(null)
  const [scheduledDate, setScheduledDate] = useState('')
  const [duration, setDuration] = useState(2)
  const [startSlot, setStartSlot] = useState<number | null>(6)
  const [endSlot, setEndSlot] = useState<number | null>(7)
  const [targetClasses, setTargetClasses] = useState<string[]>([])
  const [isAllClasses, setIsAllClasses] = useState(false)
  const [requiresSpecialRoom, setRequiresSpecialRoom] = useState(false)
  const [specialRoomType, setSpecialRoomType] = useState<string | null>(null)
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([])
  const [countsTowardCurriculum, setCountsTowardCurriculum] = useState(false)
  const [courseId, setCourseId] = useState<string | null>(null)
  const [status, setStatus] = useState<ConferenceStatus>('PLANNED')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [externalSpeakers, setExternalSpeakers] = useState<Array<{ id: string; firstName: string; lastName: string; title: string | null }>>([])

  // External speakers'ı yükle
  useEffect(() => {
    if (isOpen) {
      fetch('/api/external-speakers?isActive=true')
        .then((res) => res.json())
        .then((data) => {
          if (data.externalSpeakers) {
            setExternalSpeakers(data.externalSpeakers)
          }
        })
        .catch(console.error)
    }
  }, [isOpen])

  const resetForm = () => {
    setConferenceTitle('')
    setTopic('')
    setDescription('')
    setExternalSpeakerId(null)
    setScheduledDate('')
    setDuration(2)
    setStartSlot(6)
    setEndSlot(7)
    setTargetClasses([])
    setIsAllClasses(false)
    setRequiresSpecialRoom(false)
    setSpecialRoomType(null)
    setRequiredEquipment([])
    setCountsTowardCurriculum(false)
    setCourseId(null)
    setStatus('PLANNED')
    setNotes('')
  }

  const handleSubmit = async () => {
    if (!conferenceTitle.trim() || !topic.trim()) {
      onError('Konferans başlığı ve konu zorunludur')
      return
    }

    setIsSubmitting(true)
    try {
      const data: CreateConferenceData = {
        conferenceTitle: conferenceTitle.trim(),
        topic: topic.trim(),
        description: description.trim() || undefined,
        externalSpeakerId: externalSpeakerId || null,
        scheduledDate: scheduledDate || null,
        duration,
        startSlot,
        endSlot,
        targetClasses: targetClasses.length > 0 ? targetClasses : null,
        isAllClasses,
        requiresSpecialRoom,
        specialRoomType: specialRoomType || null,
        requiredEquipment: requiredEquipment.length > 0 ? requiredEquipment : null,
        countsTowardCurriculum,
        courseId: courseId || null,
        status,
        notes: notes.trim() || null,
      }

      const res = await fetch('/api/conferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (res.ok) {
        onSuccess('Konferans başarıyla oluşturuldu')
        resetForm()
      } else {
        onError(result.error || 'Konferans oluşturulamadı')
      }
    } catch (error) {
      console.error('Create conference error:', error)
      onError('Sunucu hatası')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Modal açıldığında formu sıfırla
  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen])

  return {
    conferenceTitle,
    topic,
    description,
    externalSpeakerId,
    scheduledDate,
    duration,
    startSlot,
    endSlot,
    targetClasses,
    isAllClasses,
    requiresSpecialRoom,
    specialRoomType,
    requiredEquipment,
    countsTowardCurriculum,
    courseId,
    status,
    notes,
    isSubmitting,
    externalSpeakers,
    setConferenceTitle,
    setTopic,
    setDescription,
    setExternalSpeakerId,
    setScheduledDate,
    setDuration,
    setStartSlot,
    setEndSlot,
    setTargetClasses,
    setIsAllClasses,
    setRequiresSpecialRoom,
    setSpecialRoomType,
    setRequiredEquipment,
    setCountsTowardCurriculum,
    setCourseId,
    setStatus,
    setNotes,
    handleSubmit,
    resetForm,
  }
}
