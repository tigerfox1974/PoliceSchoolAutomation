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
          {/* Temel Bilgiler */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Temel Bilgiler</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Ders Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Ders Kodu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 uppercase"
              />
              <p className="text-sm text-gray-500 mt-1">Otomatik olarak büyük harfe çevrilecek</p>
            </div>
          </div>

          {/* Saat Hedefleri */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Dönem Hedef Saatleri</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  4 Aylık Dönem (Saat)
                </label>
                <input
                  type="number"
                  value={formData.fourMonthHours}
                  onChange={(e) => setFormData({ ...formData, fourMonthHours: e.target.value })}
                  placeholder="40"
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  6 Aylık Dönem (Saat)
                </label>
                <input
                  type="number"
                  value={formData.sixMonthHours}
                  onChange={(e) => setFormData({ ...formData, sixMonthHours: e.target.value })}
                  placeholder="60"
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">En az birini girmeniz gerekiyor</p>
          </div>

          {/* Program Kapsamı */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Program Özellikleri</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Program Kapsamı <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.programScope}
                onChange={(e) => setFormData({ ...formData, programScope: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="COMMON">🔵 Ortak (Hem Polis hem İtfaiye)</option>
                <option value="POLIS_ONLY">🟢 Sadece Polis</option>
                <option value="ITFAIYE_ONLY">🔴 Sadece İtfaiye</option>
              </select>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <input
                type="checkbox"
                checked={formData.requiresLab}
                onChange={(e) => setFormData({ ...formData, requiresLab: e.target.checked })}
                className="w-5 h-5 rounded text-blue-600"
              />
              <div>
                <label className="font-medium cursor-pointer">
                  💻 Bilgisayar Laboratuvarı Gerekli
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bu ders Bilgisayar Lab'da yapılacak
                </p>
              </div>
            </div>
          </div>

          {/* Opsiyonel Bilgiler */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Ek Bilgiler (Opsiyonel)</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Kredi</label>
              <input
                type="number"
                value={formData.credit}
                onChange={(e) => setFormData({ ...formData, credit: e.target.value })}
                placeholder="3"
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Açıklama</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Dersin içeriği ve detayları..."
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Icon icon="ph:circle-notch" width="20" className="animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <Icon icon="ph:check-bold" width="20" />
                  Güncelle
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Temel Bilgiler */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Ders Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">4 Aylık Hedef</span>
                <p className="text-2xl font-bold">{course.fourMonthHours || '-'} <span className="text-base text-gray-500">saat</span></p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">6 Aylık Hedef</span>
                <p className="text-2xl font-bold">{course.sixMonthHours || '-'} <span className="text-base text-gray-500">saat</span></p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Program Kapsamı</span>
                <p className="text-lg font-semibold">{scopeLabels[course.programScope]}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Lab Gereksinimi</span>
                <p className="text-lg font-semibold">{course.requiresLab ? '💻 Gerekli' : '📖 Gerekmiyor'}</p>
              </div>
              {course.credit && (
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Kredi</span>
                  <p className="text-lg font-semibold">{course.credit}</p>
                </div>
              )}
            </div>
          </div>

          {/* Açıklama */}
          {course.description && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Açıklama</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{course.description}</p>
            </div>
          )}

          {/* Alt Dersler */}
          {course.subCourses.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Alt Dersler ({course.subCourses.length})</h2>
              <div className="space-y-2">
                {course.subCourses.map((sub: any) => (
                  <div key={sub.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-lg">{sub.name}</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{sub.code}</p>
                      </div>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        %{sub.weightPercentage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* İstatistikler */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">İstatistikler</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{course._count.courseInstructors}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">👨‍🏫 Eğitmen</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{course._count.subCourses}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">📚 Alt Ders</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">{course._count.dailyLessons}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">📝 Ders Kaydı</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

