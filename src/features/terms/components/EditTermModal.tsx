'use client'

import { FormEvent } from 'react'
import { Modal } from '@/shared/components'
import { Term } from '../types'
import { useEditTerm } from '../hooks/useEditTerm'

interface EditTermModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
  term: Term | null
}

export default function EditTermModal({ isOpen, onClose, onSuccess, onError, term }: EditTermModalProps) {
  const {
    formData,
    isSubmitting,
    updateTermNumber,
    updateTermType,
    updateDuration,
    updateStartDate,
    updateEndDate,
    updateStatus,
    handleSubmit: submitForm,
  } = useEditTerm({ term, isOpen, onSuccess, onError, onClose })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    submitForm()
  }

  if (!term) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✏️ Dönem Düzenle"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Dönem Tipi</label>
          <select
            value={formData.termType}
            onChange={(e) => updateTermType(e.target.value as 'POLICE' | 'FIRE')}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="POLICE">Polis Temel Eğitimi</option>
            <option value="FIRE">İtfaiye Temel Eğitimi</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Dönem Numarası</label>
          <input
            type="number"
            value={formData.termNumber}
            onChange={(e) => updateTermNumber(parseInt(e.target.value) || 0)}
            required
            min="1"
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Kurs Süresi</label>
          <select
            value={formData.duration}
            onChange={(e) => updateDuration(e.target.value as 'FOUR_MONTHS' | 'SIX_MONTHS')}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="FOUR_MONTHS">4 Ay</option>
            <option value="SIX_MONTHS">6 Ay</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">Başlangıç Tarihi</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => updateStartDate(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Bitiş Tarihi</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => updateEndDate(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Durum</label>
          <select
            value={formData.status}
            onChange={(e) => updateStatus(e.target.value as 'ACTIVE' | 'PAUSED' | 'ARCHIVED')}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="ACTIVE">Aktif</option>
            <option value="PAUSED">Duraklatılmış</option>
            <option value="ARCHIVED">Arşivlenmiş</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 rounded transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
