import { useState, useMemo } from 'react'

interface TermCoursePlan {
  id: string
  termId: string
  courseId: string
  totalPlannedHours: number
  totalActualHours: number
  course: {
    id: string
    code: string
    name: string
    programScope: string
  }
  monthlyPlans: Array<{
    id: string
    month: number
    year: number
    plannedHours: number
    actualHours: number
  }>
}

interface Filters {
  completionStatus: string[] // 'COMPLETED', 'IN_PROGRESS', 'NOT_STARTED'
  programScope: string[] // 'COMMON', 'POLIS_ONLY', 'ITFAIYE_ONLY'
  totalPlannedHoursMin: string
  totalPlannedHoursMax: string
  totalActualHoursMin: string
  totalActualHoursMax: string
}

export function useMonthlyPlanFilters(plans: TermCoursePlan[]) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({
    completionStatus: [],
    programScope: [],
    totalPlannedHoursMin: '',
    totalPlannedHoursMax: '',
    totalActualHoursMin: '',
    totalActualHoursMax: '',
  })
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Filtreleme ve sıralama
  const sortedAndFilteredPlans = useMemo(() => {
    let filtered = [...plans]

    // Arama
    if (searchQuery) {
      filtered = filtered.filter(
        (plan) =>
          plan.course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plan.course.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Tamamlanma Durumu
    if (filters.completionStatus.length > 0) {
      filtered = filtered.filter((plan) => {
        const totalActual = plan.monthlyPlans.reduce((sum, mp) => sum + mp.actualHours, 0)
        const totalPlanned = plan.totalPlannedHours

        // En az bir durum eşleşmeli
        const matches: boolean[] = []
        
        if (filters.completionStatus.includes('COMPLETED')) {
          matches.push(totalActual >= totalPlanned && totalPlanned > 0)
        }
        if (filters.completionStatus.includes('IN_PROGRESS')) {
          matches.push(totalActual > 0 && totalActual < totalPlanned)
        }
        if (filters.completionStatus.includes('NOT_STARTED')) {
          matches.push(totalActual === 0)
        }
        
        return matches.some(m => m === true)
      })
    }

    // Program Kapsamı
    if (filters.programScope.length > 0) {
      filtered = filtered.filter((plan) =>
        filters.programScope.includes(plan.course.programScope)
      )
    }

    // Toplam Planlanan Saat Aralığı
    if (filters.totalPlannedHoursMin) {
      const min = parseInt(filters.totalPlannedHoursMin)
      filtered = filtered.filter((plan) => plan.totalPlannedHours >= min)
    }
    if (filters.totalPlannedHoursMax) {
      const max = parseInt(filters.totalPlannedHoursMax)
      filtered = filtered.filter((plan) => plan.totalPlannedHours <= max)
    }

    // Toplam Gerçekleşen Saat Aralığı
    if (filters.totalActualHoursMin) {
      const min = parseInt(filters.totalActualHoursMin)
      filtered = filtered.filter((plan) => {
        const totalActual = plan.monthlyPlans.reduce((sum, mp) => sum + mp.actualHours, 0)
        return totalActual >= min
      })
    }
    if (filters.totalActualHoursMax) {
      const max = parseInt(filters.totalActualHoursMax)
      filtered = filtered.filter((plan) => {
        const totalActual = plan.monthlyPlans.reduce((sum, mp) => sum + mp.actualHours, 0)
        return totalActual <= max
      })
    }

    // Sıralama (Türkçe karakter desteği ile)
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.course.name
          bValue = b.course.name
          break
        case 'code':
          aValue = a.course.code
          bValue = b.course.code
          break
        case 'totalPlannedHours':
          aValue = a.totalPlannedHours
          bValue = b.totalPlannedHours
          break
        case 'totalActualHours':
          aValue = a.monthlyPlans.reduce((sum, mp) => sum + mp.actualHours, 0)
          bValue = b.monthlyPlans.reduce((sum, mp) => sum + mp.actualHours, 0)
          break
        case 'completionRate':
          const aTotalActual = a.monthlyPlans.reduce((sum, mp) => sum + mp.actualHours, 0)
          const bTotalActual = b.monthlyPlans.reduce((sum, mp) => sum + mp.actualHours, 0)
          aValue = a.totalPlannedHours > 0 ? (aTotalActual / a.totalPlannedHours) * 100 : 0
          bValue = b.totalPlannedHours > 0 ? (bTotalActual / b.totalPlannedHours) * 100 : 0
          break
        case 'programScope':
          // COMMON < POLIS_ONLY < ITFAIYE_ONLY sırası
          const scopeOrder: Record<string, number> = { 'COMMON': 1, 'POLIS_ONLY': 2, 'ITFAIYE_ONLY': 3 }
          aValue = scopeOrder[a.course.programScope] || 0
          bValue = scopeOrder[b.course.programScope] || 0
          break
        case 'firstMonthHours':
          // İlk ayın planlanan saatine göre (tarih sırasına göre ilk)
          const aFirstMonth = a.monthlyPlans.length > 0 
            ? a.monthlyPlans.sort((x, y) => {
                if (x.year !== y.year) return x.year - y.year
                return x.month - y.month
              })[0]?.plannedHours || 0
            : 0
          const bFirstMonth = b.monthlyPlans.length > 0
            ? b.monthlyPlans.sort((x, y) => {
                if (x.year !== y.year) return x.year - y.year
                return x.month - y.month
              })[0]?.plannedHours || 0
            : 0
          aValue = aFirstMonth
          bValue = bFirstMonth
          break
        case 'lastMonthHours':
          // Son ayın planlanan saatine göre
          const aLastMonth = a.monthlyPlans.length > 0
            ? a.monthlyPlans.sort((x, y) => {
                if (x.year !== y.year) return y.year - x.year
                return y.month - x.month
              })[0]?.plannedHours || 0
            : 0
          const bLastMonth = b.monthlyPlans.length > 0
            ? b.monthlyPlans.sort((x, y) => {
                if (x.year !== y.year) return y.year - x.year
                return y.month - x.month
              })[0]?.plannedHours || 0
            : 0
          aValue = aLastMonth
          bValue = bLastMonth
          break
        case 'maxMonthlyHours':
          // En yüksek aylık planlanan saate göre
          aValue = a.monthlyPlans.length > 0
            ? Math.max(...a.monthlyPlans.map(mp => mp.plannedHours))
            : 0
          bValue = b.monthlyPlans.length > 0
            ? Math.max(...b.monthlyPlans.map(mp => mp.plannedHours))
            : 0
          break
        case 'minMonthlyHours':
          // En düşük aylık planlanan saate göre
          aValue = a.monthlyPlans.length > 0
            ? Math.min(...a.monthlyPlans.map(mp => mp.plannedHours))
            : 0
          bValue = b.monthlyPlans.length > 0
            ? Math.min(...b.monthlyPlans.map(mp => mp.plannedHours))
            : 0
          break
        case 'avgMonthlyHours':
          // Ortalama aylık planlanan saate göre
          aValue = a.monthlyPlans.length > 0
            ? a.monthlyPlans.reduce((sum, mp) => sum + mp.plannedHours, 0) / a.monthlyPlans.length
            : 0
          bValue = b.monthlyPlans.length > 0
            ? b.monthlyPlans.reduce((sum, mp) => sum + mp.plannedHours, 0) / b.monthlyPlans.length
            : 0
          break
        case 'maxActualHours':
          // En yüksek aylık gerçekleşen saate göre
          aValue = a.monthlyPlans.length > 0
            ? Math.max(...a.monthlyPlans.map(mp => mp.actualHours))
            : 0
          bValue = b.monthlyPlans.length > 0
            ? Math.max(...b.monthlyPlans.map(mp => mp.actualHours))
            : 0
          break
        default:
          aValue = a.course.name
          bValue = b.course.name
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
  }, [plans, searchQuery, filters, sortBy, sortOrder])

  const clearFilters = () => {
    setSearchQuery('')
    setFilters({
      completionStatus: [],
      programScope: [],
      totalPlannedHoursMin: '',
      totalPlannedHoursMax: '',
      totalActualHoursMin: '',
      totalActualHoursMax: '',
    })
  }

  return {
    searchQuery,
    filters,
    sortBy,
    sortOrder,
    sortedAndFilteredPlans,
    setSearchQuery,
    setFilters,
    setSortBy,
    setSortOrder,
    clearFilters,
  }
}

