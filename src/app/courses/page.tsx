'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { ConfirmDialog, ToastContainer } from '@/shared/components'
import { CourseTableView, EditCourseModal } from '@/features/courses/components'
import { useCourseFilters } from '@/features/courses/hooks'
import { Course } from '@/features/courses/types'

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilterModal, setShowFilterModal] = useState(false)

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  // Confirm dialog states
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

  // Toast notifications
  const [toasts, setToasts] = useState<Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  }>>([])

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // useCourseFilters hook - filtreleme, sıralama ve görünüm yönetimi
  const {
    searchQuery,
    filters,
    sortBy,
    sortOrder,
    viewMode,
    sortedAndFilteredCourses,
    setSearchQuery,
    setFilters,
    setSortBy,
    setSortOrder,
    setViewMode,
    clearFilters,
  } = useCourseFilters(courses)

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

  const handleEditClick = (course: Course) => {
    setEditingCourse(course)
    setShowEditModal(true)
  }

  const handleDeleteCourse = async (course: Course) => {
    setConfirmDialog({
      isOpen: true,
      title: '🗑️ Dersi Sil',
      message: `"${course.name}" dersini silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/courses/${course.id}`, {
            method: 'DELETE',
          })

          if (res.ok) {
            showToast('Ders başarıyla silindi', 'success')
            fetchCourses()
          } else {
            const data = await res.json()
            showToast(data.error || 'Ders silinemedi', 'error')
          }
        } catch (error) {
          console.error('Ders silme hatası:', error)
          showToast('Sunucu hatası', 'error')
        }
      },
    })
  }

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
      {/* Toast Notifications */}
      <ToastContainer 
        toasts={toasts.map(toast => ({ ...toast, onClose: removeToast }))} 
      />

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

      {/* Arama ve Filtre Çubuğu */}
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

          {/* Filtre Butonu ve Aktif Filtreler */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  setShowFilterModal(!showFilterModal)
                  if (!showFilterModal) {
                    setTimeout(() => {
                      document.getElementById('filter-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                    }, 100)
                  }
                }}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  filters.programScope.length > 0 ||
                  filters.requiresLab.length > 0 ||
                  !!filters.hoursMin ||
                  !!filters.hoursMax
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Icon icon={showFilterModal ? "ph:caret-up-bold" : "ph:funnel-bold"} width="20" />
                Filtreler
                {(filters.programScope.length > 0 ||
                  filters.requiresLab.length > 0 ||
                  !!filters.hoursMin ||
                  !!filters.hoursMax) && (
                  <span className="bg-white text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold">
                    {
                      [
                        filters.programScope.length,
                        filters.requiresLab.length,
                        (filters.hoursMin || filters.hoursMax) ? 1 : 0,
                      ].filter((n) => n > 0).length
                    }
                  </span>
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <option value="name">🔤 İsme Göre</option>
                <option value="code">📝 Koda Göre</option>
                <option value="fourMonthHours">⏱️ 4 Aylık Saate Göre</option>
                <option value="sixMonthHours">⏱️ 6 Aylık Saate Göre</option>
                <option value="instructors">👨‍🏫 Eğitmen Sayısına Göre</option>
                <option value="subCourses">📚 Alt Ders Sayısına Göre</option>
              </select>

              {(searchQuery ||
                filters.programScope.length > 0 ||
                filters.requiresLab.length > 0 ||
                !!filters.hoursMin ||
                !!filters.hoursMax) && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {sortedAndFilteredCourses.length} ders bulundu
                  </span>
                  <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
                    Tümünü Temizle
                  </button>
                </div>
              )}
            </div>

            {/* Kart/Liste Toggle */}
            <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Icon icon="ph:squares-four-bold" width="18" />
                <span className="text-sm font-medium">Kart</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Icon icon="ph:list-bold" width="18" />
                <span className="text-sm font-medium">Liste</span>
              </button>
            </div>
          </div>

          {/* Gelişmiş Filtre Paneli */}
          {showFilterModal && (
            <div
              id="filter-section"
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-gray-700 transition-all duration-300 ease-in-out"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Icon icon="ph:funnel-bold" width="24" className="text-blue-600 dark:text-blue-400" />
                  Gelişmiş Filtreler
                </h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <Icon icon="ph:x-bold" width="24" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Program Kapsamı */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Icon icon="ph:graduation-cap-bold" width="20" className="text-blue-600 dark:text-blue-400" />
                    Program Kapsamı
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'COMMON', label: 'Ortak Dersler', icon: 'ph:users-bold', color: 'text-blue-600' },
                      { value: 'POLIS_ONLY', label: 'Polis Dersleri', icon: 'ph:shield-check-bold', color: 'text-green-600' },
                      { value: 'ITFAIYE_ONLY', label: 'İtfaiye Dersleri', icon: 'ph:fire-bold', color: 'text-red-600' },
                    ].map((scope) => (
                      <label
                        key={scope.value}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-blue-300 dark:hover:border-blue-600"
                      >
                        <input
                          type="checkbox"
                          checked={filters.programScope.includes(scope.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({ ...filters, programScope: [...filters.programScope, scope.value] })
                            } else {
                              setFilters({ ...filters, programScope: filters.programScope.filter(s => s !== scope.value) })
                            }
                          }}
                          className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <Icon icon={scope.icon} width="18" className={scope.color} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{scope.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Lab Gereksinimi */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Icon icon="ph:desktop-tower-bold" width="20" className="text-purple-600 dark:text-purple-400" />
                    Lab Gereksinimi
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'LAB', label: 'Lab Gerekli', icon: 'ph:desktop-tower-bold', color: 'text-blue-600' },
                      { value: 'NO_LAB', label: 'Normal Sınıf', icon: 'ph:book-open-bold', color: 'text-gray-600' },
                    ].map((lab) => (
                      <label
                        key={lab.value}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-blue-300 dark:hover:border-blue-600"
                      >
                        <input
                          type="checkbox"
                          checked={filters.requiresLab.includes(lab.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({ ...filters, requiresLab: [...filters.requiresLab, lab.value] })
                            } else {
                              setFilters({ ...filters, requiresLab: filters.requiresLab.filter(l => l !== lab.value) })
                            }
                          }}
                          className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <Icon icon={lab.icon} width="18" className={lab.color} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{lab.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Saat Aralığı */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Icon icon="ph:clock-bold" width="20" className="text-orange-600 dark:text-orange-400" />
                    Saat Aralığı (4 Aylık)
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block mb-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium">Minimum</label>
                      <input
                        type="number"
                        value={filters.hoursMin}
                        onChange={(e) => setFilters({ ...filters, hoursMin: e.target.value })}
                        placeholder="0"
                        min="0"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium">Maksimum</label>
                      <input
                        type="number"
                        value={filters.hoursMax}
                        onChange={(e) => setFilters({ ...filters, hoursMax: e.target.value })}
                        placeholder="999"
                        min="0"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    4 aylık hedef saate göre filtrelenir
                  </p>
                </div>
              </div>

              {/* İşlem Butonları */}
              <div className="flex gap-3 pt-6 mt-6 border-t border-blue-200 dark:border-gray-700">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2.5 bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600"
                >
                  <Icon icon="ph:eraser-bold" width="20" />
                  Temizle
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Icon icon="ph:check-bold" width="20" />
                  Uygula ve Kapat
                </button>
              </div>
            </div>
          )}
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
      ) : sortedAndFilteredCourses.length === 0 ? (
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
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedAndFilteredCourses.map((course) => (
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
                        📝 {course._count.dailyLessons} kayıt
                      </span>
                    </div>
                  </Link>

                  {/* İşlem Butonları */}
                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Link
                      href={`/courses/${course.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <Icon icon="ph:eye-bold" width="16" />
                      Detay
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleEditClick(course)
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <Icon icon="ph:pencil-bold" width="16" />
                      Düzenle
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDeleteCourse(course)
                      }}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <Icon icon="ph:trash-bold" width="16" />
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CourseTableView
              courses={sortedAndFilteredCourses}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(field) => {
                if (sortBy === field) {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                } else {
                  setSortBy(field)
                  setSortOrder('asc')
                }
              }}
              onEdit={handleEditClick}
              onDelete={handleDeleteCourse}
            />
          )}
        </>
      )}

      {/* Edit Modal */}
      <EditCourseModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingCourse(null)
        }}
        onSuccess={(message) => {
          showToast(message, 'success')
          fetchCourses()
          setShowEditModal(false)
          setEditingCourse(null)
        }}
        onError={(message) => {
          showToast(message, 'error')
        }}
        course={editingCourse}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  )
}
