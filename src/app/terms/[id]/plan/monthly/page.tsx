'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { ConfirmDialog, ToastContainer } from '@/shared/components'
import { useMonthlyPlanFilters } from '@/features/monthly-plans/hooks/useMonthlyPlanFilters'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from 'docx'

interface Term {
  id: string
  name: string
  termCode: string
  termType: 'POLICE' | 'FIRE'
  duration: 'FOUR_MONTHS' | 'SIX_MONTHS'
  startDate: string
  endDate: string
}

interface Course {
  id: string
  code: string
  name: string
  programScope: string
}

interface MonthlyCoursePlan {
  id: string
  month: number
  year: number
  plannedHours: number
  actualHours: number
}

interface TermCoursePlan {
  id: string
  termId: string
  courseId: string
  totalPlannedHours: number
  totalActualHours: number
  course: Course
  monthlyPlans: MonthlyCoursePlan[]
}

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]

export default function MonthlyPlanPage() {
  const params = useParams()
  const router = useRouter()
  
  const rawId = params?.id
  const termId = Array.isArray(rawId) ? rawId[0] : (rawId as string)

  const [term, setTerm] = useState<Term | null>(null)
  const [plans, setPlans] = useState<TermCoursePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [showFilterModal, setShowFilterModal] = useState(false)

  // Filtreleme hook'u
  const {
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
  } = useMonthlyPlanFilters(plans)

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
      fetchPlans()
    }
  }, [termId, selectedMonth, selectedYear])

  const fetchTerm = async () => {
    if (!termId) return
    
    try {
      const res = await fetch(`/api/terms/${termId}`)
      const data = await res.json()
      if (res.ok) {
        setTerm(data.term)
      } else {
        showToast(data.error || 'Dönem yüklenemedi', 'error')
      }
    } catch (error) {
      console.error('Term fetch error:', error)
      showToast('Dönem yüklenemedi', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchPlans = async () => {
    if (!termId) return
    
    try {
      let url = `/api/terms/${termId}/monthly-plans`
      if (selectedMonth && selectedYear) {
        url += `?month=${selectedMonth}&year=${selectedYear}`
      }
      
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok) {
        setPlans(data.plans || [])
      } else {
        showToast(data.error || 'Aylık planlar yüklenemedi', 'error')
      }
    } catch (error) {
      console.error('Plans fetch error:', error)
      showToast('Aylık planlar yüklenemedi', 'error')
    }
  }

  const handleGenerateMonthlyPlans = async () => {
    const isUpdate = hasMonthlyPlans

    setConfirmDialog({
      isOpen: true,
      title: isUpdate ? '📅 Aylık Planları Güncelle (Eşit Dağıt)' : '📅 Aylık Planları Oluştur (Eşit Dağıt)',
      message: isUpdate
        ? 'Aylık planlar dönem aylarına göre yeniden eşit dağıtılacak. Gerçekleşen saatler (actual) korunur. Devam etmek istiyor musunuz?'
        : 'Tüm dersler için aylık planlar oluşturulacak ve dönem aylarına göre eşit dağıtılacak. Gerçekleşen saatler (actual) korunur. Devam etmek istiyor musunuz?',
      type: 'info',
      onConfirm: async () => {
        setGenerating(true)
        try {
          const res = await fetch('/api/monthly-plans-generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ termId }),
          })
          const contentType = res.headers.get('content-type') || ''
          const data = contentType.includes('application/json') ? await res.json() : null
          
          if (res.ok) {
            showToast(data?.message || (isUpdate ? 'Aylık planlar başarıyla güncellendi' : 'Aylık planlar başarıyla oluşturuldu'), 'success')
            fetchPlans()
          } else {
            showToast(data?.error || (isUpdate ? 'Aylık planlar güncellenemedi' : 'Aylık planlar oluşturulamadı'), 'error')
          }
        } catch (error) {
          console.error('Generate monthly plans error:', error)
          showToast('Sunucu hatası', 'error')
        } finally {
          setGenerating(false)
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        }
      },
    })
  }

  const handleUpdatePlan = async (planId: string, field: 'plannedHours' | 'actualHours', value: number, monthlyPlan?: MonthlyCoursePlan) => {
    // Gerçekleşen saat validasyonu: Planlanandan fazla olamaz
    if (field === 'actualHours' && monthlyPlan && value > monthlyPlan.plannedHours) {
      showToast(`Gerçekleşen saat (${value}) planlanan saatten (${monthlyPlan.plannedHours}) fazla olamaz!`, 'error')
      return
    }
    
    try {
      const res = await fetch(`/api/monthly-plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        showToast('Aylık plan güncellendi', 'success')
        fetchPlans()
      } else {
        showToast(data.error || 'Plan güncellenemedi', 'error')
      }
    } catch (error) {
      console.error('Update plan error:', error)
      showToast('Sunucu hatası', 'error')
    }
  }

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 10
    const startX = margin
    let yPos = margin
    
    // Başlık
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Aylik Program', startX, yPos)
    yPos += 7
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`${term?.name || ''} - ${term?.termCode || ''}`, startX, yPos)
    yPos += 5
    
    // Tarih
    doc.setFontSize(9)
    const dateStr = new Date().toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).replace(/[^\d.]/g, '.')
    doc.text(`Olusturulma Tarihi: ${dateStr}`, startX, yPos)
    yPos += 8
    
    // Tablo sütun genişlikleri (toplam 270mm - margin'ler)
    const numCols = 4 + termMonths.length + 1 // #, Ders, Kod, Toplam Planlanan, Aylar, Toplam
    const availableWidth = pageWidth - (2 * margin)
    const colWidths = [
      8,  // #
      80, // Ders Adi
      25, // Kod
      20, // Toplam Planlanan
      ...termMonths.map(() => 18), // Her ay için
      20, // Toplam
    ]
    
    // Tablo başlıkları
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    let xPos = startX
    
    // Başlık satırı arka planı
    doc.setFillColor(37, 99, 235) // Blue-600
    doc.rect(startX, yPos - 4, availableWidth, 6, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.text('#', xPos + 2, yPos)
    xPos += colWidths[0]
    
    doc.text('Ders Adi', xPos + 2, yPos)
    xPos += colWidths[1]
    
    doc.text('Kod', xPos + 2, yPos)
    xPos += colWidths[2]
    
    doc.text('Toplam P.', xPos + 2, yPos)
    xPos += colWidths[3]
    
    termMonths.forEach(({ month, year }, idx) => {
      doc.text(MONTH_NAMES[month - 1].substring(0, 6), xPos + 2, yPos)
      xPos += colWidths[4 + idx]
    })
    
    doc.text('Toplam', xPos + 2, yPos)
    
    yPos += 8
    doc.setTextColor(0, 0, 0)
    
    // Veri satırları
    doc.setFont('helvetica', 'normal')
    plans.forEach((plan, index) => {
      // Sayfa sonu kontrolü
      if (yPos > pageHeight - 20) {
        doc.addPage()
        yPos = margin
        
        // Yeni sayfada başlık tekrarı
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setFillColor(37, 99, 235)
        doc.rect(startX, yPos - 4, availableWidth, 6, 'F')
        doc.setTextColor(255, 255, 255)
        let headerX = startX
        doc.text('#', headerX + 2, yPos)
        headerX += colWidths[0]
        doc.text('Ders Adi', headerX + 2, yPos)
        headerX += colWidths[1]
        doc.text('Kod', headerX + 2, yPos)
        headerX += colWidths[2]
        doc.text('Toplam P.', headerX + 2, yPos)
        headerX += colWidths[3]
        termMonths.forEach(({ month, year }, idx) => {
          doc.text(MONTH_NAMES[month - 1].substring(0, 6), headerX + 2, yPos)
          headerX += colWidths[4 + idx]
        })
        doc.text('Toplam', headerX + 2, yPos)
        yPos += 8
        doc.setTextColor(0, 0, 0)
      }
      
      xPos = startX
      doc.setFontSize(7)
      
      // Satır arka planı (zebra striping)
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251) // Gray-50
        doc.rect(startX, yPos - 3, availableWidth, 4, 'F')
      }
      
      // Sıra numarası
      doc.text(`${index + 1}`, xPos + 2, yPos)
      xPos += colWidths[0]
      
      // Ders adı (uzunsa kısalt)
      const courseName = plan.course.name.length > 35 ? plan.course.name.substring(0, 32) + '...' : plan.course.name
      doc.text(courseName, xPos + 2, yPos)
      xPos += colWidths[1]
      
      // Kod
      doc.text(plan.course.code.substring(0, 12), xPos + 2, yPos)
      xPos += colWidths[2]
      
      // Toplam Planlanan
      doc.text(`${plan.totalPlannedHours}`, xPos + 2, yPos)
      xPos += colWidths[3]
      
      // Aylık planlar
      termMonths.forEach(({ month, year }, idx) => {
        const monthlyPlan = plan.monthlyPlans.find(mp => mp.month === month && mp.year === year)
        const plannedHours = monthlyPlan ? monthlyPlan.plannedHours : 0
        const actualHours = monthlyPlan ? monthlyPlan.actualHours : 0
        
        // Planlanan ve gerçekleşen saat
        doc.setFontSize(6)
        doc.text(`P:${plannedHours}`, xPos + 1, yPos - 1)
        doc.text(`G:${actualHours}`, xPos + 1, yPos + 1)
        
        // İlerleme çubuğu
        if (plannedHours > 0) {
          const progressWidth = 12
          const progressHeight = 1.5
          const progressPercent = Math.min((actualHours / plannedHours) * 100, 100)
          
          // Arka plan (gri)
          doc.setFillColor(229, 231, 235)
          doc.rect(xPos + 1, yPos + 2.5, progressWidth, progressHeight, 'F')
          
          // İlerleme (yeşil/sarı)
          if (progressPercent >= 100) {
            doc.setFillColor(34, 197, 94) // Green-500
          } else if (progressPercent > 0) {
            doc.setFillColor(234, 179, 8) // Yellow-500
          } else {
            doc.setFillColor(229, 231, 235) // Gray
          }
          doc.rect(xPos + 1, yPos + 2.5, (progressWidth * progressPercent) / 100, progressHeight, 'F')
        }
        
        xPos += colWidths[4 + idx]
        doc.setFontSize(7)
      })
      
      // Toplam
      const rowTotal = plan.monthlyPlans.reduce((sum, mp) => sum + mp.plannedHours, 0)
      doc.text(`${rowTotal}`, xPos + 2, yPos)
      
      yPos += 6
    })
    
    // Toplam satırı
    yPos += 2
    doc.setDrawColor(100, 100, 100)
    doc.setLineWidth(0.5)
    doc.line(startX, yPos, startX + availableWidth, yPos)
    yPos += 4
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setFillColor(209, 213, 219) // Gray-300
    doc.rect(startX, yPos - 3, availableWidth, 4, 'F')
    
    xPos = startX
    doc.text('TOPLAM', xPos + colWidths[0] + 2, yPos)
    xPos += colWidths[0] + colWidths[1] + colWidths[2]
    
    const grandTotal = plans.reduce((sum, p) => sum + p.totalPlannedHours, 0)
    doc.text(`${grandTotal}`, xPos + 2, yPos)
    xPos += colWidths[3]
    
    termMonths.forEach(({ month, year }, idx) => {
      const monthTotal = plans.reduce((sum, plan) => {
        const mp = plan.monthlyPlans.find(m => m.month === month && m.year === year)
        return sum + (mp ? mp.plannedHours : 0)
      }, 0)
      doc.text(`${monthTotal}`, xPos + 2, yPos)
      xPos += colWidths[4 + idx]
    })
    
    const allTotal = plans.reduce((sum, p) => sum + p.monthlyPlans.reduce((s, mp) => s + mp.plannedHours, 0), 0)
    doc.text(`${allTotal}`, xPos + 2, yPos)
    
    doc.save(`aylik-program-${term?.termCode || 'program'}-${new Date().toISOString().split('T')[0]}.pdf`)
    showToast('PDF basariyla indirildi', 'success')
  }

  const handleExportExcel = () => {
    const wsData: any[] = []
    
    // Başlık satırı
    wsData.push(['#', 'Ders Adi', 'Kod', 'Toplam Planlanan', ...termMonths.map(({ month, year }) => `${MONTH_NAMES[month - 1]} ${year}`), 'Toplam'])
    
    // Veri satırları
    plans.forEach((plan, index) => {
      const rowTotal = plan.monthlyPlans.reduce((sum, mp) => sum + mp.plannedHours, 0)
      const row: any[] = [
        index + 1,
        plan.course.name,
        plan.course.code,
        plan.totalPlannedHours,
        ...termMonths.map(({ month, year }) => {
          const monthlyPlan = plan.monthlyPlans.find(mp => mp.month === month && mp.year === year)
          return monthlyPlan ? monthlyPlan.plannedHours : 0
        }),
        rowTotal,
      ]
      wsData.push(row)
    })
    
    // Toplam satırı
    const totalRow: any[] = [
      '',
      'TOPLAM',
      '',
      plans.reduce((sum, p) => sum + p.totalPlannedHours, 0),
      ...termMonths.map(({ month, year }) => {
        return plans.reduce((sum, plan) => {
          const mp = plan.monthlyPlans.find(m => m.month === month && m.year === year)
          return sum + (mp ? mp.plannedHours : 0)
        }, 0)
      }),
      plans.reduce((sum, p) => sum + p.monthlyPlans.reduce((s, mp) => s + mp.plannedHours, 0), 0),
    ]
    wsData.push(totalRow)
    
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Aylik Program')
    
    XLSX.writeFile(wb, `aylik-program-${term?.termCode || 'program'}-${new Date().toISOString().split('T')[0]}.xlsx`)
    showToast('Excel dosyasi basariyla indirildi', 'success')
  }

  const handleExportWord = async () => {
    try {
      const tableRows: TableRow[] = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('#')] }),
            new TableCell({ children: [new Paragraph('Ders Adi')] }),
            new TableCell({ children: [new Paragraph('Kod')] }),
            new TableCell({ children: [new Paragraph('Toplam Planlanan')] }),
            ...termMonths.map(({ month, year }) => 
              new TableCell({ children: [new Paragraph(`${MONTH_NAMES[month - 1]} ${year}`)] })
            ),
            new TableCell({ children: [new Paragraph('Toplam')] }),
          ],
        }),
        ...plans.map((plan, index) => {
          const rowTotal = plan.monthlyPlans.reduce((sum, mp) => sum + mp.plannedHours, 0)
          return new TableRow({
            children: [
              new TableCell({ children: [new Paragraph((index + 1).toString())] }),
              new TableCell({ children: [new Paragraph(plan.course.name)] }),
              new TableCell({ children: [new Paragraph(plan.course.code)] }),
              new TableCell({ children: [new Paragraph(plan.totalPlannedHours.toString())] }),
              ...termMonths.map(({ month, year }) => {
                const monthlyPlan = plan.monthlyPlans.find(mp => mp.month === month && mp.year === year)
                return new TableCell({ 
                  children: [new Paragraph(monthlyPlan ? monthlyPlan.plannedHours.toString() : '0')] 
                })
              }),
              new TableCell({ children: [new Paragraph(rowTotal.toString())] }),
            ],
          })
        }),
        // Toplam satırı
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('')] }),
            new TableCell({ children: [new Paragraph('TOPLAM')] }),
            new TableCell({ children: [new Paragraph('')] }),
            new TableCell({ children: [new Paragraph(plans.reduce((sum, p) => sum + p.totalPlannedHours, 0).toString())] }),
            ...termMonths.map(({ month, year }) => {
              const monthTotal = plans.reduce((sum, plan) => {
                const mp = plan.monthlyPlans.find(m => m.month === month && m.year === year)
                return sum + (mp ? mp.plannedHours : 0)
              }, 0)
              return new TableCell({ children: [new Paragraph(monthTotal.toString())] })
            }),
            new TableCell({ children: [new Paragraph(plans.reduce((sum, p) => sum + p.monthlyPlans.reduce((s, mp) => s + mp.plannedHours, 0), 0).toString())] }),
          ],
        }),
      ]
      
      const dateStr = new Date().toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).replace(/[^\d.]/g, '.')
      
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'Aylik Program', bold: true, size: 28 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${term?.name || ''} - ${term?.termCode || ''}`, size: 24 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Olusturulma Tarihi: ${dateStr}`, size: 20 }),
              ],
            }),
            new Paragraph({ text: '' }),
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
          ],
        }],
      })
      
      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `aylik-program-${term?.termCode || 'program'}-${new Date().toISOString().split('T')[0]}.docx`
      link.click()
      URL.revokeObjectURL(url)
      
      showToast('Word dosyasi basariyla indirildi', 'success')
    } catch (error) {
      console.error('Word export error:', error)
      showToast('Word dosyasi olusturulamadi', 'error')
    }
  }

  // Dönem aylarını hesapla
  const getTermMonths = (): Array<{ month: number; year: number }> => {
    if (!term) return []
    
    const startDate = new Date(term.startDate)
    const endDate = new Date(term.endDate)
    const months: Array<{ month: number; year: number }> = []
    
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      
      if (!months.find(m => m.month === month && m.year === year)) {
        months.push({ month, year })
      }
      
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    }
    
    return months
  }

  const termMonths = getTermMonths()
  const hasMonthlyPlans = plans.some(plan => plan.monthlyPlans.length > 0)
  
  // Filtrelenmiş planları kullan
  const displayPlans = sortedAndFilteredPlans

  // Sıralama ikonu komponenti
  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) {
      return <Icon icon="ph:arrows-down-up-bold" width="14" className="text-white opacity-60" />
    }
    return sortOrder === 'asc' ? (
      <Icon icon="ph:arrow-up-bold" width="14" className="text-white" />
    ) : (
      <Icon icon="ph:arrow-down-bold" width="14" className="text-white" />
    )
  }

  // Tablo başlığına tıklama ile sıralama
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
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

      {/* Header */}
      <div className="mb-8">
        <Link 
          href={`/terms/${termId}/plan`}
          className="text-blue-600 hover:underline mb-2 inline-block flex items-center gap-2"
        >
          <Icon icon="ph:arrow-left-bold" width="20" />
          Dönem Planına Dön
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Icon icon="ph:calendar-blank-bold" width="32" />
          Aylık Program
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {term.name} - {term.termCode}
        </p>
      </div>

      {/* Arama ve Filtre Çubuğu */}
      {plans.length > 0 && (
        <div className="mb-6 space-y-4">
          {/* Arama Çubuğu */}
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
              placeholder="Ders adı veya kodu ara..."
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

          {/* Filtre Butonu ve Aktif Filtreler */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  setShowFilterModal(!showFilterModal)
                  if (!showFilterModal) {
                    setTimeout(() => {
                      document.getElementById('filter-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                    }, 100)
                  }
                }}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  filters.completionStatus.length > 0 ||
                  filters.programScope.length > 0 ||
                  !!filters.totalPlannedHoursMin ||
                  !!filters.totalPlannedHoursMax ||
                  !!filters.totalActualHoursMin ||
                  !!filters.totalActualHoursMax
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Icon icon={showFilterModal ? "ph:caret-up-bold" : "ph:funnel-bold"} width="20" />
                Filtreler
                {(filters.completionStatus.length > 0 ||
                  filters.programScope.length > 0 ||
                  !!filters.totalPlannedHoursMin ||
                  !!filters.totalPlannedHoursMax ||
                  !!filters.totalActualHoursMin ||
                  !!filters.totalActualHoursMax) && (
                  <span className="bg-white text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold">
                    {
                      [
                        filters.completionStatus.length,
                        filters.programScope.length,
                        (filters.totalPlannedHoursMin || filters.totalPlannedHoursMax) ? 1 : 0,
                        (filters.totalActualHoursMin || filters.totalActualHoursMax) ? 1 : 0,
                      ].filter((n) => n > 0).length
                    }
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <optgroup label="Temel Sıralama">
                    <option value="name">🔤 İsme Göre</option>
                    <option value="code">📝 Koda Göre</option>
                    <option value="programScope">🎓 Program Kapsamına Göre</option>
                  </optgroup>
                  <optgroup label="Saat Bazlı Sıralama">
                    <option value="totalPlannedHours">⏱️ Toplam Planlanan Saate Göre</option>
                    <option value="totalActualHours">✅ Toplam Tamamlanan Saate Göre</option>
                    <option value="completionRate">📊 Tamamlanma Oranına Göre (%)</option>
                  </optgroup>
                  <optgroup label="Aylık Dağılım Sıralama">
                    <option value="firstMonthHours">📅 İlk Ay Planlanan Saate Göre</option>
                    <option value="lastMonthHours">📅 Son Ay Planlanan Saate Göre</option>
                    <option value="maxMonthlyHours">⬆️ En Yüksek Aylık Saate Göre</option>
                    <option value="minMonthlyHours">⬇️ En Düşük Aylık Saate Göre</option>
                    <option value="avgMonthlyHours">📊 Ortalama Aylık Saate Göre</option>
                    <option value="maxActualHours">✅ En Yüksek Aylık Gerçekleşen Saate Göre</option>
                  </optgroup>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer flex items-center gap-2"
                  title={sortOrder === 'asc' ? 'Artan (A-Z)' : 'Azalan (Z-A)'}
                >
                  {sortOrder === 'asc' ? (
                    <Icon icon="ph:arrow-up-bold" width="18" className="text-blue-600" />
                  ) : (
                    <Icon icon="ph:arrow-down-bold" width="18" className="text-blue-600" />
                  )}
                </button>
              </div>

              {(searchQuery ||
                filters.completionStatus.length > 0 ||
                filters.programScope.length > 0 ||
                !!filters.totalPlannedHoursMin ||
                !!filters.totalPlannedHoursMax ||
                !!filters.totalActualHoursMin ||
                !!filters.totalActualHoursMax) && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {displayPlans.length} ders bulundu
                  </span>
                  <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
                    Tümünü Temizle
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Gelişmiş Filtre Paneli */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Tamamlanma Durumu */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Icon icon="ph:check-circle-bold" width="20" className="text-green-600 dark:text-green-400" />
                    Tamamlanma Durumu
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'COMPLETED', label: 'Tamamlanan Dersler', icon: 'ph:check-circle-bold', color: 'text-green-600' },
                      { value: 'IN_PROGRESS', label: 'Devam Eden Dersler', icon: 'ph:clock-bold', color: 'text-yellow-600' },
                      { value: 'NOT_STARTED', label: 'Başlanmamış Dersler', icon: 'ph:circle-bold', color: 'text-gray-600' },
                    ].map((status) => (
                      <label
                        key={status.value}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-blue-300 dark:hover:border-blue-600"
                      >
                        <input
                          type="checkbox"
                          checked={filters.completionStatus.includes(status.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({ ...filters, completionStatus: [...filters.completionStatus, status.value] })
                            } else {
                              setFilters({ ...filters, completionStatus: filters.completionStatus.filter(s => s !== status.value) })
                            }
                          }}
                          className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <Icon icon={status.icon} width="18" className={status.color} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{status.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Program Kapsamı */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Icon icon="ph:graduation-cap-bold" width="20" className="text-blue-600 dark:text-blue-400" />
                    Program Kapsamı
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'COMMON', label: 'Ortak Dersler', icon: 'ph:users-bold', color: 'text-blue-600' },
                      { value: 'POLIS_ONLY', label: 'Polis Dersleri', icon: 'ph:shield-check-bold', color: 'text-green-600' },
                      { value: 'ITFAIYE_ONLY', label: 'İtfaiye Dersleri', icon: 'ph:fire-bold', color: 'text-red-600' },
                    ].map((scope) => (
                      <label
                        key={scope.value}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-blue-300 dark:hover:border-blue-600"
                      >
                        <input
                          type="checkbox"
                          checked={filters.programScope.includes(scope.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({ ...filters, programScope: [...filters.programScope, scope.value] })
                            } else {
                              setFilters({ ...filters, programScope: filters.programScope.filter(s => s !== scope.value) })
                            }
                          }}
                          className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <Icon icon={scope.icon} width="18" className={scope.color} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{scope.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Toplam Planlanan Saat Aralığı */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Icon icon="ph:clock-bold" width="20" className="text-orange-600 dark:text-orange-400" />
                    Toplam Planlanan Saat
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block mb-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium">Minimum</label>
                      <input
                        type="number"
                        value={filters.totalPlannedHoursMin}
                        onChange={(e) => setFilters({ ...filters, totalPlannedHoursMin: e.target.value })}
                        placeholder="0"
                        min="0"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium">Maksimum</label>
                      <input
                        type="number"
                        value={filters.totalPlannedHoursMax}
                        onChange={(e) => setFilters({ ...filters, totalPlannedHoursMax: e.target.value })}
                        placeholder="999"
                        min="0"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Toplam Tamamlanan Saat Aralığı */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Icon icon="ph:check-circle-bold" width="20" className="text-green-600 dark:text-green-400" />
                    Toplam Tamamlanan Saat
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block mb-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium">Minimum</label>
                      <input
                        type="number"
                        value={filters.totalActualHoursMin}
                        onChange={(e) => setFilters({ ...filters, totalActualHoursMin: e.target.value })}
                        placeholder="0"
                        min="0"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium">Maksimum</label>
                      <input
                        type="number"
                        value={filters.totalActualHoursMax}
                        onChange={(e) => setFilters({ ...filters, totalActualHoursMax: e.target.value })}
                        placeholder="999"
                        min="0"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* İşlem Butonları */}
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

      {/* Actions */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {!hasMonthlyPlans ? (
            <button
              onClick={handleGenerateMonthlyPlans}
              disabled={generating}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Icon icon="ph:magic-wand-bold" width="20" />
              {generating ? 'Oluşturuluyor...' : 'Aylık Planları Oluştur'}
            </button>
          ) : (
            <button
              onClick={handleGenerateMonthlyPlans}
              disabled={generating}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Icon icon="ph:arrow-clockwise-bold" width="20" />
              {generating ? 'Güncelleniyor...' : 'Aylık Planları Güncelle'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Export Butonları */}
          {hasMonthlyPlans && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
                title="PDF olarak indir"
              >
                <Icon icon="ph:file-pdf-bold" width="18" />
                PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                title="Excel olarak indir"
              >
                <Icon icon="ph:file-xls-bold" width="18" />
                Excel
              </button>
              <button
                onClick={handleExportWord}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                title="Word olarak indir"
              >
                <Icon icon="ph:file-doc-bold" width="18" />
                Word
              </button>
            </div>
          )}

          {/* Ay/Yıl Filtreleri */}
          <div className="flex items-center gap-4">
            <select
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Tüm Yıllar</option>
              {Array.from(new Set(termMonths.map(m => m.year))).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={selectedMonth || ''}
              onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Tüm Aylar</option>
              {MONTH_NAMES.map((name, index) => (
                <option key={index + 1} value={index + 1}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Plans Table */}
      {plans.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Icon icon="ph:calendar-blank-bold" width="64" className="mx-auto mb-4 text-gray-400" />
          <p className="text-xl text-gray-600 dark:text-gray-400">Henüz dönem planı oluşturulmamış</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Önce dönem planı oluşturun, sonra aylık planları oluşturabilirsiniz
          </p>
        </div>
      ) : displayPlans.length === 0 ? (
        <div className="text-center py-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <Icon icon="ph:magnifying-glass-bold" width="64" className="mx-auto mb-4 text-yellow-500" />
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">Filtre kriterlerinize uygun ders bulunamadı</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Filtreleri temizleyip tekrar deneyin
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : !hasMonthlyPlans ? (
        <div className="text-center py-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Icon icon="ph:calendar-plus-bold" width="64" className="mx-auto mb-4 text-blue-500" />
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">Aylık planlar henüz oluşturulmamış</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Yukarıdaki "Aylık Planları Oluştur" butonuna tıklayarak otomatik oluşturup eşit dağıtabilirsiniz
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-3 py-3 text-center text-xs font-bold border-r border-blue-500 sticky left-0 bg-blue-600 z-20 min-w-[50px]">
                    #
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-bold border-r border-blue-500 sticky left-[50px] bg-blue-600 z-20 min-w-[250px] cursor-pointer hover:bg-blue-700 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Ders Adı
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-3 text-center text-xs font-bold border-r border-blue-500 min-w-[80px] cursor-pointer hover:bg-blue-700 transition-colors"
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Kod
                      <SortIcon field="code" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-center text-sm font-bold border-r border-blue-500 min-w-[100px] cursor-pointer hover:bg-blue-700 transition-colors"
                    onClick={() => handleSort('totalPlannedHours')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Toplam Planlanan
                      <SortIcon field="totalPlannedHours" />
                    </div>
                  </th>
                  {termMonths.map(({ month, year }) => (
                    <th key={`${year}-${month}`} className="px-3 py-3 text-center text-xs font-bold border-r border-blue-500 min-w-[140px]">
                      <div className="font-semibold">{MONTH_NAMES[month - 1]}</div>
                      <div className="text-xs opacity-90">{year}</div>
                    </th>
                  ))}
                  <th
                    className="px-4 py-3 text-center text-sm font-bold bg-blue-800 min-w-[100px] cursor-pointer hover:bg-blue-900 transition-colors"
                    onClick={() => handleSort('totalActualHours')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Toplam
                      <SortIcon field="totalActualHours" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {displayPlans.map((plan, index) => {
                  const totalPlanned = plan.monthlyPlans.reduce((sum, mp) => sum + mp.plannedHours, 0)
                  const totalActual = plan.monthlyPlans.reduce((sum, mp) => sum + mp.actualHours, 0)
                  
                  return (
                    <tr key={plan.id} className="hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-3 py-3 text-center text-sm font-semibold text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-800 z-10">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-left border-r border-gray-200 dark:border-gray-700 sticky left-[50px] bg-white dark:bg-gray-800 z-10">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{plan.course.name}</div>
                      </td>
                      <td className="px-3 py-3 text-center text-xs font-mono text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                        {plan.course.code}
                      </td>
                      <td className="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{plan.totalPlannedHours}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {totalActual > 0 && (
                            <>
                              <div className={totalActual >= plan.totalPlannedHours ? 'text-green-600 font-medium' : 'text-orange-600'}>
                                Tamamlanan: {totalActual}
                              </div>
                              <div className={`mt-1 font-semibold ${totalActual >= plan.totalPlannedHours ? 'text-green-600' : totalActual > 0 ? 'text-yellow-600' : 'text-gray-500'}`}>
                                {plan.totalPlannedHours > 0 ? Math.round((totalActual / plan.totalPlannedHours) * 100) : 0}%
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      {termMonths.map(({ month, year }) => {
                        const monthlyPlan = plan.monthlyPlans.find(
                          mp => mp.month === month && mp.year === year
                        )
                        
                        return (
                          <td key={`${year}-${month}`} className="px-3 py-3 text-center border-r border-gray-200 dark:border-gray-700 align-middle">
                            {monthlyPlan ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-center gap-2">
                                  <input
                                    type="number"
                                    value={monthlyPlan.plannedHours}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value) || 0
                                      handleUpdatePlan(monthlyPlan.id, 'plannedHours', value)
                                    }}
                                    className="w-16 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                                    min="0"
                                  />
                                  <span className="text-xs text-gray-500">Planlanan Ders Saati</span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                  <input
                                    type="number"
                                    value={monthlyPlan.actualHours}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value) || 0
                                      handleUpdatePlan(monthlyPlan.id, 'actualHours', value, monthlyPlan)
                                    }}
                                    max={monthlyPlan.plannedHours}
                                    className={`w-16 px-2 py-1.5 text-sm border rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                      monthlyPlan.actualHours > monthlyPlan.plannedHours
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                    }`}
                                    min="0"
                                  />
                                  <span className="text-xs text-gray-500">Tamamlanan Ders Saati</span>
                                </div>
                                {/* İlerleme göstergesi */}
                                {monthlyPlan.plannedHours > 0 && (
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div
                                      className={`h-1.5 rounded-full ${
                                        monthlyPlan.actualHours >= monthlyPlan.plannedHours
                                          ? 'bg-green-500'
                                          : monthlyPlan.actualHours > 0
                                          ? 'bg-yellow-500'
                                          : 'bg-transparent'
                                      }`}
                                      style={{
                                        width: `${Math.min((monthlyPlan.actualHours / monthlyPlan.plannedHours) * 100, 100)}%`,
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="px-4 py-3 text-center bg-gray-50 dark:bg-gray-700/50 font-semibold">
                        <div className="text-gray-900 dark:text-gray-100">{totalPlanned}</div>
                        {totalActual > 0 && (
                          <>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Tamamlanan: {totalActual}
                            </div>
                            <div className={`text-xs font-semibold mt-1 ${totalActual >= plan.totalPlannedHours ? 'text-green-600' : totalActual > 0 ? 'text-yellow-600' : 'text-gray-500'}`}>
                              {plan.totalPlannedHours > 0 ? Math.round((totalActual / plan.totalPlannedHours) * 100) : 0}%
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {/* Toplam Satırı */}
                <tr className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-bold border-t-2 border-gray-400">
                  <td colSpan={3} className="px-4 py-3 text-right border-r border-gray-300 dark:border-gray-600 sticky left-0 bg-gray-100 dark:bg-gray-700 z-10">
                    TOPLAM
                  </td>
                  <td className="px-4 py-3 text-center border-r border-gray-300 dark:border-gray-600">
                    {displayPlans.reduce((sum, p) => sum + p.totalPlannedHours, 0)}
                  </td>
                  {termMonths.map(({ month, year }) => {
                    const monthTotal = displayPlans.reduce((sum, plan) => {
                      const mp = plan.monthlyPlans.find(m => m.month === month && m.year === year)
                      return sum + (mp ? mp.plannedHours : 0)
                    }, 0)
                    const monthActual = displayPlans.reduce((sum, plan) => {
                      const mp = plan.monthlyPlans.find(m => m.month === month && m.year === year)
                      return sum + (mp ? mp.actualHours : 0)
                    }, 0)
                    return (
                      <td key={`${year}-${month}`} className="px-3 py-3 text-center border-r border-gray-300 dark:border-gray-600">
                        <div className="text-gray-900 dark:text-gray-100">{monthTotal}</div>
                        {monthActual > 0 && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">Tamamlanan: {monthActual}</div>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-4 py-3 text-center bg-gray-300 dark:bg-gray-600">
                    {displayPlans.reduce((sum, p) => sum + p.monthlyPlans.reduce((s, mp) => s + mp.plannedHours, 0), 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

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

