'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { ConfirmDialog, ToastContainer } from '@/shared/components'
import { TermTableView, CreateTermModal, EditTermModal, TermToolbar, TermFilters } from '@/features/terms/components'
import { useTermFilters } from '@/features/terms/hooks/useTermFilters'
import { hasActiveFilters } from '@/features/terms/utils'

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
          const res = await fetch(`/api/terms/${termId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          })

          if (res.ok) {
            fetchTerms()
            showToast(`Dönem ${statusLabels[newStatus].toLowerCase()} olarak işaretlendi`, 'success')
          } else {
            const error = await res.json()
            showToast(error.error || 'İşlem başarısız', 'error')
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
      const res = await fetch(`/api/terms/${termId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchTerms()
        showToast('Dönem başarıyla silindi', 'success')
      } else {
        const error = await res.json()
        showToast(error.error || 'Dönem silinemedi', 'error')
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
      <ToastContainer 
        toasts={toasts.map(toast => ({ ...toast, onClose: removeToast }))} 
      />

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

      {/* Search, Filter and View Controls */}
      {terms.length > 0 && (
        <>
          <TermToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onFilterClick={() => setShowFilterModal(true)}
            onClearFilters={clearFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            resultsCount={sortedAndFilteredTerms.length}
            hasActiveSearch={hasActiveFilters(searchQuery, filters)}
          />

          <TermFilters
            isOpen={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
          />
        </>
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
