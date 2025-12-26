/**
 * Conferences Feature - Type Definitions
 * Konferans yönetimi ile ilgili TypeScript type ve interface tanımları
 */

export type ConferenceStatus = 'PLANNED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

export interface ExternalSpeaker {
  id: string
  firstName: string
  lastName: string
  title: string | null
  organization: string | null
  department: string | null
  email: string | null
  phone: string | null
  address: string | null
  expertise: string[] | null
  bio: string | null
  isActive: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface Conference {
  id: string
  conferenceTitle: string
  topic: string
  description: string | null
  externalSpeakerId: string | null
  externalSpeaker: ExternalSpeaker | null
  scheduledDate: string | null
  duration: number
  startSlot: number | null
  endSlot: number | null
  targetClasses: string[] | null
  isAllClasses: boolean
  requiresSpecialRoom: boolean
  specialRoomType: string | null
  requiredEquipment: string[] | null
  countsTowardCurriculum: boolean
  courseId: string | null
  course: {
    id: string
    code: string
    name: string
  } | null
  status: ConferenceStatus
  organizerId: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    dailyLessons: number
  }
}

export interface CreateConferenceData {
  conferenceTitle: string
  topic: string
  description?: string
  externalSpeakerId?: string | null
  scheduledDate?: string | null
  duration?: number
  startSlot?: number | null
  endSlot?: number | null
  targetClasses?: string[] | null
  isAllClasses?: boolean
  requiresSpecialRoom?: boolean
  specialRoomType?: string | null
  requiredEquipment?: string[] | null
  countsTowardCurriculum?: boolean
  courseId?: string | null
  status?: ConferenceStatus
  organizerId?: string | null
  notes?: string | null
}

export interface EditConferenceData extends CreateConferenceData {
  id: string
}

export interface ConferenceStatusConfig {
  label: string
  color: string
  icon: string
  bgColor: string
}

export const CONFERENCE_STATUS_CONFIG: Record<ConferenceStatus, ConferenceStatusConfig> = {
  PLANNED: {
    label: 'Planlandı',
    color: 'text-blue-600 dark:text-blue-400',
    icon: 'ph:calendar-blank-bold',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  CONFIRMED: {
    label: 'Onaylandı',
    color: 'text-green-600 dark:text-green-400',
    icon: 'ph:check-circle-bold',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
  },
  COMPLETED: {
    label: 'Tamamlandı',
    color: 'text-gray-600 dark:text-gray-400',
    icon: 'ph:check-bold',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
  },
  CANCELLED: {
    label: 'İptal Edildi',
    color: 'text-red-600 dark:text-red-400',
    icon: 'ph:x-circle-bold',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
  },
}

export const SPECIAL_ROOM_TYPES = [
  { value: 'AUDITORIUM', label: 'Konferans Salonu' },
  { value: 'CONFERENCE_HALL', label: 'Toplantı Salonu' },
  { value: 'LECTURE_HALL', label: 'Derslik' },
  { value: 'OTHER', label: 'Diğer' },
]
