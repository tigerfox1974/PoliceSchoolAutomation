const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteSlot8() {
  try {
    // Önce slot 8'i bul
    const slot8 = await prisma.timeSlot.findFirst({
      where: { slotNumber: 8 }
    });
    
    if (!slot8) {
      console.log('❌ Slot 8 bulunamadı');
      return;
    }
    
    console.log(`✓ Slot 8 bulundu: ${slot8.startTime} - ${slot8.endTime}`);
    
    // Bu slotta kaç ders var?
    const lessonsCount = await prisma.dailyLesson.count({
      where: { timeSlotId: slot8.id }
    });
    
    console.log(`  → Bu slotta ${lessonsCount} ders var`);
    
    if (lessonsCount > 0) {
      console.log('  → Önce bu slottaki dersleri siliyorum...');
      await prisma.dailyLesson.deleteMany({
        where: { timeSlotId: slot8.id }
      });
      console.log('  ✓ Dersler silindi');
    }
    
    // Şimdi slot'u sil
    await prisma.timeSlot.delete({
      where: { id: slot8.id }
    });
    
    console.log('✅ Slot 8 başarıyla silindi!');
    
    // Kalan slotları göster
    const remainingSlots = await prisma.timeSlot.findMany({
      orderBy: { slotNumber: 'asc' }
    });
    
    console.log(`\n✓ Kalan slot sayısı: ${remainingSlots.length}`);
    remainingSlots.forEach(slot => {
      console.log(`  Slot ${slot.slotNumber}: ${slot.startTime} - ${slot.endTime}`);
    });
    
  } catch (error) {
    console.error('Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteSlot8();
