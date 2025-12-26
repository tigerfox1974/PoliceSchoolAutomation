'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ExternalSpeaker {
  id: string
  firstName: string
  lastName: string
  title: string | null
  organization: string | null
  department: string | null
  email: string | null
  phone: string | null
  expertise: any
  bio: string | null
  isActive: boolean
  _count: {
    conferences: number
  }
}

export default function ExternalSpeakersPage() {
  const [speakers, setSpeakers] = useState<ExternalSpeaker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSpeakers()
  }, [])

  const fetchSpeakers = async () => {
    try {
      const res = await fetch('/api/external-speakers')
      const data = await res.json()
      setSpeakers(data.externalSpeakers || [])
    } catch (error) {
      console.error('Dıştan gelen eğitmenler yüklenemedi:', error)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Ana Sayfa
          </Link>
          <h1 className="text-3xl font-bold">👨‍🏫 Dıştan Gelen Eğitmenler</h1>
        </div>
        <button
          onClick={() => alert('Yeni eğitmen oluşturma formu yakında eklenecek')}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          + Yeni Eğitmen
        </button>
      </div>

      {speakers.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Henüz dıştan gelen eğitmen eklenmemiş
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Konferanslar ve özel dersler için davet edeceğiniz uzman eğitmenleri buradan yönetin
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {speakers.map((speaker) => (
            <div
              key={speaker.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-300">
                    {speaker.firstName.charAt(0)}{speaker.lastName.charAt(0)}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      speaker.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {speaker.isActive ? '✓ Aktif' : '⏸️ Pasif'}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-1">
                  {speaker.title ? `${speaker.title} ` : ''}
                  {speaker.firstName} {speaker.lastName}
                </h3>

                {speaker.organization && (
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {speaker.organization}
                  </p>
                )}

                {speaker.department && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {speaker.department}
                  </p>
                )}
              </div>

              {speaker.bio && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                  {speaker.bio}
                </p>
              )}

              <div className="space-y-2 text-sm">
                {speaker.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">📧</span>
                    <a
                      href={`mailto:${speaker.email}`}
                      className="text-blue-600 hover:underline break-all"
                    >
                      {speaker.email}
                    </a>
                  </div>
                )}

                {speaker.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">📞</span>
                    <a
                      href={`tel:${speaker.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {speaker.phone}
                    </a>
                  </div>
                )}

                {speaker.expertise && Array.isArray(speaker.expertise) && speaker.expertise.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Uzmanlık Alanları:</p>
                    <div className="flex flex-wrap gap-1">
                      {speaker.expertise.map((exp: string, index: number) => (
                        <span
                          key={index}
                          className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">🎤 Konferanslar:</span>
                    <span className="font-bold text-lg">{speaker._count.conferences}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

