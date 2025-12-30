import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Tüm haftalar için program oluştur
async function generateAllWeeks(termId: string) {
  try {
    // Dönem bilgilerini al
    const term = await prisma.term.findUnique({
      where: { id: termId },
      include: {
        settings: true,
        classes: {
          where: { isDeleted: false },
        },
      },
    })

    if (!term) {
      return NextResponse.json({ error: 'Dönem bulunamadı' }, { status: 404 })
    }

    if (!term.settings) {
      return NextResponse.json({ error: 'Dönem ayarları bulunamadı' }, { status: 404 })
    }

    // Dönem başlangıç ve bitiş tarihleri arasındaki tüm haftaları hesapla
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
    
    console.log(`Generating programs for all ${totalWeeks} weeks`)

    // Tüm mevcut dersleri sil (yenileme için)
    const deleted = await prisma.dailyLesson.deleteMany({
      where: {
        termId,
        specificDate: {
          gte: firstMonday,
          lte: endDate,
        },
      },
    })
    console.log(`Deleted ${deleted.count} existing lessons`)

    let totalCreatedLessons = 0
    const weekResults = []

    // Her hafta için program oluştur
    for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
      const weekStartDate = new Date(firstMonday)
      weekStartDate.setDate(firstMonday.getDate() + (weekNum - 1) * 7)
      
      const weekEndDate = new Date(weekStartDate)
      weekEndDate.setDate(weekStartDate.getDate() + 6)
      weekEndDate.setHours(23, 59, 59, 999)

      // Hafta dönem bitiş tarihini geçiyorsa dur
      if (weekStartDate > endDate) {
        break
      }

      try {
        const result = await generateWeekProgram(termId, weekNum, weekStartDate, weekEndDate, term)
        totalCreatedLessons += result.createdLessons
        weekResults.push({
          weekNumber: weekNum,
          createdLessons: result.createdLessons,
          status: 'success',
        })
        console.log(`Week ${weekNum}: ${result.createdLessons} lessons created`)
      } catch (error) {
        console.error(`Week ${weekNum} error:`, error)
        weekResults.push({
          weekNumber: weekNum,
          createdLessons: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Bilinmeyen hata',
        })
      }
    }

    return NextResponse.json({
      message: 'Tüm haftalar için program oluşturuldu',
      totalWeeks,
      totalCreatedLessons,
      weekResults,
    })
  } catch (error) {
    console.error('Generate all weeks error:', error)
    return NextResponse.json(
      { error: 'Tüm haftalar için program oluşturulamadı', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}

// Yardımcı fonksiyon: Ayın toplam hafta sayısını hesapla
function calculateWeeksInMonth(monthStartDate: Date, monthEndDate: Date, term: any): number {
  // Ayın ilk Pazartesi'sini bul
  const firstDayOfWeek = monthStartDate.getDay() // 0 = Pazar, 1 = Pazartesi, ...
  const daysToMonday = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek
  const firstMonday = new Date(monthStartDate)
  firstMonday.setDate(monthStartDate.getDate() + daysToMonday)
  firstMonday.setHours(0, 0, 0, 0)
  
  // Ayın son Pazar'ını bul
  const lastDayOfWeek = monthEndDate.getDay()
  const daysToSunday = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek
  const lastSunday = new Date(monthEndDate)
  lastSunday.setDate(monthEndDate.getDate() + daysToSunday)
  lastSunday.setHours(23, 59, 59, 999)
  
  // Dönem sınırlarını kontrol et
  const termStart = new Date(term.startDate)
  const termEnd = new Date(term.endDate)
  
  const actualStart = firstMonday < termStart ? termStart : firstMonday
  const actualEnd = lastSunday > termEnd ? termEnd : lastSunday
  
  // Hafta sayısını hesapla
  const weeks = Math.ceil((actualEnd.getTime() - actualStart.getTime()) / (7 * 24 * 60 * 60 * 1000))
  return Math.max(1, weeks) // En az 1 hafta
}

// Yardımcı fonksiyon: Kalan hafta sayısını hesapla
function calculateRemainingWeeks(currentWeekEndDate: Date, termEndDate: Date): number {
  const termEnd = new Date(termEndDate)
  termEnd.setHours(23, 59, 59, 999)
  
  // Kalan hafta sayısını hesapla
  const remainingDays = Math.ceil((termEnd.getTime() - currentWeekEndDate.getTime()) / (24 * 60 * 60 * 1000))
  const remainingWeeks = Math.ceil(remainingDays / 7)
  return Math.max(1, remainingWeeks) // En az 1 hafta
}

// Tek hafta için program oluştur (helper function)
async function generateWeekProgram(
  termId: string,
  weekNumber: number,
  weekStartDate: Date,
  weekEndDate: Date,
  term: any
) {
  // Hafta hangi aya ait? (Haftanın çoğu hangi ayda ise o ay)
  const weekMonth = weekStartDate.getMonth() + 1
  const weekYear = weekStartDate.getFullYear()
  
  // O ayın başlangıç ve bitiş tarihlerini hesapla
  const monthStartDate = new Date(weekYear, weekMonth - 1, 1)
  const monthEndDate = new Date(weekYear, weekMonth, 0) // Ayın son günü
  monthEndDate.setHours(23, 59, 59, 999)
  
  // O ayın toplam hafta sayısını hesapla
  const weeksInMonth = calculateWeeksInMonth(monthStartDate, monthEndDate, term)
  
  // O ay için aylık planları getir
  const monthlyPlans = await prisma.monthlyCoursePlan.findMany({
    where: {
      termCoursePlan: {
        termId,
      },
      month: weekMonth,
      year: weekYear,
      plannedHours: {
        gt: 0,
      },
    },
    include: {
      termCoursePlan: {
        include: {
          course: {
            include: {
              courseInstructors: {
                include: {
                  instructor: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (monthlyPlans.length === 0) {
    return { createdLessons: 0 }
  }

  // TimeSlot'ları getir
  const timeSlots = await prisma.timeSlot.findMany({
    orderBy: { slotNumber: 'asc' },
  })

  if (timeSlots.length === 0) {
    return { createdLessons: 0 }
  }

  // Çalışma günlerini al
  const workingDays = (term.settings.workingDays as string[]) || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']

  // Sınıfları al
  const classes = term.classes || []

  if (classes.length === 0) {
    return { createdLessons: 0 }
  }

  // Haftalık program oluşturma algoritması (GENEL GÖRÜNÜM - Sınıf bazlı değil)
  // Mantık: Bir günde bir ders sadece bir kez görünür (hangi saatte olduğu önemli değil)
  // Günlük programda bu dersler sınıflara dağıtılacak
  
  const createdLessons = []
  
  // İNTİBAK HAFTASI KONTROLÜ: İlk hafta tüm hafta "İntibak Eğitimi" olmalı
  if (weekNumber === 1) {
    // İntibak SpecialEvent'ini kontrol et veya oluştur
    let orientationEvent = await prisma.specialEvent.findFirst({
      where: {
        eventType: 'ORIENTATION',
        eventTitle: { contains: 'İntibak' },
      },
    })

    if (!orientationEvent) {
      orientationEvent = await prisma.specialEvent.create({
        data: {
          eventType: 'ORIENTATION',
          eventTitle: 'İntibak Eğitimi',
          description: 'İlk hafta tüm hafta',
          duration: 7, // Tüm gün
          requiresInstructor: false,
          allClassesTogether: true,
          countsTowardCurriculum: false,
        },
      })
    }

    // İlk hafta için tüm çalışma günlerinde tüm saatlerde İntibak Eğitimi
    for (const dayName of workingDays) {
      const dayIndex = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].indexOf(dayName)
      if (dayIndex === -1) continue

      const dayDate = new Date(weekStartDate)
      dayDate.setDate(weekStartDate.getDate() + dayIndex)
      dayDate.setHours(0, 0, 0, 0)

      // Tüm saatlerde İntibak Eğitimi
      for (const timeSlot of timeSlots) {
        for (const classItem of classes) {
          const existing = await prisma.dailyLesson.findFirst({
            where: {
              termId,
              classId: classItem.id,
              specificDate: dayDate,
              timeSlotId: timeSlot.id,
              specialEventId: orientationEvent.id,
            },
          })

          if (!existing) {
            try {
              await prisma.dailyLesson.create({
                data: {
                  termId,
                  classId: classItem.id,
                  dayOfWeek: dayName as any,
                  timeSlotId: timeSlot.id,
                  specificDate: dayDate,
                  isSpecialEvent: true,
                  specialEventId: orientationEvent.id,
                  specialEventType: 'ORIENTATION',
                  requiresInstructor: false,
                },
              })
              createdLessons.push({ id: 'orientation' })
            } catch (error) {
              console.error('Create orientation lesson error:', error)
            }
          }
        }
      }
    }

    // İntibak haftası için normal dersler oluşturulmaz
    return { createdLessons: createdLessons.length }
  }

  // SABİT DERSLERİ ÖNCE EKLE (Normal derslerden önce rezerve edilsin)
  // Müdüriyet (Her Cuma 7. ders) ve Sosyal/Sportif (Her Çarşamba 6-7. ders)
  let managementEvent = await prisma.specialEvent.findFirst({
    where: {
      eventType: 'MANAGEMENT',
      eventTitle: { contains: 'Müdüriyet' },
    },
  })

  if (!managementEvent) {
    managementEvent = await prisma.specialEvent.create({
      data: {
        eventType: 'MANAGEMENT',
        eventTitle: 'Haftalık Müdüriyet Toplantısı',
        description: 'Her Cuma 7. ders saati',
        duration: 1,
        dayOfWeek: 5, // Cuma
        slotIndex: 7, // 7. ders
        requiresInstructor: false,
        allClassesTogether: true,
        countsTowardCurriculum: false,
        managedBy: 'Okul Müdürü',
      },
    })
  }

  let socialSportsEvent = await prisma.specialEvent.findFirst({
    where: {
      eventType: 'SOCIAL_SPORTS',
      eventTitle: { contains: 'Sosyal' },
    },
  })

  if (!socialSportsEvent) {
    socialSportsEvent = await prisma.specialEvent.create({
      data: {
        eventType: 'SOCIAL_SPORTS',
        eventTitle: 'Sosyal ve Sportif Faaliyetler',
        description: 'Her Çarşamba 6-7. ders saatleri',
        duration: 2,
        dayOfWeek: 3, // Çarşamba
        slotIndex: 6, // 6. ders (başlangıç)
        requiresInstructor: false,
        allClassesTogether: true,
        countsTowardCurriculum: false,
      },
    })
  }

  // Sabit dersleri ekle (normal derslerden önce)
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStartDate)
    dayDate.setDate(weekStartDate.getDate() + i)
    dayDate.setHours(0, 0, 0, 0)
    
    const dayOfWeek = dayDate.getDay() // 0 = Pazar, 1 = Pazartesi, ..., 5 = Cuma, 3 = Çarşamba
    
    // Müdüriyet: Her Cuma 7. ders
    if (dayOfWeek === 5) { // Cuma
      const fridaySlot7 = timeSlots.find((ts) => ts.slotNumber === 7)
      if (fridaySlot7) {
        for (const classItem of classes) {
          const existingManagement = await prisma.dailyLesson.findFirst({
            where: {
              termId,
              classId: classItem.id,
              specificDate: dayDate,
              timeSlotId: fridaySlot7.id,
              specialEventId: managementEvent.id,
            },
          })

          if (!existingManagement) {
            try {
              await prisma.dailyLesson.create({
                data: {
                  termId,
                  classId: classItem.id,
                  dayOfWeek: 'FRIDAY' as any,
                  timeSlotId: fridaySlot7.id,
                  specificDate: dayDate,
                  isSpecialEvent: true,
                  specialEventId: managementEvent.id,
                  specialEventType: 'MANAGEMENT',
                  requiresInstructor: false,
                },
              })
              createdLessons.push({ id: 'management' })
            } catch (error) {
              console.error('Create management lesson error:', error)
            }
          }
        }
      }
    }

    // Sosyal/Sportif: Her Çarşamba 6-7. ders (ÖNCE 6. SAAT, SONRA 7. SAAT)
    if (dayOfWeek === 3) { // Çarşamba
      const wednesdaySlot6 = timeSlots.find((ts) => ts.slotNumber === 6)
      const wednesdaySlot7 = timeSlots.find((ts) => ts.slotNumber === 7)
      
      if (wednesdaySlot6 && wednesdaySlot7) {
        for (const classItem of classes) {
          // 6. ders (ÖNCE)
          const existingSocial6 = await prisma.dailyLesson.findFirst({
            where: {
              termId,
              classId: classItem.id,
              specificDate: dayDate,
              timeSlotId: wednesdaySlot6.id,
              specialEventId: socialSportsEvent.id,
            },
          })

          if (!existingSocial6) {
            try {
              await prisma.dailyLesson.create({
                data: {
                  termId,
                  classId: classItem.id,
                  dayOfWeek: 'WEDNESDAY' as any,
                  timeSlotId: wednesdaySlot6.id,
                  specificDate: dayDate,
                  isSpecialEvent: true,
                  specialEventId: socialSportsEvent.id,
                  specialEventType: 'SOCIAL_SPORTS',
                  requiresInstructor: false,
                },
              })
              createdLessons.push({ id: 'social-sports-6' })
            } catch (error) {
              console.error('Create social sports lesson error:', error)
            }
          }

          // 7. ders (SONRA)
          const existingSocial7 = await prisma.dailyLesson.findFirst({
            where: {
              termId,
              classId: classItem.id,
              specificDate: dayDate,
              timeSlotId: wednesdaySlot7.id,
              specialEventId: socialSportsEvent.id,
            },
          })

          if (!existingSocial7) {
            try {
              await prisma.dailyLesson.create({
                data: {
                  termId,
                  classId: classItem.id,
                  dayOfWeek: 'WEDNESDAY' as any,
                  timeSlotId: wednesdaySlot7.id,
                  specificDate: dayDate,
                  isSpecialEvent: true,
                  specialEventId: socialSportsEvent.id,
                  specialEventType: 'SOCIAL_SPORTS',
                  requiresInstructor: false,
                },
              })
              createdLessons.push({ id: 'social-sports-7' })
            } catch (error) {
              console.error('Create social sports lesson error:', error)
            }
          }
        }
      }
    }
  }
  
  // BEDEN EĞİTİMİ ÖNCELİĞİ: Perşembe 6-7. ders saatlerini önce rezerve et
  // Bu hafta için beden eğitimi dersi varsa, Perşembe 6-7. ders saatlerini rezerve et
  const physicalEducationPlan = monthlyPlans.find(
    (plan) => {
      const courseName = plan.termCoursePlan.course.name.toUpperCase()
      return courseName.includes('BEDEN EĞİTİMİ') || courseName.includes('BEDEN EĞİTİM')
    }
  )
  
  if (physicalEducationPlan) {
    const course = physicalEducationPlan.termCoursePlan.course
    const courseInstructors = course.courseInstructors || []
    const instructor = courseInstructors[0]?.instructor
    
    if (instructor) {
      // Perşembe gününü bul (Pazartesi + 3 = Perşembe)
      const thursdayDate = new Date(weekStartDate)
      thursdayDate.setDate(weekStartDate.getDate() + 3)
      thursdayDate.setHours(0, 0, 0, 0)
      
      const thursdaySlot6 = timeSlots.find((ts) => ts.slotNumber === 6)
      const thursdaySlot7 = timeSlots.find((ts) => ts.slotNumber === 7)
      
      if (thursdaySlot6 && thursdaySlot7) {
        // Bu hafta için beden eğitimi dersinin kaç saat olacağını hesapla
        const weeksInMonth = 4
        const weeklyHours = Math.ceil(physicalEducationPlan.plannedHours / weeksInMonth)
        
        // Bu hafta Perşembe 6-7. ders saatlerini rezerve et (haftalık saat sayısı kadar)
        // Örnek: Haftalık 2 saat ise, bu hafta Perşembe 6-7. ders saatlerinde yazılır
        if (weeklyHours > 0) {
          // 6. ders
          const existingPE6 = await prisma.dailyLesson.findFirst({
            where: {
              termId,
              courseId: course.id,
              specificDate: thursdayDate,
              timeSlotId: thursdaySlot6.id,
              isCancelled: false,
            },
          })
          
          if (!existingPE6) {
            try {
              await prisma.dailyLesson.create({
                data: {
                  termId,
                  classId: classes[0].id,
                  courseId: course.id,
                  instructorId: instructor.id,
                  dayOfWeek: 'THURSDAY' as any,
                  timeSlotId: thursdaySlot6.id,
                  specificDate: thursdayDate,
                },
              })
              createdLessons.push({ id: 'pe-6' })
            } catch (error) {
              console.error('Create PE lesson error:', error)
            }
          }
          
          // 7. ders
          const existingPE7 = await prisma.dailyLesson.findFirst({
            where: {
              termId,
              courseId: course.id,
              specificDate: thursdayDate,
              timeSlotId: thursdaySlot7.id,
              isCancelled: false,
            },
          })
          
          if (!existingPE7) {
            try {
              await prisma.dailyLesson.create({
                data: {
                  termId,
                  classId: classes[0].id,
                  courseId: course.id,
                  instructorId: instructor.id,
                  dayOfWeek: 'THURSDAY' as any,
                  timeSlotId: thursdaySlot7.id,
                  specificDate: thursdayDate,
                },
              })
              createdLessons.push({ id: 'pe-7' })
            } catch (error) {
              console.error('Create PE lesson error:', error)
            }
          }
        }
      }
    }
  }
  
  // YENİ ALGORİTMA: GÜN BAZLI - Her gün 7 ders saati dolu olmalı
  // 1. Her ders için sayaç kontrolü (toplam saatine ulaştı mı?)
  // 2. Eşit dağılım hesaplama (aylık plan verilerini kullanarak)
  // 3. Her gün için boş slotları bul
  // 4. Dersleri bu boş slotlara doldur
  // 5. Her gün 7 ders saati dolu olmalı
  
  // BASİT VERSİYON: Aylık plan verilerini kullanarak haftalık saat hesapla
  const courseWeeklyHours = new Map<string, number>()
  const courseInstructorsMap = new Map<string, any>()
  const courseMap = new Map<string, any>()
  
  for (const monthlyPlan of monthlyPlans) {
    const course = monthlyPlan.termCoursePlan.course
    
    // Beden eğitimi dersini atla (zaten Perşembe 6-7. ders saatlerinde rezerve edildi)
    const isPhysicalEducation = course.name.toUpperCase().includes('BEDEN EĞİTİMİ') || 
                               course.name.toUpperCase().includes('BEDEN EĞİTİM')
    if (isPhysicalEducation) {
      continue
    }
    
    // BASİT HESAPLAMA: Aylık plan / hafta sayısı = haftalık saat
    const weeklyHours = Math.ceil(monthlyPlan.plannedHours / weeksInMonth)
    
    if (weeklyHours > 0) {
      courseWeeklyHours.set(course.id, weeklyHours)
      courseMap.set(course.id, course)
      
      const courseInstructors = course.courseInstructors || []
      if (courseInstructors.length > 0) {
        courseInstructorsMap.set(course.id, courseInstructors[0]?.instructor)
      }
    }
  }
  
  // Her gün için dersleri doldur
  for (const dayName of workingDays) {
    const dayIndex = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].indexOf(dayName)
    if (dayIndex === -1) continue
    
    const dayDate = new Date(weekStartDate)
    dayDate.setDate(weekStartDate.getDate() + dayIndex)
    dayDate.setHours(0, 0, 0, 0)
    
    // Bu gün için dolu slotları bul
    const occupiedSlots = await prisma.dailyLesson.findMany({
      where: {
        termId,
        specificDate: dayDate,
        isCancelled: false,
      },
      select: {
        timeSlotId: true,
        courseId: true,
      },
    })
    
    const occupiedSlotIds = new Set(occupiedSlots.map(l => l.timeSlotId))
    const occupiedCourseIds = new Set(occupiedSlots.map(l => l.courseId))
    
    // Bu gün için boş slotları bul
    const availableSlots = timeSlots.filter(ts => {
      // Sabit ders saatlerini atla
      if (dayName === 'WEDNESDAY' && (ts.slotNumber === 6 || ts.slotNumber === 7)) {
        return false // Çarşamba 6-7. ders Sosyal/Sportif için rezerve
      }
      if (dayName === 'FRIDAY' && ts.slotNumber === 7) {
        return false // Cuma 7. ders Müdüriyet için rezerve
      }
      if (dayName === 'THURSDAY' && (ts.slotNumber === 6 || ts.slotNumber === 7)) {
        return false // Perşembe 6-7. ders Beden Eğitimi için rezerve
      }
      return !occupiedSlotIds.has(ts.id)
    })
    
    // Bu gün için dersleri doldur (boş slotlar kadar)
    // ÖNEMLİ: Sayaç kontrolü ile filtrele (toplam saatine ulaşan dersleri atla)
    const coursesToFill = Array.from(courseWeeklyHours.entries())
      .filter(([courseId]) => !occupiedCourseIds.has(courseId)) // Bu günde zaten yazılmış dersleri atla
      .sort(() => Math.random() - 0.5) // Rastgele sırala
    
    let slotIndex = 0
    for (const [courseId, weeklyHours] of coursesToFill) {
      if (slotIndex >= availableSlots.length) break
      
      const course = courseMap.get(courseId)
      const instructor = courseInstructorsMap.get(courseId)
      
      if (!course || !instructor) continue
      
      // Bu günde bu ders zaten yazılmış mı kontrol et
      if (occupiedCourseIds.has(course.id)) {
        continue // Bu günde bu ders zaten var
      }
      
      const timeSlot = availableSlots[slotIndex]
      
      // Lab çakışma kontrolü
      if (course.requiresLab) {
        const labConflict = await prisma.dailyLesson.findFirst({
          where: {
            termId,
            specificDate: dayDate,
            timeSlotId: timeSlot.id,
            course: {
              requiresLab: true,
            },
            isCancelled: false,
          },
        })
        
        if (labConflict) {
          // Bu slot dolu, bir sonraki slotu dene
          slotIndex++
          continue
        }
      }
      
      // VERİTABANINDA bu günde bu ders zaten yazılmış mı kontrol et (TÜM HAFTALAR İÇİN)
      const existingCourseOnDay = await prisma.dailyLesson.findFirst({
        where: {
          termId,
          courseId: course.id,
          specificDate: dayDate,
          isCancelled: false,
        },
      })
      
      if (existingCourseOnDay) {
        continue // Bu günde bu ders zaten var
      }
      
      // DailyLesson oluştur
      try {
        const lesson = await prisma.dailyLesson.create({
          data: {
            termId,
            classId: classes[0].id,
            courseId: course.id,
            instructorId: instructor.id,
            dayOfWeek: dayName as any,
            timeSlotId: timeSlot.id,
            specificDate: dayDate,
          },
        })
        
        createdLessons.push(lesson)
        slotIndex++
      } catch (error) {
        console.error('Create lesson error:', error)
      }
    }
    
    // Eğer hala boş slot varsa, kalan derslerle doldur (her gün 7 ders saati dolu olmalı)
    const remainingSlots = availableSlots.slice(slotIndex)
    if (remainingSlots.length > 0) {
      // Tüm dersleri tekrar dene (bu günde yazılmamış olanlar)
      // ÖNEMLİ: Bir günde bir ders sadece bir kez yazılır, ama boş slotları doldurmak için
      // diğer dersleri kullanabiliriz
      const allCourses = Array.from(courseWeeklyHours.entries())
        .filter(([courseId]) => !occupiedCourseIds.has(courseId))
        .sort(() => Math.random() - 0.5)
      
      let remainingSlotIndex = 0
      let courseIndex = 0
      
      // Boş slotları doldur (döngü ile tüm slotlar dolu olana kadar)
      while (remainingSlotIndex < remainingSlots.length && allCourses.length > 0) {
        const [courseId, weeklyHours] = allCourses[courseIndex % allCourses.length]
        const course = courseMap.get(courseId)
        const instructor = courseInstructorsMap.get(courseId)
        
        if (!course || !instructor) {
          courseIndex++
          continue
        }
        
        // Bu günde bu ders zaten yazılmış mı kontrol et
        if (occupiedCourseIds.has(course.id)) {
          courseIndex++
          continue // Bu günde bu ders zaten var
        }
        
        const timeSlot = remainingSlots[remainingSlotIndex]
        
        // Lab çakışma kontrolü
        if (course.requiresLab) {
          const labConflict = await prisma.dailyLesson.findFirst({
            where: {
              termId,
              specificDate: dayDate,
              timeSlotId: timeSlot.id,
              course: {
                requiresLab: true,
              },
              isCancelled: false,
            },
          })
          
          if (labConflict) {
            remainingSlotIndex++
            continue
          }
        }
        
        // VERİTABANINDA bu günde bu ders zaten yazılmış mı kontrol et
        const existingCourseOnDay = await prisma.dailyLesson.findFirst({
          where: {
            termId,
            courseId: course.id,
            specificDate: dayDate,
            isCancelled: false,
          },
        })
        
        if (existingCourseOnDay) {
          // Bu günde bu ders zaten var, bir sonraki dersi dene
          courseIndex++
          continue
        }
        
        try {
          const lesson = await prisma.dailyLesson.create({
            data: {
              termId,
              classId: classes[0].id,
              courseId: course.id,
              instructorId: instructor.id,
              dayOfWeek: dayName as any,
              timeSlotId: timeSlot.id,
              specificDate: dayDate,
            },
          })
          
          createdLessons.push(lesson)
          occupiedCourseIds.add(courseId) // Bu günde bu ders yazıldı
          remainingSlotIndex++
          courseIndex++
        } catch (error) {
          console.error('Create lesson error:', error)
          courseIndex++
        }
      }
    }
  }

  return { createdLessons: createdLessons.length }
}

// GET: Belirli bir hafta için haftalık programı getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const termId = params.id
    const { searchParams } = new URL(request.url)
    const weekNumber = parseInt(searchParams.get('weekNumber') || '1')
    const classId = searchParams.get('classId') // Opsiyonel: Belirli bir sınıf için

    if (!termId) {
      return NextResponse.json({ error: 'Term ID gerekli' }, { status: 400 })
    }

    // Dönem bilgilerini al
    const term = await prisma.term.findUnique({
      where: { id: termId },
      include: {
        settings: true,
      },
    })

    if (!term) {
      return NextResponse.json({ error: 'Dönem bulunamadı' }, { status: 404 })
    }

    // Hafta başlangıç ve bitiş tarihlerini hesapla (POST ile aynı mantık)
    const startDate = new Date(term.startDate)
    const endDate = new Date(term.endDate)
    // Dönem başlangıç tarihinin Pazartesi gününü bul
    const startDayOfWeek = startDate.getDay() // 0 = Pazar, 1 = Pazartesi, ...
    const daysToMonday = startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek
    const firstMonday = new Date(startDate)
    firstMonday.setDate(startDate.getDate() + daysToMonday)
    firstMonday.setHours(0, 0, 0, 0)
    
    // Toplam hafta sayısını hesapla (navigasyon için)
    const totalWeeks = Math.ceil((endDate.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000))

    // Hafta başlangıç tarihi (Pazartesi)
    const weekStartDate = new Date(firstMonday)
    weekStartDate.setDate(firstMonday.getDate() + (weekNumber - 1) * 7)

    // Hafta bitiş tarihi (Pazar)
    const weekEndDate = new Date(weekStartDate)
    weekEndDate.setDate(weekStartDate.getDate() + 6)
    weekEndDate.setHours(23, 59, 59, 999)

    // Haftalık dersleri getir
    const whereClause: any = {
      termId,
      specificDate: {
        gte: weekStartDate,
        lte: weekEndDate,
      },
      isCancelled: false,
    }

    if (classId) {
      whereClause.classId = classId
    }

    // TermCoursePlan bilgilerini al (her course için totalPlannedHours)
    const termCoursePlans = await prisma.termCoursePlan.findMany({
      where: { termId },
      select: {
        courseId: true,
        totalPlannedHours: true,
      },
    })
    const coursePlannedHoursMap = new Map(
      termCoursePlans.map((plan) => [plan.courseId, plan.totalPlannedHours])
    )

    const weeklyLessons = await prisma.dailyLesson.findMany({
      where: whereClause,
      include: {
        course: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rank: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        timeSlot: true,
        specialEvent: true,
        conference: true,
      },
      orderBy: [
        { specificDate: 'asc' },
        { timeSlot: { slotNumber: 'asc' } },
      ],
    })

    // Her dersin o haftaya kadar kaç kez göründüğünü hesapla (verimli yöntem)
    // Sayaç: Her dersin o haftaya kadar kaç kez göründüğü + o hafta içinde kaçıncı görünümü
    const courseOccurrenceCount = new Map<string, Map<string, number>>() // courseId -> date -> occurrenceCount
    
    // Önce bu haftadan önceki tüm dersleri say (her gün için bir kez)
    const previousLessonsByCourse = await prisma.dailyLesson.groupBy({
      by: ['courseId', 'specificDate'],
      where: {
        termId,
        specificDate: {
          gte: firstMonday,
          lt: weekStartDate,
        },
        isCancelled: false,
        courseId: { not: null },
      },
    })
    
    // Her ders için önceki haftalardaki toplam görünüm sayısını hesapla
    const previousCountByCourse = new Map<string, number>()
    for (const lesson of previousLessonsByCourse) {
      if (lesson.courseId) {
        previousCountByCourse.set(lesson.courseId, (previousCountByCourse.get(lesson.courseId) || 0) + 1)
      }
    }
    
    // Bu hafta içindeki dersleri tarihe göre sırala ve sayaç numarasını hesapla
    const weeklyLessonsByCourse = new Map<string, Array<{ date: string, lesson: any }>>()
    for (const lesson of weeklyLessons) {
      if (lesson.courseId) {
        const lessonDate = new Date(lesson.specificDate || lesson.createdAt).toISOString().split('T')[0]
        if (!weeklyLessonsByCourse.has(lesson.courseId)) {
          weeklyLessonsByCourse.set(lesson.courseId, [])
        }
        weeklyLessonsByCourse.get(lesson.courseId)!.push({ date: lessonDate, lesson })
      }
    }
    
    // Her ders için o hafta içindeki görünüm sırasını hesapla
    for (const [courseId, lessons] of weeklyLessonsByCourse.entries()) {
      // Tarihe göre sırala
      lessons.sort((a, b) => a.date.localeCompare(b.date))
      
      // Her gün için sayaç numarasını hesapla
      const dateToCount = new Map<string, number>()
      let currentCount = previousCountByCourse.get(courseId) || 0
      
      for (const { date } of lessons) {
        if (!dateToCount.has(date)) {
          currentCount++
          dateToCount.set(date, currentCount)
        }
      }
      
      courseOccurrenceCount.set(courseId, dateToCount)
    }

    // Hafta günlerini oluştur (Pazartesi-Pazar)
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate)
      date.setDate(weekStartDate.getDate() + i)
      weekDays.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][date.getDay()],
        dayName: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][date.getDay()],
      })
    }

    // Dersleri günlere göre grupla
    // Haftalık program görünümü için: Bir günde bir ders sadece bir kez gösterilir (hangi saatte olduğu önemli değil)
    const lessonsByDay = weekDays.map((day) => {
      const dayLessons = weeklyLessons.filter((lesson) => {
        const lessonDate = new Date(lesson.specificDate || lesson.createdAt)
        return lessonDate.toISOString().split('T')[0] === day.date
      })

      // Bir günde aynı ders sadece bir kez gösterilir (haftalık program genel görünüm)
      const uniqueCoursesByDay = new Map<string, typeof dayLessons[0]>()
      
      for (const lesson of dayLessons) {
        const courseId = lesson.courseId || 'unknown'
        // Aynı ders için sadece bir kayıt tut (ilk bulunan)
        if (!uniqueCoursesByDay.has(courseId)) {
          uniqueCoursesByDay.set(courseId, lesson)
        }
      }

      // 7 ders saati için boş array oluştur
      // Haftalık program görünümünde her saat için aynı ders gösterilir (genel görünüm)
      const uniqueLessonsArray = Array.from(uniqueCoursesByDay.values())
      
      const slots = Array.from({ length: 7 }, (_, index) => {
        const slotNumber = index + 1
        
        // Bu saat için dersleri bul (specialEvent'ler dahil)
        const slotLessons = dayLessons.filter((l) => l.timeSlot?.slotNumber === slotNumber)
        
        if (slotLessons.length === 0) {
          return null
        }
        
        // SpecialEvent varsa öncelik ver (İntibak Eğitimi için)
        const specialEventLesson = slotLessons.find(l => l.isSpecialEvent && l.specialEvent)
        if (specialEventLesson) {
          return {
            ...specialEventLesson,
            course: specialEventLesson.specialEvent ? {
              id: null,
              name: specialEventLesson.specialEvent.eventTitle,
              code: null,
              requiresLab: false,
              totalPlannedHours: 0,
              occurrenceCount: 0,
            } : null,
          }
        }
        
        // Aynı saatte aynı ders varsa, sadece birini al (ilkini)
        // Haftalık program görünümü için sınıf bazlı değil, ders bazlı gösterim
        const uniqueLessons = new Map<string, typeof slotLessons[0]>()
        
        for (const lesson of slotLessons) {
          const courseId = lesson.courseId || 'unknown'
          // Aynı ders için sadece bir kayıt tut (ilk bulunan)
          if (!uniqueLessons.has(courseId)) {
            uniqueLessons.set(courseId, lesson)
          }
        }
        
        // Eğer aynı saatte birden fazla farklı ders varsa, ilkini al
        // (Normalde aynı saatte sadece bir ders olmalı)
        const lesson = Array.from(uniqueLessons.values())[0] || null
        if (lesson && lesson.courseId) {
          // Ders bilgisine toplam saat ve sayaç ekle
          const totalHours = coursePlannedHoursMap.get(lesson.courseId) || 0
          const lessonDate = new Date(lesson.specificDate || lesson.createdAt).toISOString().split('T')[0]
          const dateToCount = courseOccurrenceCount.get(lesson.courseId)
          const occurrenceCount = dateToCount?.get(lessonDate) || 0
          return {
            ...lesson,
            course: {
              ...lesson.course,
              totalPlannedHours: totalHours,
              occurrenceCount: occurrenceCount,
            },
          }
        }
        return lesson
      })

      return {
        ...day,
        slots,
      }
    })

    return NextResponse.json({
      termId,
      weekNumber,
      weekStartDate: weekStartDate.toISOString(),
      weekEndDate: weekEndDate.toISOString(),
      weekDays: lessonsByDay,
      totalLessons: weeklyLessons.length,
      totalWeeks: Math.max(1, totalWeeks), // Navigasyon için toplam hafta sayısı
    })
  } catch (error) {
    console.error('Get weekly schedule error:', error)
    return NextResponse.json(
      { error: 'Haftalık program getirilemedi' },
      { status: 500 }
    )
  }
}

// POST: Haftalık program oluştur (otomatik algoritma)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const termId = params.id
    const body = await request.json()
    const { weekNumber, classId, generateAll } = body

    if (!termId) {
      return NextResponse.json({ error: 'Term ID gerekli' }, { status: 400 })
    }

    // generateAll: true ise tüm haftalar için program oluştur
    if (generateAll) {
      return await generateAllWeeks(termId)
    }

    // Tek hafta için program oluştur
    if (!weekNumber || weekNumber < 1) {
      return NextResponse.json({ error: 'Geçerli hafta numarası gerekli veya generateAll: true gönderin' }, { status: 400 })
    }

    // Dönem bilgilerini al
    const term = await prisma.term.findUnique({
      where: { id: termId },
      include: {
        settings: true,
        classes: {
          where: { isDeleted: false },
        },
      },
    })

    if (!term) {
      return NextResponse.json({ error: 'Dönem bulunamadı' }, { status: 404 })
    }

    if (!term.settings) {
      return NextResponse.json({ error: 'Dönem ayarları bulunamadı' }, { status: 404 })
    }

    // Hafta tarihlerini hesapla
    const startDate = new Date(term.startDate)
    const startDayOfWeek = startDate.getDay()
    const daysToMonday = startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek
    const firstMonday = new Date(startDate)
    firstMonday.setDate(startDate.getDate() + daysToMonday)
    firstMonday.setHours(0, 0, 0, 0)

    const weekStartDate = new Date(firstMonday)
    weekStartDate.setDate(firstMonday.getDate() + (weekNumber - 1) * 7)

    const weekEndDate = new Date(weekStartDate)
    weekEndDate.setDate(weekStartDate.getDate() + 6)
    weekEndDate.setHours(23, 59, 59, 999)

    // Bu hafta için mevcut dersleri sil (yenileme için)
    await prisma.dailyLesson.deleteMany({
      where: {
        termId,
        specificDate: {
          gte: weekStartDate,
          lte: weekEndDate,
        },
      },
    })

    // Tek hafta için program oluştur
    const result = await generateWeekProgram(termId, weekNumber, weekStartDate, weekEndDate, term)

    if (result.createdLessons === 0) {
      const coursesWithoutInstructors = await prisma.monthlyCoursePlan.count({
        where: {
          termCoursePlan: {
            termId,
          },
          plannedHours: {
            gt: 0,
          },
        },
      })

      return NextResponse.json({
        message: 'Haftalık program oluşturuldu ancak hiç ders oluşturulamadı',
        weekNumber,
        weekStartDate: weekStartDate.toISOString(),
        weekEndDate: weekEndDate.toISOString(),
        createdLessons: 0,
        warning: `Derslere eğitmen atanmamış. ${coursesWithoutInstructors} ders için eğitmen ataması yapılması gerekiyor.`,
      })
    }

    return NextResponse.json({
      message: 'Haftalık program oluşturuldu',
      weekNumber,
      weekStartDate: weekStartDate.toISOString(),
      weekEndDate: weekEndDate.toISOString(),
      createdLessons: result.createdLessons,
    })
  } catch (error) {
    console.error('Create weekly schedule error:', error)
    return NextResponse.json(
      { error: 'Haftalık program oluşturulamadı', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}

// DELETE: Tüm haftalar için haftalık programı sil (yenileme için)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const termId = Array.isArray(params.id) ? params.id[0] : params.id

    if (!termId) {
      return NextResponse.json({ error: 'Term ID gerekli' }, { status: 400 })
    }

    // Dönem bilgilerini al
    const term = await prisma.term.findUnique({
      where: { id: termId },
    })

    if (!term) {
      return NextResponse.json({ error: 'Dönem bulunamadı' }, { status: 404 })
    }

    // Dönem süresi boyunca tüm dersleri sil
    const deleted = await prisma.dailyLesson.deleteMany({
      where: {
        termId,
        specificDate: {
          gte: term.startDate,
          lte: term.endDate,
        },
      },
    })

    return NextResponse.json({
      message: 'Tüm haftalar için program silindi',
      deletedCount: deleted.count,
    })
  } catch (error) {
    console.error('Delete weekly schedule error:', error)
    return NextResponse.json(
      { error: 'Haftalık program silinemedi', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}

