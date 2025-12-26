'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Modal } from '@/shared/components'
import { Instructor } from '../types'

interface EditInstructorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
  instructor: Instructor | null
}

export default function EditInstructorModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
  instructor,
}: EditInstructorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    instructorType: 'CADRE' as 'CADRE' | 'EXTERNAL',
    rank: '',
    badgeNumber: '',
    institution: '',
    branch: '',
    isActive: true,
  })

  useEffect(() => {
    if (instructor && isOpen) {
      setFormData({
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        email: instructor.email || '',
        phone: instructor.phone || '',
        instructorType: instructor.instructorType,
        rank: instructor.rank || '',
        badgeNumber: instructor.badgeNumber || '',
        institution: instructor.institution || '',
        branch: instructor.branch || '',
        isActive: instructor.isActive,
      })
    }
  }, [instructor, isOpen])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // FormData'yı temizle (boş string'leri null'a çevir)
      const submitData = {
        ...formData,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        rank: formData.rank.trim() || null,
        badgeNumber: formData.badgeNumber.trim() || null,
        institution: formData.institution.trim() || null,
        branch: formData.branch.trim() || null,
      }

      const res = await fetch(`/api/instructors/${instructor?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      const data = await res.json()

      if (res.ok) {
        onSuccess('Eğitmen başarıyla güncellendi')
        onClose()
      } else {
        onError(data.error || 'Eğitmen güncellenemedi')
      }
    } catch (error) {
      onError('Sunucu hatası')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  if (!instructor) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✏️ Eğitmen Düzenle" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Temel Bilgiler */}
        <div className="space-y-4">
          <h3 className="font-semibold border-b pb-2">Temel Bilgiler</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Ad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Soyad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">E-posta</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Telefon</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Eğitmen Tipi */}
        <div className="space-y-4">
          <h3 className="font-semibold border-b pb-2">Eğitmen Tipi</h3>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tip <span className="text-red-500">*</span>
            </label>
            <select
              name="instructorType"
              value={formData.instructorType}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="CADRE">👮 Kadrolu Personel</option>
              <option value="EXTERNAL">🎓 Dıştan Gelen Eğitmen</option>
            </select>
          </div>

          {/* Kadrolu Personel Alanları */}
          {formData.instructorType === 'CADRE' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Rütbe</label>
                <input
                  type="text"
                  name="rank"
                  value={formData.rank}
                  onChange={handleChange}
                  placeholder="Örn: Komiser, Başçavuş"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sicil Numarası</label>
                <input
                  type="text"
                  name="badgeNumber"
                  value={formData.badgeNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </>
          )}

          {/* Dıştan Gelen Eğitmen Alanları */}
          {formData.instructorType === 'EXTERNAL' && (
            <div>
              <label className="block text-sm font-medium mb-2">Kurum</label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                placeholder="Örn: Savcılık, Üniversite"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          )}

          {/* Ortak Alan */}
          <div>
            <label className="block text-sm font-medium mb-2">Branş/Uzmanlık Alanı</label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              placeholder="Örn: Ceza Hukuku, İtfaiye Teknikleri"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Durum */}
        <div className="space-y-4">
          <h3 className="font-semibold border-b pb-2">Durum</h3>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-5 h-5 rounded text-blue-600"
            />
            <label className="font-medium">✓ Aktif Eğitmen</label>
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

