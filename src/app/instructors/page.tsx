'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { ConfirmDialog, ToastContainer } from '@/shared/components'
import { InstructorTableView, EditInstructorModal } from '@/features/instructors/components'
import { useInstructorFilters } from '@/features/instructors/hooks'
import { Instructor } from '@/features/instructors/types'

export default function InstructorsPage() {
  const router = useRouter()
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilterModal, setShowFilterModal] = useState(false)

  // Edit modal states (şimdilik placeholder)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null)

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

  // useInstructorFilters hook
  const {
    searchQuery,
    filters,
    sortBy,
    sortOrder,
    viewMode,
    sortedAndFilteredInstructors,
    setSearchQuery,
    setFilters,
    setSortBy,
    setSortOrder,
    setViewMode,
    clearFilters,
  } = useInstructorFilters(instructors)

  useEffect(() => {
    fetchInstructors()
  }, [])

  const fetchInstructors = async () => {
    try {
      const res = await fetch('/api/instructors')
      const data = await res.json()
      setInstructors(data.instructors || [])
    } catch (error) {
      console.error('Eğitmenler yüklenemedi:', error)
      showToast('Eğitmenler yüklenirken bir hata oluştu', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (instructor: Instructor) => {
    setEditingInstructor(instructor)
    setShowEditModal(true)
  }

  const handleDeleteInstructor = async (instructor: Instructor) => {
    setConfirmDialog({
      isOpen: true,
      title: '🗑️ Eğitmeni Sil',
      message: `"${instructor.firstName} ${instructor.lastName}" eğitmenini silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/instructors/${instructor.id}`, {
            method: 'DELETE',
          })

          if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Silme işlemi başarısız')
          }

          showToast('Eğitmen başarıyla silindi', 'success')
          fetchInstructors()
        } catch (error: any) {
          showToast(error.message || 'Eğitmen silinirken bir hata oluştu', 'error')
        } finally {
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        }
      },
    })
  }

  const typeLabels = {
    CADRE: '👮 Kadrolu',
    EXTERNAL: '🎓 Dış Kaynak',
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
      <ToastContainer toasts={toasts} onRemove={removeToast} />

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

      {/* Arama ve Filtreler */}
      {instructors.length > 0 && (
        <div className="mb-6 space-y-4">
          {/* Üst Bar: Arama + Filtreler + Görünüm */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Arama Çubuğu */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Icon
                  icon="ph:magnifying-glass-bold"
                  width="20"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Eğitmen ara (ad, soyad, rütbe, branş)..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filtre Butonu */}
            <button
              onClick={() => setShowFilterModal(!showFilterModal)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                filters.instructorType.length > 0 || filters.isActive.length > 0
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Icon icon={showFilterModal ? "ph:caret-up-bold" : "ph:funnel-bold"} width="20" />
              Filtreler
              {(filters.instructorType.length > 0 || filters.isActive.length > 0) && (
                <span className="bg-white text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold">
                  {filters.instructorType.length + filters.isActive.length}
                </span>
              )}
            </button>

            {/* Sıralama */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              <option value="name">🔤 İsme Göre</option>
              <option value="rank">⭐ Rütbeye Göre</option>
              <option value="branch">🏢 Branşa Göre</option>
              <option value="courses">📚 Ders Sayısına Göre</option>
            </select>

            {/* Filtre Temizle */}
            {(searchQuery || filters.instructorType.length > 0 || filters.isActive.length > 0) && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {sortedAndFilteredInstructors.length} eğitmen bulundu
                </span>
                <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
                  Tümünü Temizle
                </button>
              </div>
            )}

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
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-gray-700">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Eğitmen Tipi */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Icon icon="ph:user-bold" width="20" className="text-blue-600 dark:text-blue-400" />
                    Eğitmen Tipi
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'CADRE', label: '👮 Kadrolu Personel', icon: 'ph:shield-check-bold', color: 'text-green-600' },
                      { value: 'EXTERNAL', label: '🎓 Dıştan Gelen Eğitmen', icon: 'ph:user-plus-bold', color: 'text-purple-600' },
                    ].map((type) => (
                      <label
                        key={type.value}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-blue-300 dark:hover:border-blue-600"
                      >
                        <input
                          type="checkbox"
                          checked={filters.instructorType.includes(type.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({ ...filters, instructorType: [...filters.instructorType, type.value] })
                            } else {
                              setFilters({ ...filters, instructorType: filters.instructorType.filter(t => t !== type.value) })
                            }
                          }}
                          className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <Icon icon={type.icon} width="18" className={type.color} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Durum */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Icon icon="ph:check-circle-bold" width="20" className="text-green-600 dark:text-green-400" />
                    Durum
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'ACTIVE', label: '✓ Aktif Eğitmenler', icon: 'ph:check-circle-bold', color: 'text-green-600' },
                      { value: 'INACTIVE', label: '⏸ Pasif Eğitmenler', icon: 'ph:pause-circle-bold', color: 'text-gray-600' },
                    ].map((status) => (
                      <label
                        key={status.value}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-blue-300 dark:hover:border-blue-600"
                      >
                        <input
                          type="checkbox"
                          checked={filters.isActive.includes(status.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({ ...filters, isActive: [...filters.isActive, status.value] })
                            } else {
                              setFilters({ ...filters, isActive: filters.isActive.filter(s => s !== status.value) })
                            }
                          }}
                          className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <Icon icon={status.icon} width="18" className={status.color} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{status.label}</span>
                      </label>
                    ))}
                  </div>
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

      {/* Eğitmen Listesi */}
      {instructors.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Icon icon="ph:user-circle-bold" width="64" className="mx-auto mb-4 text-gray-400" />
          <p className="text-xl text-gray-600 dark:text-gray-400">Henüz eğitmen eklenmemiş</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Yeni eğitmen eklemek için yukarıdaki butonu kullanın
          </p>
        </div>
      ) : sortedAndFilteredInstructors.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Icon icon="ph:magnifying-glass-bold" width="64" className="mx-auto mb-4 text-gray-400" />
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            Arama kriterlerine uygun eğitmen bulunamadı
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Farklı filtreler veya arama terimleri deneyin
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedAndFilteredInstructors.map((instructor) => (
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
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}
                      >
                        {typeLabels[instructor.instructorType]}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          instructor.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
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

                  {/* DERSLER - TAM ADLARIYLA */}
                  {instructor.courseInstructors.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        📚 VERDİĞİ DERSLER ({instructor.courseInstructors.length}):
                      </div>
                      <div className="space-y-1">
                        {instructor.courseInstructors.map((ci) => (
                          <div
                            key={ci.id}
                            className="text-sm text-gray-800 dark:text-gray-200 font-medium"
                          >
                            • {ci.course.name}
                          </div>
                        ))}
                      </div>
                    </div>
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
                      onClick={() => handleEditClick(instructor)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <Icon icon="ph:pencil-bold" width="16" />
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDeleteInstructor(instructor)}
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
            <InstructorTableView
              instructors={sortedAndFilteredInstructors}
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
              onDelete={handleDeleteInstructor}
            />
          )}
        </>
      )}

      {/* Edit Modal */}
      <EditInstructorModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingInstructor(null)
        }}
        onSuccess={(message) => {
          showToast(message, 'success')
          fetchInstructors()
          setShowEditModal(false)
          setEditingInstructor(null)
        }}
        onError={(message) => {
          showToast(message, 'error')
        }}
        instructor={editingInstructor}
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
