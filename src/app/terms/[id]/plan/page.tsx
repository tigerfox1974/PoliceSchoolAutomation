'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { ConfirmDialog, ToastContainer } from '@/shared/components'

interface Term {
  id: string
  name: string
  termCode: string
  termType: 'POLICE' | 'FIRE'
  duration: 'FOUR_MONTHS' | 'SIX_MONTHS'
}

interface Course {
  id: string
  code: string
  name: string
  fourMonthHours: number | null
  sixMonthHours: number | null
  programScope: string
  requiresLab: boolean
}

interface TermCoursePlan {
  id: string
  termId: string
  courseId: string
  totalPlannedHours: number
  totalActualHours: number
  course: Course
}

interface SelectedCourse {
  courseId: string
  totalPlannedHours: string
  course: Course
}

export default function TermPlanPage() {
  const params = useParams()
  const router = useRouter()
  
  // params.id kontrolü ve parse
  const rawId = params?.id
  const termId = Array.isArray(rawId) ? rawId[0] : (rawId as string)
  
  // Debug: termId kontrolü
  useEffect(() => {
    console.log('TermPlanPage - params:', params)
    console.log('TermPlanPage - rawId:', rawId)
    console.log('TermPlanPage - termId:', termId)
  }, [params, rawId, termId])

  const [term, setTerm] = useState<Term | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [plans, setPlans] = useState<TermCoursePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterScope, setFilterScope] = useState<string>('ALL') // ALL, COMMON, POLIS_ONLY, ITFAIYE_ONLY

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

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  useEffect(() => {
    if (termId) {
      fetchTerm()
      fetchCourses()
      fetchPlans()
    }
  }, [termId])

  const fetchTerm = async () => {
    if (!termId) {
      setLoading(false)
      return
    }
    
    try {
      const res = await fetch(`/api/terms/${termId}`)
      const data = await res.json()
      if (res.ok) {
        setTerm(data.term)
      } else {
        console.error('Term fetch error:', data.error)
        showToast(data.error || 'Dönem yüklenemedi', 'error')
      }
    } catch (error) {
      console.error('Term fetch error:', error)
      showToast('Dönem yüklenemedi', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      if (res.ok) {
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error('Courses fetch error:', error)
    }
  }

  const fetchPlans = async () => {
    if (!termId) return
    
    try {
      const res = await fetch(`/api/terms/${termId}/course-plans`)
      const data = await res.json()
      if (res.ok) {
        setPlans(data.plans || [])
        setShowForm(data.plans.length === 0) // Eğer plan yoksa formu göster
      } else {
        console.error('Plans fetch error:', data.error)
      }
    } catch (error) {
      console.error('Plans fetch error:', error)
    }
  }

  // Filtrelenmiş dersler
  const filteredCourses = courses.filter(course => {
    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!course.name.toLowerCase().includes(query) && 
          !course.code.toLowerCase().includes(query)) {
        return false
      }
    }

    // Program kapsamı filtresi
    if (filterScope !== 'ALL') {
      if (course.programScope !== filterScope) {
        return false
      }
    } else {
      // ALL seçiliyse, dönem tipine göre filtrele
      if (term) {
        if (term.termType === 'POLICE' && course.programScope === 'ITFAIYE_ONLY') {
          return false
        }
        if (term.termType === 'FIRE' && course.programScope === 'POLIS_ONLY') {
          return false
        }
      }
    }

    // Zaten planlanmış dersleri gösterme (yeni plan oluştururken)
    if (showForm && plans.length > 0) {
      const isAlreadyPlanned = plans.some(plan => plan.courseId === course.id)
      return !isAlreadyPlanned
    }

    return true
  })

  const handleCourseToggle = (course: Course) => {
    const isSelected = selectedCourses.some(sc => sc.courseId === course.id)
    
    if (isSelected) {
      setSelectedCourses(prev => prev.filter(sc => sc.courseId !== course.id))
    } else {
      // Otomatik saat önerisi
      const suggestedHours = term?.duration === 'FOUR_MONTHS' 
        ? course.fourMonthHours 
        : course.sixMonthHours

      setSelectedCourses(prev => [...prev, {
        courseId: course.id,
        totalPlannedHours: suggestedHours ? suggestedHours.toString() : '',
        course,
      }])
    }
  }

  const handleHoursChange = (courseId: string, hours: string) => {
    setSelectedCourses(prev => prev.map(sc => 
      sc.courseId === courseId 
        ? { ...sc, totalPlannedHours: hours }
        : sc
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedCourses.length === 0) {
      showToast('En az bir ders seçmelisiniz', 'warning')
      return
    }

    // Validasyon: Tüm seçili dersler için saat girilmiş mi?
    const invalidCourses = selectedCourses.filter(sc => !sc.totalPlannedHours || parseInt(sc.totalPlannedHours) <= 0)
    if (invalidCourses.length > 0) {
      showToast('Tüm seçili dersler için geçerli bir saat girmelisiniz', 'warning')
      return
    }

    setSaving(true)

    try {
      const res = await fetch(`/api/terms/${termId}/course-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plans: selectedCourses.map(sc => ({
            courseId: sc.courseId,
            totalPlannedHours: parseInt(sc.totalPlannedHours),
          })),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        showToast(data.message || 'Dönem planı başarıyla oluşturuldu!', 'success')
        setSelectedCourses([])
        setShowForm(false)
        fetchPlans()
      } else {
        showToast(data.error || 'Plan oluşturulamadı', 'error')
      }
    } catch (error) {
      console.error('Plan create error:', error)
      showToast('Sunucu hatası', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePlan = (plan: TermCoursePlan) => {
    if (!termId) {
      showToast('Dönem ID bulunamadı', 'error')
      return
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Planı Sil',
      message: `"${plan.course.name}" dersinin planını silmek istediğinize emin misiniz?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/terms/${termId}/course-plans/${plan.id}`, {
            method: 'DELETE',
          })

          const data = await res.json()

          if (res.ok) {
            showToast('Plan başarıyla silindi', 'success')
            fetchPlans()
          } else {
            showToast(data.error || 'Plan silinemedi', 'error')
          }
        } catch (error) {
          console.error('Plan delete error:', error)
          showToast('Sunucu hatası', 'error')
        } finally {
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        }
      },
    })
  }

  // Toplam saat hesaplama
  const totalPlannedHours = plans.reduce((sum, plan) => sum + plan.totalPlannedHours, 0)
  const totalActualHours = plans.reduce((sum, plan) => sum + plan.totalActualHours, 0)

  if (!termId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Dönem ID bulunamadı</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    )
  }

  if (!term) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Dönem bulunamadı</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      {/* Başlık */}
      <div className="mb-8">
        <Link 
          href={`/terms/${termId}`} 
          className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-2"
        >
          <Icon icon="ph:arrow-left-bold" width="20" />
          Döneme Dön
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">📋 Dönem Planı</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {term.name} - {term.termCode}
            </p>
          </div>
          {plans.length > 0 && (
            <div className="flex items-center gap-3">
              <Link
                href={`/terms/${termId}/plan/monthly`}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium"
              >
                <Icon icon="ph:calendar-blank-bold" width="20" />
                Aylık Program
              </Link>
              <Link
                href={`/terms/${termId}/schedule/weekly/1`}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium"
              >
                <Icon icon="ph:calendar-week-bold" width="20" />
                Haftalık Program
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mevcut Plan Görünümü */}
      {plans.length > 0 && !showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Mevcut Plan</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Icon icon="ph:plus-bold" width="20" />
              Yeni Ders Ekle
            </button>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Planlanan Saat</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalPlannedHours}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Gerçekleşen Saat</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalActualHours}</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Planlanan Ders Sayısı</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{plans.length}</div>
            </div>
          </div>

          {/* Plan Tablosu */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold">Ders Kodu</th>
                  <th className="text-left py-3 px-4 font-semibold">Ders Adı</th>
                  <th className="text-right py-3 px-4 font-semibold">Planlanan Saat</th>
                  <th className="text-right py-3 px-4 font-semibold">Gerçekleşen Saat</th>
                  <th className="text-right py-3 px-4 font-semibold">İlerleme</th>
                  <th className="text-center py-3 px-4 font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => {
                  const progress = plan.totalPlannedHours > 0 
                    ? Math.round((plan.totalActualHours / plan.totalPlannedHours) * 100)
                    : 0

                  return (
                    <tr key={plan.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 font-mono text-sm">{plan.course.code}</td>
                      <td className="py-3 px-4">{plan.course.name}</td>
                      <td className="py-3 px-4 text-right font-semibold">{plan.totalPlannedHours}</td>
                      <td className="py-3 px-4 text-right">{plan.totalActualHours}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeletePlan(plan)}
                          className="text-red-600 hover:text-red-700 p-2"
                          title="Planı sil"
                        >
                          <Icon icon="ph:trash-bold" width="20" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Yeni Plan Formu */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {plans.length > 0 ? 'Yeni Ders Ekle' : 'Dönem Planı Oluştur'}
            </h2>
            {plans.length > 0 && (
              <button
                onClick={() => {
                  setShowForm(false)
                  setSelectedCourses([])
                }}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                İptal
              </button>
            )}
          </div>

          {/* Filtreler */}
          <div className="mb-6 flex gap-4">
            <input
              type="text"
              placeholder="Ders ara (kod veya ad)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
            <select
              value={filterScope}
              onChange={(e) => setFilterScope(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            >
              <option value="ALL">Tümü</option>
              <option value="COMMON">Ortak</option>
              <option value="POLIS_ONLY">Sadece Polis</option>
              <option value="ITFAIYE_ONLY">Sadece İtfaiye</option>
            </select>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Ders Listesi */}
            <div className="max-h-96 overflow-y-auto mb-6 border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold w-12">
                      <input
                        type="checkbox"
                        checked={filteredCourses.length > 0 && filteredCourses.every(course => 
                          selectedCourses.some(sc => sc.courseId === course.id)
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            filteredCourses.forEach(course => {
                              if (!selectedCourses.some(sc => sc.courseId === course.id)) {
                                const suggestedHours = term.duration === 'FOUR_MONTHS' 
                                  ? course.fourMonthHours 
                                  : course.sixMonthHours
                                setSelectedCourses(prev => [...prev, {
                                  courseId: course.id,
                                  totalPlannedHours: suggestedHours ? suggestedHours.toString() : '',
                                  course,
                                }])
                              }
                            })
                          } else {
                            setSelectedCourses(prev => prev.filter(sc => 
                              !filteredCourses.some(course => course.id === sc.courseId)
                            ))
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">Ders Kodu</th>
                    <th className="text-left py-3 px-4 font-semibold">Ders Adı</th>
                    <th className="text-left py-3 px-4 font-semibold">Program Kapsamı</th>
                    <th className="text-right py-3 px-4 font-semibold">Önerilen Saat</th>
                    <th className="text-right py-3 px-4 font-semibold">Hedef Saat</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        {searchQuery ? 'Arama sonucu bulunamadı' : 'Ders bulunamadı'}
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((course) => {
                      const isSelected = selectedCourses.some(sc => sc.courseId === course.id)
                      const selectedCourse = selectedCourses.find(sc => sc.courseId === course.id)
                      const suggestedHours = term.duration === 'FOUR_MONTHS' 
                        ? course.fourMonthHours 
                        : course.sixMonthHours

                      return (
                        <tr 
                          key={course.id} 
                          className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                            isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCourseToggle(course)}
                              className="rounded"
                            />
                          </td>
                          <td className="py-3 px-4 font-mono text-sm">{course.code}</td>
                          <td className="py-3 px-4">{course.name}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              course.programScope === 'COMMON' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              course.programScope === 'POLIS_ONLY' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {course.programScope === 'COMMON' ? 'Ortak' :
                               course.programScope === 'POLIS_ONLY' ? 'Sadece Polis' :
                               'Sadece İtfaiye'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {suggestedHours ? (
                              <span className="text-gray-600 dark:text-gray-400">{suggestedHours} saat</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {isSelected ? (
                              <input
                                type="number"
                                min="1"
                                value={selectedCourse?.totalPlannedHours || ''}
                                onChange={(e) => handleHoursChange(course.id, e.target.value)}
                                placeholder={suggestedHours ? suggestedHours.toString() : 'Saat'}
                                className="w-24 px-2 py-1 border rounded text-right focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                required
                              />
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Önizleme */}
            {selectedCourses.length > 0 && (
              <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Seçili Dersler ({selectedCourses.length})</h3>
                <div className="space-y-2">
                  {selectedCourses.map((sc) => {
                    const totalHours = parseInt(sc.totalPlannedHours) || 0
                    return (
                      <div key={sc.courseId} className="flex justify-between items-center">
                        <span>{sc.course.name}</span>
                        <span className="font-semibold">{totalHours} saat</span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600 flex justify-between items-center font-bold">
                  <span>Toplam:</span>
                  <span>
                    {selectedCourses.reduce((sum, sc) => sum + (parseInt(sc.totalPlannedHours) || 0), 0)} saat
                  </span>
                </div>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving || selectedCourses.length === 0}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Icon icon="ph:spinner" width="20" className="animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Icon icon="ph:check-bold" width="20" />
                    Planı Kaydet
                  </>
                )}
              </button>
              {plans.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setSelectedCourses([])
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
                >
                  İptal
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

