const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Ders kodu oluşturma fonksiyonu
function generateCourseCode(name) {
  // Türkçe karakterleri değiştir
  const turkishMap = {
    'ç': 'C', 'Ç': 'C',
    'ğ': 'G', 'Ğ': 'G',
    'ı': 'I', 'İ': 'I',
    'ö': 'O', 'Ö': 'O',
    'ş': 'S', 'Ş': 'S',
    'ü': 'U', 'Ü': 'U'
  }
  
  let code = name
    .toUpperCase()
    .replace(/[ÇĞİÖŞÜçğıöşü]/g, (char) => turkishMap[char] || char)
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .substring(0, 10)
  
  return code || 'COURSE'
}

async function seedCourses() {
  try {
    console.log('🌱 Dersler veritabanına ekleniyor...\n')

    // ============================================================================
    // 4 AYLIK POLİS TEMEL EĞİTİMİ DERSLERİ
    // ============================================================================
    
    const policeCourses = [
      // HUKUK DERSLERİ
      { name: 'CEZA HUKUKU VE UYGULAMALARI', hours: 40, scope: 'POLIS_ONLY', lab: false },
      { name: 'CEZA MUHAKEMELERİ USUL YASASI VE UYGULAMALARI', hours: 40, scope: 'POLIS_ONLY', lab: false },
      { name: 'POLİSLİĞE GİRİŞ', hours: 24, scope: 'POLIS_ONLY', lab: false },
      { name: 'POLİSE YETKİ, GÖREV VEREN YASA VE UYGULAMALAR', hours: 46, scope: 'POLIS_ONLY', lab: false },
      { name: 'HUKUKA GİRİŞ VE İNSAN HAKLARI', hours: 12, scope: 'POLIS_ONLY', lab: false },
      
      // MESLEK DERSLERİ
      { name: 'MESLEKİ TRAFİK EĞİTİMİ ve GÜVENLİĞİ', hours: 28, scope: 'POLIS_ONLY', lab: false },
      { name: 'DEVLET GÜVENLİĞİ VE İSTİHBARAT', hours: 8, scope: 'POLIS_ONLY', lab: false },
      { name: 'MESLEKİ TEKNİK YAZIŞMA USUL VE ESASLARI', hours: 12, scope: 'POLIS_ONLY', lab: false },
      { name: 'OLAY YERİ GÜVENLİĞİ', hours: 8, scope: 'POLIS_ONLY', lab: false },
      { name: 'TOPLUMSAL OLAYLAR VE ÖNLEYİCİ HİZMETLER UYGULAMALARI', hours: 20, scope: 'POLIS_ONLY', lab: false },
      
      // UYGULAMALI DERSLER
      { name: 'BEDEN EĞİTİMİ', hours: 16, scope: 'POLIS_ONLY', lab: false },
      { name: 'BİLGİSAYAR DESTEKLİ POLİS UYGULAMALARI', hours: 12, scope: 'POLIS_ONLY', lab: true, subCourses: [
        { name: 'SAID', hours: 4 },
        { name: 'ESBA', hours: 3 },
        { name: 'KBS', hours: 3 },
        { name: 'BHP (Portal)', hours: 2 }
      ]},
      { name: 'TEMEL SEVİYE BİLGİSAYAR KULLANIMI (WORD-EXCEL)', hours: 14, scope: 'POLIS_ONLY', lab: true },
      { name: 'ELEKTRONİK BELGE YÖNETİM SİSTEMİ (EBYS)', hours: 8, scope: 'POLIS_ONLY', lab: true },
      { name: 'POLİS MÜDAHALE YÖNTEM VE TEKNİKLERİ', hours: 20, scope: 'POLIS_ONLY', lab: false },
      { name: 'POLİS UYGULAMALARI', hours: 42, scope: 'POLIS_ONLY', lab: false, subCourses: [
        { name: 'Adli', hours: 30 },
        { name: 'Trafik', hours: 12 }
      ]},
      { name: 'SİLAH BİLGİSİ VE ATIŞ', hours: 30, scope: 'POLIS_ONLY', lab: false },
      { name: 'YANAŞIK DÜZEN', hours: 15, scope: 'POLIS_ONLY', lab: false },
      
      // GENEL KÜLTÜR DERSLERİ
      { name: 'İNGİLİZCE', hours: 30, scope: 'COMMON', lab: false },
      { name: 'SOSYAL PSİKOLOJİ', hours: 10, scope: 'POLIS_ONLY', lab: false },
      { name: 'SAĞLIK BİLGİSİ VE İLK YARDIM', hours: 35, scope: 'COMMON', lab: false },
      
      // KONFERANSLAR
      { name: 'YANGIN VE TABİ AFETLER', hours: 2, scope: 'COMMON', lab: false, type: 'CONFERENCE' },
      { name: 'UYUŞTURUCU MADDELER VE ZARARLARI', hours: 2, scope: 'COMMON', lab: false, type: 'CONFERENCE' },
      { name: 'POLİS - HALKLA İLİŞKİLER', hours: 2, scope: 'POLIS_ONLY', lab: false, type: 'CONFERENCE' },
      { name: 'KRİMİNALİSTİK KONULARI', hours: 6, scope: 'POLIS_ONLY', lab: false, type: 'CONFERENCE' },
      { name: 'GÜVENLİK KUVVETLERİ KOMUTANLIĞI TANITIMI ve BİLGİLENDİRME KONFERANSI', hours: 2, scope: 'COMMON', lab: false, type: 'CONFERENCE' },
      { name: 'TARİH', hours: 2, scope: 'COMMON', lab: false, type: 'CONFERENCE' },
      { name: 'BEDEN DİLİ VE KRİZ ANLARINDA İLETİŞİM VE DUYGU KONTROLÜ', hours: 2, scope: 'POLIS_ONLY', lab: false, type: 'CONFERENCE' },
    ]

    // ============================================================================
    // 4 AYLIK İTFAİYE TEMEL EĞİTİMİ DERSLERİ
    // ============================================================================
    
    const fireCourses = [
      // HUKUK DERSLERİ
      { name: 'CEZA HUKUKU', hours: 3, scope: 'ITFAIYE_ONLY', lab: false },
      { name: 'CEZA MUHAKEMELERİ USUL YASASI', hours: 4, scope: 'ITFAIYE_ONLY', lab: false },
      { name: 'POLİS YASASI VE TÜZÜKLERİ (Polisliğe Giriş)', hours: 24, scope: 'ITFAIYE_ONLY', lab: false },
      { name: 'TRAFİK BİLGİSİ', hours: 5, scope: 'ITFAIYE_ONLY', lab: false },
      { name: 'ANAYASA VE İNSAN HAKLARI', hours: 5, scope: 'ITFAIYE_ONLY', lab: false },
      
      // MESLEK DERSLERİ
      { name: 'MESLEKİ TEKNİK YAZIŞMA USUL VE ESASLARI', hours: 12, scope: 'ITFAIYE_ONLY', lab: false },
      { name: 'ELEKTRONİK BELGE YÖNETİM SİSTEMİ (EBYS)', hours: 8, scope: 'ITFAIYE_ONLY', lab: true },
      { name: 'TALİMATLAR', hours: 9, scope: 'ITFAIYE_ONLY', lab: false, subCourses: [
        { name: 'Yangınları Önlemede İtfaiye', hours: 0 },
        { name: 'Raporları Talimatı', hours: 3 },
        { name: 'Emareler', hours: 1 },
        { name: 'Kayıp ve Buluntu Eşyalar', hours: 1 },
        { name: 'Polis Kimlik Kartları', hours: 1 },
        { name: 'Olay Yeri', hours: 2 },
        { name: 'Polis Mensuplarının Kılık Kıyafet Tüzüğü', hours: 1 }
      ]},
      { name: 'YANGINLAR', hours: 114, scope: 'ITFAIYE_ONLY', lab: false },
      { name: 'TOPLUMSAL OLAYLAR (Polis Taktikleri)', hours: 7, scope: 'ITFAIYE_ONLY', lab: false },
      
      // UYGULAMALI DERSLER
      { name: 'BEDEN EĞİTİMİ', hours: 8, scope: 'ITFAIYE_ONLY', lab: false },
      { name: 'TEMEL SEVİYE BİLGİSAYAR VE PORTAL KULLANIMI', hours: 10, scope: 'ITFAIYE_ONLY', lab: true },
      { name: 'SİLAH BİLGİSİ VE ATIŞ', hours: 15, scope: 'ITFAIYE_ONLY', lab: false },
      { name: 'YANAŞIK DÜZEN', hours: 10, scope: 'ITFAIYE_ONLY', lab: false },
      
      // GENEL KÜLTÜR DERSLERİ
      { name: 'HALKLA İLİŞKİLER', hours: 4, scope: 'ITFAIYE_ONLY', lab: false },
      { name: 'SAĞLIK BİLGİSİ VE İLK YARDIM', hours: 35, scope: 'COMMON', lab: false },
      
      // KONFERANSLAR
      { name: 'UYUŞTURUCU MADDELER VE ZARARLARI KONFERANSI', hours: 3, scope: 'COMMON', lab: false, type: 'CONFERENCE' },
      { name: 'TARİH', hours: 3, scope: 'COMMON', lab: false, type: 'CONFERENCE' },
      { name: 'KRİMİNALİSTİK KONULARI', hours: 2, scope: 'COMMON', lab: false, type: 'CONFERENCE' },
      { name: 'GÜVENLİK KUVVETLERİ KOMUTANLIĞI TANITIMI VE BİLGİLENDİRME KONFERANSI', hours: 2, scope: 'COMMON', lab: false, type: 'CONFERENCE' },
    ]

    let createdCount = 0
    let subCourseCount = 0

    // Polis derslerini ekle
    console.log('📚 Polis Temel Eğitimi Dersleri Ekleniyor...')
    for (const course of policeCourses) {
      const code = generateCourseCode(course.name)
      
      const created = await prisma.course.create({
        data: {
          name: course.name,
          code: code,
          fourMonthHours: course.hours,
          sixMonthHours: null,
          programScope: course.scope,
          requiresLab: course.lab,
          courseType: course.type || 'STANDARD',
        }
      })

      createdCount++
      console.log(`  ✓ ${code} - ${course.name} (${course.hours} saat)`)

      // Alt dersler varsa ekle
      if (course.subCourses && course.subCourses.length > 0) {
        for (const subCourse of course.subCourses) {
          const subCode = generateCourseCode(subCourse.name)
          await prisma.course.create({
            data: {
              name: subCourse.name,
              code: `${code}-${subCode}`,
              fourMonthHours: subCourse.hours,
              sixMonthHours: null,
              programScope: course.scope,
              requiresLab: course.lab,
              courseType: course.type || 'STANDARD',
              parentCourseId: created.id,
              weightPercentage: subCourse.hours > 0 ? (subCourse.hours / course.hours) * 100 : 0,
            }
          })
          subCourseCount++
          console.log(`    └─ ${subCode} - ${subCourse.name} (${subCourse.hours} saat)`)
        }
      }
    }

    console.log('\n🔥 İtfaiye Temel Eğitimi Dersleri Ekleniyor...')
    // İtfaiye derslerini ekle
    for (const course of fireCourses) {
      const code = generateCourseCode(course.name)
      
      // Aynı isimde ders varsa koduna -ITF ekle
      const existing = await prisma.course.findFirst({
        where: { code: code, isDeleted: false }
      })
      
      const finalCode = existing ? `${code}-ITF` : code
      
      const created = await prisma.course.create({
        data: {
          name: course.name,
          code: finalCode,
          fourMonthHours: course.hours,
          sixMonthHours: null,
          programScope: course.scope,
          requiresLab: course.lab,
          courseType: course.type || 'STANDARD',
        }
      })

      createdCount++
      console.log(`  ✓ ${finalCode} - ${course.name} (${course.hours} saat)`)

      // Alt dersler varsa ekle
      if (course.subCourses && course.subCourses.length > 0) {
        for (const subCourse of course.subCourses) {
          const subCode = generateCourseCode(subCourse.name)
          await prisma.course.create({
            data: {
              name: subCourse.name,
              code: `${finalCode}-${subCode}`,
              fourMonthHours: subCourse.hours,
              sixMonthHours: null,
              programScope: course.scope,
              requiresLab: course.lab,
              courseType: course.type || 'STANDARD',
              parentCourseId: created.id,
              weightPercentage: subCourse.hours > 0 ? (subCourse.hours / course.hours) * 100 : 0,
            }
          })
          subCourseCount++
          console.log(`    └─ ${subCode} - ${subCourse.name} (${subCourse.hours} saat)`)
        }
      }
    }

    console.log(`\n✅ Toplam ${createdCount} ana ders ve ${subCourseCount} alt ders başarıyla eklendi!`)
    
    // İstatistikler
    const stats = await prisma.course.groupBy({
      by: ['programScope'],
      where: { isDeleted: false },
      _count: true
    })
    
    console.log('\n📊 İstatistikler:')
    stats.forEach(stat => {
      console.log(`  ${stat.programScope}: ${stat._count} ders`)
    })

  } catch (error) {
    console.error('❌ Hata:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedCourses()
  .then(() => {
    console.log('\n🎉 Seed işlemi tamamlandı!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seed işlemi başarısız:', error)
    process.exit(1)
  })

