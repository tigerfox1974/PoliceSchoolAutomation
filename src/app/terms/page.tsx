'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { ConfirmDialog, ToastContainer } from '@/shared/components'
import { TermTableView, CreateTermModal, EditTermModal } from '@/features/terms/components'
import { useTermFilters } from '@/features/terms/hooks/useTermFilters'

interface Term {
  id: string
  termCode: string
  name: string
  termNumber: number
  termType: 'POLICE' | 'FIRE'
  duration: 'FOUR_MONTHS' | 'SIX_MONTHS'
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
  _count: {
    students: number
    classes: number
    instructorTerms: number
  }
}

export default function TermsPage() {
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // useTermFilters hook - filtreleme, sıralama ve görünüm yönetimi
  const {
    searchQuery,
    filters,
    sortBy,
    sortOrder,
    viewMode,
    sortedAndFilteredTerms,
    setSearchQuery,
    setFilters,
    setSortBy,
    setSortOrder,
    setViewMode,
    clearFilters,
  } = useTermFilters(terms)

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTerm, setEditingTerm] = useState<Term | null>(null)

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

  // Filter modal state
  const [showFilterModal, setShowFilterModal] = useState(false)

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

  useEffect(() => {
    fetchTerms()
  }, [])

  const fetchTerms = async () => {
    try {
      const res = await fetch('/api/terms')
      const data = await res.json()
      setTerms(data.terms || [])
    } catch (error) {
      console.error('Dönemler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (term: Term) => {
    setEditingTerm(term)
    setShowEditModal(true)
  }

  const handleStatusChange = async (termId: string, termName: string, newStatus: 'ACTIVE' | 'PAUSED' | 'ARCHIVED') => {
    const statusLabels = {
      ACTIVE: 'Aktif',
      PAUSED: 'Duraklatılmış',
      ARCHIVED: 'Arşivlenmiş',
    }

    const statusActions = {
      ACTIVE: 'aktif hale getirmek',
      PAUSED: 'duraklatmak',
      ARCHIVED: 'arşivlemek',
    }

    setConfirmDialog({
      isOpen: true,
      title: `Dönem Durumunu ${statusLabels[newStatus]} Yap`,
      message: `"${termName}" dönemini ${statusActions[newStatus]} istediğinizden emin misiniz?`,
      type: newStatus === 'ARCHIVED' ? 'warning' : 'info',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/term-actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'status', id: termId, status: newStatus }),
          })

          const contentType = res.headers.get('content-type') || ''
          const data = contentType.includes('application/json') ? await res.json() : null

          if (res.ok) {
            fetchTerms()
            showToast(`Dönem ${statusLabels[newStatus].toLowerCase()} olarak işaretlendi`, 'success')
          } else {
            showToast(data?.error || 'İşlem başarısız', 'error')
          }
        } catch (error) {
          console.error('Status change error:', error)
          showToast('Sunucu hatası', 'error')
        }
      },
    })
  }

  const handleDeleteTerm = async (term: Term) => {
    // ACTIVE dönemler için ekstra uyarı göster
    if (term.status === 'ACTIVE') {
      setConfirmDialog({
        isOpen: true,
        title: '⚠️ Aktif Dönem Silme Uyarısı',
        message: `"${term.name}" dönemi AKTİF durumda!\n\nBu dönemi silmek istediğinizden emin misiniz?`,
        type: 'danger',
        onConfirm: () => {
          // İlk onay sonrası ikinci onay
          setTimeout(() => {
            setConfirmDialog({
              isOpen: true,
              title: '🗑️ Silme İşlemini Onayla',
              message: `Bu işlem geri alınamaz!\n\n"${term.name}" dönemi ve tüm ilişkili veriler kalıcı olarak silinecektir.`,
              type: 'danger',
              onConfirm: async () => {
                await performDelete(term.id, term.name)
              },
            })
          }, 150)
        },
      })
    } else {
      // Aktif olmayan dönemler için tek onay
      setConfirmDialog({
        isOpen: true,
        title: '🗑️ Dönemi Sil',
        message: `"${term.name}" dönemini silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`,
        type: 'danger',
        onConfirm: async () => {
          await performDelete(term.id, term.name)
        },
      })
    }
  }

  const performDelete = async (termId: string, termName: string) => {
    try {
      const res = await fetch('/api/term-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: termId }),
      })

      const contentType = res.headers.get('content-type') || ''
      const data = contentType.includes('application/json') ? await res.json() : null

      if (res.ok) {
        fetchTerms()
        showToast('Dönem başarıyla silindi', 'success')
      } else {
        showToast(data?.error || 'Dönem silinemedi', 'error')
      }
    } catch (error) {
      console.error('Dönem silme hatası:', error)
      showToast('Sunucu hatası', 'error')
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
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">🎓 Dönem Yönetimi</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          + Yeni Dönem Oluştur
        </button>
      </div>

      {/* Create Term Modal */}
      {showCreateForm && (
        <CreateTermModal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSuccess={(msg) => {
            showToast(msg, 'success')
            fetchTerms()
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {/* Search and Filter Bar */}
      {terms.length > 0 && (
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
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
              placeholder="Dönem adı, kodu veya numarası ara..."
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

          {/* Filter Button and Active Filters */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  setShowFilterModal(!showFilterModal)
                  // Smooth scroll to filters
                  if (!showFilterModal) {
                    setTimeout(() => {
                      document.getElementById('filter-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                    }, 100)
                  }
                }}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  filters.termType.length > 0 ||
                  filters.status.length > 0 ||
                  filters.duration.length > 0 ||
                  !!filters.dateFrom ||
                  !!filters.dateTo
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Icon icon={showFilterModal ? "ph:caret-up-bold" : "ph:funnel-bold"} width="20" />
                Filtreler
                {(filters.termType.length > 0 ||
                  filters.status.length > 0 ||
                  filters.duration.length > 0 ||
                  !!filters.dateFrom ||
                  !!filters.dateTo) && (
                  <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                    {
                      [
                        filters.termType.length,
                        filters.status.length,
                        filters.duration.length,
                        (filters.dateFrom || filters.dateTo) ? 1 : 0,
                      ].filter((n) => n > 0).length
                    }
                  </span>
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <option value="name">🔤 İsme Göre</option>
                <option value="termType">🎓 Tipe Göre</option>
                <option value="duration">⏱️ Süreye Göre</option>
                <option value="status">🎯 Duruma Göre</option>
                <option value="endDate">📅 Bitiş Tarihine Göre</option>
                <option value="students">👨‍🎓 Öğrenci Sayısına Göre</option>
                <option value="classes">🏫 Sınıf Sayısına Göre</option>
                <option value="instructors">👨‍🏫 Eğitmen Sayısına Göre</option>
              </select>

              {(searchQuery ||
                filters.termType.length > 0 ||
                filters.status.length > 0 ||
                filters.duration.length > 0 ||
                !!filters.dateFrom ||
                !!filters.dateTo) && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {sortedAndFilteredTerms.length} dönem bulundu
                  </span>
                  <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
                    Tümünü Temizle
                  </button>
                </div>
              )}
            </div>

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

          {/* Inline Filter Section */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Term Type Filter */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Icon icon="ph:graduation-cap-bold" width="20" className="text-blue-600 dark:text-blue-400" />
                    Dönem Tipi
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'POLICE', label: 'Polis Temel Eğitimi', icon: 'ph:shield-check-bold' },
                      { value: 'FIRE', label: 'İtfaiye Temel Eğitimi', icon: 'ph:fire-bold' },
                    ].map((type) => (
                      <label
                        key={type.value}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-blue-300 dark:hover:border-blue-600"
                      >
                        <input
                          type="checkbox"
                          checked={filters.termType.includes(type.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({ ...filters, termType: [...filters.termType, type.value] })
                            } else {
                              setFilters({ ...filters, termType: filters.termType.filter(t => t !== type.value) })
                            }
                          }}
                          className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <Icon icon={type.icon} width="18" className="text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Icon icon="ph:traffic-sign-bold" width="20" className="text-green-600 dark:text-green-400" />
                    Durum
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'ACTIVE', label: 'Aktif', icon: 'ph:check-circle-bold', color: 'text-green-600' },
                      { value: 'PAUSED', label: 'Duraklatıldı', icon: 'ph:pause-circle-bold', color: 'text-orange-600' },
                      { value: 'ARCHIVED', label: 'Arşiv', icon: 'ph:archive-bold', color: 'text-gray-600' },
                    ].map((s) => (
                      <label
                        key={s.value}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-blue-300 dark:hover:border-blue-600"
                      >
                        <input
                          type="checkbox"
                          checked={filters.status.includes(s.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({ ...filters, status: [...filters.status, s.value] })
                            } else {
                              setFilters({ ...filters, status: filters.status.filter(st => st !== s.value) })
                            }
                          }}
                          className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <Icon icon={s.icon} width="18" className={s.color} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{s.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Duration Filter */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Icon icon="ph:clock-bold" width="20" className="text-purple-600 dark:text-purple-400" />
                    Kurs Süresi
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'FOUR_MONTHS', label: '4 Ay', icon: 'ph:calendar-bold' },
                      { value: 'SIX_MONTHS', label: '6 Ay', icon: 'ph:calendar-plus-bold' },
                    ].map((duration) => (
                      <label
                        key={duration.value}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-blue-300 dark:hover:border-blue-600"
                      >
                        <input
                          type="checkbox"
                          checked={filters.duration.includes(duration.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({ ...filters, duration: [...filters.duration, duration.value] })
                            } else {
                              setFilters({ ...filters, duration: filters.duration.filter(d => d !== duration.value) })
                            }
                          }}
                          className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <Icon icon={duration.icon} width="18" className="text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{duration.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Icon icon="ph:calendar-dots-bold" width="20" className="text-red-600 dark:text-red-400" />
                    Tarih Aralığı
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block mb-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium">Başlangıç</label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium">Bitiş</label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Kesişen dönemler listelenir
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
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

      {terms.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Henüz dönem oluşturulmamış
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Sistemi kullanmaya başlamak için önce bir dönem oluşturun
          </p>
        </div>
      ) : sortedAndFilteredTerms.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Icon icon="ph:magnifying-glass-bold" width="64" className="mx-auto mb-4 text-gray-400" />
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            Arama kriterlerine uygun dönem bulunamadı
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Farklı arama terimleri veya filtreler deneyin
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedAndFilteredTerms.map((term) => {
                const statusConfig = {
                  ACTIVE: { label: 'Aktif', color: 'bg-green-500', icon: '✓' },
                  PAUSED: { label: 'Duraklatıldı', color: 'bg-orange-500', icon: '⏸' },
                  ARCHIVED: { label: 'Arşivlendi', color: 'bg-gray-500', icon: '📦' },
                }[term.status]

                return (
                  <div
                    key={term.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 relative"
                  >
                    <Link href={`/terms/${term.id}`} className="block">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{term.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{term.termCode}</p>
                        </div>
                        <span
                          className={`${statusConfig.color} text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1`}
                        >
                          <span>{statusConfig.icon}</span>
                          <span>{statusConfig.label}</span>
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p>
                          {term.termType === 'POLICE' ? '🚔' : '🚒'}{' '}
                          {term.termType === 'POLICE' ? 'Polis Eğitimi' : 'İtfaiye Eğitimi'}
                        </p>
                        <p>⏱️ Süre: {term.duration === 'FOUR_MONTHS' ? '4 Ay' : '6 Ay'}</p>
                        <p>
                          📅 {new Date(term.startDate).toLocaleDateString('tr-TR')} -{' '}
                          {new Date(term.endDate).toLocaleDateString('tr-TR')}
                        </p>
                        <div className="flex justify-between pt-4 border-t">
                          <span>👨‍🎓 {term._count.students}</span>
                          <span>🏫 {term._count.classes}</span>
                          <span>👨‍🏫 {term._count.instructorTerms}</span>
                        </div>
                      </div>
                    </Link>

                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleEditClick(term)
                          }}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <Icon icon="ph:pencil-bold" width="16" />
                          Düzenle
                        </button>

                        {term.status === 'ACTIVE' && (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleStatusChange(term.id, term.name, 'PAUSED')
                            }}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
                          >
                            <Icon icon="ph:pause-bold" width="16" />
                            Duraklat
                          </button>
                        )}

                        {term.status === 'PAUSED' && (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleStatusChange(term.id, term.name, 'ACTIVE')
                            }}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
                          >
                            <Icon icon="ph:play-bold" width="16" />
                            Aktifleştir
                          </button>
                        )}

                        {term.status === 'ARCHIVED' && (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleStatusChange(term.id, term.name, 'ACTIVE')
                            }}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
                          >
                            <Icon icon="ph:arrow-counter-clockwise-bold" width="16" />
                            Geri Al
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {term.status !== 'ARCHIVED' && (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleStatusChange(term.id, term.name, 'ARCHIVED')
                            }}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
                          >
                            <Icon icon="ph:archive-bold" width="16" />
                            Arşivle
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDeleteTerm(term)
                          }}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <Icon icon="ph:trash-bold" width="16" />
                          Sil
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <TermTableView
              terms={sortedAndFilteredTerms}
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
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTerm}
            />
          )}
        </>
      )}

      {/* Edit Modal */}
      <EditTermModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingTerm(null)
        }}
        onSuccess={(message) => {
          showToast(message, 'success')
          fetchTerms()
          setShowEditModal(false)
          setEditingTerm(null)
        }}
        onError={(message) => {
          showToast(message, 'error')
        }}
        term={editingTerm}
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
