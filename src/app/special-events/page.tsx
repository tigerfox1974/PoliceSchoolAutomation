'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface SpecialEvent {
  id: string
  eventType: string
  eventTitle: string
  description: string
  duration: number
  dayOfWeek: number | null
  slotIndex: number | null
  requiresInstructor: boolean
  allClassesTogether: boolean
  countsTowardCurriculum: boolean
  managedBy: string | null
  _count: {
    dailyLessons: number
  }
}

export default function SpecialEventsPage() {
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    )
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Ana Sayfa
          </Link>
          <h1 className="text-3xl font-bold">🎯 Özel Etkinlikler</h1>
        </div>
        <button
          onClick={() => alert('Yeni etkinlik oluşturma formu yakında eklenecek')}
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

                <div className="flex gap-2 mt-4">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

