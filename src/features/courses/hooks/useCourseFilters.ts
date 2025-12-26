import { useState, useMemo } from 'react'
import { Course } from '../types'

interface Filters {
  programScope: string[]
  requiresLab: string[]
  hoursMin: string
  hoursMax: string
}

export function useCourseFilters(courses: Course[]) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({
    programScope: [],
    requiresLab: [],
    hoursMin: '',
    hoursMax: '',
  })
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filtreleme ve sıralama
  const sortedAndFilteredCourses = useMemo(() => {
    let filtered = [...courses]

    // Arama
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Program Kapsamı
    if (filters.programScope.length > 0) {
      filtered = filtered.filter((course) =>
        filters.programScope.includes(course.programScope)
      )
    }

    // Lab Gereksinimi
    if (filters.requiresLab.length > 0) {
      filtered = filtered.filter((course) => {
        if (filters.requiresLab.includes('LAB')) {
          return course.requiresLab
        }
        if (filters.requiresLab.includes('NO_LAB')) {
          return !course.requiresLab
        }
        return true
      })
    }

    // Saat Aralığı (4 aylık bazında)
    if (filters.hoursMin) {
      const min = parseInt(filters.hoursMin)
      filtered = filtered.filter((course) => (course.fourMonthHours || 0) >= min)
    }
    if (filters.hoursMax) {
      const max = parseInt(filters.hoursMax)
      filtered = filtered.filter((course) => (course.fourMonthHours || 0) <= max)
    }

    // Sıralama (Türkçe karakter desteği ile)
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'code':
          aValue = a.code
          bValue = b.code
          break
        case 'fourMonthHours':
          aValue = a.fourMonthHours || 0
          bValue = b.fourMonthHours || 0
          break
        case 'sixMonthHours':
          aValue = a.sixMonthHours || 0
          bValue = b.sixMonthHours || 0
          break
        case 'instructors':
          aValue = a._count.courseInstructors
          bValue = b._count.courseInstructors
          break
        case 'subCourses':
          aValue = a._count.subCourses
          bValue = b._count.subCourses
          break
        default:
          aValue = a.name
          bValue = b.name
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
  }, [courses, searchQuery, filters, sortBy, sortOrder])

  const clearFilters = () => {
    setSearchQuery('')
    setFilters({
      programScope: [],
      requiresLab: [],
      hoursMin: '',
      hoursMax: '',
    })
  }

  return {
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
  }
}

