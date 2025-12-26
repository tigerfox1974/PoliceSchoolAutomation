/**
 * External Speakers Feature - Type Definitions
 * Dış konuşmacı yönetimi ile ilgili TypeScript type ve interface tanımları
 */

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
  _count?: {
    conferences: number
  }
}

export interface CreateExternalSpeakerData {
  firstName: string
  lastName: string
  title?: string
  organization?: string
  department?: string
  email?: string
  phone?: string
  address?: string
  expertise?: string[]
  bio?: string
  isActive?: boolean
  notes?: string
}

export interface EditExternalSpeakerData extends CreateExternalSpeakerData {
  id: string
}
