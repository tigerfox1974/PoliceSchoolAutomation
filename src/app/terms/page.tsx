'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Modal, ConfirmDialog, ToastContainer } from '@/shared/components'

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
  const [selectedType, setSelectedType] = useState<'POLICE' | 'FIRE'>('POLICE')
  const [suggestedNumber, setSuggestedNumber] = useState<number>(1)
  const [currentTermNumber, setCurrentTermNumber] = useState<number>(0)
  const [selectedDuration, setSelectedDuration] = useState<'FOUR_MONTHS' | 'SIX_MONTHS'>('FOUR_MONTHS')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTerm, setEditingTerm] = useState<Term | null>(null)
  const [editFormData, setEditFormData] = useState({
    termNumber: 0,
    termType: 'POLICE' as 'POLICE' | 'FIRE',
    duration: 'FOUR_MONTHS' as 'FOUR_MONTHS' | 'SIX_MONTHS',
    startDate: '',
    endDate: '',
    status: 'ACTIVE' as 'ACTIVE' | 'PAUSED' | 'ARCHIVED',
  })

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

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filters, setFilters] = useState({
    termType: [] as string[],
    status: [] as string[],
    duration: [] as string[],
    dateFrom: '',
    dateTo: '',
  })
  const [filteredTerms, setFilteredTerms] = useState<Term[]>([])

  // View and sort states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'termType' | 'duration' | 'status' | 'endDate' | 'students' | 'classes' | 'instructors'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [sortedAndFilteredTerms, setSortedAndFilteredTerms] = useState<Term[]>([])

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

  // Apply search and filters
  useEffect(() => {
    let result = [...terms]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((term) =>
        term.name.toLowerCase().includes(query) ||
        term.termCode.toLowerCase().includes(query) ||
        term.termNumber.toString().includes(query)
      )
    }

    // Type filter
    if (filters.termType.length > 0) {
      result = result.filter((term) => filters.termType.includes(term.termType))
    }

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter((term) => filters.status.includes(term.status))
    }

    // Duration filter
    if (filters.duration.length > 0) {
      result = result.filter((term) => filters.duration.includes(term.duration))
    }

    // Date range filter (overlap)
    if (filters.dateFrom || filters.dateTo) {
      const from = filters.dateFrom ? new Date(filters.dateFrom) : null
      const to = filters.dateTo ? new Date(filters.dateTo) : null

      result = result.filter((term) => {
        const termStart = new Date(term.startDate)
        const termEnd = new Date(term.endDate)

        if (from && termEnd < from) return false
        if (to && termStart > to) return false
        return true
      })
    }

    setFilteredTerms(result)
  }, [terms, searchQuery, filters])

  // Apply sorting
  useEffect(() => {
    let result = [...filteredTerms]

    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
        break
      case 'termType':
        result.sort((a, b) => a.termType.localeCompare(b.termType))
        break
      case 'duration':
        result.sort((a, b) => {
          const durationOrder = { FOUR_MONTHS: 0, SIX_MONTHS: 1 }
          return durationOrder[a.duration] - durationOrder[b.duration]
        })
        break
      case 'status':
        const statusOrder = { ACTIVE: 0, PAUSED: 1, ARCHIVED: 2 }
        result.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
        break
      case 'endDate':
        result.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
        break
      case 'students':
        result.sort((a, b) => a._count.students - b._count.students)
        break
      case 'classes':
        result.sort((a, b) => a._count.classes - b._count.classes)
        break
      case 'instructors':
        result.sort((a, b) => a._count.instructorTerms - b._count.instructorTerms)
        break
    }

    if (sortOrder === 'desc') {
      result.reverse()
    }

    setSortedAndFilteredTerms(result)
  }, [filteredTerms, sortBy, sortOrder])

  useEffect(() => {
    fetchTerms()
  }, [])

  useEffect(() => {
    if (showCreateForm) {
      fetchSuggestion(selectedType)
    }
  }, [selectedType, showCreateForm])

  useEffect(() => {
    if (startDate && selectedDuration) {
      calculateEndDate(startDate, selectedDuration)
    }
  }, [startDate, selectedDuration])

  const fetchSuggestion = async (type: 'POLICE' | 'FIRE') => {
    try {
      const res = await fetch(`/api/terms/suggest?termType=${type}`)
      const data = await res.json()
      const suggested = data.suggestedNumber
      
      // Eğer öneri null ise kullanıcı manuel girecek
      if (suggested === null) {
        setSuggestedNumber(0)
        setCurrentTermNumber(0)
      } else {
        setSuggestedNumber(suggested || 1)
        setCurrentTermNumber(suggested || 1)
      }
    } catch (error) {
      console.error('Öneri alınamadı:', error)
      setSuggestedNumber(0)
      setCurrentTermNumber(0)
    }
  }

  const calculateEndDate = (start: string, duration: 'FOUR_MONTHS' | 'SIX_MONTHS') => {
    const startDateObj = new Date(start)
    const endDateObj = new Date(startDateObj)
    
    if (duration === 'FOUR_MONTHS') {
      endDateObj.setMonth(endDateObj.getMonth() + 4)
    } else {
      endDateObj.setMonth(endDateObj.getMonth() + 6)
    }
    
    setEndDate(endDateObj.toISOString().split('T')[0])
  }

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

  const handleCreateTerm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      termNumber: formData.get('termNumber'),
      termType: selectedType,
      duration: selectedDuration,
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      isActive: formData.get('isActive') === 'on',
    }

    try {
      const res = await fetch('/api/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setShowCreateForm(false)
        fetchTerms()
        ;(e.target as HTMLFormElement).reset()
        setStartDate('')
        setEndDate('')
        setCurrentTermNumber(0)
        showToast('Dönem başarıyla oluşturuldu', 'success')
      } else {
        const error = await res.json()
        showToast(error.error || 'Dönem oluşturulamadı', 'error')
      }
    } catch (error) {
      console.error('Dönem oluşturma hatası:', error)
      showToast('Sunucu hatası', 'error')
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilters({
      termType: [],
      status: [],
      duration: [],
      dateFrom: '',
      dateTo: '',
    })
  }

  const handleEditClick = (term: Term) => {
    setEditingTerm(term)
    setEditFormData({
      termNumber: term.termNumber,
      termType: term.termType,
      duration: term.duration,
      startDate: term.startDate.split('T')[0],
      endDate: term.endDate.split('T')[0],
      status: term.status,
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingTerm) return

    try {
      const res = await fetch(`/api/terms/${editingTerm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      })

      if (res.ok) {
        setShowEditModal(false)
        setEditingTerm(null)
        fetchTerms()
        showToast('Dönem başarıyla güncellendi', 'success')
      } else {
        const error = await res.json()
        showToast(error.error || 'Dönem güncellenemedi', 'error')
      }
    } catch (error) {
      console.error('Edit error:', error)
      showToast('Sunucu hatası', 'error')
    }
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
        <Modal
          isOpen={showCreateForm}
          onClose={() => {
            setShowCreateForm(false)
            setCurrentTermNumber(0)
            setStartDate('')
            setEndDate('')
          }}
          title="🎓 Yeni Dönem Oluştur"
          size="lg"
        >
        <form onSubmit={handleCreateTerm} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Dönem Tipi</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 'POLICE' | 'FIRE')}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="POLICE">Polis Temel Eğitimi</option>
                <option value="FIRE">İtfaiye Temel Eğitimi</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Dönem Numarası</label>
              <input
                type="number"
                name="termNumber"
                required
                min="1"
                value={currentTermNumber || ''}
                onChange={(e) => setCurrentTermNumber(parseInt(e.target.value) || 0)}
                placeholder="Dönem numarasını girin"
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              {suggestedNumber > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  💡 Önerilen: {suggestedNumber}. dönem (Son kayıtlara göre)
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium">Dönem Kodu (Otomatik)</label>
              <input
                type="text"
                value={currentTermNumber > 0 ? `${selectedType === 'POLICE' ? 'PTE' : 'İTE'}-${String(currentTermNumber).padStart(2, '0')}` : ''}
                disabled
                placeholder={currentTermNumber > 0 ? '' : 'Dönem numarası girilince otomatik üretilecektir'}
                className="w-full px-4 py-2 border rounded bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 mt-1">
                🔒 Otomatik oluşturulur, değiştirilemez
              </p>
            </div>

            {currentTermNumber > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  📝 Dönem Adı: <strong>{currentTermNumber}. {selectedType === 'POLICE' ? 'Polis Temel Eğitimi' : 'İtfaiye Temel Eğitimi'}</strong>
                </p>
              </div>
            )}

            <div>
              <label className="block mb-2 font-medium">Kurs Süresi</label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value as 'FOUR_MONTHS' | 'SIX_MONTHS')}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="FOUR_MONTHS">4 Ay</option>
                <option value="SIX_MONTHS">6 Ay</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">Başlangıç Tarihi</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Bitiş Tarihi</label>
                <input
                  type="date"
                  name="endDate"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                {startDate && (
                  <p className="text-sm text-gray-500 mt-1">
                    ⚡ Otomatik hesaplandı (değiştirebilirsiniz)
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="status"
                id="status"
                className="mr-2"
              />
              <label htmlFor="status">Aktif Dönem Olarak Başlat</label>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Dönem Oluştur
            </button>
          </form>
        </Modal>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => {
                            if (sortBy === 'status') {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                            } else {
                              setSortBy('status')
                              setSortOrder('asc')
                            }
                          }}
                          className="flex items-center gap-2 font-semibold text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          Durum
                          <span className="text-xs">
                            {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                            {sortBy !== 'status' && '↕'}
                          </span>
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => {
                            if (sortBy === 'name') {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                            } else {
                              setSortBy('name')
                              setSortOrder('asc')
                            }
                          }}
                          className="flex items-center gap-2 font-semibold text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          Dönem Adı
                          <span className="text-xs">
                            {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                            {sortBy !== 'name' && '↕'}
                          </span>
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => {
                            if (sortBy === 'termType') {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                            } else {
                              setSortBy('termType')
                              setSortOrder('asc')
                            }
                          }}
                          className="flex items-center gap-2 font-semibold text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          Tip
                          <span className="text-xs">
                            {sortBy === 'termType' && (sortOrder === 'asc' ? '↑' : '↓')}
                            {sortBy !== 'termType' && '↕'}
                          </span>
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => {
                            if (sortBy === 'duration') {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                            } else {
                              setSortBy('duration')
                              setSortOrder('asc')
                            }
                          }}
                          className="flex items-center gap-2 font-semibold text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          Süre
                          <span className="text-xs">
                            {sortBy === 'duration' && (sortOrder === 'asc' ? '↑' : '↓')}
                            {sortBy !== 'duration' && '↕'}
                          </span>
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => {
                            if (sortBy === 'endDate') {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                            } else {
                              setSortBy('endDate')
                              setSortOrder('asc')
                            }
                          }}
                          className="flex items-center gap-2 font-semibold text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          Bitiş Tarihi
                          <span className="text-xs">
                            {sortBy === 'endDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                            {sortBy !== 'endDate' && '↕'}
                          </span>
                        </button>
                      </th>
                      <th className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            if (sortBy === 'students') {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                            } else {
                              setSortBy('students')
                              setSortOrder('asc')
                            }
                          }}
                          className="flex items-center gap-2 font-semibold text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mx-auto"
                        >
                          👨‍🎓 Öğrenci
                          <span className="text-xs">
                            {sortBy === 'students' && (sortOrder === 'asc' ? '↑' : '↓')}
                            {sortBy !== 'students' && '↕'}
                          </span>
                        </button>
                      </th>
                      <th className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            if (sortBy === 'classes') {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                            } else {
                              setSortBy('classes')
                              setSortOrder('asc')
                            }
                          }}
                          className="flex items-center gap-2 font-semibold text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mx-auto"
                        >
                          🏫 Sınıf
                          <span className="text-xs">
                            {sortBy === 'classes' && (sortOrder === 'asc' ? '↑' : '↓')}
                            {sortBy !== 'classes' && '↕'}
                          </span>
                        </button>
                      </th>
                      <th className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            if (sortBy === 'instructors') {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                            } else {
                              setSortBy('instructors')
                              setSortOrder('asc')
                            }
                          }}
                          className="flex items-center gap-2 font-semibold text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mx-auto"
                        >
                          👨‍🏫 Eğitmen
                          <span className="text-xs">
                            {sortBy === 'instructors' && (sortOrder === 'asc' ? '↑' : '↓')}
                            {sortBy !== 'instructors' && '↕'}
                          </span>
                        </button>
                      </th>
                      <th className="px-4 py-3 text-right">
                        <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">İşlemler</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedAndFilteredTerms.map((term) => {
                      const statusConfig = {
                        ACTIVE: { label: 'Aktif', color: 'bg-green-500', icon: '✓' },
                        PAUSED: { label: 'Duraklatıldı', color: 'bg-orange-500', icon: '⏸' },
                        ARCHIVED: { label: 'Arşivlendi', color: 'bg-gray-500', icon: '📦' },
                      }[term.status]

                      return (
                        <tr key={term.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`${statusConfig.color} text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 w-fit`}>
                              <span>{statusConfig.icon}</span>
                              <span>{statusConfig.label}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/terms/${term.id}`} className="block hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              <div className="font-semibold">{term.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{term.termCode}</div>
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {term.termType === 'POLICE' ? '🚔 Polis' : '🚒 İtfaiye'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {term.duration === 'FOUR_MONTHS' ? '4 Ay' : '6 Ay'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(term.endDate).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-medium">
                            {term._count.students}
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-medium">
                            {term._count.classes}
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-medium">
                            {term._count.instructorTerms}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditClick(term)}
                                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                                title="Düzenle"
                              >
                                <Icon icon="ph:pencil-bold" width="16" />
                              </button>

                              {term.status === 'ACTIVE' && (
                                <button
                                  onClick={() => handleStatusChange(term.id, term.name, 'PAUSED')}
                                  className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                                  title="Duraklat"
                                >
                                  <Icon icon="ph:pause-bold" width="16" />
                                </button>
                              )}

                              {term.status === 'PAUSED' && (
                                <button
                                  onClick={() => handleStatusChange(term.id, term.name, 'ACTIVE')}
                                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                                  title="Aktifleştir"
                                >
                                  <Icon icon="ph:play-bold" width="16" />
                                </button>
                              )}

                              {term.status === 'ARCHIVED' && (
                                <button
                                  onClick={() => handleStatusChange(term.id, term.name, 'ACTIVE')}
                                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                                  title="Geri Al"
                                >
                                  <Icon icon="ph:arrow-counter-clockwise-bold" width="16" />
                                </button>
                              )}

                              {term.status !== 'ARCHIVED' && (
                                <button
                                  onClick={() => handleStatusChange(term.id, term.name, 'ARCHIVED')}
                                  className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                                  title="Arşivle"
                                >
                                  <Icon icon="ph:archive-bold" width="16" />
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteTerm(term)}
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                                title="Sil"
                              >
                                <Icon icon="ph:trash-bold" width="16" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingTerm(null)
        }}
        title="✏️ Dönemi Düzenle"
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Dönem Tipi</label>
            <select
              value={editFormData.termType}
              onChange={(e) => setEditFormData({ ...editFormData, termType: e.target.value as 'POLICE' | 'FIRE' })}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="POLICE">Polis Temel Eğitimi</option>
              <option value="FIRE">İtfaiye Temel Eğitimi</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Dönem Numarası</label>
            <input
              type="number"
              min="1"
              required
              value={editFormData.termNumber}
              onChange={(e) => setEditFormData({ ...editFormData, termNumber: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Kurs Süresi</label>
            <select
              value={editFormData.duration}
              onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value as 'FOUR_MONTHS' | 'SIX_MONTHS' })}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="FOUR_MONTHS">4 Ay</option>
              <option value="SIX_MONTHS">6 Ay</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium">Başlangıç Tarihi</label>
              <input
                type="date"
                required
                value={editFormData.startDate}
                onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Bitiş Tarihi</label>
              <input
                type="date"
                required
                value={editFormData.endDate}
                onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Durum</label>
            <select
              value={editFormData.status}
              onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'ACTIVE' | 'PAUSED' | 'ARCHIVED' })}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="ACTIVE">✓ Aktif</option>
              <option value="PAUSED">⏸ Duraklatıldı</option>
              <option value="ARCHIVED">📦 Arşivlendi</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false)
                setEditingTerm(null)
              }}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Kaydet
            </button>
          </div>
        </form>
      </Modal>

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
