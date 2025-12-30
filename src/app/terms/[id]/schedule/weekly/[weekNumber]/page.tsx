'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { ToastContainer } from '@/shared/components'

interface WeeklySchedule {
  termId: string
  weekNumber: number
  weekStartDate: string
  weekEndDate: string
  weekDays: Array<{
    date: string
    dayOfWeek: string
    dayName: string
    slots: Array<any>
  }>
  totalLessons: number
}

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]

const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']

export default function WeeklySchedulePage() {
  const params = useParams()
  const router = useRouter()
  
  const rawId = params?.id
  const termId = Array.isArray(rawId) ? rawId[0] : (rawId as string)
  
  const rawWeekNumber = params?.weekNumber
  const weekNumber = Array.isArray(rawWeekNumber) 
    ? parseInt(rawWeekNumber[0]) 
    : parseInt(rawWeekNumber as string) || 1

  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [term, setTerm] = useState<any>(null)
  const [maxWeeksFromAPI, setMaxWeeksFromAPI] = useState<number | null>(null)
  
  // maxWeeks'i term state'inden veya API'den gelen değerden hesapla
  const maxWeeks = useMemo(() => {
    // Önce API'den gelen değeri kullan (daha güvenilir)
    if (maxWeeksFromAPI !== null) {
      return maxWeeksFromAPI
    }
    
    // Sonra term state'inden hesapla
    if (!term?.startDate || !term?.endDate) return 1
    
    const startDate = new Date(term.startDate)
    const endDate = new Date(term.endDate)
    
    // İlk Pazartesi'yi bul
    const startDayOfWeek = startDate.getDay()
    const daysToMonday = startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek
    const firstMonday = new Date(startDate)
    firstMonday.setDate(startDate.getDate() + daysToMonday)
    firstMonday.setHours(0, 0, 0, 0)
    
    // Toplam hafta sayısını hesapla
    const totalWeeks = Math.ceil((endDate.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000))
    return Math.max(1, totalWeeks)
  }, [term?.startDate, term?.endDate, maxWeeksFromAPI])

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

  // Term bilgisini sadece termId değiştiğinde yükle (maxWeeks hesaplaması için)
  useEffect(() => {
    if (termId) {
      fetchTerm()
    }
  }, [termId])

  // Haftalık programı weekNumber değiştiğinde yükle
  useEffect(() => {
    if (termId) {
      fetchSchedule()
    }
  }, [termId, weekNumber])

  const fetchTerm = async () => {
    try {
      const response = await fetch(`/api/terms/${termId}`)
      if (response.ok) {
        const data = await response.json()
        setTerm(data)
        // maxWeeks artık useMemo ile term state'inden hesaplanıyor
      }
    } catch (error) {
      console.error('Fetch term error:', error)
    }
  }

  const fetchSchedule = async () => {
    if (!termId) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/terms/${termId}/weekly-schedule?weekNumber=${weekNumber}`)
      if (response.ok) {
        const data = await response.json()
        setSchedule(data)
        // API'den gelen totalWeeks bilgisini kaydet (navigasyon için)
        if (data.totalWeeks && data.totalWeeks > 0) {
          setMaxWeeksFromAPI(data.totalWeeks)
        }
      } else {
        const error = await response.json()
        showToast(error.error || 'Haftalık program getirilemedi', 'error')
      }
    } catch (error) {
      console.error('Fetch schedule error:', error)
      showToast('Sunucu hatası', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (generateAll: boolean = false) => {
    if (!termId) return
    
    setGenerating(true)
    try {
      const response = await fetch(`/api/terms/${termId}/weekly-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          weekNumber: generateAll ? undefined : weekNumber,
          generateAll: generateAll,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Generate response:', JSON.stringify(data, null, 2))
        
        if (generateAll) {
          const totalLessons = data.totalCreatedLessons || 0
          const totalWeeks = data.totalWeeks || 0
          showToast(`Tüm haftalar için program oluşturuldu (${totalWeeks} hafta, ${totalLessons} ders)`, 'success')
          // API'den gelen totalWeeks değerini kaydet (navigasyon için)
          if (totalWeeks > 0) {
            setMaxWeeksFromAPI(totalWeeks)
          }
        } else {
          const lessonCount = data.createdLessons || 0
          if (lessonCount > 0) {
            showToast(`${data.message || 'Haftalık program oluşturuldu'} (${lessonCount} ders)`, 'success')
          } else {
            const warningMsg = data.warning || 'Haftalık program oluşturuldu ancak hiç ders oluşturulamadı. Terminal loglarını kontrol edin.'
            showToast(warningMsg, 'warning')
            console.warn('No lessons created. Response:', data)
          }
        }
        
        // Hemen yeniden yükle
        setTimeout(async () => {
          await fetchSchedule()
          // maxWeeks zaten termId'den hesaplanıyor, tekrar fetchTerm() çağırmaya gerek yok
        }, 1000)
      } else {
        const error = await response.json()
        console.error('Generate schedule error:', error)
        let errorMessage = error.error || 'Haftalık program oluşturulamadı'
        if (error.debug) {
          console.log('Debug info:', error.debug)
          if (error.debug.allMonthlyPlans && error.debug.allMonthlyPlans.length > 0) {
            errorMessage += ` (Mevcut aylık planlar: ${error.debug.allMonthlyPlans.join(', ')})`
          }
        }
        showToast(errorMessage, 'error')
      }
    } catch (error) {
      console.error('Generate schedule error:', error)
      showToast('Sunucu hatası', 'error')
    } finally {
      setGenerating(false)
    }
  }


  // Tüm dersleri topla ve her birine unique renk ata
  const courseColorMap = useMemo(() => {
    if (!schedule) return new Map<string, any>()
    
    const colorMap = new Map<string, any>()
    const allCourseIds = new Set<string>()
    
    // Tüm dersleri topla
    schedule.weekDays.forEach((day) => {
      day.slots.forEach((slot) => {
        if (slot) {
          const courseId = slot.course?.id || slot.specialEvent?.id || 'unknown'
          if (courseId !== 'unknown') {
            allCourseIds.add(courseId)
          }
        }
      })
    })
    
    // Renk paleti (birbirinden farklı, ayırt edilebilir renkler)
    const colors = [
      { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-900' },
      { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-900' },
      { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-900' },
      { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-900' },
      { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-900' },
      { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-900' },
      { bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-900' },
      { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-900' },
      { bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-900' },
      { bg: 'bg-cyan-100', border: 'border-cyan-400', text: 'text-cyan-900' },
      { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-900' },
      { bg: 'bg-lime-100', border: 'border-lime-400', text: 'text-lime-900' },
      { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-900' },
      { bg: 'bg-violet-100', border: 'border-violet-400', text: 'text-violet-900' },
      { bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-900' },
      { bg: 'bg-sky-100', border: 'border-sky-400', text: 'text-sky-900' },
      { bg: 'bg-fuchsia-100', border: 'border-fuchsia-400', text: 'text-fuchsia-900' },
      { bg: 'bg-slate-200', border: 'border-slate-500', text: 'text-slate-900' },
      { bg: 'bg-stone-200', border: 'border-stone-500', text: 'text-stone-900' },
      { bg: 'bg-zinc-200', border: 'border-zinc-500', text: 'text-zinc-900' },
      { bg: 'bg-blue-200', border: 'border-blue-500', text: 'text-blue-950' },
      { bg: 'bg-red-200', border: 'border-red-500', text: 'text-red-950' },
      { bg: 'bg-green-200', border: 'border-green-500', text: 'text-green-950' },
      { bg: 'bg-yellow-200', border: 'border-yellow-500', text: 'text-yellow-950' },
      { bg: 'bg-purple-200', border: 'border-purple-500', text: 'text-purple-950' },
      { bg: 'bg-pink-200', border: 'border-pink-500', text: 'text-pink-950' },
      { bg: 'bg-indigo-200', border: 'border-indigo-500', text: 'text-indigo-950' },
      { bg: 'bg-orange-200', border: 'border-orange-500', text: 'text-orange-950' },
      { bg: 'bg-teal-200', border: 'border-teal-500', text: 'text-teal-950' },
      { bg: 'bg-cyan-200', border: 'border-cyan-500', text: 'text-cyan-950' },
      { bg: 'bg-amber-200', border: 'border-amber-500', text: 'text-amber-950' },
      { bg: 'bg-lime-200', border: 'border-lime-500', text: 'text-lime-950' },
      { bg: 'bg-emerald-200', border: 'border-emerald-500', text: 'text-emerald-950' },
      { bg: 'bg-violet-200', border: 'border-violet-500', text: 'text-violet-950' },
      { bg: 'bg-rose-200', border: 'border-rose-500', text: 'text-rose-950' },
      { bg: 'bg-sky-200', border: 'border-sky-500', text: 'text-sky-950' },
      { bg: 'bg-fuchsia-200', border: 'border-fuchsia-500', text: 'text-fuchsia-950' },
      { bg: 'bg-blue-300', border: 'border-blue-600', text: 'text-blue-950' },
      { bg: 'bg-red-300', border: 'border-red-600', text: 'text-red-950' },
      { bg: 'bg-green-300', border: 'border-green-600', text: 'text-green-950' },
      { bg: 'bg-yellow-300', border: 'border-yellow-600', text: 'text-yellow-950' },
      { bg: 'bg-purple-300', border: 'border-purple-600', text: 'text-purple-950' },
      { bg: 'bg-pink-300', border: 'border-pink-600', text: 'text-pink-950' },
      { bg: 'bg-indigo-300', border: 'border-indigo-600', text: 'text-indigo-950' },
      { bg: 'bg-orange-300', border: 'border-orange-600', text: 'text-orange-950' },
      { bg: 'bg-teal-300', border: 'border-teal-600', text: 'text-teal-950' },
      { bg: 'bg-cyan-300', border: 'border-cyan-600', text: 'text-cyan-950' },
      { bg: 'bg-amber-300', border: 'border-amber-600', text: 'text-amber-950' },
      { bg: 'bg-lime-300', border: 'border-lime-600', text: 'text-lime-950' },
      { bg: 'bg-emerald-300', border: 'border-emerald-600', text: 'text-emerald-950' },
      { bg: 'bg-violet-300', border: 'border-violet-600', text: 'text-violet-950' },
      { bg: 'bg-rose-300', border: 'border-rose-600', text: 'text-rose-950' },
      { bg: 'bg-sky-300', border: 'border-sky-600', text: 'text-sky-950' },
      { bg: 'bg-fuchsia-300', border: 'border-fuchsia-600', text: 'text-fuchsia-950' },
      // Koyu renkler (beyaz yazı ile)
      { bg: 'bg-red-700', border: 'border-red-900', text: 'text-white' },
      { bg: 'bg-blue-700', border: 'border-blue-900', text: 'text-white' },
      { bg: 'bg-green-700', border: 'border-green-900', text: 'text-white' },
      { bg: 'bg-purple-700', border: 'border-purple-900', text: 'text-white' },
      { bg: 'bg-indigo-700', border: 'border-indigo-900', text: 'text-white' },
      { bg: 'bg-pink-700', border: 'border-pink-900', text: 'text-white' },
      { bg: 'bg-yellow-600', border: 'border-yellow-800', text: 'text-white' },
      { bg: 'bg-orange-700', border: 'border-orange-900', text: 'text-white' },
      { bg: 'bg-teal-700', border: 'border-teal-900', text: 'text-white' },
      { bg: 'bg-cyan-700', border: 'border-cyan-900', text: 'text-white' },
      { bg: 'bg-amber-700', border: 'border-amber-900', text: 'text-white' },
      { bg: 'bg-lime-700', border: 'border-lime-900', text: 'text-white' },
      { bg: 'bg-emerald-700', border: 'border-emerald-900', text: 'text-white' },
      { bg: 'bg-violet-700', border: 'border-violet-900', text: 'text-white' },
      { bg: 'bg-rose-700', border: 'border-rose-900', text: 'text-white' },
      { bg: 'bg-sky-700', border: 'border-sky-900', text: 'text-white' },
      { bg: 'bg-fuchsia-700', border: 'border-fuchsia-900', text: 'text-white' },
      // Ek açık renkler
      { bg: 'bg-slate-300', border: 'border-slate-600', text: 'text-slate-950' },
      { bg: 'bg-stone-300', border: 'border-stone-600', text: 'text-stone-950' },
      { bg: 'bg-neutral-300', border: 'border-neutral-600', text: 'text-neutral-950' },
      { bg: 'bg-zinc-300', border: 'border-zinc-600', text: 'text-zinc-950' },
      // Ek koyu renkler
      { bg: 'bg-slate-700', border: 'border-slate-900', text: 'text-white' },
      { bg: 'bg-stone-700', border: 'border-stone-900', text: 'text-white' },
      { bg: 'bg-neutral-700', border: 'border-neutral-900', text: 'text-white' },
      { bg: 'bg-zinc-700', border: 'border-zinc-900', text: 'text-white' },
    ]
    
    // Her derse sırayla unique renk ata
    const courseIdsArray = Array.from(allCourseIds)
    courseIdsArray.forEach((courseId, index) => {
      const colorIndex = index % colors.length
      colorMap.set(courseId, colors[colorIndex])
    })
    
    return colorMap
  }, [schedule])

  // Ders için renk kodu al (unique renk garantisi)
  const getCourseColor = (courseId: string) => {
    return courseColorMap.get(courseId) || {
      bg: 'bg-gray-100',
      border: 'border-gray-400',
      text: 'text-gray-900',
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekNumber = direction === 'prev' ? weekNumber - 1 : weekNumber + 1
    if (newWeekNumber < 1 || newWeekNumber > maxWeeks) return
    router.push(`/terms/${termId}/schedule/weekly/${newWeekNumber}`)
  }

  const handleWeekSelect = (newWeek: number) => {
    if (newWeek >= 1 && newWeek <= maxWeeks) {
      router.push(`/terms/${termId}/schedule/weekly/${newWeek}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    )
  }

  if (!termId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Dönem ID bulunamadı</div>
      </div>
    )
  }

  const weekStartDate = schedule?.weekStartDate ? new Date(schedule.weekStartDate) : null
  const weekEndDate = schedule?.weekEndDate ? new Date(schedule.weekEndDate) : null

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="mb-8">
        <Link 
          href={`/terms/${termId}/plan`}
          className="text-blue-600 hover:underline mb-2 inline-block flex items-center gap-2"
        >
          <Icon icon="ph:arrow-left-bold" width="20" />
          Dönem Planına Dön
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Icon icon="ph:calendar-blank-bold" width="32" />
              {weekNumber}. HAFTA
            </h1>
            {weekStartDate && weekEndDate && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {weekStartDate.getDate()} {MONTH_NAMES[weekStartDate.getMonth()]} {weekStartDate.getFullYear()} - 
                {' '}{weekEndDate.getDate()} {MONTH_NAMES[weekEndDate.getMonth()]} {weekEndDate.getFullYear()}
              </p>
            )}
            {term && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                {term.name} - {term.termCode}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateWeek('prev')}
              disabled={weekNumber <= 1}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon icon="ph:arrow-left-bold" width="20" />
            </button>
            
            {/* Direkt hafta seçimi */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Hafta:</span>
              <select
                value={weekNumber}
                onChange={(e) => handleWeekSelect(parseInt(e.target.value))}
                className="px-3 py-1 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-sm font-semibold"
              >
                {Array.from({ length: maxWeeks }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500 dark:text-gray-400">/ {maxWeeks}</span>
            </div>
            
            <button
              onClick={() => navigateWeek('next')}
              disabled={weekNumber >= maxWeeks}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon icon="ph:arrow-right-bold" width="20" />
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!schedule || schedule.totalLessons === 0 ? (
            <button
              onClick={() => handleGenerate(true)}
              disabled={generating}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Icon icon="ph:magic-wand-bold" width="20" />
              {generating ? 'Oluşturuluyor...' : 'Tüm Haftalar İçin Program Oluştur'}
            </button>
          ) : (
            <button
              onClick={() => handleGenerate(true)}
              disabled={generating}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Icon icon="ph:arrow-clockwise-bold" width="20" />
              {generating ? 'Yenileniyor...' : 'Tüm Programları Yenile'}
            </button>
          )}
        </div>
      </div>

      {/* Schedule Table */}
      {!schedule || schedule.totalLessons === 0 ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Icon icon="ph:calendar-blank-bold" width="64" className="mx-auto mb-4 text-gray-400" />
          <p className="text-xl text-gray-600 dark:text-gray-400">Haftalık program henüz oluşturulmamış</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Yukarıdaki "Haftalık Programı Oluştur" butonuna tıklayarak otomatik oluşturabilirsiniz
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold border-r border-blue-500 min-w-[150px]">
                    TARİH
                  </th>
                  {[1, 2, 3, 4, 5, 6, 7].map((slot) => (
                    <th key={slot} className="px-3 py-3 text-center text-xs font-bold border-r border-blue-500 min-w-[140px]">
                      <div>{slot}. DERS</div>
                      <div className="text-xs opacity-90 mt-1">08:15-09:00</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {schedule.weekDays.map((day, dayIndex) => {
                  const date = new Date(day.date)
                  const isWeekend = day.dayOfWeek === 'SATURDAY' || day.dayOfWeek === 'SUNDAY'
                  
                  return (
                    <tr key={day.date} className={isWeekend ? 'bg-gray-50 dark:bg-gray-900' : 'hover:bg-blue-50 dark:hover:bg-gray-700/50'}>
                      <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-700 font-medium">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {date.getDate()} {MONTH_NAMES[date.getMonth()]} {date.getFullYear()}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {day.dayName}
                        </div>
                      </td>
                      {isWeekend ? (
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 font-medium">
                          HAFTA SONU TATİLİ
                        </td>
                      ) : (
                        day.slots.map((lesson, slotIndex) => (
                          <td
                            key={slotIndex}
                            className="px-2 py-2 border-r border-gray-200 dark:border-gray-700 align-top min-h-[80px]"
                          >
                            {lesson ? (
                              (() => {
                                // SpecialEvent için renk (eventType'a göre) veya course için renk
                                const colorKey = lesson.specialEvent?.id || lesson.course?.id || 'unknown'
                                const color = getCourseColor(colorKey)
                                const displayName = lesson.specialEvent?.eventTitle || lesson.course?.name || 'Özel Etkinlik'
                                return (
                                  <div className={`text-xs p-2 rounded ${color.bg} dark:bg-opacity-20 border ${color.border} dark:border-opacity-50`}>
                                    <div className={`font-semibold ${color.text} dark:text-gray-100`}>
                                      {displayName}
                                      {lesson.course?.totalPlannedHours && lesson.course?.occurrenceCount !== undefined && (
                                        <span className="ml-1 text-xs opacity-75">
                                          ({lesson.course.occurrenceCount}/{lesson.course.totalPlannedHours})
                                        </span>
                                      )}
                                    </div>
                                    {lesson.instructor && (
                                      <div className="text-gray-600 dark:text-gray-400 mt-1 text-xs">
                                        {lesson.instructor.firstName} {lesson.instructor.lastName}
                                      </div>
                                    )}
                                  </div>
                                )
                              })()
                            ) : (
                              <div className="text-gray-400 text-xs text-center py-4">-</div>
                            )}
                          </td>
                        ))
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

