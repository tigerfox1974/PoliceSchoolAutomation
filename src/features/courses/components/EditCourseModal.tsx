'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Modal } from '@/shared/components'

interface Course {
  id: string
  name: string
  code: string
  fourMonthHours: number | null
  sixMonthHours: number | null
  requiresLab: boolean
  programScope: string
  credit: number | null
  description: string | null
}

interface EditCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
  course: Course | null
}

export default function EditCourseModal({ isOpen, onClose, onSuccess, onError, course }: EditCourseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    fourMonthHours: '',
    sixMonthHours: '',
    requiresLab: false,
    programScope: 'COMMON',
    credit: '',
    description: '',
  })

  useEffect(() => {
    if (course && isOpen) {
      setFormData({
        name: course.name,
        code: course.code,
        fourMonthHours: course.fourMonthHours?.toString() || '',
        sixMonthHours: course.sixMonthHours?.toString() || '',
        requiresLab: course.requiresLab,
        programScope: course.programScope,
        credit: course.credit?.toString() || '',
        description: course.description || '',
      })
    }
  }, [course, isOpen])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/courses/${course?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        onSuccess('Ders başarıyla güncellendi')
        onClose()
      } else {
        onError(data.error || 'Ders güncellenemedi')
      }
    } catch (error) {
      onError('Sunucu hatası')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  if (!course) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✏️ Ders Düzenle" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Temel Bilgiler */}
        <div className="space-y-4">
          <h3 className="font-semibold border-b pb-2">Temel Bilgiler</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">Ders Adı *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ders Kodu *</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 uppercase"
            />
          </div>
        </div>

        {/* Hedef Saatler */}
        <div className="space-y-4">
          <h3 className="font-semibold border-b pb-2">Dönem Hedef Saatleri</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">4 Aylık (Saat)</label>
              <input
                type="number"
                name="fourMonthHours"
                value={formData.fourMonthHours}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">6 Aylık (Saat)</label>
              <input
                type="number"
                name="sixMonthHours"
                value={formData.sixMonthHours}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Program Özellikleri */}
        <div className="space-y-4">
          <h3 className="font-semibold border-b pb-2">Program Özellikleri</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">Program Kapsamı *</label>
            <select
              name="programScope"
              value={formData.programScope}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="COMMON">🔵 Ortak (Hem Polis hem İtfaiye)</option>
              <option value="POLIS_ONLY">🟢 Sadece Polis</option>
              <option value="ITFAIYE_ONLY">🔴 Sadece İtfaiye</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="requiresLab"
              checked={formData.requiresLab}
              onChange={handleChange}
              className="w-5 h-5 rounded text-blue-600"
            />
            <label className="font-medium">💻 Bilgisayar Laboratuvarı Gerekli</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Kredi</label>
            <input
              type="number"
              name="credit"
              value={formData.credit}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Açıklama</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

