'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Conference {
  id: string
  conferenceTitle: string
  topic: string
  description: string | null
  scheduledDate: string | null
  duration: number
  startSlot: number | null
  endSlot: number | null
  isAllClasses: boolean
  requiresSpecialRoom: boolean
  specialRoomType: string | null
  countsTowardCurriculum: boolean
  status: 'PLANNED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  externalSpeaker: {
    id: string
    firstName: string
    lastName: string
    title: string | null
    organization: string | null
  } | null
  course: {
    id: string
    name: string
    code: string
  } | null
  _count: {
    dailyLessons: number
  }
}

export default function ConferencesPage() {
  const [conferences, setConferences] = useState<Conference[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConferences()
  }, [])

  const fetchConferences = async () => {
    try {
      const res = await fetch('/api/conferences')
      const data = await res.json()
      setConferences(data.conferences || [])
    } catch (error) {
      console.error('Konferanslar yüklenemedi:', error)
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

  const statusConfig = {
    PLANNED: { label: 'Planlandı', color: 'bg-yellow-100 text-yellow-800', icon: '📅' },
    CONFIRMED: { label: 'Onaylandı', color: 'bg-blue-100 text-blue-800', icon: '✅' },
    COMPLETED: { label: 'Tamamlandı', color: 'bg-green-100 text-green-800', icon: '✓' },
    CANCELLED: { label: 'İptal', color: 'bg-red-100 text-red-800', icon: '❌' },
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Ana Sayfa
          </Link>
          <h1 className="text-3xl font-bold">🎤 Konferanslar</h1>
        </div>
        <button
          onClick={() => alert('Yeni konferans oluşturma formu yakında eklenecek')}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          + Yeni Konferans
        </button>
      </div>

      {conferences.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Henüz konferans oluşturulmamış
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Dış konuşmacılar ile düzenlenecek konferansları buradan yönetin
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conferences.map((conf) => {
            const status = statusConfig[conf.status]
            
            return (
              <div
                key={conf.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6"
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${status.color}`}>
                      {status.icon} {status.label}
                    </span>
                    {conf.countsTowardCurriculum && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Müfredat
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{conf.conferenceTitle}</h3>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                    {conf.topic}
                  </p>
                </div>

                {conf.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                    {conf.description}
                  </p>
                )}

                {conf.externalSpeaker && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {conf.externalSpeaker.title ? `${conf.externalSpeaker.title} ` : ''}
                      {conf.externalSpeaker.firstName} {conf.externalSpeaker.lastName}
                    </p>
                    {conf.externalSpeaker.organization && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {conf.externalSpeaker.organization}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  {conf.scheduledDate && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">📅 Tarih:</span>
                      <span className="font-medium">
                        {new Date(conf.scheduledDate).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">⏱️ Süre:</span>
                    <span className="font-medium">{conf.duration} saat</span>
                  </div>

                  {conf.startSlot && conf.endSlot && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">🕐 Saatler:</span>
                      <span className="font-medium">{conf.startSlot}. - {conf.endSlot}. ders</span>
                    </div>
                  )}

                  {conf.course && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">📚 Ders:</span>
                      <span className="font-medium">{conf.course.name}</span>
                    </div>
                  )}

                  {conf.requiresSpecialRoom && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">🏛️ Özel Mekan:</span>
                      <span className="font-medium">{conf.specialRoomType || 'Gerekli'}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">📊 Programda:</span>
                      <span className="font-medium">{conf._count.dailyLessons} kayıt</span>
                    </div>
                  </div>

                  {conf.isAllClasses && (
                    <div className="mt-3">
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Tüm Sınıflar
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

