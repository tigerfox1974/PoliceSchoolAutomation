import { useState, useMemo } from 'react'
import { Instructor } from '../types'

interface Filters {
  instructorType: string[]
  isActive: string[]
}

export function useInstructorFilters(instructors: Instructor[]) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({
    instructorType: [],
    isActive: [],
  })
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const sortedAndFilteredInstructors = useMemo(() => {
    let filtered = [...instructors]

    // Arama
    if (searchQuery) {
      filtered = filtered.filter(
        (instructor) =>
          instructor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          instructor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (instructor.rank && instructor.rank.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (instructor.branch && instructor.branch.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Tip filtresi
    if (filters.instructorType.length > 0) {
      filtered = filtered.filter((instructor) =>
        filters.instructorType.includes(instructor.instructorType)
      )
    }

    // Aktif durum
    if (filters.isActive.length > 0) {
      filtered = filtered.filter((instructor) => {
        if (filters.isActive.includes('ACTIVE')) return instructor.isActive
        if (filters.isActive.includes('INACTIVE')) return !instructor.isActive
        return true
      })
    }

    // Sıralama (Türkçe karakter desteği ile)
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`
          bValue = `${b.firstName} ${b.lastName}`
          break
        case 'rank':
          aValue = a.rank || ''
          bValue = b.rank || ''
          break
        case 'courses':
          aValue = a._count.courseInstructors
          bValue = b._count.courseInstructors
          break
        case 'branch':
          aValue = a.branch || ''
          bValue = b.branch || ''
          break
        default:
          aValue = a.lastName
          bValue = b.lastName
      }

      // Sayısal değerler için normal karşılaştırma
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }

      // String değerler için Türkçe locale-aware sıralama
      const comparison = aValue.toString().localeCompare(bValue.toString(), 'tr', {
        sensitivity: 'base',
        numeric: true,
      })

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [instructors, searchQuery, filters, sortBy, sortOrder])

  const clearFilters = () => {
    setSearchQuery('')
    setFilters({
      instructorType: [],
      isActive: [],
    })
  }

  return {
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
  }
}

