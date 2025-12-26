import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed işlemi başlatılıyor...\n');

  // Özel Etkinlikler (YOKLAMA, MÜDİRİYET)
  const specialEvents = await Promise.all([
    // YOKLAMA - Her Cuma 1. ders
    prisma.specialEvent.create({
      data: {
        eventType: 'YOKLAMA',
        eventTitle: 'Haftalık Yoklama',
        description: 'Çevremizi Tanıyalım, Okul Kuralları ve Dilekçe Yazma',
        duration: 1,
        dayOfWeek: 5, // Cuma
        slotIndex: 1,
        requiresInstructor: false,
        allClassesTogether: true,
        countsTowardCurriculum: false,
        managedBy: 'Eğitmen Gözetmenliği',
      },
    }),

    // MÜDİRİYET - Her Cuma 7. ders
    prisma.specialEvent.create({
      data: {
        eventType: 'MANAGEMENT',
        eventTitle: 'Müdüriyet Toplantısı',
        description: 'Haftalık değerlendirme ve duyurular',
        duration: 1,
        dayOfWeek: 5, // Cuma
        slotIndex: 7,
        requiresInstructor: false,
        allClassesTogether: true,
        countsTowardCurriculum: false,
        managedBy: 'Okul Müdürü',
      },
    }),

    // SOSYAL VE SPORTİF FAALİYETLER
    prisma.specialEvent.create({
      data: {
        eventType: 'SOCIAL_SPORTS',
        eventTitle: 'Sosyal ve Sportif Faaliyetler',
        description: 'Öğrencilerin sosyal ve sportif gelişimi',
        duration: 2,
        requiresInstructor: false,
        allClassesTogether: false,
        countsTowardCurriculum: false,
        notes: 'Genellikle 6. ve 7. ders saatlerinde',
      },
    }),
  ]);

  console.log('✅ Özel Etkinlikler oluşturuldu:', specialEvents.length);

  // Dış Konuşmacılar
  const externalSpeakers = await Promise.all([
    prisma.externalSpeaker.create({
      data: {
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        title: 'Prof. Dr.',
        organization: 'İstanbul Üniversitesi',
        department: 'Yangın Mühendisliği',
        email: 'ahmet.yilmaz@istanbul.edu.tr',
        phone: '+90 212 555 1234',
        expertise: ['Yangın Güvenliği', 'Afet Yönetimi', 'İlk Yardım'],
        bio: 'Yangın güvenliği alanında 20 yıllık deneyime sahip akademisyen',
        isActive: true,
      },
    }),

    prisma.externalSpeaker.create({
      data: {
        firstName: 'Mehmet',
        lastName: 'Kaya',
        title: 'Albay',
        organization: 'Güvenlik Kuvvetleri Komutanlığı',
        department: 'Taktik Eğitim',
        phone: '+90 312 555 5678',
        expertise: ['Askeri Taktik', 'Güvenlik', 'Disiplin'],
        bio: 'Güvenlik kuvvetlerinde 25 yıl görev yapmış deneyimli subay',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Dış Konuşmacılar oluşturuldu:', externalSpeakers.length);

  // Konferanslar
  const conferences = await Promise.all([
    prisma.conference.create({
      data: {
        conferenceTitle: 'Yangın ve Tabii Afetler',
        topic: 'Yangın güvenliği önlemleri ve afet durumunda alınacak tedbirler',
        description: 'Yangın söndürme teknikleri, afet yönetimi ve ilk müdahale',
        externalSpeakerId: externalSpeakers[0].id,
        duration: 2,
        startSlot: 6,
        endSlot: 7,
        isAllClasses: true,
        requiresSpecialRoom: true,
        specialRoomType: 'AUDITORIUM',
        requiredEquipment: ['Projeksiyon', 'Ses Sistemi', 'Mikrofon'],
        countsTowardCurriculum: true,
        status: 'PLANNED',
      },
    }),

    prisma.conference.create({
      data: {
        conferenceTitle: 'Güvenlik Kuvvetleri Komutanlığı Tanıtımı',
        topic: 'Güvenlik kuvvetlerinin görevleri, yetkileri ve organizasyon yapısı',
        description: 'Askeri hiyerarşi, disiplin kuralları ve taktik eğitim',
        externalSpeakerId: externalSpeakers[1].id,
        duration: 2,
        startSlot: 6,
        endSlot: 7,
        isAllClasses: true,
        requiresSpecialRoom: true,
        specialRoomType: 'CONFERENCE_HALL',
        status: 'PLANNED',
      },
    }),
  ]);

  console.log('✅ Konferanslar oluşturuldu:', conferences.length);
  console.log('\n🎉 Seed işlemi tamamlandı!');
}

main()
  .catch((e) => {
    console.error('❌ Seed işlemi sırasında hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
