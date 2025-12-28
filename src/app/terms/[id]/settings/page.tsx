'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { ToastContainer } from '@/shared/components'

interface TermSettings {
  id?: string
  termId: string
  firstLessonStart: string
  lessonDuration: number
  breakDuration: number
  lunchBreakStart: string
  lunchBreakDuration: number
  hasStudyHall: boolean
  studyHallStart: string | null
  studyHallDuration: number | null
  workingDays: string[]
  examWeeks: any[]
  isDefault?: boolean
}

interface Term {
  id: string
  name: string
  termCode: string
}

interface TimeSlotPreview {
  slotNumber: number
  startTime: string
  endTime: string
  isBreak: boolean
  label: string
}

export default function TermSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const termId = Array.isArray(params.id) ? params.id[0] : (params.id as string)

  const [term, setTerm] = useState<Term | null>(null)
  const [settings, setSettings] = useState<TermSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  // TimeSlot önizlemesi hesapla
  const calculateTimeSlots = (): TimeSlotPreview[] => {
    if (!settings) return []

    const slots: TimeSlotPreview[] = []
    const firstStart = settings.firstLessonStart
    const lessonDur = settings.lessonDuration
    const breakDur = settings.breakDuration

    // İlk ders başlangıç saatini parse et
    const [firstHour, firstMin] = firstStart.split(':').map(Number)
    let currentHour = firstHour
    let currentMin = firstMin

    // 1-5. dersler
    for (let i = 1; i <= 5; i++) {
      const start = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`
      
      // Bitiş saati hesapla
      let endMin = currentMin + lessonDur
      let endHour = currentHour
      if (endMin >= 60) {
        endHour += Math.floor(endMin / 60)
        endMin = endMin % 60
      }
      const end = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`

      slots.push({
        slotNumber: i,
        startTime: start,
        endTime: end,
        isBreak: false,
        label: `${i}. Ders`,
      })

      // Sonraki ders başlangıcı (tenefüs sonrası)
      currentMin += lessonDur + breakDur
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60)
        currentMin = currentMin % 60
      }
    }

    // Öğle yemeği
    const [lunchHour, lunchMin] = settings.lunchBreakStart.split(':').map(Number)
    let lunchEndMin = lunchMin + settings.lunchBreakDuration
    let lunchEndHour = lunchHour
    if (lunchEndMin >= 60) {
      lunchEndHour += Math.floor(lunchEndMin / 60)
      lunchEndMin = lunchEndMin % 60
    }

    slots.push({
      slotNumber: 6,
      startTime: settings.lunchBreakStart,
      endTime: `${String(lunchEndHour).padStart(2, '0')}:${String(lunchEndMin).padStart(2, '0')}`,
      isBreak: true,
      label: 'Öğle Yemeği',
    })

    // 6-7. dersler (öğle yemeğinden sonra)
    currentHour = lunchEndHour
    currentMin = lunchEndMin

    for (let i = 6; i <= 7; i++) {
      const start = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`
      
      let endMin = currentMin + lessonDur
      let endHour = currentHour
      if (endMin >= 60) {
        endHour += Math.floor(endMin / 60)
        endMin = endMin % 60
      }
      const end = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`

      slots.push({
        slotNumber: i + 1, // 7, 8
        startTime: start,
        endTime: end,
        isBreak: false,
        label: `${i}. Ders`,
      })

      // Sonraki ders başlangıcı
      currentMin += lessonDur + breakDur
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60)
        currentMin = currentMin % 60
      }
    }

    return slots
  }

  useEffect(() => {
    if (termId) {
      fetchTerm()
      fetchSettings()
    }
  }, [termId])

  const fetchTerm = async () => {
    try {
      const res = await fetch(`/api/terms/${termId}`)
      const data = await res.json()
      if (res.ok) {
        setTerm(data.term)
      }
    } catch (error) {
      console.error('Term fetch error:', error)
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/terms/${termId}/settings`)
      const data = await res.json()
      if (res.ok) {
        setSettings(data)
      }
    } catch (error) {
      console.error('Settings fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const method = settings?.id ? 'PUT' : 'POST'
      const res = await fetch(`/api/terms/${termId}/settings`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      const data = await res.json()

      if (res.ok) {
        showToast('✅ Ayarlar başarıyla kaydedildi!', 'success')
        setSettings(data.settings || data)
        // 1.5 saniye sonra dönem detay sayfasına yönlendir
        setTimeout(() => {
          router.push(`/terms/${termId}`)
        }, 1500)
      } else {
        showToast(`❌ Hata: ${data.error || 'Ayarlar kaydedilemedi'}`, 'error')
      }
    } catch (error) {
      console.error('Settings save error:', error)
      showToast('❌ Sunucu hatası', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof TermSettings, value: any) => {
    setSettings(prev => {
      if (!prev) return null
      return { ...prev, [field]: value }
    })
  }

  const toggleWorkingDay = (day: string) => {
    if (!settings) return
    const current = settings.workingDays || []
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day]
    handleChange('workingDays', updated)
  }

  if (!termId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Geçersiz dönem ID</div>
        <Link href="/terms" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Dönemlere Dön
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Yükleniyor...</div>
      </div>
    )
  }

  if (!term) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Dönem bulunamadı</div>
        <Link href="/terms" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Dönemlere Dön
        </Link>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Ayarlar yüklenemedi</div>
        <Link href={`/terms/${termId}`} className="text-blue-600 hover:underline mt-4 inline-block">
          ← Döneme Dön
        </Link>
      </div>
    )
  }

  const timeSlots = calculateTimeSlots()
  const workingDaysList = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
  const dayNames: Record<string, string> = {
    MONDAY: 'Pazartesi',
    TUESDAY: 'Salı',
    WEDNESDAY: 'Çarşamba',
    THURSDAY: 'Perşembe',
    FRIDAY: 'Cuma',
    SATURDAY: 'Cumartesi',
    SUNDAY: 'Pazar',
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/terms/${termId}`}
          className="text-blue-600 hover:underline mb-2 inline-flex items-center gap-2"
        >
          <Icon icon="ph:arrow-left-bold" width="20" />
          Döneme Dön
        </Link>
        <h1 className="text-3xl font-bold mt-4">⚙️ Dönem Ayarları</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {term.name} ({term.termCode})
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Ders Saatleri Ayarları */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Icon icon="ph:clock-bold" width="24" className="text-blue-600" />
            Ders Saatleri Ayarları
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                İlk Ders Başlangıç Saati
              </label>
              <input
                type="time"
                value={settings.firstLessonStart}
                onChange={(e) => handleChange('firstLessonStart', e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Ders Süresi (dakika)
              </label>
              <input
                type="number"
                value={settings.lessonDuration}
                onChange={(e) => handleChange('lessonDuration', parseInt(e.target.value))}
                min="30"
                max="60"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tenefüs Süresi (dakika)
              </label>
              <input
                type="number"
                value={settings.breakDuration}
                onChange={(e) => handleChange('breakDuration', parseInt(e.target.value))}
                min="5"
                max="30"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Öğle Yemeği Başlangıç
              </label>
              <input
                type="time"
                value={settings.lunchBreakStart}
                onChange={(e) => handleChange('lunchBreakStart', e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Öğle Yemeği Süresi (dakika)
              </label>
              <input
                type="number"
                value={settings.lunchBreakDuration}
                onChange={(e) => handleChange('lunchBreakDuration', parseInt(e.target.value))}
                min="30"
                max="120"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* ETÜD Ayarları */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Icon icon="ph:book-bold" width="24" className="text-purple-600" />
            ETÜD Ayarları
          </h2>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="hasStudyHall"
              checked={settings.hasStudyHall}
              onChange={(e) => handleChange('hasStudyHall', e.target.checked)}
              className="mr-2 w-5 h-5"
            />
            <label htmlFor="hasStudyHall" className="text-sm font-medium">
              ETÜD var mı?
            </label>
          </div>

          {settings.hasStudyHall && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  ETÜD Başlangıç Saati
                </label>
                <input
                  type="time"
                  value={settings.studyHallStart || '17:00'}
                  onChange={(e) => handleChange('studyHallStart', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  ETÜD Süresi (dakika)
                </label>
                <input
                  type="number"
                  value={settings.studyHallDuration || 90}
                  onChange={(e) => handleChange('studyHallDuration', parseInt(e.target.value))}
                  min="30"
                  max="180"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Çalışma Günleri */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Icon icon="ph:calendar-bold" width="24" className="text-green-600" />
            Çalışma Günleri
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {workingDaysList.map((day) => (
              <label
                key={day}
                className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <input
                  type="checkbox"
                  checked={settings.workingDays?.includes(day) || false}
                  onChange={() => toggleWorkingDay(day)}
                  className="mr-2 w-4 h-4"
                />
                <span className="text-sm font-medium">{dayNames[day]}</span>
              </label>
            ))}
          </div>
        </div>

        {/* TimeSlot Önizleme */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Icon icon="ph:eye-bold" width="24" className="text-orange-600" />
            Hesaplanan Ders Saatleri Önizleme
          </h2>

          <div className="space-y-2">
            {timeSlots.map((slot) => (
              <div
                key={slot.slotNumber}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  slot.isBreak
                    ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">{slot.slotNumber}</span>
                  <span className="font-medium">{slot.label}</span>
                </div>
                <div className="text-sm font-mono">
                  {slot.startTime} - {slot.endTime}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link
            href={`/terms/${termId}`}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}

