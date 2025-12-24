'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Modal } from '@/shared/components'
import { Term } from '../types'

interface EditTermModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
  term: Term | null
}

interface EditFormData {
  termNumber: number
  termType: 'POLICE' | 'FIRE'
  duration: 'FOUR_MONTHS' | 'SIX_MONTHS'
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
}

export default function EditTermModal({ isOpen, onClose, onSuccess, onError, term }: EditTermModalProps) {
  const [formData, setFormData] = useState<EditFormData>({
    termNumber: 0,
    termType: 'POLICE',
    duration: 'FOUR_MONTHS',
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
  })

  // Bitiş tarihini otomatik hesapla
  const calculateEndDate = (startDate: string, duration: 'FOUR_MONTHS' | 'SIX_MONTHS'): string => {
    if (!startDate) return ''
    const start = new Date(startDate)
    const months = duration === 'FOUR_MONTHS' ? 4 : 6
    const end = new Date(start.setMonth(start.getMonth() + months))
    return end.toISOString().split('T')[0]
  }

  useEffect(() => {
    if (term) {
      setFormData({
        termNumber: term.termNumber,
        termType: term.termType,
        duration: term.duration,
        startDate: term.startDate.split('T')[0],
        endDate: term.endDate.split('T')[0],
        status: term.status,
      })
    }
  }, [term])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!term) return

    try {
      const res = await fetch(`/api/terms/${term.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        onSuccess('Dönem başarıyla güncellendi')
        onClose()
      } else {
        const error = await res.json()
        onError(error.error || 'Dönem güncellenemedi')
      }
    } catch (error) {
      console.error('Edit error:', error)
      onError('Sunucu hatası')
    }
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
            onChange={(e) => setFormData({ ...formData, termType: e.target.value as 'POLICE' | 'FIRE' })}
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
            onChange={(e) => setFormData({ ...formData, termNumber: parseInt(e.target.value) || 0 })}
            required
            min="1"
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Kurs Süresi</label>
          <select
            value={formData.duration}
            onChange={(e) => {
              const newDuration = e.target.value as 'FOUR_MONTHS' | 'SIX_MONTHS'
              const newEndDate = formData.startDate ? calculateEndDate(formData.startDate, newDuration) : formData.endDate
              setFormData({ ...formData, duration: newDuration, endDate: newEndDate })
            }}
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
              onChange={(e) => {
                const newStartDate = e.target.value
                const newEndDate = calculateEndDate(newStartDate, formData.duration)
                setFormData({ ...formData, startDate: newStartDate, endDate: newEndDate })
              }}
              required
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Bitiş Tarihi</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Durum</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'PAUSED' | 'ARCHIVED' })}
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
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
          >
            Güncelle
          </button>
        </div>
      </form>
    </Modal>
  )
}
