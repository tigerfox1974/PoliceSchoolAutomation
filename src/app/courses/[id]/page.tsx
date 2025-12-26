'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'

interface Course {
  id: string
  name: string
  code: string
  fourMonthHours: number | null
  sixMonthHours: number | null
  requiresLab: boolean
  programScope: string
  credit: number | null
  description: string | null
  parentCourse: any
  subCourses: any[]
  courseInstructors: any[]
  _count: {
    dailyLessons: number
    subCourses: number
    courseInstructors: number
  }
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    fetchCourse()
  }, [params.id])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${params.id}`)
      const data = await res.json()
      
      if (res.ok) {
        setCourse(data.course)
        setFormData({
          name: data.course.name,
          code: data.course.code,
          fourMonthHours: data.course.fourMonthHours || '',
          sixMonthHours: data.course.sixMonthHours || '',
          requiresLab: data.course.requiresLab,
          programScope: data.course.programScope,
          credit: data.course.credit || '',
          description: data.course.description || '',
        })
      }
    } catch (error) {
      console.error('Course fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/courses/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        alert('✅ Ders güncellendi!')
        setEditing(false)
        fetchCourse()
      } else {
        const data = await res.json()
        alert('❌ Hata: ' + (data.error || 'Güncellenemedi'))
      }
    } catch (error) {
      alert('❌ Sunucu hatası')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu dersi silmek istediğinizden emin misiniz?')) return

    try {
      const res = await fetch(`/api/courses/${params.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('✅ Ders silindi!')
        router.push('/courses')
      } else {
        const data = await res.json()
        alert('❌ ' + (data.error || 'Silinemedi'))
      }
    } catch (error) {
      alert('❌ Sunucu hatası')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Ders bulunamadı</p>
      </div>
    )
  }

  const scopeLabels: Record<string, string> = {
    COMMON: 'Ortak',
    POLIS_ONLY: 'Sadece Polis',
    ITFAIYE_ONLY: 'Sadece İtfaiye',
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/courses" className="text-blue-600 hover:underline mb-2 inline-flex items-center gap-2">
          <Icon icon="ph:arrow-left-bold" width="20" />
          Derslere Dön
        </Link>
        <div className="flex justify-between items-start mt-4">
          <div>
            <h1 className="text-3xl font-bold">{course.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{course.code}</p>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Icon icon="ph:pencil-bold" width="20" />
                  Düzenle
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Icon icon="ph:trash-bold" width="20" />
                  Sil
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                İptal
              </button>
            )}
          </div>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleUpdate} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Ders Adı</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Ders Kodu</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">4 Aylık (Saat)</label>
              <input
                type="number"
                value={formData.fourMonthHours}
                onChange={(e) => setFormData({ ...formData, fourMonthHours: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">6 Aylık (Saat)</label>
              <input
                type="number"
                value={formData.sixMonthHours}
                onChange={(e) => setFormData({ ...formData, sixMonthHours: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Güncelle
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Ders Bilgileri</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">4 Aylık Hedef</span>
                <p className="text-lg font-semibold">{course.fourMonthHours || '-'} saat</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">6 Aylık Hedef</span>
                <p className="text-lg font-semibold">{course.sixMonthHours || '-'} saat</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Program Kapsamı</span>
                <p className="text-lg font-semibold">{scopeLabels[course.programScope]}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Lab Gereksinimi</span>
                <p className="text-lg font-semibold">{course.requiresLab ? '💻 Gerekli' : '📖 Gerekmiyor'}</p>
              </div>
            </div>
          </div>

          {course.subCourses.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Alt Dersler ({course.subCourses.length})</h2>
              <div className="space-y-2">
                {course.subCourses.map((sub: any) => (
                  <div key={sub.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">{sub.name}</span>
                      <span className="text-gray-600">%{sub.weightPercentage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

