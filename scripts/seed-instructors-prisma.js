const { PrismaClient } = require('@prisma/client')

const instructors = [
  // KADROLU EĞİTMENLER (CADRE)
  { kktcKimlik: '1000000001', firstName: 'Osman', lastName: 'KAYABAŞI', rank: 'Pol.Md.Mv', type: 'CADRE', branch: 'Ceza Hukuku' },
  { kktcKimlik: '1000000002', firstName: 'İrfan', lastName: 'TÜRK', rank: 'Muf', type: 'CADRE', branch: 'Ceza Muhakemeleri' },
  { kktcKimlik: '1000000003', firstName: 'Yeşim', lastName: 'GÜMÜŞOK', rank: 'Muf', type: 'CADRE', branch: 'Polis Yasaları' },
  { kktcKimlik: '1000000004', firstName: 'Feyvaz', lastName: 'İNECİ', rank: 'Muf', type: 'CADRE', branch: 'Polis Yetkisi' },
  { kktcKimlik: '1000000005', firstName: 'Ahmet', lastName: 'TULUHAN', rank: 'Muf', type: 'CADRE', branch: 'Hukuk' },
  { kktcKimlik: '1000000006', firstName: 'Andım', lastName: 'BAYTUNÇ', rank: 'Muf', type: 'CADRE', branch: 'Bilgisayar Uygulamaları' },
  { kktcKimlik: '1000000007', firstName: 'Ahmet', lastName: 'SOYER', rank: 'Muf', type: 'CADRE', branch: 'Trafik' },
  { kktcKimlik: '1000000008', firstName: 'Hasan', lastName: 'ÜZEN', rank: 'B.Muf', type: 'CADRE', branch: 'İstihbarat' },
  { kktcKimlik: '1000000009', firstName: 'Çetin', lastName: 'İLERİ', rank: 'Muf', type: 'CADRE', branch: 'Teknik Yazışma' },
  { kktcKimlik: '1000000010', firstName: 'Celal', lastName: 'ERDEN', rank: 'M/Mv', type: 'CADRE', branch: 'Olay Yeri' },
  { kktcKimlik: '1000000011', firstName: 'İmur', lastName: 'KIRÇAY', rank: 'PÇ', type: 'CADRE', branch: 'Toplumsal Olaylar' },
  { kktcKimlik: '1000000012', firstName: 'Murat', lastName: 'MURATLAR', rank: 'PÇ', type: 'CADRE', branch: 'Bilgisayar' },
  { kktcKimlik: '1000000013', firstName: 'Muharrem', lastName: 'UYSAL', rank: 'PÇ', type: 'CADRE', branch: 'EBYS' },
  { kktcKimlik: '1000000014', firstName: 'Yalçın', lastName: 'HÜSSEİN', rank: 'ŞHG', type: 'CADRE', branch: 'EBYS' },
  { kktcKimlik: '1000000015', firstName: 'Ali', lastName: 'USLU', rank: 'PÇ', type: 'CADRE', branch: 'Polis Müdahale' },
  { kktcKimlik: '1000000016', firstName: 'Selçuk', lastName: 'AMCAOĞLU', rank: 'PÇ', type: 'CADRE', branch: 'Polis Müdahale' },
  { kktcKimlik: '1000000017', firstName: 'Gürcan', lastName: 'KERVANLI', rank: 'PM', type: 'CADRE', branch: 'Polis Müdahale' },
  { kktcKimlik: '1000000018', firstName: 'Ersin', lastName: 'SARI', rank: 'PM', type: 'CADRE', branch: 'Polis Müdahale' },
  { kktcKimlik: '1000000019', firstName: 'Aykut', lastName: 'ÇAVUŞOĞLU', rank: 'PÇ', type: 'CADRE', branch: 'Silah ve Atış' },
  { kktcKimlik: '1000000020', firstName: 'Aysu', lastName: 'BOZDEMİR', rank: 'PM', type: 'CADRE', branch: 'Silah ve Atış' },
  { kktcKimlik: '1000000021', firstName: 'Yusuf', lastName: 'İNCEKALAN', rank: 'PM', type: 'CADRE', branch: 'Silah ve Atış' },
  { kktcKimlik: '1000000022', firstName: 'Bayram', lastName: 'ÇALIŞKAN', rank: 'PÇ', type: 'CADRE', branch: 'Yanaşık Düzen' },
  { kktcKimlik: '1000000023', firstName: 'Serdar', lastName: 'KARPUZCU', rank: 'B/Muf', type: 'CADRE', branch: 'Polis Uygulamaları' },

  // DIŞ KAYNAK EĞİTMENLER (EXTERNAL)
  { kktcKimlik: '2000000001', firstName: 'Huriye A.', lastName: 'KARAFİSTAN', rank: 'ŞHG', type: 'EXTERNAL', institution: 'Polis Genel Müdürlüğü', branch: 'İngilizce' },
  { kktcKimlik: '2000000002', firstName: 'Fadil', lastName: 'METİN', rank: 'PÇ', type: 'EXTERNAL', institution: 'Polis Genel Müdürlüğü', branch: 'Psikoloji' },
  { kktcKimlik: '2000000003', firstName: 'Safiye', lastName: 'YAĞLI', rank: 'Hemşire', type: 'EXTERNAL', institution: 'Sağlık Bakanlığı', branch: 'İlk Yardım' },
  { kktcKimlik: '2000000004', firstName: 'Ramadan', lastName: 'GÜRPINAR', rank: 'İtf.Müd', type: 'EXTERNAL', institution: 'PGM İtfaiye Müdürlüğü', branch: 'Yangın' },
  { kktcKimlik: '2000000005', firstName: 'Yılmaz', lastName: 'HACIOĞULLARI', rank: 'Muf', type: 'EXTERNAL', institution: 'Üniversiteler', branch: 'Halkla İlişkiler' },
  { kktcKimlik: '2000000006', firstName: 'Ahmet', lastName: 'KAHVECİSOY', rank: 'Başmüfettiş', type: 'EXTERNAL', institution: 'Polis Genel Müdürlüğü', branch: 'Tarih' },
  { kktcKimlik: '2000000007', firstName: 'A.', lastName: 'KAYIKÇI', rank: 'İtf.M/Mv', type: 'EXTERNAL', institution: 'PGM İtfaiye Müdürlüğü', branch: 'Yangınlar' },
  { kktcKimlik: '2000000008', firstName: 'Ali', lastName: 'KAZMA', rank: 'İtf.M/Mv', type: 'EXTERNAL', institution: 'PGM İtfaiye Müdürlüğü', branch: 'Yangınlar' },
  { kktcKimlik: '2000000009', firstName: 'Uğur', lastName: 'MANAVOĞLU', rank: 'İtf.M/Mv', type: 'EXTERNAL', institution: 'PGM İtfaiye Müdürlüğü', branch: 'Yangınlar' },
  { kktcKimlik: '2000000010', firstName: 'Umut', lastName: 'DAVULCU', rank: 'İÇ', type: 'EXTERNAL', institution: 'PGM İtfaiye Müdürlüğü', branch: 'Yangınlar' },
  { kktcKimlik: '2000000011', firstName: 'Murat', lastName: 'ECERSOY', rank: 'İÇ', type: 'EXTERNAL', institution: 'PGM İtfaiye Müdürlüğü', branch: 'Yangınlar' },
  { kktcKimlik: '2000000012', firstName: 'Selçuk', lastName: 'TABAKÇI', rank: 'İM', type: 'EXTERNAL', institution: 'PGM İtfaiye Müdürlüğü', branch: 'Yangınlar' },
]

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Eğitmenler ekleniyor (Prisma)...')

  let success = 0
  let skipped = 0

  for (const instructor of instructors) {
    const result = await prisma.instructor.upsert({
      where: { tcKimlikNo: instructor.kktcKimlik },
      create: {
        tcKimlikNo: instructor.kktcKimlik,
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        instructorType: instructor.type,
        rank: instructor.rank || null,
        badgeNumber: instructor.type === 'CADRE' ? `SIC-${instructor.kktcKimlik.slice(-4)}` : null,
        institution: instructor.institution || null,
        branch: instructor.branch || null,
        isActive: true,
      },
      update: {
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        instructorType: instructor.type,
        rank: instructor.rank || null,
        badgeNumber: instructor.type === 'CADRE' ? `SIC-${instructor.kktcKimlik.slice(-4)}` : null,
        institution: instructor.institution || null,
        branch: instructor.branch || null,
        isActive: true,
        isDeleted: false,
        deletedAt: null,
      },
    })

    if (result?.id) {
      if (result.createdAt && result.updatedAt && result.createdAt.getTime() === result.updatedAt.getTime()) {
        success++
      } else {
        skipped++
      }
    }
  }

  console.log(`✅ Eklendi/Güncellendi: ${success}`)
  console.log(`ℹ️ Zaten vardı (güncellendi): ${skipped}`)
  console.log(`👨‍🏫 Toplam: ${instructors.length}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
