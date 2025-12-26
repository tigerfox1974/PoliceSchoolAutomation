import { useState, useEffect } from 'react'
import { Conference, EditConferenceData, ConferenceStatus } from '../types'

interface UseEditConferenceProps {
  isOpen: boolean
  conference: Conference | null
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function useEditConference({ isOpen, conference, onSuccess, onError }: UseEditConferenceProps) {
  const [conferenceTitle, setConferenceTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [externalSpeakerId, setExternalSpeakerId] = useState<string | null>(null)
  const [scheduledDate, setScheduledDate] = useState('')
  const [duration, setDuration] = useState(2)
  const [startSlot, setStartSlot] = useState<number | null>(null)
  const [endSlot, setEndSlot] = useState<number | null>(null)
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

  // Conference değiştiğinde formu doldur
  useEffect(() => {
    if (conference && isOpen) {
      setConferenceTitle(conference.conferenceTitle)
      setTopic(conference.topic)
      setDescription(conference.description || '')
      setExternalSpeakerId(conference.externalSpeakerId)
      setScheduledDate(conference.scheduledDate ? conference.scheduledDate.split('T')[0] : '')
      setDuration(conference.duration)
      setStartSlot(conference.startSlot)
      setEndSlot(conference.endSlot)
      setTargetClasses(Array.isArray(conference.targetClasses) ? conference.targetClasses : [])
      setIsAllClasses(conference.isAllClasses)
      setRequiresSpecialRoom(conference.requiresSpecialRoom)
      setSpecialRoomType(conference.specialRoomType)
      setRequiredEquipment(Array.isArray(conference.requiredEquipment) ? conference.requiredEquipment : [])
      setCountsTowardCurriculum(conference.countsTowardCurriculum)
      setCourseId(conference.courseId)
      setStatus(conference.status)
      setNotes(conference.notes || '')
    }
  }, [conference, isOpen])

  const handleSubmit = async () => {
    if (!conference) return

    if (!conferenceTitle.trim() || !topic.trim()) {
      onError('Konferans başlığı ve konu zorunludur')
      return
    }

    setIsSubmitting(true)
    try {
      const data: EditConferenceData = {
        id: conference.id,
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

      const res = await fetch(`/api/conferences/${conference.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (res.ok) {
        onSuccess('Konferans başarıyla güncellendi')
      } else {
        onError(result.error || 'Konferans güncellenemedi')
      }
    } catch (error) {
      console.error('Edit conference error:', error)
      onError('Sunucu hatası')
    } finally {
      setIsSubmitting(false)
    }
  }

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
  }
}
