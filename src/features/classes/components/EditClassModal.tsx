'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Modal } from '@/shared/components'

interface Class {
  id: string
  name: string
  code: string
  capacity: number
}

interface EditClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
  classItem: Class | null
  termId: string
}

interface CreateClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
  termId: string
}

export default function EditClassModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
  classItem,
  termId,
}: EditClassModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
  })

  useEffect(() => {
    if (classItem && isOpen) {
      setFormData({
        name: classItem.name,
        capacity: classItem.capacity.toString(),
      })
    } else if (!classItem && isOpen) {
      // Yeni sınıf oluşturma modu - formu sıfırla
      setFormData({
        name: '',
        capacity: '',
      })
    }
  }, [classItem, isOpen])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const isEditMode = classItem !== null
      const url = isEditMode
        ? `/api/terms/${termId}/classes/${classItem.id}`
        : `/api/terms/${termId}/classes`
      
      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          capacity: parseInt(formData.capacity),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        onSuccess(isEditMode ? '✅ Sınıf başarıyla güncellendi!' : '✅ Sınıf başarıyla oluşturuldu!')
        onClose()
      } else {
        onError(`❌ Hata: ${data.error || (isEditMode ? 'Sınıf güncellenemedi' : 'Sınıf oluşturulamadı')}`)
      }
    } catch (error) {
      console.error('Class operation error:', error)
      onError('❌ Sunucu hatası')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditMode = classItem !== null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Sınıf Düzenle" : "Yeni Sınıf Ekle"} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Sınıf Adı</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Örn: A Sınıfı"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Kapasite</label>
          <input
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            required
            min="1"
            placeholder="Örn: 30"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (isEditMode ? 'Güncelleniyor...' : 'Oluşturuluyor...') : (isEditMode ? 'Güncelle' : 'Oluştur')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

