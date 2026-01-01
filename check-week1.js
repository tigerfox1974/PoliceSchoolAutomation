const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check1stWeek() {
  try {
    const termId = 'cmjpto8ae0000bncc1gqr5kgj';
    
    // 1. hafta tarihleri
    const week1Start = new Date('2026-02-01T00:00:00.000Z'); // Pazar (Dönem başı)
    const week1End = new Date('2026-02-07T23:59:59.999Z'); // Cumartesi
    
    console.log('=== 1. HAFTA KONTROL (02-07 Şubat) ===\n');
    
    const lessons = await prisma.dailyLesson.findMany({
      where: {
        termId,
        specificDate: {
          gte: week1Start,
          lte: week1End
        }
      },
      include: {
        course: true,
        specialEvent: true,
        timeSlot: true
      },
      orderBy: [
        { specificDate: 'asc' },
        { timeSlot: { slotNumber: 'asc' } }
      ]
    });
    
    console.log(`Toplam ders sayısı: ${lessons.length}\n`);
    
    const byDate = {};
    lessons.forEach(lesson => {
      const date = lesson.specificDate.toISOString().split('T')[0];
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(lesson);
    });
    
    Object.keys(byDate).sort().forEach(date => {
      console.log(`\n${date}:`);
      byDate[date].forEach(lesson => {
        const name = lesson.specialEvent ? lesson.specialEvent.eventTitle : lesson.course?.name || 'UNKNOWN';
        const slot = lesson.timeSlot.slotNumber;
        const type = lesson.isSpecialEvent ? '[ÖZEL]' : '[DERS]';
        console.log(`  Slot ${slot}: ${type} ${name}`);
      });
    });
    
  } catch (error) {
    console.error('Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check1stWeek();
