'use client'

import { useState } from 'react'
import { ConfirmDialog } from '@/shared/components'
import { useTerms, useTermFilters } from '@/features/terms/hooks'
import {
  TermCard,
  TermListItem,
  CreateTermModal,
  EditTermModal,
  TermFilters,
  TermToolbar
} from '@/features/terms/components'
import { Term, ConfirmDialogState } from '@/features/terms/types'
import { hasActiveFilters } from '@/features/terms/utils'

export default function TermsPage() {
  // Data hooks
  const { terms, loading, fetchTerms, deleteTerm, updateTermStatus } = useTerms()
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    sortedAndFilteredTerms,
    clearFilters,
  } = useTermFilters(terms)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [editingTerm, setEditingTerm] = useState<Term | null>(null)
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {},
  })

  // Handlers
  const handleEditClick = (term: Term) => {
    setEditingTerm(term)
    setShowEditModal(true)
  }

  const handleStatusChange = (termId: string, termName: string, newStatus: 'ACTIVE' | 'PAUSED' | 'ARCHIVED') => {
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
        const result = await updateTermStatus(termId, newStatus)
        if (result.success) {
          alert(`Dönem ${statusLabels[newStatus].toLowerCase()} olarak işaretlendi`)
        } else {
          alert(result.error || 'İşlem başarısız')
        }
      },
    })
  }

  const handleDeleteTerm = (term: Term) => {
    if (term.status === 'ACTIVE') {
      setConfirmDialog({
        isOpen: true,
        title: '⚠️ Aktif Dönem Silme Uyarısı',
        message: `"${term.name}" dönemi AKTİF durumda!\n\nBu dönemi silmek istediğinizden emin misiniz?`,
        type: 'danger',
        onConfirm: () => {
          setTimeout(() => {
            setConfirmDialog({
              isOpen: true,
              title: '🗑️ Silme İşlemini Onayla',
              message: `Bu işlem geri alınamaz!\n\n"${term.name}" dönemi ve tüm ilişkili veriler kalıcı olarak silinecektir.`,
              type: 'danger',
              onConfirm: async () => {
                const result = await deleteTerm(term.id)
                if (result.success) {
                  alert('Dönem başarıyla silindi')
                } else {
                  alert(result.error || 'Dönem silinemedi')
                }
              },
            })
          }, 150)
        },
      })
    } else {
      setConfirmDialog({
        isOpen: true,
        title: '🗑️ Dönemi Sil',
        message: `"${term.name}" dönemini silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`,
        type: 'danger',
        onConfirm: async () => {
          const result = await deleteTerm(term.id)
          if (result.success) {
            alert('Dönem başarıyla silindi')
          } else {
            alert(result.error || 'Dönem silinemedi')
          }
        },
      })
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
        <h1 className="text-3xl font-bold">🎓 Dönem Yönetimi</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          + Yeni Dönem Oluştur
        </button>
      </div>

      {/* Create Modal */}
      <CreateTermModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchTerms}
      />

      {/* Edit Modal */}
      <EditTermModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingTerm(null)
        }}
        onSuccess={fetchTerms}
        term={editingTerm}
      />

      {/* Filter Modal */}
      <TermFilters
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          confirmDialog.onConfirm()
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />

      {/* Toolbar */}
      {terms.length > 0 && (
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
      )}

      {/* Terms List */}
      {terms.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Henüz dönem oluşturulmamış. Başlamak için yukarıdaki butona tıklayın.
        </div>
      ) : sortedAndFilteredTerms.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Arama kriterlerine uygun dönem bulunamadı.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAndFilteredTerms.map((term) => (
            <TermCard
              key={term.id}
              term={term}
              onEdit={handleEditClick}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTerm}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAndFilteredTerms.map((term) => (
            <TermListItem
              key={term.id}
              term={term}
              onEdit={handleEditClick}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTerm}
            />
          ))}
        </div>
      )}
    </div>
  )
}
