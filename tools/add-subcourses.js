const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('📚 Alt Dersler oluşturuluyor...\n')

  // 1. Parent dersleri bul
  const bilgisayarDers = await prisma.course.findFirst({
    where: { code: 'BDP101' },
  })

  const polisUygulamaDers = await prisma.course.findFirst({
    where: { code: 'UYG101' },
  })

  if (!bilgisayarDers) {
    console.error('❌ Bilgisayar Destekli Polis Uygulamaları dersi bulunamadı (BDP101)')
    return
  }

  if (!polisUygulamaDers) {
    console.error('❌ Polis Uygulamaları dersi bulunamadı (UYG101)')
    return
  }

  console.log(`✅ Parent ders bulundu: ${bilgisayarDers.name} (${bilgisayarDers.code})`)
  console.log(`✅ Parent ders bulundu: ${polisUygulamaDers.name} (${polisUygulamaDers.code})\n`)

  // 2. Bilgisayar Destekli Polis Uygulamaları alt dersleri
  const bilgisayarSubCourses = [
    { code: 'BDP-SAID', name: 'SAID', hours: 4, weight: 33.33 },
    { code: 'BDP-ESBA', name: 'ESBA', hours: 3, weight: 25.0 },
    { code: 'BDP-KBS', name: 'KBS', hours: 3, weight: 25.0 },
    { code: 'BDP-BHP', name: 'BHP (Portal)', hours: 2, weight: 16.67 },
  ]

  console.log('📘 Bilgisayar Destekli Polis alt dersleri:')
  for (const sub of bilgisayarSubCourses) {
    const existing = await prisma.course.findUnique({
      where: { code: sub.code },
    })

    if (existing) {
      console.log(`  ⏭️  ${sub.code} zaten mevcut`)
      continue
    }

    await prisma.course.create({
      data: {
        code: sub.code,
        name: sub.name,
        fourMonthHours: sub.hours,
        sixMonthHours: Math.ceil(sub.hours * 1.5),
        requiresLab: true,
        programScope: 'POLIS_ONLY',
        courseType: 'STANDARD',
        parentCourseId: bilgisayarDers.id,
        weightPercentage: sub.weight,
      },
    })
    console.log(`  ✅ ${sub.code} - ${sub.name} (${sub.hours} saat, %${sub.weight})`)
  }

  // 3. Polis Uygulamaları alt dersleri
  const polisUygulamaSubCourses = [
    { code: 'UYG-ADLI', name: 'Adli Polis Uygulamaları', hours: 30, weight: 71.43 },
    { code: 'UYG-TRAFIK', name: 'Trafik Polis Uygulamaları', hours: 12, weight: 28.57 },
  ]

  console.log('\n📗 Polis Uygulamaları alt dersleri:')
  for (const sub of polisUygulamaSubCourses) {
    const existing = await prisma.course.findUnique({
      where: { code: sub.code },
    })

    if (existing) {
      console.log(`  ⏭️  ${sub.code} zaten mevcut`)
      continue
    }

    await prisma.course.create({
      data: {
        code: sub.code,
        name: sub.name,
        fourMonthHours: sub.hours,
        sixMonthHours: Math.ceil(sub.hours * 1.33),
        requiresLab: false,
        programScope: 'POLIS_ONLY',
        courseType: 'STANDARD',
        parentCourseId: polisUygulamaDers.id,
        weightPercentage: sub.weight,
      },
    })
    console.log(`  ✅ ${sub.code} - ${sub.name} (${sub.hours} saat, %${sub.weight})`)
  }

  // 4. Özet
  const totalSubCourses = await prisma.course.count({
    where: {
      parentCourseId: { not: null },
    },
  })

  console.log(`\n📊 ÖZET:`)
  console.log(`🌳 Toplam alt ders sayısı: ${totalSubCourses}`)
  console.log(`✅ FAZ 1C TAMAMLANDI`)
}

main()
  .catch((e) => {
    console.error('Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
