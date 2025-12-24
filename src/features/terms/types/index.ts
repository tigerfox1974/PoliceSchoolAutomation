/**
 * Terms Feature - Type Definitions
 * Tüm dönem yönetimi ile ilgili TypeScript type ve interface tanımları
 */

export type TermType = 'POLICE' | 'FIRE'
export type TermDuration = 'FOUR_MONTHS' | 'SIX_MONTHS'
export type TermStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED'

export interface Term {
  id: string
  termCode: string
  name: string
  termNumber: number
  termType: TermType
  duration: TermDuration
  startDate: string
  endDate: string
  status: TermStatus
  _count: {
    students: number
    classes: number
    instructorTerms: number
  }
}

export interface TermFilters {
  termType: string[]
  status: string[]
  duration: string[]
  dateFrom: string
  dateTo: string
}

export type SortOption = 'newest' | 'oldest' | 'name' | 'status' | 'termType' | 'duration' | 'endDate' | 'students' | 'classes' | 'instructors'
export type SortOrder = 'asc' | 'desc'
export type ViewMode = 'grid' | 'list'

export interface CreateTermData {
  termNumber: number
  termType: TermType
  duration: TermDuration
  startDate: string
  endDate: string
  isActive: boolean
}

export interface EditTermData {
  termNumber: number
  termType: TermType
  duration: TermDuration
  startDate: string
  endDate: string
  status: TermStatus
}

export interface ConfirmDialogState {
  isOpen: boolean
  title: string
  message: string
  type: 'danger' | 'warning' | 'info'
  onConfirm: () => void
}

export interface TermStatusConfig {
  label: string
  color: string
  icon: string
}
