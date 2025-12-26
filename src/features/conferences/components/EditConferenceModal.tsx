'use client'

import { FormEvent } from 'react'
import { Modal } from '@/shared/components'
import { useEditConference } from '../hooks/useEditConference'
import { Conference, CONFERENCE_STATUS_CONFIG, SPECIAL_ROOM_TYPES, ConferenceStatus } from '../types'
import { Icon } from '@iconify/react'

interface EditConferenceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
  conference: Conference | null
}

export default function EditConferenceModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
  conference,
}: EditConferenceModalProps) {
  const {
    conferenceTitle,
    topic,
    description,
    externalSpeakerId,
    scheduledDate,
    duration,
    startSlot,
    endSlot,
    isAllClasses,
    requiresSpecialRoom,
    specialRoomType,
    requiredEquipment,
    countsTowardCurriculum,
    status,
    notes,
    isSubmitting,
    externalSpeakers,
    setConferenceTitle,
    setTopic,
    setDescription,
    setExternalSpeakerId,
    setScheduledDate,
    setDuration,
    setStartSlot,
    setEndSlot,
    setIsAllClasses,
    setRequiresSpecialRoom,
    setSpecialRoomType,
    setRequiredEquipment,
    setCountsTowardCurriculum,
    setStatus,
    setNotes,
    handleSubmit,
  } = useEditConference({ isOpen, conference, onSuccess, onError })

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await handleSubmit()
    if (!isSubmitting) {
      onClose()
    }
  }

  if (!conference) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✏️ Konferans Düzenle" size="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Konferans Başlığı */}
        <div>
          <label className="block mb-2 font-medium">
            Konferans Başlığı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={conferenceTitle}
            onChange={(e) => setConferenceTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Konu */}
        <div>
          <label className="block mb-2 font-medium">
            Konu <span className="text-red-500">*</span>
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            rows={2}
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
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Dış Konuşmacı */}
        <div>
          <label className="block mb-2 font-medium">Dış Konuşmacı</label>
          <select
            value={externalSpeakerId || ''}
            onChange={(e) => setExternalSpeakerId(e.target.value || null)}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Konuşmacı Seçin</option>
            {externalSpeakers.map((speaker) => (
              <option key={speaker.id} value={speaker.id}>
                {speaker.title ? `${speaker.title} ` : ''}
                {speaker.firstName} {speaker.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Tarih ve Süre */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 font-medium">Tarih</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Süre (Ders Saati)</label>
            <input
              type="number"
              min="1"
              max="7"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 2)}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Durum</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ConferenceStatus)}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              {Object.entries(CONFERENCE_STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ders Saatleri */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">Başlangıç Ders Saati</label>
            <select
              value={startSlot || ''}
              onChange={(e) => setStartSlot(e.target.value ? parseInt(e.target.value) : null)}
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
          <div>
            <label className="block mb-2 font-medium">Bitiş Ders Saati</label>
            <select
              value={endSlot || ''}
              onChange={(e) => setEndSlot(e.target.value ? parseInt(e.target.value) : null)}
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
              checked={isAllClasses}
              onChange={(e) => setIsAllClasses(e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="font-medium">Tüm Sınıflar</span>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={requiresSpecialRoom}
              onChange={(e) => setRequiresSpecialRoom(e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="font-medium">Özel Salon Gerekli</span>
          </label>

          {requiresSpecialRoom && (
            <div>
              <label className="block mb-2 font-medium">Salon Tipi</label>
              <select
                value={specialRoomType || ''}
                onChange={(e) => setSpecialRoomType(e.target.value || null)}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Seçin</option>
                {SPECIAL_ROOM_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={countsTowardCurriculum}
              onChange={(e) => setCountsTowardCurriculum(e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="font-medium">Müfredattan Sayılır</span>
          </label>
        </div>

        {/* Notlar */}
        <div>
          <label className="block mb-2 font-medium">Notlar</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
