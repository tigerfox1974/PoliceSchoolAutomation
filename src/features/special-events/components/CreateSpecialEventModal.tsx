'use client'

import { FormEvent } from 'react'
import { Modal } from '@/shared/components'
import { useCreateSpecialEvent } from '../hooks/useCreateSpecialEvent'
import { EVENT_TYPE_CONFIG, DAY_OF_WEEK_LABELS, SpecialEventType } from '../types'
import { Icon } from '@iconify/react'

interface CreateSpecialEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function CreateSpecialEventModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: CreateSpecialEventModalProps) {
  const {
    eventType,
    eventTitle,
    description,
    duration,
    dayOfWeek,
    slotIndex,
    requiresInstructor,
    allClassesTogether,
    countsTowardCurriculum,
    managedBy,
    notes,
    isSubmitting,
    setEventType,
    setEventTitle,
    setDescription,
    setDuration,
    setDayOfWeek,
    setSlotIndex,
    setRequiresInstructor,
    setAllClassesTogether,
    setCountsTowardCurriculum,
    setManagedBy,
    setNotes,
    handleSubmit,
    resetForm,
  } = useCreateSpecialEvent({ isOpen, onSuccess, onError })

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await handleSubmit()
    if (!isSubmitting) {
      onClose()
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const eventTypeConfig = EVENT_TYPE_CONFIG[eventType]

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="🎪 Yeni Özel Etkinlik Oluştur" size="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Etkinlik Tipi */}
        <div>
          <label className="block mb-2 font-medium">Etkinlik Tipi</label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value as SpecialEventType)}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
          {eventTypeConfig && (
            <div className={`mt-2 p-3 rounded ${eventTypeConfig.bgColor}`}>
              <p className="text-sm flex items-center gap-2">
                <Icon icon={eventTypeConfig.icon} width="20" className={eventTypeConfig.color} />
                <span className={eventTypeConfig.color}>{eventTypeConfig.label} etkinliği</span>
              </p>
            </div>
          )}
        </div>

        {/* Etkinlik Başlığı */}
        <div>
          <label className="block mb-2 font-medium">
            Etkinlik Başlığı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            required
            placeholder="Örn: Haftalık Yoklama"
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Açıklama */}
        <div>
          <label className="block mb-2 font-medium">Açıklama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Etkinlik hakkında detaylı bilgi..."
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Süre ve Zaman Bilgileri */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 font-medium">Süre (Ders Saati)</label>
            <input
              type="number"
              min="1"
              max="7"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Haftanın Günü</label>
            <select
              value={dayOfWeek || ''}
              onChange={(e) => setDayOfWeek(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Belirtilmemiş</option>
              {Object.entries(DAY_OF_WEEK_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Ders Saati</label>
            <select
              value={slotIndex || ''}
              onChange={(e) => setSlotIndex(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Belirtilmemiş</option>
              {[1, 2, 3, 4, 5, 6, 7].map((slot) => (
                <option key={slot} value={slot}>
                  {slot}. Ders
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Özellikler */}
        <div className="space-y-3">
          <label className="block font-medium">Özellikler</label>

          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={requiresInstructor}
              onChange={(e) => setRequiresInstructor(e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <span className="font-medium">Eğitmen Ataması Gerekli</span>
              <p className="text-sm text-gray-500">Bu etkinlik için eğitmen atanması gerekiyor mu?</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={allClassesTogether}
              onChange={(e) => setAllClassesTogether(e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <span className="font-medium">Tüm Sınıflar Birlikte</span>
              <p className="text-sm text-gray-500">Tüm sınıflar (A-F) aynı anda bu etkinliğe katılacak mı?</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={countsTowardCurriculum}
              onChange={(e) => setCountsTowardCurriculum(e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <span className="font-medium">Müfredattan Sayılır</span>
              <p className="text-sm text-gray-500">Bu etkinlik müfredat ilerlemesine dahil edilecek mi?</p>
            </div>
          </label>
        </div>

        {/* Yönetim Bilgileri */}
        <div>
          <label className="block mb-2 font-medium">Yöneten Kişi/Kurum</label>
          <input
            type="text"
            value={managedBy}
            onChange={(e) => setManagedBy(e.target.value)}
            placeholder="Örn: Okul Müdürü, Eğitmen Gözetmenliği"
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Notlar */}
        <div>
          <label className="block mb-2 font-medium">Notlar</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Ek notlar..."
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Oluşturuluyor...' : 'Etkinlik Oluştur'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
