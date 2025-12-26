'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'

interface Course {
  id: string
  name: string
  code: string
  fourMonthHours: number | null
  sixMonthHours: number | null
  requiresLab: boolean
  programScope: 'COMMON' | 'POLIS_ONLY' | 'ITFAIYE_ONLY'
  credit: number | null
  description: string | null
  parentCourse: {
    id: string
    name: string
    code: string
  } | null
  subCourses: {
    id: string
    name: string
    code: string
    weightPercentage: number | null
  }[]
  _count: {
    termCoursePlans: number
    courseInstructors: number
  }
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [programScopeFilter, setProgramScopeFilter] = useState<string>('ALL')
  const [labFilter, setLabFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Dersler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtreleme
  const filteredCourses = courses.filter((course) => {
    // Arama
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())

    // Program kapsamı
    const matchesScope = programScopeFilter === 'ALL' || course.programScope === programScopeFilter

    // Lab filtresi
    const matchesLab =
      labFilter === 'ALL' ||
      (labFilter === 'LAB' && course.requiresLab) ||
      (labFilter === 'NO_LAB' && !course.requiresLab)

    return matchesSearch && matchesScope && matchesLab
  })

  const scopeLabels = {
    COMMON: 'Ortak',
    POLIS_ONLY: 'Sadece Polis',
    ITFAIYE_ONLY: 'Sadece İtfaiye',
  }

  const scopeColors = {
    COMMON: 'bg-blue-100 text-blue-800',
    POLIS_ONLY: 'bg-green-100 text-green-800',
    ITFAIYE_ONLY: 'bg-red-100 text-red-800',
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
          <h1 className="text-3xl font-bold">📚 Dersler</h1>
        </div>
        <Link
          href="/courses/new"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Icon icon="ph:plus-bold" width="20" />
          Yeni Ders Oluştur
        </Link>
      </div>

      {/* Arama ve Filtreler */}
      {courses.length > 0 && (
        <div className="mb-6 space-y-4">
          {/* Arama Çubuğu */}
          <div className="relative">
            <Icon
              icon="ph:magnifying-glass-bold"
              width="20"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ders adı veya kodu ara..."
              className="w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Icon icon="ph:x-bold" width="18" />
              </button>
            )}
          </div>

          {/* Filtreler */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={programScopeFilter}
              onChange={(e) => setProgramScopeFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="ALL">Tüm Programlar</option>
              <option value="COMMON">🔵 Ortak Dersler</option>
              <option value="POLIS_ONLY">🟢 Polis Dersleri</option>
              <option value="ITFAIYE_ONLY">🔴 İtfaiye Dersleri</option>
            </select>

            <select
              value={labFilter}
              onChange={(e) => setLabFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="ALL">Tüm Dersler</option>
              <option value="LAB">💻 Lab Gerektiren</option>
              <option value="NO_LAB">📖 Normal Dersler</option>
            </select>

            {(searchQuery || programScopeFilter !== 'ALL' || labFilter !== 'ALL') && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredCourses.length} ders bulundu
                </span>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setProgramScopeFilter('ALL')
                    setLabFilter('ALL')
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Temizle
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ders Listesi */}
      {courses.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Icon icon="ph:book-open-bold" width="64" className="mx-auto mb-4 text-gray-400" />
          <p className="text-xl text-gray-600 dark:text-gray-400">Henüz ders eklenmemiş</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Sistemi kullanmaya başlamak için önce ders tanımlarını ekleyin
          </p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Icon icon="ph:magnifying-glass-bold" width="64" className="mx-auto mb-4 text-gray-400" />
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            Arama kriterlerine uygun ders bulunamadı
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Farklı filtreler veya arama terimleri deneyin
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6"
            >
              <Link href={`/courses/${course.id}`} className="block">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                      {course.code}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${scopeColors[course.programScope]}`}>
                      {scopeLabels[course.programScope]}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{course.name}</h3>
                  {course.parentCourse && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Alt Ders: {course.parentCourse.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  {course.fourMonthHours && (
                    <div className="flex items-center gap-2">
                      <Icon icon="ph:calendar-bold" width="16" className="text-gray-500" />
                      <span>4 Aylık: {course.fourMonthHours} saat</span>
                    </div>
                  )}
                  {course.sixMonthHours && (
                    <div className="flex items-center gap-2">
                      <Icon icon="ph:calendar-plus-bold" width="16" className="text-gray-500" />
                      <span>6 Aylık: {course.sixMonthHours} saat</span>
                    </div>
                  )}
                  {course.requiresLab && (
                    <div className="flex items-center gap-2">
                      <Icon icon="ph:desktop-tower-bold" width="16" className="text-blue-500" />
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        Bilgisayar Lab Gerekli
                      </span>
                    </div>
                  )}
                  {course.subCourses.length > 0 && (
                    <div className="pt-2 border-t">
                      <span className="text-gray-600 dark:text-gray-400">
                        {course.subCourses.length} alt ders
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    👨‍🏫 {course._count.courseInstructors} eğitmen
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    📅 {course._count.termCoursePlans} dönem
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

