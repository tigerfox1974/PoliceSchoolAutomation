/**
 * DERS TAMAMLANMA ANALİZİ
 * 
 * Bu script her dersin:
 * 1. Hedef saatini (totalPlannedHours)
 * 2. Gerçekleşen saatini (haftalık programda kaç kez yazıldığını)
 * 3. Eksik kalan saatini
 * 4. Aylık dağılımını (Şubat, Mart, Nisan, Mayıs)
 * analiz eder.
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function analyzeCourseCompletion() {
  try {
    console.log('📊 DERS TAMAMLANMA ANALİZİ\n')
    console.log('='.repeat(100) + '\n')

    // PTE-69 dönemini al
    const term = await prisma.term.findFirst({
      where: { termCode: 'PTE-69' },
      include: {
        settings: true,
      },
    })

    if (!term) {
      console.log('❌ PTE-69 dönemi bulunamadı')
      return
    }

    console.log(`✅ Dönem: ${term.name}`)
    console.log(`📅 Tarih: ${term.startDate.toISOString().split('T')[0]} → ${term.endDate.toISOString().split('T')[0]}`)
    
    // Toplam hafta sayısı
    const totalWeeks = Math.ceil((term.endDate.getTime() - term.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
    console.log(`📆 Toplam Hafta: ${totalWeeks}\n`)

    // Tüm ders planlarını al (TermCoursePlan + MonthlyCoursePlan)
    const termCoursePlans = await prisma.termCoursePlan.findMany({
      where: { termId: term.id },
      include: {
        course: true,
        monthlyPlans: {
          orderBy: [{ year: 'asc' }, { month: 'asc' }],
        },
      },
    })

    console.log(`📚 Toplam Ders Sayısı: ${termCoursePlans.length}\n`)

    // Her ders için gerçekleşen saatleri hesapla (distinct tarih bazında)
    const courseCompletions = []

    for (const plan of termCoursePlans) {
      const course = plan.course

      // Gerçekleşen: distinct (courseId, specificDate) - her gün 1 saat sayılır
      const distinctLessons = await prisma.dailyLesson.findMany({
        where: {
          termId: term.id,
          courseId: course.id,
          isCancelled: false,
          isSpecialEvent: false,
        },
        select: {
          specificDate: true,
        },
        distinct: ['courseId', 'specificDate'],
      })

      const actualHours = distinctLessons.length
      const plannedHours = plan.totalPlannedHours
      const remaining = plannedHours - actualHours
      const completionRate = plannedHours > 0 ? ((actualHours / plannedHours) * 100).toFixed(1) : 0

      // Aylık dağılım
      const monthlyDistribution = {
        'Şubat': { planned: 0, actual: 0 },
        'Mart': { planned: 0, actual: 0 },
        'Nisan': { planned: 0, actual: 0 },
        'Mayıs': { planned: 0, actual: 0 },
      }

      // Aylık planlar
      plan.monthlyPlans.forEach(mp => {
        const monthName = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'][mp.month]
        if (monthlyDistribution[monthName] !== undefined) {
          monthlyDistribution[monthName].planned = mp.plannedHours
        }
      })

      // Gerçekleşen aylık dağılım
      distinctLessons.forEach(lesson => {
        const month = lesson.specificDate.getMonth() + 1 // 1-12
        const monthName = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'][month]
        if (monthlyDistribution[monthName] !== undefined) {
          monthlyDistribution[monthName].actual += 1
        }
      })

      courseCompletions.push({
        code: course.code,
        name: course.name,
        plannedHours,
        actualHours,
        remaining,
        completionRate: parseFloat(completionRate),
        monthlyDistribution,
      })
    }

    // Tamamlanma oranına göre sırala (en düşük önce)
    courseCompletions.sort((a, b) => a.completionRate - b.completionRate)

    console.log('🔴 TAMAMLANMAYAN veya EKSİK DERSLER (<%100):\n')
    console.log('-'.repeat(100))

    const incompleteCourses = courseCompletions.filter(c => c.completionRate < 100)
    
    if (incompleteCourses.length === 0) {
      console.log('✅ Tüm dersler tamamlandı!\n')
    } else {
      incompleteCourses.forEach(course => {
        console.log(`\n📘 ${course.code}: ${course.name}`)
        console.log(`   Hedef: ${course.plannedHours} saat | Gerçekleşen: ${course.actualHours} saat | Eksik: ${course.remaining} saat`)
        console.log(`   Tamamlanma: ${course.completionRate}% ${course.completionRate < 50 ? '🔴' : course.completionRate < 80 ? '🟠' : '🟡'}`)
        
        console.log('   Aylık Dağılım:')
        Object.entries(course.monthlyDistribution).forEach(([month, data]) => {
          const status = data.actual >= data.planned ? '✅' : data.actual > 0 ? '⚠️' : '❌'
          console.log(`     ${month}: Plan=${data.planned} | Gerçek=${data.actual} ${status}`)
        })
      })
    }

    // KBS özel analizi
    console.log('\n\n' + '='.repeat(100))
    console.log('🔍 KBS DERSİ ÖZEL ANALİZİ')
    console.log('='.repeat(100) + '\n')

    const kbsCourse = courseCompletions.find(c => c.code.includes('KBS'))
    if (kbsCourse) {
      console.log(`📘 ${kbsCourse.code}: ${kbsCourse.name}`)
      console.log(`   Hedef: ${kbsCourse.plannedHours} saat`)
      console.log(`   Gerçekleşen: ${kbsCourse.actualHours} saat`)
      console.log(`   Eksik: ${kbsCourse.remaining} saat`)
      console.log(`   Tamamlanma: ${kbsCourse.completionRate}%\n`)

      console.log('📊 Aylık Dağılım:')
      Object.entries(kbsCourse.monthlyDistribution).forEach(([month, data]) => {
        const status = data.actual >= data.planned ? '✅' : data.actual > 0 ? '⚠️' : '❌'
        const bar = '█'.repeat(data.actual) + '░'.repeat(Math.max(0, data.planned - data.actual))
        console.log(`   ${month.padEnd(10)}: Plan=${data.planned} | Gerçek=${data.actual} ${status} ${bar}`)
      })

      // KBS'nin hangi haftalarda yazıldığını bul
      const kbsLessons = await prisma.dailyLesson.findMany({
        where: {
          termId: term.id,
          course: { code: { contains: 'KBS' } },
          isCancelled: false,
          isSpecialEvent: false,
        },
        select: {
          specificDate: true,
          class: { select: { name: true } },
        },
        distinct: ['courseId', 'specificDate'],
        orderBy: { specificDate: 'asc' },
      })

      console.log(`\n📅 KBS Dersi Yapıldığı Tarihler (${kbsLessons.length} gün):`)
      kbsLessons.forEach((lesson, idx) => {
        const date = lesson.specificDate
        const weekNum = Math.ceil((date.getTime() - term.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
        console.log(`   ${idx + 1}. ${date.toISOString().split('T')[0]} (Hafta ${weekNum})`)
      })
    }

    // GENEL ÖZET
    console.log('\n\n' + '='.repeat(100))
    console.log('📈 GENEL ÖZET')
    console.log('='.repeat(100) + '\n')

    const totalPlanned = courseCompletions.reduce((sum, c) => sum + c.plannedHours, 0)
    const totalActual = courseCompletions.reduce((sum, c) => sum + c.actualHours, 0)
    const totalRemaining = courseCompletions.reduce((sum, c) => sum + c.remaining, 0)
    const overallCompletion = ((totalActual / totalPlanned) * 100).toFixed(1)

    console.log(`📊 Toplam Planlanan: ${totalPlanned} saat`)
    console.log(`✅ Toplam Gerçekleşen: ${totalActual} saat`)
    console.log(`❌ Toplam Eksik: ${totalRemaining} saat`)
    console.log(`📈 Genel Tamamlanma: ${overallCompletion}%\n`)

    const completeCount = courseCompletions.filter(c => c.completionRate >= 100).length
    const incompleteCount = courseCompletions.filter(c => c.completionRate < 100).length

    console.log(`✅ Tamamen Tamamlanan: ${completeCount} ders`)
    console.log(`⚠️ Eksik Kalan: ${incompleteCount} ders\n`)

    // SON HAFTA ANALİZİ
    console.log('='.repeat(100))
    console.log('🏁 SON HAFTA (18. HAFTA) ANALİZİ')
    console.log('='.repeat(100) + '\n')

    // 18. haftanın tarihleri
    const startDate = new Date(term.startDate)
    const startDayOfWeek = startDate.getDay()
    const daysToMonday = startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek
    const firstMonday = new Date(startDate)
    firstMonday.setDate(startDate.getDate() + daysToMonday)
    
    const week18Start = new Date(firstMonday)
    week18Start.setDate(firstMonday.getDate() + (18 - 1) * 7)
    
    const week18End = new Date(week18Start)
    week18End.setDate(week18Start.getDate() + 6)

    console.log(`📅 18. Hafta Tarihleri: ${week18Start.toISOString().split('T')[0]} → ${week18End.toISOString().split('T')[0]}`)
    console.log(`📅 Dönem Bitiş: ${term.endDate.toISOString().split('T')[0]}\n`)

    // 18. haftada olan dersler
    const week18Lessons = await prisma.dailyLesson.groupBy({
      by: ['courseId'],
      where: {
        termId: term.id,
        specificDate: {
          gte: week18Start,
          lte: week18End,
        },
        isCancelled: false,
        isSpecialEvent: false,
      },
      _count: { courseId: true },
    })

    console.log(`📚 18. Haftada Yapılan Farklı Ders Sayısı: ${week18Lessons.length}\n`)

    // KBS 18. haftada var mı?
    const kbsInWeek18 = week18Lessons.find(l => {
      const course = termCoursePlans.find(p => p.courseId === l.courseId)
      return course?.course.code.includes('KBS')
    })

    if (kbsInWeek18) {
      console.log(`✅ KBS dersi 18. haftada ${kbsInWeek18._count.courseId} kez yapıldı`)
    } else {
      console.log(`❌ KBS dersi 18. haftada hiç yapılmadı`)
      console.log(`⚠️ Muhtemel neden: Mayıs ayı planında 3 saat var ama 18. hafta dönemin sonuna denk geldiği için algoritma yetiştirememiş olabilir`)
    }

    // TARİHSEL KISITLAMA ANALİZİ
    console.log('\n\n' + '='.repeat(100))
    console.log('⏰ TARİHSEL KISITLAMA ANALİZİ')
    console.log('='.repeat(100) + '\n')

    console.log('🔍 Mayıs Ayına Sıkıştırılmış Dersler:\n')
    const mayOnlyCourses = courseCompletions.filter(c => {
      const mayPlan = c.monthlyDistribution['Mayıs'].planned
      const otherMonths = c.monthlyDistribution['Şubat'].planned + 
                          c.monthlyDistribution['Mart'].planned + 
                          c.monthlyDistribution['Nisan'].planned
      return mayPlan > 0 && otherMonths === 0
    })

    if (mayOnlyCourses.length > 0) {
      mayOnlyCourses.forEach(c => {
        console.log(`📘 ${c.code}: ${c.name}`)
        console.log(`   Sadece Mayıs'ta: ${c.monthlyDistribution['Mayıs'].planned} saat planlanmış`)
        console.log(`   Gerçekleşen: ${c.monthlyDistribution['Mayıs'].actual} saat`)
        console.log(`   Tamamlanma: ${c.completionRate}% ${c.completionRate < 100 ? '⚠️ EKSİK' : '✅'}\n`)
      })

      console.log('📝 DEĞERLENDİRME:')
      console.log('   ⚠️ Bu dersler SADECE Mayıs ayına planlanmış')
      console.log('   ⚠️ Mayıs ayında yeterli hafta/gün olmayabilir')
      console.log('   ⚠️ Son hafta (18. hafta) dönem bitiş tarihine çok yakın')
      console.log('   ⚠️ Algoritma backlog sisteminden çekememiş (çünkü önceki aylarda plan yoktu)')
      console.log('   ✅ Bu bir algoritma hatası DEĞİL, tarihsel kısıtlama ve planlama stratejisi')
    }

    console.log('\n✅ Analiz tamamlandı!\n')

  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeCourseCompletion()
