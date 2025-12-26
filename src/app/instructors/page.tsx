'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'

interface Instructor {
  id: string
  tcKimlikNo: string // KKTC Kimlik No (10 hane)
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  instructorType: 'CADRE' | 'EXTERNAL'
  rank: string | null
  badgeNumber: string | null
  institution: string | null
  branch: string | null
  isActive: boolean
  _count: {
    courseInstructors: number
    dailyLessons: number
  }
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchInstructors()
  }, [])

  const fetchInstructors = async () => {
    try {
      const res = await fetch('/api/instructors')
      const data = await res.json()
      setInstructors(data.instructors || [])
    } catch (error) {
      console.error('Instructors fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInstructors = instructors.filter((instructor) => {
    if (typeFilter === 'ALL') return true
    return instructor.instructorType === typeFilter
  })

  const typeLabels = {
    CADRE: 'Kadrolu',
    EXTERNAL: 'Dış Kaynak',
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
          <h1 className="text-3xl font-bold">👨‍🏫 Eğitmenler</h1>
        </div>
        <Link
          href="/instructors/new"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Icon icon="ph:plus-bold" width="20" />
          Yeni Eğitmen Ekle
        </Link>
      </div>

      {/* Filtre */}
      {instructors.length > 0 && (
        <div className="mb-6">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            <option value="ALL">Tüm Eğitmenler</option>
            <option value="CADRE">👮 Kadrolu Personel</option>
            <option value="EXTERNAL">🎓 Dış Kaynak</option>
          </select>
          <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
            {filteredInstructors.length} eğitmen bulundu
          </span>
        </div>
      )}

      {/* Eğitmen Listesi */}
      {instructors.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Icon icon="ph:user-circle-bold" width="64" className="mx-auto mb-4 text-gray-400" />
          <p className="text-xl text-gray-600 dark:text-gray-400">Henüz eğitmen eklenmemiş</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Yeni eğitmen eklemek için yukarıdaki butonu kullanın
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.map((instructor) => (
            <div
              key={instructor.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-300">
                  {instructor.firstName.charAt(0)}{instructor.lastName.charAt(0)}
                </div>
                <div className="flex flex-col gap-1">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      instructor.instructorType === 'CADRE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {typeLabels[instructor.instructorType]}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      instructor.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {instructor.isActive ? '✓ Aktif' : '⏸ Pasif'}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-1">
                {instructor.rank && `${instructor.rank} `}
                {instructor.firstName} {instructor.lastName}
              </h3>

              {instructor.branch && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                  {instructor.branch}
                </p>
              )}

              {instructor.instructorType === 'EXTERNAL' && instructor.institution && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {instructor.institution}
                </p>
              )}

              <div className="space-y-2 text-sm">
                {instructor.email && (
                  <div className="flex items-center gap-2">
                    <Icon icon="ph:envelope-bold" width="16" className="text-gray-500" />
                    <span className="truncate">{instructor.email}</span>
                  </div>
                )}
                {instructor.phone && (
                  <div className="flex items-center gap-2">
                    <Icon icon="ph:phone-bold" width="16" className="text-gray-500" />
                    <span>{instructor.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  📚 {instructor._count.courseInstructors} ders
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  📝 {instructor._count.dailyLessons} kayıt
                </span>
              </div>

              {/* İşlem Butonları */}
              <div className="mt-4 pt-4 border-t flex gap-2">
                <Link
                  href={`/instructors/${instructor.id}`}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
                >
                  <Icon icon="ph:eye-bold" width="16" />
                  Detay
                </Link>
                <button
                  onClick={() => alert('Düzenle modalı yakında eklenecek')}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
                >
                  <Icon icon="ph:pencil-bold" width="16" />
                  Düzenle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

