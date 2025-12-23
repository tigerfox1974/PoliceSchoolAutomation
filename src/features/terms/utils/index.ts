/**
 * Terms Feature - Utility Functions
 * Filtreleme, sıralama ve yardımcı fonksiyonlar
 */

import type { Term, TermFilters, SortOption, TermStatusConfig } from '../types'

/**
 * Dönemleri arama ve filtre kriterlerine göre süzer
 */
export function filterTerms(
  terms: Term[],
  searchQuery: string,
  filters: TermFilters
): Term[] {
  let result = [...terms]

  // Arama filtresi
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    result = result.filter(
      (term) =>
        term.name.toLowerCase().includes(query) ||
        term.termCode.toLowerCase().includes(query) ||
        term.termNumber.toString().includes(query)
    )
  }

  // Dönem tipi filtresi
  if (filters.termType.length > 0) {
    result = result.filter((term) => filters.termType.includes(term.termType))
  }

  // Durum filtresi
  if (filters.status.length > 0) {
    result = result.filter((term) => filters.status.includes(term.status))
  }

  // Süre filtresi
  if (filters.duration.length > 0) {
    result = result.filter((term) => filters.duration.includes(term.duration))
  }

  // Tarih aralığı filtresi (overlap)
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

  return result
}

/**
 * Dönemleri belirtilen kritere göre sıralar
 */
export function sortTerms(terms: Term[], sortBy: SortOption): Term[] {
  const result = [...terms]

  switch (sortBy) {
    case 'newest':
      result.sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
      break
    case 'oldest':
      result.sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
      break
    case 'name':
      result.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
      break
    case 'status':
      const statusOrder = { ACTIVE: 0, PAUSED: 1, ARCHIVED: 2 }
      result.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
      break
  }

  return result
}

/**
 * Dönem durumuna göre görsel konfigürasyon döner
 */
export function getStatusConfig(status: Term['status']): TermStatusConfig {
  const configs: Record<Term['status'], TermStatusConfig> = {
    ACTIVE: { label: 'Aktif', color: 'bg-green-500', icon: '✓' },
    PAUSED: { label: 'Duraklatıldı', color: 'bg-orange-500', icon: '⏸' },
    ARCHIVED: { label: 'Arşivlendi', color: 'bg-gray-500', icon: '📦' },
  }

  return configs[status]
}

/**
 * Bitiş tarihini başlangıç ve süreye göre hesaplar
 */
export function calculateEndDate(
  startDate: string,
  duration: 'FOUR_MONTHS' | 'SIX_MONTHS'
): string {
  const start = new Date(startDate)
  const months = duration === 'FOUR_MONTHS' ? 4 : 6
  const end = new Date(start.setMonth(start.getMonth() + months))
  return end.toISOString().split('T')[0]
}

/**
 * Aktif filtre sayısını hesaplar
 */
export function getActiveFilterCount(filters: TermFilters): number {
  return [
    filters.termType.length,
    filters.status.length,
    filters.duration.length,
    filters.dateFrom || filters.dateTo ? 1 : 0,
  ].filter((n) => n > 0).length
}

/**
 * Filtre aktif mi kontrol eder
 */
export function hasActiveFilters(
  searchQuery: string,
  filters: TermFilters
): boolean {
  return (
    !!searchQuery ||
    filters.termType.length > 0 ||
    filters.status.length > 0 ||
    filters.duration.length > 0 ||
    !!filters.dateFrom ||
    !!filters.dateTo
  )
}
