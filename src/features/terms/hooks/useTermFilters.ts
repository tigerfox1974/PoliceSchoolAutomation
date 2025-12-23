/**
 * useTermFilters Hook
 * Dönem filtreleme, sıralama ve görünüm state yönetimi
 */

import { useState, useEffect, useMemo } from 'react'
import type { Term, TermFilters, SortOption, ViewMode } from '../types'
import { filterTerms, sortTerms } from '../utils'

export function useTermFilters(terms: Term[]) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<TermFilters>({
    termType: [],
    status: [],
    duration: [],
    dateFrom: '',
    dateTo: '',
  })
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Filtrelenmiş dönemler
  const filteredTerms = useMemo(() => {
    return filterTerms(terms, searchQuery, filters)
  }, [terms, searchQuery, filters])

  // Filtrelenmiş + sıralanmış dönemler
  const sortedAndFilteredTerms = useMemo(() => {
    return sortTerms(filteredTerms, sortBy)
  }, [filteredTerms, sortBy])

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

  return {
    // State
    searchQuery,
    filters,
    sortBy,
    viewMode,
    
    // Computed
    filteredTerms,
    sortedAndFilteredTerms,
    
    // Actions
    setSearchQuery,
    setFilters,
    setSortBy,
    setViewMode,
    clearFilters,
  }
}
