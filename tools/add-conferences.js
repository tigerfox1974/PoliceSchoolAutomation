const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Konferansları ekle
const NEW_CONFERENCES = [
  { name: 'Yangin ve Tabi Afetler', code: 'KNF101', fourMonthHours: 2, sixMonthHours: 3, requiresLab: false, programScope: 'POLIS_ONLY', courseType: 'CONFERENCE' },
  { name: 'Uyusturucu Maddeler ve Zararlari', code: 'KNF102', fourMonthHours: 2, sixMonthHours: 3, requiresLab: false, programScope: 'COMMON', courseType: 'CONFERENCE' },
  { name: 'Polis - Halkla Iliskiler', code: 'KNF103', fourMonthHours: 2, sixMonthHours: 3, requiresLab: false, programScope: 'POLIS_ONLY', courseType: 'CONFERENCE' },
  { name: 'Kriminalistik Konulari', code: 'KNF104', fourMonthHours: 6, sixMonthHours: 8, requiresLab: false, programScope: 'POLIS_ONLY', courseType: 'CONFERENCE' },
  { name: 'Guvenlik Kuvvetleri Komutanligi Tanitimi ve Bilgilendirme Konferansi', code: 'KNF105', fourMonthHours: 2, sixMonthHours: 3, requiresLab: false, programScope: 'POLIS_ONLY', courseType: 'CONFERENCE' },
  { name: 'Tarih', code: 'KNF106', fourMonthHours: 2, sixMonthHours: 3, requiresLab: false, programScope: 'COMMON', courseType: 'CONFERENCE' },
  { name: 'Beden Dili ve Kriz Anlarinda Iletisim ve Duygu Kontrolu', code: 'KNF107', fourMonthHours: 2, sixMonthHours: 3, requiresLab: false, programScope: 'COMMON', courseType: 'CONFERENCE' },
]

async function main() {
  console.log('📚 Konferanslar ekleniyor...\n')

  let added = 0
  let updated = 0
  let skipped = 0

  for (const conf of NEW_CONFERENCES) {
    try {
      const existing = await prisma.course.findUnique({
        where: { code: conf.code },
      })

      if (existing) {
        // Güncelle
        await prisma.course.update({
          where: { code: conf.code },
          data: {
            name: conf.name,
            fourMonthHours: conf.fourMonthHours,
            sixMonthHours: conf.sixMonthHours,
            requiresLab: conf.requiresLab,
            programScope: conf.programScope,
            courseType: conf.courseType,
          },
        })
        console.log(`✏️  ${conf.code} - ${conf.name} (güncellendi)`)
        updated++
      } else {
        // Yeni ekle
        await prisma.course.create({
          data: {
            code: conf.code,
            name: conf.name,
            fourMonthHours: conf.fourMonthHours,
            sixMonthHours: conf.sixMonthHours,
            requiresLab: conf.requiresLab,
            programScope: conf.programScope,
            courseType: conf.courseType,
          },
        })
        console.log(`✅ ${conf.code} - ${conf.name} (eklendi)`)
        added++
      }
    } catch (error) {
      console.error(`❌ ${conf.code} - Hata:`, error.message)
      skipped++
    }
  }

  console.log(`\n📊 ÖZET:`)
  console.log(`✅ Yeni eklenen: ${added}`)
  console.log(`✏️  Güncellenen: ${updated}`)
  console.log(`❌ Hata: ${skipped}`)
  console.log(`📚 Toplam: ${NEW_CONFERENCES.length}`)

  // Toplam konferans sayısını göster
  const totalConferences = await prisma.course.count({
    where: { courseType: 'CONFERENCE' },
  })
  console.log(`\n🎯 DB'de toplam konferans sayısı: ${totalConferences}`)
}

main()
  .catch((e) => {
    console.error('Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
