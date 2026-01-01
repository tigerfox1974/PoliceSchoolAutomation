const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSlots() {
  try {
    // 1. Tüm TimeSlot'ları listele
    const timeSlots = await prisma.timeSlot.findMany({
      orderBy: { slotNumber: 'asc' }
    });
    
    console.log('\n=== TIMESLOT KAYITLARI ===');
    console.log(`Toplam slot sayısı: ${timeSlots.length}\n`);
    timeSlots.forEach(slot => {
      console.log(`Slot ${slot.slotNumber}: ${slot.startTime} - ${slot.endTime}`);
    });
    
    // 2. Çarşamba 10 Şubat 2026'daki ders dağılımı (Slot bazında)
    console.log('\n\n=== ÇARŞAMBA 10 ŞUBAT 2026 - SLOT BAZINDA ===');
    const wednesdayLessons = await prisma.dailyLesson.groupBy({
      by: ['timeSlotId'],
      where: {
        date: new Date('2026-02-10T00:00:00.000Z')
      },
      _count: true
    });
    
    for (const group of wednesdayLessons) {
      const slot = timeSlots.find(s => s.id === group.timeSlotId);
      console.log(`Slot ${slot?.slotNumber}: ${group._count} ders`);
      
      // Bu slottaki dersleri listele
      const lessons = await prisma.dailyLesson.findMany({
        where: {
          date: new Date('2026-02-10T00:00:00.000Z'),
          timeSlotId: group.timeSlotId
        },
        include: {
          course: true,
          specialEvent: true
        }
      });
      
      lessons.forEach((lesson, idx) => {
        if (lesson.course) {
          console.log(`  ${idx + 1}. ${lesson.course.name}`);
        } else if (lesson.specialEvent) {
          console.log(`  ${idx + 1}. ${lesson.specialEvent.eventTitle} (Özel Etkinlik)`);
        }
      });
    }
    
    // 3. Cuma 12 Şubat 2026
    console.log('\n\n=== CUMA 12 ŞUBAT 2026 - SLOT BAZINDA ===');
    const fridayLessons = await prisma.dailyLesson.groupBy({
      by: ['timeSlotId'],
      where: {
        date: new Date('2026-02-12T00:00:00.000Z')
      },
      _count: true
    });
    
    for (const group of fridayLessons) {
      const slot = timeSlots.find(s => s.id === group.timeSlotId);
      console.log(`Slot ${slot?.slotNumber}: ${group._count} ders`);
      
      const lessons = await prisma.dailyLesson.findMany({
        where: {
          date: new Date('2026-02-12T00:00:00.000Z'),
          timeSlotId: group.timeSlotId
        },
        include: {
          course: true,
          specialEvent: true
        }
      });
      
      lessons.forEach((lesson, idx) => {
        if (lesson.course) {
          console.log(`  ${idx + 1}. ${lesson.course.name}`);
        } else if (lesson.specialEvent) {
          console.log(`  ${idx + 1}. ${lesson.specialEvent.eventTitle} (Özel Etkinlik)`);
        }
      });
    }
    
  } catch (error) {
    console.error('Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSlots();
