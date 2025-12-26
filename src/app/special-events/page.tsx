'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { ConfirmDialog, ToastContainer } from '@/shared/components'
import {
  CreateSpecialEventModal,
  EditSpecialEventModal,
  SpecialEventListItem,
} from '@/features/special-events/components'
import { useSpecialEvents } from '@/features/special-events/hooks'
import { SpecialEvent } from '@/features/special-events/types'

export default function SpecialEventsPage() {
  const { specialEvents, loading, error, refetch } = useSpecialEvents()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<SpecialEvent | null>(null)

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'danger' | 'warning' | 'info'
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {},
  })

  const [toasts, setToasts] = useState<Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  }>>([])

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const handleEdit = (event: SpecialEvent) => {
    setEditingEvent(event)
    setShowEditModal(true)
  }

  const handleDelete = (event: SpecialEvent) => {
    setConfirmDialog({
      isOpen: true,
      title: '🗑️ Özel Etkinliği Sil',
      message: `"${event.eventTitle}" etkinliğini silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/special-events/${event.id}`, {
            method: 'DELETE',
          })

          if (res.ok) {
            showToast('Özel etkinlik başarıyla silindi', 'success')
            refetch()
          } else {
            const error = await res.json()
            showToast(error.error || 'Özel etkinlik silinemedi', 'error')
          }
        } catch (error) {
          console.error('Delete error:', error)
          showToast('Sunucu hatası', 'error')
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      },
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer
        toasts={toasts.map((toast) => ({ ...toast, onClose: removeToast }))}
      />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">🎪 Özel Etkinlikler Yönetimi</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Icon icon="ph:plus-bold" width="20" />
          Yeni Etkinlik Oluştur
        </button>
      </div>

      {specialEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Icon icon="ph:calendar-x-bold" width="64" className="mx-auto mb-4 text-gray-400" />
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            Henüz özel etkinlik oluşturulmamış
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            YOKLAMA, MÜDİRİYET, KONFERANS gibi özel etkinlikler oluşturmak için yukarıdaki butona tıklayın
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialEvents.map((event) => (
            <SpecialEventListItem
              key={event.id}
              specialEvent={event}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CreateSpecialEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(msg) => {
          showToast(msg, 'success')
          refetch()
          setShowCreateModal(false)
        }}
        onError={(msg) => showToast(msg, 'error')}
      />

      <EditSpecialEventModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingEvent(null)
        }}
        onSuccess={(msg) => {
          showToast(msg, 'success')
          refetch()
          setShowEditModal(false)
          setEditingEvent(null)
        }}
        onError={(msg) => showToast(msg, 'error')}
        specialEvent={editingEvent}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  )
}
