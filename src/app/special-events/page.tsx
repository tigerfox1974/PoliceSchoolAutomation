'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ConfirmDialog, ToastContainer } from '@/shared/components'

interface SpecialEvent {
  id: string
  eventType: string
  eventTitle: string
  description: string
  duration: number
  dayOfWeek: number | null
  slotIndex: number | null
  startDate?: string | null
  endDate?: string | null
  requiresInstructor: boolean
  allClassesTogether: boolean
  countsTowardCurriculum: boolean
  managedBy: string | null
  notes?: string | null
  _count: {
    dailyLessons: number
  }
}

interface SpecialEventForm {
  id?: string
  eventType: string
  eventTitle: string
  description: string
  duration: number
  dayOfWeek: string
  slotIndex: string
  startDate: string
  endDate: string
  requiresInstructor: boolean
  allClassesTogether: boolean
  countsTowardCurriculum: boolean
  managedBy: string
  notes: string
}

export default function SpecialEventsPage() {
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingEvent, setEditingEvent] = useState<SpecialEvent | null>(null)
  const [form, setForm] = useState<SpecialEventForm>({
    eventType: 'YOKLAMA',
    eventTitle: '',
    description: '',
    duration: 1,
    dayOfWeek: '',
    slotIndex: '',
    startDate: '',
    endDate: '',
    requiresInstructor: false,
    allClassesTogether: false,
    countsTowardCurriculum: false,
    managedBy: '',
    notes: '',
  })
  const [toasts, setToasts] = useState<Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  }>>([])
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

  useEffect(() => {
    fetchSpecialEvents()
  }, [])

  const fetchSpecialEvents = async () => {
    try {
      const res = await fetch('/api/special-events')
      const data = await res.json()
      setSpecialEvents(data.specialEvents || [])
    } catch (error) {
      console.error('Özel etkinlikler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const resetForm = () => {
    setForm({
      eventType: 'YOKLAMA',
      eventTitle: '',
      description: '',
      duration: 1,
      dayOfWeek: '',
      slotIndex: '',
      startDate: '',
      endDate: '',
      requiresInstructor: false,
      allClassesTogether: false,
      countsTowardCurriculum: false,
      managedBy: '',
      notes: '',
    })
  }

  const openCreateModal = () => {
    setEditingEvent(null)
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (event: SpecialEvent) => {
    setEditingEvent(event)
    setForm({
      id: event.id,
      eventType: event.eventType,
      eventTitle: event.eventTitle,
      description: event.description || '',
      duration: event.duration || 1,
      dayOfWeek: event.dayOfWeek ? String(event.dayOfWeek) : '',
      slotIndex: event.slotIndex ? String(event.slotIndex) : '',
      startDate: event.startDate ? event.startDate.split('T')[0] : '',
      endDate: event.endDate ? event.endDate.split('T')[0] : '',
      requiresInstructor: event.requiresInstructor,
      allClassesTogether: event.allClassesTogether,
      countsTowardCurriculum: event.countsTowardCurriculum,
      managedBy: event.managedBy || '',
      notes: event.notes || '',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.eventType || !form.eventTitle.trim()) {
      showToast('Etkinlik tipi ve başlık zorunludur', 'error')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        id: form.id,
        eventType: form.eventType,
        eventTitle: form.eventTitle.trim(),
        description: form.description.trim() || null,
        duration: Number(form.duration) || 1,
        dayOfWeek: form.dayOfWeek || null,
        slotIndex: form.slotIndex || null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        requiresInstructor: form.requiresInstructor,
        allClassesTogether: form.allClassesTogether,
        countsTowardCurriculum: form.countsTowardCurriculum,
        managedBy: form.managedBy.trim() || null,
        notes: form.notes.trim() || null,
      }

      const res = await fetch('/api/special-events', {
        method: editingEvent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        showToast(data.error || 'İşlem başarısız', 'error')
        return
      }

      showToast(editingEvent ? '✅ Özel etkinlik güncellendi' : '✅ Özel etkinlik oluşturuldu', 'success')
      setIsModalOpen(false)
      resetForm()
      await fetchSpecialEvents()
    } catch (error) {
      console.error('Özel etkinlik kaydetme hatası:', error)
      showToast('Sunucu hatası', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = (event: SpecialEvent) => {
    setConfirmDialog({
      isOpen: true,
      title: '🗑️ Özel Etkinliği Sil',
      message: `"${event.eventTitle}" etkinliğini silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/special-events?id=${event.id}`, {
            method: 'DELETE',
          })
          const data = await res.json().catch(() => ({}))

          if (!res.ok) {
            showToast(data.error || 'Silme başarısız', 'error')
            return
          }

          showToast('✅ Özel etkinlik silindi', 'success')
          await fetchSpecialEvents()
        } catch (error) {
          console.error('Özel etkinlik silme hatası:', error)
          showToast('Sunucu hatası', 'error')
        }
      },
    })
  }

  const eventTypeLabels: Record<string, string> = {
    YOKLAMA: '📋 Yoklama',
    MANAGEMENT: '🏛️ Müdüriyet',
    SOCIAL_SPORTS: '⚽ Sosyal ve Sportif Faaliyetler',
    CEREMONY: '🎖️ Tören',
    ORIENTATION: '🎓 İntibak Haftası',
    OTHER: '📌 Diğer',
  }

  const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
  const eventTypeOptions = [
    { value: 'YOKLAMA', label: '📋 Yoklama' },
    { value: 'MANAGEMENT', label: '🏛️ Müdüriyet' },
    { value: 'SOCIAL_SPORTS', label: '⚽ Sosyal ve Sportif Faaliyetler' },
    { value: 'CEREMONY', label: '🎖️ Tören' },
    { value: 'ORIENTATION', label: '🎓 İntibak Haftası' },
    { value: 'OTHER', label: '📌 Diğer' },
  ]

  const formatDate = (value?: string | null) => {
    if (!value) return ''
    return value.split('T')[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText="Sil"
        cancelText="Vazgeç"
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Ana Sayfa
          </Link>
          <h1 className="text-3xl font-bold">🎯 Özel Etkinlikler</h1>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          + Yeni Özel Etkinlik
        </button>
      </div>

      {specialEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Henüz özel etkinlik oluşturulmamış
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Yoklama, müdüriyet toplantısı gibi düzenli etkinlikler ekleyin
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{eventTypeLabels[event.eventType]?.split(' ')[0] || '📌'}</span>
                  {event.requiresInstructor && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Eğitmen Gerekli
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-1">{event.eventTitle}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {eventTypeLabels[event.eventType]?.split(' ').slice(1).join(' ') || event.eventType}
                </p>
              </div>

              {event.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">⏱️ Süre:</span>
                  <span className="font-medium">{event.duration} ders saati</span>
                </div>

                {event.dayOfWeek !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">📅 Gün:</span>
                    <span className="font-medium">{dayNames[event.dayOfWeek - 1] || 'Belirtilmemiş'}</span>
                  </div>
                )}

                {(event.startDate || event.endDate) && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">🗓️ Tarih:</span>
                    <span className="font-medium">
                      {formatDate(event.startDate) || 'Belirtilmemiş'}
                      {event.endDate && event.endDate !== event.startDate ? ` - ${formatDate(event.endDate)}` : ''}
                    </span>
                  </div>
                )}

                {event.slotIndex !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">🕐 Ders Saati:</span>
                    <span className="font-medium">{event.slotIndex}. saat</span>
                  </div>
                )}

                {event.managedBy && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">👤 Yönetici:</span>
                    <span className="font-medium">{event.managedBy}</span>
                  </div>
                )}

                <div className="pt-3 border-t mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">📊 Kullanım:</span>
                    <span className="font-medium">{event._count.dailyLessons} ders programında</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 flex-wrap">
                  {event.allClassesTogether && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Tüm Sınıflar
                    </span>
                  )}
                  {event.countsTowardCurriculum && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Müfredat
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEditModal(event)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(event)}
                    className="px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700 rounded"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingEvent ? '✏️ Özel Etkinlik Düzenle' : '➕ Yeni Özel Etkinlik'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Etkinlik Tipi</label>
                  <select
                    value={form.eventType}
                    onChange={(e) => setForm((prev) => ({ ...prev, eventType: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    required
                  >
                    {eventTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Etkinlik Başlığı</label>
                  <input
                    type="text"
                    value={form.eventTitle}
                    onChange={(e) => setForm((prev) => ({ ...prev, eventTitle: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Açıklama</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Süre (ders saati)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.duration}
                    onChange={(e) => setForm((prev) => ({ ...prev, duration: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Gün (opsiyonel)</label>
                  <select
                    value={form.dayOfWeek}
                    onChange={(e) => setForm((prev) => ({ ...prev, dayOfWeek: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Seçiniz</option>
                    {dayNames.map((name, idx) => (
                      <option key={name} value={String(idx + 1)}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ders Saati (opsiyonel)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={form.slotIndex}
                    onChange={(e) => setForm((prev) => ({ ...prev, slotIndex: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Başlangıç Tarihi (opsiyonel)</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bitiş Tarihi (opsiyonel)</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.requiresInstructor}
                    onChange={(e) => setForm((prev) => ({ ...prev, requiresInstructor: e.target.checked }))}
                  />
                  Eğitmen gerekli
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.allClassesTogether}
                    onChange={(e) => setForm((prev) => ({ ...prev, allClassesTogether: e.target.checked }))}
                  />
                  Tüm sınıflar birlikte
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.countsTowardCurriculum}
                    onChange={(e) => setForm((prev) => ({ ...prev, countsTowardCurriculum: e.target.checked }))}
                  />
                  Müfredattan sayılır
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Yönetici (opsiyonel)</label>
                  <input
                    type="text"
                    value={form.managedBy}
                    onChange={(e) => setForm((prev) => ({ ...prev, managedBy: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Notlar (opsiyonel)</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

