import { PrismaClient, TermStatus } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

type Args = {
  termId?: string
  out?: string
}

function parseArgs(argv: string[]): Args {
  const args: Args = {}
  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i]
    if (!raw.startsWith('--')) continue

    const [key, inlineValue] = raw.split('=')
    const value = inlineValue ?? argv[i + 1]

    if (key === '--termId') {
      if (!inlineValue) i++
      args.termId = value
    } else if (key === '--out') {
      if (!inlineValue) i++
      args.out = value
    }
  }
  return args
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

function monthKeyFromDate(d: Date) {
  return monthKey(d.getFullYear(), d.getMonth() + 1)
}

function escapeMd(value: string) {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function calculateWeek1Range(termStartDate: Date) {
  const startDate = startOfDay(termStartDate)
  const startDayOfWeek = startDate.getDay() // 0=Sun
  const daysToMonday = startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek
  const firstMonday = addDays(startDate, daysToMonday)
  const weekStart = startOfDay(firstMonday)
  const weekEnd = endOfDay(addDays(weekStart, 6))
  return { weekStart, weekEnd }
}

async function main() {
  const prisma = new PrismaClient()
  const args = parseArgs(process.argv.slice(2))

  try {
    let termId = args.termId

    if (!termId) {
      const activeTerm = await prisma.term.findFirst({
        where: { status: TermStatus.ACTIVE, isDeleted: false },
        orderBy: { startDate: 'desc' },
      })
      if (!activeTerm) {
        throw new Error('Term bulunamadı. Lütfen --termId verin.')
      }
      termId = activeTerm.id
      console.log(`--termId verilmedi. Aktif dönem seçildi: ${activeTerm.name} (${activeTerm.termCode}) ${termId}`)
    }

    const term = await prisma.term.findUnique({
      where: { id: termId },
      select: { id: true, name: true, termCode: true, startDate: true, endDate: true },
    })

    if (!term) throw new Error(`Term bulunamadı: ${termId}`)

    const termSettings = await prisma.termSettings.findUnique({
      where: { termId: term.id },
      select: { workingDays: true },
    })

    const workingDays = (termSettings?.workingDays as string[]) || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
    // Kural gereği hafta sonunu her koşulda kapat
    const workingDaysSet = new Set(workingDays.filter((d) => d !== 'SATURDAY' && d !== 'SUNDAY'))

    const timeSlots = await prisma.timeSlot.findMany({
      orderBy: { slotNumber: 'asc' },
      select: { id: true, slotNumber: true },
    })

    const totalSlotCount = timeSlots.length
    const slot6 = timeSlots.find((s) => s.slotNumber === 6)?.id
    const slot7 = timeSlots.find((s) => s.slotNumber === 7)?.id

    const monthlyPlans = await prisma.monthlyCoursePlan.findMany({
      where: {
        termCoursePlan: { termId: term.id },
        plannedHours: { gt: 0 },
      },
      include: {
        termCoursePlan: {
          include: {
            course: {
              select: { id: true, code: true, name: true },
            },
          },
        },
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    })

    if (monthlyPlans.length === 0) {
      throw new Error('Bu dönem için MonthlyCoursePlan bulunamadı (plannedHours > 0).')
    }

    const plannedByMonth = new Map<string, Map<string, { planned: number; courseCode: string; courseName: string }>>()
    const monthKeys = new Set<string>()
    const courseIds = new Set<string>()

    for (const mp of monthlyPlans) {
      const mk = monthKey(mp.year, mp.month)
      monthKeys.add(mk)

      const course = mp.termCoursePlan.course
      courseIds.add(course.id)

      if (!plannedByMonth.has(mk)) plannedByMonth.set(mk, new Map())
      plannedByMonth.get(mk)!.set(course.id, {
        planned: mp.plannedHours,
        courseCode: course.code,
        courseName: course.name,
      })
    }

    // Gerçekleşen: business rule gereği (courseId + specificDate) DISTINCT sayılır.
    // (Aynı gün 6 sınıfa yazılsa bile 1 sayılır)
    const rawActualDistinct = await prisma.dailyLesson.findMany({
      where: {
        termId: term.id,
        isCancelled: false,
        isSpecialEvent: false,
        courseId: { not: null, in: Array.from(courseIds) },
        specificDate: { not: null },
      },
      select: { courseId: true, specificDate: true },
      distinct: ['courseId', 'specificDate'],
    })

    const actualByMonth = new Map<string, Map<string, number>>()

    for (const row of rawActualDistinct) {
      if (!row.courseId || !row.specificDate) continue
      const mk = monthKeyFromDate(row.specificDate)
      if (!monthKeys.has(mk)) {
        // Planı olmayan aylar (örn: planlar Şubat-Haziran, ama ders Ocak'a sarktı)
        continue
      }
      if (!actualByMonth.has(mk)) actualByMonth.set(mk, new Map())
      const m = actualByMonth.get(mk)!
      m.set(row.courseId, (m.get(row.courseId) || 0) + 1)
    }

    const sortedMonthKeys = Array.from(monthKeys).sort()

    let totalPlannedAll = 0
    let totalActualAll = 0

    const summaryLines: string[] = []
    summaryLines.push(`# Aylık Kota Doğrulama Raporu`)
    summaryLines.push('')
    summaryLines.push(`- Dönem: ${escapeMd(term.name)} (${escapeMd(term.termCode)})`)
    summaryLines.push(`- TermId: ${term.id}`)
    summaryLines.push(`- Dönem Tarih Aralığı: ${formatDate(term.startDate)} → ${formatDate(term.endDate)}`)
    summaryLines.push(`- Kural: (courseId + specificDate) DISTINCT = 1 saat`)
    summaryLines.push(`- Not: Carry-over (aydan aya devretme) açıkken ay bazında sapmalar normaldir; ana hedef dönem toplamlarının tutmasıdır.`)
    summaryLines.push('')

    // Ay toplamları
    summaryLines.push('## Aylık Toplamlar')
    summaryLines.push('| Ay | Planlanan | Gerçekleşen | Fark |')
    summaryLines.push('|---|---:|---:|---:|')

    for (const mk of sortedMonthKeys) {
      const plannedMap = plannedByMonth.get(mk) || new Map()
      const actualMap = actualByMonth.get(mk) || new Map()

      let plannedTotal = 0
      let actualTotal = 0

      for (const { planned } of plannedMap.values()) plannedTotal += planned
      for (const actual of actualMap.values()) actualTotal += actual

      totalPlannedAll += plannedTotal
      totalActualAll += actualTotal

      summaryLines.push(`| ${mk} | ${plannedTotal} | ${actualTotal} | ${actualTotal - plannedTotal} |`)
    }

    summaryLines.push('')
    summaryLines.push(`**Genel Toplam:** Planlanan ${totalPlannedAll}, Gerçekleşen ${totalActualAll}, Fark ${totalActualAll - totalPlannedAll}`)
    summaryLines.push('')

    // --- Kapasite Analizi ---
    // Teorik kapasite: (iş günleri x slot sayısı) - (özel etkinlik slotları) - (PE rezerv slotları)
    // Not: Özel etkinlikler DB'den sayılır (distinct date+slot). PE rezervi DB'de kayıtlı değil, kurala göre Perşembe 6-7 düşülür.
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    const { weekStart: week1Start, weekEnd: week1End } = calculateWeek1Range(term.startDate)

    const specialEventDistinct = await prisma.dailyLesson.findMany({
      where: {
        termId: term.id,
        isCancelled: false,
        isSpecialEvent: true,
        specificDate: { not: null },
      },
      select: { specificDate: true, timeSlotId: true },
      distinct: ['specificDate', 'timeSlotId'],
    })

    // monthKey -> dateStr(YYYY-MM-DD) -> blockedSlotCount
    const specialEventCountByMonthDay = new Map<string, Map<string, number>>()
    for (const row of specialEventDistinct) {
      if (!row.specificDate) continue
      const mk = monthKeyFromDate(row.specificDate)
      if (!monthKeys.has(mk)) continue
      const dateStr = row.specificDate.toISOString().split('T')[0]
      if (!specialEventCountByMonthDay.has(mk)) specialEventCountByMonthDay.set(mk, new Map())
      const dayMap = specialEventCountByMonthDay.get(mk)!
      dayMap.set(dateStr, (dayMap.get(dateStr) || 0) + 1)
    }

    const capacityByMonth = new Map<string, { workingDays: number; rawSlots: number; specialEventSlots: number; peReservedSlots: number; maxCurriculumSlots: number }>()

    // Tarih aralığını gün gün dolaş
    for (let d = startOfDay(term.startDate); d <= endOfDay(term.endDate); d = addDays(d, 1)) {
      const mk = monthKeyFromDate(d)
      if (!monthKeys.has(mk)) continue

      const dayName = dayNames[d.getDay()]
      if (!workingDaysSet.has(dayName)) continue

      if (!capacityByMonth.has(mk)) {
        capacityByMonth.set(mk, { workingDays: 0, rawSlots: 0, specialEventSlots: 0, peReservedSlots: 0, maxCurriculumSlots: 0 })
      }

      const c = capacityByMonth.get(mk)!
      c.workingDays += 1
      c.rawSlots += totalSlotCount

      // İntibak haftası: pratikte bu hafta müfredat yok (tüm slotlar özel etkinlik)
      const isInWeek1 = d >= week1Start && d <= week1End
      if (isInWeek1) {
        c.specialEventSlots += totalSlotCount
        continue
      }

      // Özel etkinlik slotları (DB üzerinden)
      const seDayMap = specialEventCountByMonthDay.get(mk)
      if (seDayMap) {
        const dateStr = d.toISOString().split('T')[0]
        c.specialEventSlots += seDayMap.get(dateStr) || 0
      }

      // PE rezervi: Perşembe 6-7
      if (dayName === 'THURSDAY') {
        if (slot6) c.peReservedSlots += 1
        if (slot7) c.peReservedSlots += 1
      }
    }

    for (const [mk, c] of capacityByMonth.entries()) {
      c.maxCurriculumSlots = Math.max(0, c.rawSlots - c.specialEventSlots - c.peReservedSlots)
    }

    summaryLines.push('## Kapasite Analizi (Pinpoint)')
    summaryLines.push('| Ay | İş Günü | Slot/Gün | Ham Slot | Özel Etkinlik Slot | PE Rezerv Slot | Maks Müfredat Slot | Planlanan | Gerçekleşen |')
    summaryLines.push('|---|---:|---:|---:|---:|---:|---:|---:|---:|')
    for (const mk of sortedMonthKeys) {
      const cap = capacityByMonth.get(mk)
      const plannedMap = plannedByMonth.get(mk) || new Map()
      const actualMap = actualByMonth.get(mk) || new Map()
      let plannedTotal = 0
      let actualTotal = 0
      for (const { planned } of plannedMap.values()) plannedTotal += planned
      for (const actual of actualMap.values()) actualTotal += actual

      summaryLines.push(
        `| ${mk} | ${cap?.workingDays ?? 0} | ${totalSlotCount} | ${cap?.rawSlots ?? 0} | ${cap?.specialEventSlots ?? 0} | ${cap?.peReservedSlots ?? 0} | ${cap?.maxCurriculumSlots ?? 0} | ${plannedTotal} | ${actualTotal} |`
      )
    }
    summaryLines.push('')

    // Detay
    summaryLines.push('## Ders Bazında Dönem Toplamı')
    summaryLines.push('| Ders Kodu | Ders Adı | Planlanan (Toplam) | Gerçekleşen (Toplam) | Fark |')
    summaryLines.push('|---|---|---:|---:|---:|')

    // Toplam plan (monthly planların toplamı)
    const totalPlannedByCourseId = new Map<string, { planned: number; code: string; name: string }>()
    const courseInfoById = new Map<string, { code: string; name: string }>()
    for (const mp of monthlyPlans) {
      const course = mp.termCoursePlan.course
      courseInfoById.set(course.id, { code: course.code, name: course.name })
      const current = totalPlannedByCourseId.get(course.id)
      totalPlannedByCourseId.set(course.id, {
        planned: (current?.planned || 0) + mp.plannedHours,
        code: course.code,
        name: course.name,
      })
    }

    // Toplam actual (distinct courseId+specificDate, tüm dönem)
    const totalActualByCourseId = new Map<string, number>()
    for (const row of rawActualDistinct) {
      if (!row.courseId) continue
      totalActualByCourseId.set(row.courseId, (totalActualByCourseId.get(row.courseId) || 0) + 1)
    }

    const totalRows = Array.from(totalPlannedByCourseId.entries()).map(([courseId, v]) => {
      const actual = totalActualByCourseId.get(courseId) || 0
      return {
        code: v.code,
        name: v.name,
        planned: v.planned,
        actual,
        diff: actual - v.planned,
      }
    })

    const termMismatchCount = totalRows.filter((r) => r.diff !== 0).length

    totalRows.sort((a, b) => a.code.localeCompare(b.code, 'tr'))
    for (const r of totalRows) {
      summaryLines.push(`| ${escapeMd(r.code)} | ${escapeMd(r.name)} | ${r.planned} | ${r.actual} | ${r.diff} |`)
    }
    summaryLines.push('')

    summaryLines.push('## Ders Bazında Detay (Ay-Ay)')

    let monthlyMismatchCount = 0

    for (const mk of sortedMonthKeys) {
      const plannedMap = plannedByMonth.get(mk) || new Map()
      const actualMap = actualByMonth.get(mk) || new Map()

      const rows: Array<{ code: string; name: string; planned: number; actual: number; diff: number }> = []

      for (const [courseId, p] of plannedMap.entries()) {
        const actual = actualMap.get(courseId) || 0
        const diff = actual - p.planned
        if (diff !== 0) monthlyMismatchCount++
        rows.push({
          code: p.courseCode,
          name: p.courseName,
          planned: p.planned,
          actual,
          diff,
        })
      }

      rows.sort((a, b) => a.code.localeCompare(b.code, 'tr'))

      summaryLines.push(`### ${mk}`)
      summaryLines.push('| Ders Kodu | Ders Adı | Planlanan | Gerçekleşen | Fark |')
      summaryLines.push('|---|---|---:|---:|---:|')

      for (const r of rows) {
        summaryLines.push(`| ${escapeMd(r.code)} | ${escapeMd(r.name)} | ${r.planned} | ${r.actual} | ${r.diff} |`)
      }

      summaryLines.push('')
    }

    // Bu ay planı olmayan (başka ay(lar)da planlı) ama bu ay içinde gerçekleşen dersler (carry-over ile normal)
    const extraActual: Array<{ mk: string; courseId: string; count: number }> = []
    for (const [mk, aMap] of actualByMonth.entries()) {
      const pMap = plannedByMonth.get(mk) || new Map()
      for (const [courseId, count] of aMap.entries()) {
        if (!pMap.has(courseId)) extraActual.push({ mk, courseId, count })
      }
    }

    if (extraActual.length > 0) {
      summaryLines.push('## Not: Bu Ay Planlı Değil Ama Yazılan Dersler (Carry-Over)')
      summaryLines.push('| Ay | Ders Kodu | Ders Adı | Gerçekleşen |')
      summaryLines.push('|---|---|---|---:|')
      for (const r of extraActual.sort((a, b) => a.mk.localeCompare(b.mk))) {
        const info = courseInfoById.get(r.courseId)
        summaryLines.push(`| ${r.mk} | ${escapeMd(info?.code || r.courseId)} | ${escapeMd(info?.name || '-') } | ${r.count} |`)
      }
      summaryLines.push('')
    }

    summaryLines.push(`## Özet`)
    summaryLines.push(`- Plan satırı (ay+ders): ${monthlyPlans.length}`)
    summaryLines.push(`- Aylık sapma satırı (ay+ders, fark ≠ 0): ${monthlyMismatchCount}`)
    summaryLines.push(`- Dönem toplam sapma satırı (ders, fark ≠ 0): ${termMismatchCount}`)
    summaryLines.push('')

    const outPath = args.out
      ? path.resolve(process.cwd(), args.out)
      : path.resolve(process.cwd(), 'doc', 'AYLIK_KOTA_DOGRULAMA_RAPORU.md')

    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, summaryLines.join('\n'), 'utf8')

    console.log(`Rapor yazıldı: ${outPath}`)
    console.log(`Genel toplam fark: ${totalActualAll - totalPlannedAll}`)
    console.log(`Aylık sapma satırı (ay+ders): ${monthlyMismatchCount}`)
    console.log(`Dönem toplam sapma satırı (ders): ${termMismatchCount}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
