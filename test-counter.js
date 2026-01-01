const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCounters() {
  try {
    const termId = 'cmjpto8ae0000bncc1gqr5kgj';
    
    // 2. hafta tarihleri
    const weekStartDate = new Date('2026-02-08T00:00:00.000Z'); // Pazartesi
    const previousDay = new Date(weekStartDate);
    previousDay.setDate(previousDay.getDate() - 1); // 7 Şubat Pazar
    previousDay.setHours(23, 59, 59, 999);
    
    console.log('=== 2. HAFTA SAYAÇ TESTİ ===');
    console.log('weekStartDate:', weekStartDate.toISOString());
    console.log('previousDay:', previousDay.toISOString());
    
    // Bir ders seç
    const course = await prisma.course.findFirst({
      where: { name: { contains: 'POLİSE YETKİ' } }
    });
    
    if (!course) {
      console.log('Ders bulunamadı');
      return;
    }
    
    console.log('\nDers:', course.name);
    
    // Bu dersin totalPlannedHours değerini al
    const termCoursePlan = await prisma.termCoursePlan.findFirst({
      where: {
        termId,
        courseId: course.id
      }
    });
    
    console.log('totalPlannedHours:', termCoursePlan?.totalPlannedHours);
    
    // previousDay'e kadar kaç ders var?
    const countBefore = await prisma.dailyLesson.count({
      where: {
        termId,
        courseId: course.id,
        specificDate: { lte: previousDay },
        isCancelled: false
      }
    });
    
    console.log('previousDay\'e kadar ders sayısı:', countBefore);
    
    // 2. hafta içinde kaç ders var?
    const weekEndDate = new Date('2026-02-14T23:59:59.999Z');
    const countInWeek = await prisma.dailyLesson.count({
      where: {
        termId,
        courseId: course.id,
        specificDate: {
          gte: weekStartDate,
          lte: weekEndDate
        },
        isCancelled: false
      }
    });
    
    console.log('2. hafta içinde ders sayısı:', countInWeek);
    
    // Toplam kaç ders yazılmış (2. hafta dahil)?
    const totalCount = await prisma.dailyLesson.count({
      where: {
        termId,
        courseId: course.id,
        specificDate: { lte: weekEndDate },
        isCancelled: false
      }
    });
    
    console.log('Toplam ders sayısı (2. hafta dahil):', totalCount);
    
    // Tüm dersleri listele
    const lessons = await prisma.dailyLesson.findMany({
      where: {
        termId,
        courseId: course.id,
        isCancelled: false
      },
      select: {
        specificDate: true,
        timeSlot: {
          select: {
            slotNumber: true
          }
        }
      },
      orderBy: {
        specificDate: 'asc'
      }
    });
    
    console.log('\nTüm dersler:');
    lessons.forEach(lesson => {
      console.log(`  - ${lesson.specificDate.toISOString().split('T')[0]} Slot ${lesson.timeSlot.slotNumber}`);
    });
    
  } catch (error) {
    console.error('Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCounters();
