/**
 * Special Events Feature - Type Definitions
 * Özel etkinlikler yönetimi ile ilgili TypeScript type ve interface tanımları
 */

export type SpecialEventType = 'YOKLAMA' | 'MANAGEMENT' | 'SOCIAL_SPORTS' | 'CEREMONY' | 'ORIENTATION' | 'OTHER'

export interface SpecialEvent {
  id: string
  eventType: SpecialEventType
  eventTitle: string
  description: string | null
  duration: number
  dayOfWeek: number | null // 1=Pazartesi, 5=Cuma
  slotIndex: number | null // 1-7
  requiresInstructor: boolean
  allClassesTogether: boolean
  countsTowardCurriculum: boolean
  managedBy: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    dailyLessons: number
  }
}

export interface CreateSpecialEventData {
  eventType: SpecialEventType
  eventTitle: string
  description?: string
  duration?: number
  dayOfWeek?: number | null
  slotIndex?: number | null
  requiresInstructor?: boolean
  allClassesTogether?: boolean
  countsTowardCurriculum?: boolean
  managedBy?: string | null
  notes?: string | null
}

export interface EditSpecialEventData extends CreateSpecialEventData {
  id: string
}

export interface SpecialEventFilters {
  eventType: SpecialEventType[]
  dayOfWeek: number[]
  requiresInstructor: boolean | null
  allClassesTogether: boolean | null
}

export interface SpecialEventStatusConfig {
  label: string
  color: string
  icon: string
  bgColor: string
}

export const EVENT_TYPE_CONFIG: Record<SpecialEventType, SpecialEventStatusConfig> = {
  YOKLAMA: {
    label: 'Yoklama',
    color: 'text-red-600 dark:text-red-400',
    icon: 'ph:clipboard-check-bold',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
  },
  MANAGEMENT: {
    label: 'Müdüriyet',
    color: 'text-orange-600 dark:text-orange-400',
    icon: 'ph:users-three-bold',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
  },
  SOCIAL_SPORTS: {
    label: 'Sosyal ve Sportif',
    color: 'text-green-600 dark:text-green-400',
    icon: 'ph:soccer-ball-bold',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
  },
  CEREMONY: {
    label: 'Tören',
    color: 'text-blue-600 dark:text-blue-400',
    icon: 'ph:flag-bold',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  ORIENTATION: {
    label: 'İntibak',
    color: 'text-purple-600 dark:text-purple-400',
    icon: 'ph:graduation-cap-bold',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  OTHER: {
    label: 'Diğer',
    color: 'text-gray-600 dark:text-gray-400',
    icon: 'ph:calendar-bold',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
  },
}

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  1: 'Pazartesi',
  2: 'Salı',
  3: 'Çarşamba',
  4: 'Perşembe',
  5: 'Cuma',
}
