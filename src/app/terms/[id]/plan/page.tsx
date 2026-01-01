'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { ConfirmDialog, ToastContainer } from '@/shared/components'
import * as XLSX from 'xlsx'

interface Term {
  id: string
  name: string
  termCode: string
  termType: 'POLICE' | 'FIRE'
  duration: 'FOUR_MONTHS' | 'SIX_MONTHS'
}

interface Course {
  id: string
  code: string
  name: string
  fourMonthHours: number | null
  sixMonthHours: number | null
  programScope: string
  requiresLab: boolean
}

interface TermCoursePlan {
  id: string
  termId: string
  courseId: string
  totalPlannedHours: number
  totalActualHours: number
  course: Course
}

interface SelectedCourse {
  courseId: string
  totalPlannedHours: string
  course: Course
}

type PlanFillSource = 'AUTO' | 'COPY' | 'FILE'

type ImportRowStatus = 'OK' | 'COURSE_NOT_FOUND' | 'INVALID_HOURS' | 'DUPLICATE_CODE'

type ImportPreviewRow = {
  code: string
  name?: string
  plannedHoursRaw: string
  plannedHours?: number
  status: ImportRowStatus
  courseId?: string
}

export default function TermPlanPage() {
  const params = useParams()

  // params.id kontrolü ve parse
  const rawId = params?.id
  const termId = Array.isArray(rawId) ? rawId[0] : (rawId as string)

  const [term, setTerm] = useState<Term | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [plans, setPlans] = useState<TermCoursePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterScope, setFilterScope] = useState<string>('ALL') // ALL, COMMON, POLIS_ONLY, ITFAIYE_ONLY

  const [isPlanFillOpen, setIsPlanFillOpen] = useState(false)
  const [planFillStep, setPlanFillStep] = useState<1 | 2 | 3>(1)
  const [planFillSource, setPlanFillSource] = useState<PlanFillSource>('AUTO')
  const [seedLoading, setSeedLoading] = useState(false)
  const [termsForCopy, setTermsForCopy] = useState<Term[]>([])
  const [copyFromTermId, setCopyFromTermId] = useState<string>('')
  const [importPreview, setImportPreview] = useState<ImportPreviewRow[]>([])
  const [applyLoading, setApplyLoading] = useState(false)

  const [toasts, setToasts] = useState<Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  }>>([])

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

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  useEffect(() => {
    if (termId) {
      fetchTerm()
      fetchCourses()
      fetchPlans()
    }
  }, [termId])

  useEffect(() => {
    if (isPlanFillOpen) {
      // modal her acildiginda temiz basla
      setPlanFillStep(1)
      setPlanFillSource('AUTO')
      setImportPreview([])
      setCopyFromTermId('')
      fetchTermsForCopy()
    }
  }, [isPlanFillOpen])

  const fetchTerm = async () => {
    if (!termId) {
      setLoading(false)
      return
    }
    
    try {
      const res = await fetch(`/api/terms/${termId}`)
      const data = await res.json()
      if (res.ok) {
        setTerm(data.term)
      } else {

        console.error('Term fetch error:', data.error)
        showToast(data.error || 'Dönem yüklenemedi', 'error')
      }
    } catch (error) {
      console.error('Term fetch error:', error)
      showToast('Dönem yüklenemedi', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      if (res.ok) {
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error('Courses fetch error:', error)
    }
  }

  const fetchTermsForCopy = async () => {
    try {
      const res = await fetch('/api/terms')
      const data = await res.json()
      if (res.ok) {
        const allTerms: Term[] = data.terms || []
        const filtered = allTerms.filter(t => t.id !== termId)
        setTermsForCopy(filtered)
      }
    } catch (error) {
      console.error('Terms fetch error:', error)
    }
  }

  const fetchPlans = async () => {
    if (!termId) return
    
    try {
      const res = await fetch(`/api/terms/${termId}/course-plans`)
      const data = await res.json()
      if (res.ok) {
        setPlans(data.plans || [])
        setShowForm(data.plans.length === 0) // Eğer plan yoksa formu göster
      } else {
        console.error('Plans fetch error:', data.error)
      }
    } catch (error) {
      console.error('Plans fetch error:', error)
    }
  }

  const normalizeCourseCode = (code: string) => code.trim().toUpperCase()

  const buildCourseCodeIndex = () => {
    const byCode = new Map<string, Course[]>()
    for (const c of courses) {
      const key = normalizeCourseCode(c.code)
      const existing = byCode.get(key) || []
      existing.push(c)
      byCode.set(key, existing)
    }
    return byCode
  }

  const ensureCoursesSeededIfEmpty = async () => {
    if (!term) return
    if (courses.length > 0) return

    setSeedLoading(true)
    try {
      const res = await fetch('/api/admin/seed/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termType: term.termType }),
      })

      const data = await res.json()

      if (res.ok) {
        showToast(data.message || 'Ders katalogu yuklendi', 'success')
        await fetchCourses()
      } else {
        showToast(data.error || 'Ders katalogu yuklenemedi', 'error')
      }
    } catch (error) {
      console.error('Seed courses error:', error)
      showToast('Ders katalogu yuklenemedi', 'error')
    } finally {
      setSeedLoading(false)
    }
  }

  const preparePreviewFromAuto = () => {
    if (!term) return
    const rows: ImportPreviewRow[] = []

    const applicableCourses = courses.filter((c) => {
      if (term.termType === 'POLICE' && c.programScope === 'ITFAIYE_ONLY') return false
      if (term.termType === 'FIRE' && c.programScope === 'POLIS_ONLY') return false
      return true
    })

    for (const c of applicableCourses) {
      const suggested = term.duration === 'FOUR_MONTHS' ? c.fourMonthHours : c.sixMonthHours
      const planned = suggested ?? null

      if (!planned || planned <= 0) {
        continue
      }

      rows.push({
        code: c.code,
        name: c.name,
        plannedHoursRaw: String(planned),
        plannedHours: planned,
        status: 'OK',
        courseId: c.id,
      })
    }

    setImportPreview(rows)
  }

  const preparePreviewFromCopy = async () => {
    if (!termId || !copyFromTermId) {
      showToast('Kopyalanacak donemi secmelisiniz', 'warning')
      return
    }

    try {
      const res = await fetch(`/api/terms/${copyFromTermId}/course-plans`)
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Kaynak donem plani yuklenemedi', 'error')
        return
      }

      const rows: ImportPreviewRow[] = (data.plans || []).map(
        (p: {
          courseId?: string
          totalPlannedHours?: number | null
          course?: {
            code?: string | null
            name?: string | null
          } | null
        }) => ({
          code: p.course?.code || '',
          name: p.course?.name || undefined,
          plannedHoursRaw: String(p.totalPlannedHours ?? ''),
          plannedHours: typeof p.totalPlannedHours === 'number' ? p.totalPlannedHours : undefined,
          status: typeof p.totalPlannedHours === 'number' && p.totalPlannedHours > 0 ? 'OK' : 'INVALID_HOURS',
          courseId: p.courseId,
        })
      )

      setImportPreview(rows)
    } catch (error) {
      console.error('Copy plans fetch error:', error)
      showToast('Kaynak donem plani yuklenemedi', 'error')
    }
  }

  const parseNumberFromCell = (value: unknown) => {
    if (value === null || value === undefined) return null
    if (typeof value === 'number') return value
    const asStr = String(value).trim()
    if (!asStr) return null
    const normalized = asStr.replace(',', '.')
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }

  const preparePreviewFromFile = async (file: File) => {
    if (courses.length === 0) {
      showToast('Once ders katalogu olusturulmali', 'warning')
      return
    }

    try {
      const ext = file.name.split('.').pop()?.toLowerCase()
      const byCode = buildCourseCodeIndex()
      const seenCodes = new Set<string>()

      let rawRows: Array<Record<string, unknown>> = []

      if (ext === 'csv') {
        const text = await file.text()
        const lines = text.split(/\r?\n/).filter(Boolean)
        if (lines.length === 0) {
          showToast('Dosya bos gorunuyor', 'warning')
          return
        }

        // basit CSV: ilk satir header, ayirici virgül veya noktalı virgül
        const delimiter = lines[0].includes(';') ? ';' : ','
        const headers = lines[0].split(delimiter).map((h) => h.trim())
        rawRows = lines.slice(1).map((line) => {
          const values = line.split(delimiter)
          const obj: Record<string, unknown> = {}
          headers.forEach((h, idx) => {
            obj[h] = values[idx]
          })
          return obj
        })
      } else {
        const buf = await file.arrayBuffer()
        const wb = XLSX.read(buf, { type: 'array' })
        const sheetName = wb.SheetNames[0]
        const ws = wb.Sheets[sheetName]
        rawRows = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Array<Record<string, unknown>>
      }

      const rows: ImportPreviewRow[] = rawRows.map((r) => {
        const codeRaw = (r as Record<string, unknown>).code ?? (r as Record<string, unknown>).CODE ?? (r as Record<string, unknown>).kod ?? (r as Record<string, unknown>).KOD ?? (r as Record<string, unknown>)['Ders Kodu'] ?? (r as Record<string, unknown>)['dersKodu'] ?? ''
        const hoursRaw = (r as Record<string, unknown>).plannedHours ?? (r as Record<string, unknown>).PLANNEDHOURS ?? (r as Record<string, unknown>).hours ?? (r as Record<string, unknown>).HOURS ?? (r as Record<string, unknown>).saat ?? (r as Record<string, unknown>).SAAT ?? (r as Record<string, unknown>)['Hedef Saat'] ?? ''
        const nameRaw = (r as Record<string, unknown>).name ?? (r as Record<string, unknown>).NAME ?? (r as Record<string, unknown>).ad ?? (r as Record<string, unknown>).AD ?? (r as Record<string, unknown>)['Ders Adi'] ?? (r as Record<string, unknown>)['Ders Adı'] ?? ''

        const code = normalizeCourseCode(String(codeRaw || ''))
        const plannedNum = parseNumberFromCell(hoursRaw)

        const preview: ImportPreviewRow = {
          code,
          name: nameRaw ? String(nameRaw) : undefined,
          plannedHoursRaw: String(hoursRaw ?? ''),
          plannedHours: plannedNum === null ? undefined : Math.round(plannedNum),
          status: 'OK',
        }

        if (!code) {
          preview.status = 'COURSE_NOT_FOUND'
          return preview
        }

        if (seenCodes.has(code)) {
          preview.status = 'DUPLICATE_CODE'
          return preview
        }
        seenCodes.add(code)

        const matches = byCode.get(code) || []
        if (matches.length === 0) {
          preview.status = 'COURSE_NOT_FOUND'
          return preview
        }
        if (matches.length > 1) {
          preview.status = 'DUPLICATE_CODE'
          return preview
        }

        if (!preview.plannedHours || preview.plannedHours <= 0) {
          preview.status = 'INVALID_HOURS'
          return preview
        }

        preview.courseId = matches[0].id
        preview.name = matches[0].name
        return preview
      })

      setImportPreview(rows)
    } catch (error) {
      console.error('File import parse error:', error)
      showToast('Dosya okunamadi', 'error')
    }
  }

  const applyImportPreview = async () => {
    if (!termId) return
    const okRows = importPreview.filter(r => r.status === 'OK' && r.courseId && r.plannedHours && r.plannedHours > 0)
    if (okRows.length === 0) {
      showToast('Uygulanacak gecerli satir yok', 'warning')
      return
    }

    setApplyLoading(true)
    try {
      // mevcut planlar ile merge: ayni course varsa update, yoksa create
      const existingByCourseId = new Map<string, TermCoursePlan>()
      for (const p of plans) existingByCourseId.set(p.courseId, p)

      const toUpdate = okRows.filter(r => existingByCourseId.has(r.courseId!))
      const toCreate = okRows.filter(r => !existingByCourseId.has(r.courseId!))

      // update
      for (const r of toUpdate) {
        const existing = existingByCourseId.get(r.courseId!)!
        await fetch(`/api/terms/${termId}/course-plans/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ totalPlannedHours: r.plannedHours }),
        })
      }

      // create
      if (toCreate.length > 0) {
        const res = await fetch(`/api/terms/${termId}/course-plans`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plans: toCreate.map(r => ({ courseId: r.courseId, totalPlannedHours: r.plannedHours })),
          }),
        })

        const data = await res.json()
        if (!res.ok) {
          showToast(data.error || 'Plan uygulanamadi', 'error')
          return
        }
      }

      showToast('Plan basariyla uygulandi', 'success')
      await fetchPlans()
      setIsPlanFillOpen(false)
    } catch (error) {
      console.error('Apply import error:', error)
      showToast('Plan uygulanamadi', 'error')
    } finally {
      setApplyLoading(false)
    }
  }

  // Filtrelenmiş dersler
  const filteredCourses = courses.filter(course => {
    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!course.name.toLowerCase().includes(query) && 
          !course.code.toLowerCase().includes(query)) {
        return false
      }
    }

    // Program kapsamı filtresi
    if (filterScope !== 'ALL') {
      if (course.programScope !== filterScope) {
        return false
      }
    } else {
      // ALL seçiliyse, dönem tipine göre filtrele
      if (term) {
        if (term.termType === 'POLICE' && course.programScope === 'ITFAIYE_ONLY') {
          return false
        }
        if (term.termType === 'FIRE' && course.programScope === 'POLIS_ONLY') {
          return false
        }
      }
    }

    // Zaten planlanmış dersleri gösterme (yeni plan oluştururken)
    if (showForm && plans.length > 0) {
      const isAlreadyPlanned = plans.some(plan => plan.courseId === course.id)
      return !isAlreadyPlanned
    }

    return true
  })

  const handleCourseToggle = (course: Course) => {
    const isSelected = selectedCourses.some(sc => sc.courseId === course.id)
    
    if (isSelected) {
      setSelectedCourses(prev => prev.filter(sc => sc.courseId !== course.id))
    } else {
      // Otomatik saat önerisi
      const suggestedHours = term?.duration === 'FOUR_MONTHS' 
        ? course.fourMonthHours 
        : course.sixMonthHours

      setSelectedCourses(prev => [...prev, {
        courseId: course.id,
        totalPlannedHours: suggestedHours ? suggestedHours.toString() : '',
        course,
      }])
    }
  }

  const handleHoursChange = (courseId: string, hours: string) => {
    setSelectedCourses(prev => prev.map(sc => 
      sc.courseId === courseId 
        ? { ...sc, totalPlannedHours: hours }
        : sc
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedCourses.length === 0) {
      showToast('En az bir ders seçmelisiniz', 'warning')
      return
    }

    // Validasyon: Tüm seçili dersler için saat girilmiş mi?
    const invalidCourses = selectedCourses.filter(sc => !sc.totalPlannedHours || parseInt(sc.totalPlannedHours) <= 0)
    if (invalidCourses.length > 0) {
      showToast('Tüm seçili dersler için geçerli bir saat girmelisiniz', 'warning')
      return
    }

    setSaving(true)

    try {
      const res = await fetch(`/api/terms/${termId}/course-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plans: selectedCourses.map(sc => ({
            courseId: sc.courseId,
            totalPlannedHours: parseInt(sc.totalPlannedHours),
          })),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        showToast(data.message || 'Dönem planı başarıyla oluşturuldu!', 'success')
        setSelectedCourses([])
        setShowForm(false)
        fetchPlans()
      } else {
        showToast(data.error || 'Plan oluşturulamadı', 'error')
      }
    } catch (error) {
      console.error('Plan create error:', error)
      showToast('Sunucu hatası', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePlan = (plan: TermCoursePlan) => {
    if (!termId) {
      showToast('Dönem ID bulunamadı', 'error')
      return
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Planı Sil',
      message: `"${plan.course.name}" dersinin planını silmek istediğinize emin misiniz?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/terms/${termId}/course-plans/${plan.id}`, {
            method: 'DELETE',
          })

          const data = await res.json()

          if (res.ok) {
            showToast('Plan başarıyla silindi', 'success')
            fetchPlans()
          } else {
            showToast(data.error || 'Plan silinemedi', 'error')
          }
        } catch (error) {
          console.error('Plan delete error:', error)
          showToast('Sunucu hatası', 'error')
        } finally {
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        }
      },
    })
  }

  // Toplam saat hesaplama
  const totalPlannedHours = plans.reduce((sum, plan) => sum + plan.totalPlannedHours, 0)
  const totalActualHours = plans.reduce((sum, plan) => sum + plan.totalActualHours, 0)

  if (!termId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Dönem ID bulunamadı</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    )
  }

  if (!term) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Dönem bulunamadı</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      {/* Başlık */}
      <div className="mb-8">
        <Link 
          href={`/terms/${termId}`} 
          className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-2"
        >
          <Icon icon="ph:arrow-left-bold" width="20" />
          Döneme Dön
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">📋 Dönem Planı</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {term.name} - {term.termCode}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlanFillOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
            >
              <Icon icon="ph:wand-bold" width="20" />
              Planı Doldur
            </button>
            {plans.length > 0 && (
              <>
                <Link
                  href={`/terms/${termId}/plan/monthly`}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium"
                >
                  <Icon icon="ph:calendar-blank-bold" width="20" />
                  Aylık Program
                </Link>
                <Link
                  href={`/terms/${termId}/schedule/weekly/1`}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium"
                >
                  <Icon icon="ph:calendar-week-bold" width="20" />
                  Haftalık Program
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Plan Doldur Sihirbazi */}
      {isPlanFillOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold">Plani Doldur</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Kopyala / Dosyadan Iceri Aktar / Otomatik Doldur</p>
              </div>
              <button
                onClick={() => setIsPlanFillOpen(false)}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                title="Kapat"
              >
                <Icon icon="ph:x-bold" width="22" />
              </button>
            </div>

            <div className="px-6 py-4">
              {/* Step 1: katalog kontrol + kaynak secimi */}
              {planFillStep === 1 && (
                <div className="space-y-4">
                  {courses.length === 0 ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="font-semibold mb-1">Ders katalogu bos</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        Import / kopyalama icin once standart dersleri yukleyelim.
                      </div>
                      <button
                        onClick={ensureCoursesSeededIfEmpty}
                        disabled={seedLoading || !term}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {seedLoading ? (
                          <>
                            <Icon icon="ph:spinner" width="18" className="animate-spin" />
                            Yukleniyor...
                          </>
                        ) : (
                          <>
                            <Icon icon="ph:download-simple-bold" width="18" />
                            Standart Mufredati Yukle
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="font-semibold mb-1">Ders katalogu hazir</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">Kaynak secerek devam edebilirsiniz.</div>
                    </div>
                  )}

                  <div>
                    <div className="font-semibold mb-2">Kaynak</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        onClick={() => setPlanFillSource('AUTO')}
                        className={`border rounded-lg p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          planFillSource === 'AUTO' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="font-semibold flex items-center gap-2"><Icon icon="ph:magic-wand-bold" width="18" />Otomatik</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Hedef saatlerden doldur</div>
                      </button>
                      <button
                        onClick={() => setPlanFillSource('COPY')}
                        className={`border rounded-lg p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          planFillSource === 'COPY' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="font-semibold flex items-center gap-2"><Icon icon="ph:copy-bold" width="18" />Kopyala</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Baska donemden al</div>
                      </button>
                      <button
                        onClick={() => setPlanFillSource('FILE')}
                        className={`border rounded-lg p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          planFillSource === 'FILE' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="font-semibold flex items-center gap-2"><Icon icon="ph:file-arrow-up-bold" width="18" />Dosya</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Excel/CSV import</div>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setIsPlanFillOpen(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Iptal
                    </button>
                    <button
                      onClick={async () => {
                        if (courses.length === 0) {
                          showToast('Once ders katalogu yuklenmeli', 'warning')
                          return
                        }
                        setPlanFillStep(2)
                        setImportPreview([])
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Devam
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: kaynaga gore veri hazirla */}
              {planFillStep === 2 && (
                <div className="space-y-4">
                  {planFillSource === 'AUTO' && (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Dönem suresine gore (4/6 ay) hedef saatlerden plan hazirlanacak.
                      </div>
                      <button
                        onClick={() => {
                          preparePreviewFromAuto()
                          setPlanFillStep(3)
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Icon icon="ph:eye-bold" width="18" />
                        Onizleme Hazirla
                      </button>
                    </div>
                  )}

                  {planFillSource === 'COPY' && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium">Kaynak Donem</label>
                      <select
                        value={copyFromTermId}
                        onChange={(e) => setCopyFromTermId(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      >
                        <option value="">Seciniz...</option>
                        {termsForCopy.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.termCode} - {t.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={async () => {
                          await preparePreviewFromCopy()
                          setPlanFillStep(3)
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Icon icon="ph:eye-bold" width="18" />
                        Onizleme Hazirla
                      </button>
                    </div>
                  )}

                  {planFillSource === 'FILE' && (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Dosya kolonlari: <span className="font-mono">code</span> ve <span className="font-mono">plannedHours</span> (veya benzerleri).
                      </div>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={async (e) => {
                          const f = e.target.files?.[0]
                          if (!f) return
                          await preparePreviewFromFile(f)
                          setPlanFillStep(3)
                        }}
                        className="block w-full text-sm"
                      />
                    </div>
                  )}

                  <div className="flex justify-between gap-3">
                    <button
                      onClick={() => setPlanFillStep(1)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Geri
                    </button>
                    <button
                      onClick={() => setIsPlanFillOpen(false)}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: onizleme + uygula */}
              {planFillStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Onizleme</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      OK: {importPreview.filter(r => r.status === 'OK').length} / Toplam: {importPreview.length}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                          <th className="text-left py-2 px-3">Kod</th>
                          <th className="text-left py-2 px-3">Ders</th>
                          <th className="text-right py-2 px-3">Hedef</th>
                          <th className="text-left py-2 px-3">Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-gray-500">Onizleme yok</td>
                          </tr>
                        ) : (
                          importPreview.map((r, idx) => (
                            <tr key={`${r.code}-${idx}`} className="border-b border-gray-100 dark:border-gray-700">
                              <td className="py-2 px-3 font-mono">{r.code || '-'}</td>
                              <td className="py-2 px-3">{r.name || '-'}</td>
                              <td className="py-2 px-3 text-right">{r.plannedHours ?? r.plannedHoursRaw}</td>
                              <td className="py-2 px-3">
                                {r.status === 'OK' && <span className="text-green-700 dark:text-green-300">OK</span>}
                                {r.status === 'COURSE_NOT_FOUND' && <span className="text-red-700 dark:text-red-300">Ders bulunamadi</span>}
                                {r.status === 'INVALID_HOURS' && <span className="text-red-700 dark:text-red-300">Saat gecersiz</span>}
                                {r.status === 'DUPLICATE_CODE' && <span className="text-yellow-700 dark:text-yellow-300">Tekrarlanan/Belirsiz kod</span>}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between gap-3">
                    <button
                      onClick={() => setPlanFillStep(2)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Geri
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsPlanFillOpen(false)}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                      >
                        Kapat
                      </button>
                      <button
                        onClick={applyImportPreview}
                        disabled={applyLoading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {applyLoading ? (
                          <>
                            <Icon icon="ph:spinner" width="18" className="animate-spin" />
                            Uygulaniyor...
                          </>
                        ) : (
                          <>
                            <Icon icon="ph:check-bold" width="18" />
                            Uygula
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mevcut Plan Görünümü */}
      {plans.length > 0 && !showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Mevcut Plan</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Icon icon="ph:plus-bold" width="20" />
              Yeni Ders Ekle
            </button>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Planlanan Saat</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalPlannedHours}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Gerçekleşen Saat</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalActualHours}</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Planlanan Ders Sayısı</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{plans.length}</div>
            </div>
          </div>

          {/* Plan Tablosu */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold">Ders Kodu</th>
                  <th className="text-left py-3 px-4 font-semibold">Ders Adı</th>
                  <th className="text-right py-3 px-4 font-semibold">Planlanan Saat</th>
                  <th className="text-right py-3 px-4 font-semibold">Gerçekleşen Saat</th>
                  <th className="text-right py-3 px-4 font-semibold">İlerleme</th>
                  <th className="text-center py-3 px-4 font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => {
                  const progress = plan.totalPlannedHours > 0 
                    ? Math.round((plan.totalActualHours / plan.totalPlannedHours) * 100)
                    : 0

                  return (
                    <tr key={plan.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 font-mono text-sm">{plan.course.code}</td>
                      <td className="py-3 px-4">{plan.course.name}</td>
                      <td className="py-3 px-4 text-right font-semibold">{plan.totalPlannedHours}</td>
                      <td className="py-3 px-4 text-right">{plan.totalActualHours}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeletePlan(plan)}
                          className="text-red-600 hover:text-red-700 p-2"
                          title="Planı sil"
                        >
                          <Icon icon="ph:trash-bold" width="20" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Yeni Plan Formu */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {plans.length > 0 ? 'Yeni Ders Ekle' : 'Dönem Planı Oluştur'}
            </h2>
            {plans.length > 0 && (
              <button
                onClick={() => {
                  setShowForm(false)
                  setSelectedCourses([])
                }}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                İptal
              </button>
            )}
          </div>

          {/* Filtreler */}
          <div className="mb-6 flex gap-4">
            <input
              type="text"
              placeholder="Ders ara (kod veya ad)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
            <select
              value={filterScope}
              onChange={(e) => setFilterScope(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            >
              <option value="ALL">Tümü</option>
              <option value="COMMON">Ortak</option>
              <option value="POLIS_ONLY">Sadece Polis</option>
              <option value="ITFAIYE_ONLY">Sadece İtfaiye</option>
            </select>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Ders Listesi */}
            <div className="max-h-96 overflow-y-auto mb-6 border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold w-12">
                      <input
                        type="checkbox"
                        checked={filteredCourses.length > 0 && filteredCourses.every(course => 
                          selectedCourses.some(sc => sc.courseId === course.id)
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            filteredCourses.forEach(course => {
                              if (!selectedCourses.some(sc => sc.courseId === course.id)) {
                                const suggestedHours = term.duration === 'FOUR_MONTHS' 
                                  ? course.fourMonthHours 
                                  : course.sixMonthHours
                                setSelectedCourses(prev => [...prev, {
                                  courseId: course.id,
                                  totalPlannedHours: suggestedHours ? suggestedHours.toString() : '',
                                  course,
                                }])
                              }
                            })
                          } else {
                            setSelectedCourses(prev => prev.filter(sc => 
                              !filteredCourses.some(course => course.id === sc.courseId)
                            ))
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">Ders Kodu</th>
                    <th className="text-left py-3 px-4 font-semibold">Ders Adı</th>
                    <th className="text-left py-3 px-4 font-semibold">Program Kapsamı</th>
                    <th className="text-right py-3 px-4 font-semibold">Önerilen Saat</th>
                    <th className="text-right py-3 px-4 font-semibold">Hedef Saat</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        {searchQuery ? 'Arama sonucu bulunamadı' : 'Ders bulunamadı'}
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((course) => {
                      const isSelected = selectedCourses.some(sc => sc.courseId === course.id)
                      const selectedCourse = selectedCourses.find(sc => sc.courseId === course.id)
                      const suggestedHours = term.duration === 'FOUR_MONTHS' 
                        ? course.fourMonthHours 
                        : course.sixMonthHours

                      return (
                        <tr 
                          key={course.id} 
                          className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                            isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCourseToggle(course)}
                              className="rounded"
                            />
                          </td>
                          <td className="py-3 px-4 font-mono text-sm">{course.code}</td>
                          <td className="py-3 px-4">{course.name}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              course.programScope === 'COMMON' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              course.programScope === 'POLIS_ONLY' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {course.programScope === 'COMMON' ? 'Ortak' :
                               course.programScope === 'POLIS_ONLY' ? 'Sadece Polis' :
                               'Sadece İtfaiye'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {suggestedHours ? (
                              <span className="text-gray-600 dark:text-gray-400">{suggestedHours} saat</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {isSelected ? (
                              <input
                                type="number"
                                min="1"
                                value={selectedCourse?.totalPlannedHours || ''}
                                onChange={(e) => handleHoursChange(course.id, e.target.value)}
                                placeholder={suggestedHours ? suggestedHours.toString() : 'Saat'}
                                className="w-24 px-2 py-1 border rounded text-right focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                required
                              />
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Önizleme */}
            {selectedCourses.length > 0 && (
              <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Seçili Dersler ({selectedCourses.length})</h3>
                <div className="space-y-2">
                  {selectedCourses.map((sc) => {
                    const totalHours = parseInt(sc.totalPlannedHours) || 0
                    return (
                      <div key={sc.courseId} className="flex justify-between items-center">
                        <span>{sc.course.name}</span>
                        <span className="font-semibold">{totalHours} saat</span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600 flex justify-between items-center font-bold">
                  <span>Toplam:</span>
                  <span>
                    {selectedCourses.reduce((sum, sc) => sum + (parseInt(sc.totalPlannedHours) || 0), 0)} saat
                  </span>
                </div>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving || selectedCourses.length === 0}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Icon icon="ph:spinner" width="20" className="animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Icon icon="ph:check-bold" width="20" />
                    Planı Kaydet
                  </>
                )}
              </button>
              {plans.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setSelectedCourses([])
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
                >
                  İptal
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

