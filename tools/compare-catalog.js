// Gerçek 4 Aylık Polis Müfredatı vs Mevcut Katalog Karşılaştırma

const REAL_CATALOG = {
  'HUKUK DERSLERİ': {
    'Ceza Hukuku ve Uygulamaları': 40,
    'Ceza Muhakemeleri Usul Yasası ve Uygulamaları': 40,
    'Polisliğe Giriş': 24,
    'Polise Yetki, Görev Veren Yasa ve Uygulamalar': 46,
    'Hukuka Giriş ve İnsan Hakları': 12, // Tek Sınav 1. Dön
  },
  'MESLEK DERSLERİ': {
    'Mesleki Trafik Eğitimi ve Güvenliği': 28,
    'Devlet Güvenliği ve İstihbarat': 8, // Tek Sınav 2 Dön
    'Mesleki Teknik Yazışma Usul ve Esasları': 12, // Tek Sınav 1 Dön
    'Olay Yeri Güvenliği': 8, // Tek Sınav 2 Dön
    'Toplumsal Olaylar ve Önleyici Hizmetler Uygulamaları': 20,
  },
  'UYGULAMALI DERSLER': {
    'Beden Eğitimi': 16,
    'Bilgisayar Destekli Polis Uygulamaları': 12, // Tek Sınav 2 Dön
    // Alt dersler: SAID(4), ESBA(3), KBS(3), BHP(2)
    'Temel Seviye Bilgisayar Kullanımı (Word-Excel)': 14, // Tek Sınav 1 Dön
    'Elektronik Belge Yönetim Sistemi(EBYS)': 8, // Tek Sınav 2 Dön
    'Polis Müdahale Yöntem ve Teknikleri': 20,
    'Polis Uygulamaları': 42, // Tek Sınav 2 Dön
    // Alt dersler: Adli(30), Trafik(12)
    'Silah Bilgisi ve Atış': 30,
    'Yanaşık Düzen': 15,
  },
  'GENEL KÜLTÜR DERSLERİ': {
    'İngilizce': 30,
    'Sosyal Psikoloji': 10, // Tek Sınav 1 Dön
    'Sağlık Bilgisi ve İlk Yardım': 35, // Tek Sınav 2 Dön
  },
  'KONFERANSLAR': {
    'Yangın ve Tabi Afetler': 2,
    'Uyuşturucu Maddeler ve Zararları': 2,
    'Polis - Halkla İlişkiler': 2,
    'Kriminalistik Konuları': 6,
    'Güvenlik Kuvvetleri Komutanlığı Tanıtımı ve Bilgilendirme Konferansı': 2,
    'Tarih': 2,
    'Beden Dili ve Kriz Anlarında İletişim ve Duygu Kontrolü': 2,
  },
  'DİĞER FAALİYETLER': {
    'İntibak Eğitimi': 35,
    'Sınavlar (11 Yoklama Dahil)': 71,
    'Sosyal ve Sportif Faaliyetler': 20,
    'Resmi Tatil': 51,
    'Tören Hazırlığı ve Tören': 28,
    'Müdüriyet Saati': 13,
  }
}

// Toplam hesapla
let total = 0
let groupTotals = {}

Object.entries(REAL_CATALOG).forEach(([group, courses]) => {
  const groupTotal = Object.values(courses).reduce((sum, hours) => sum + hours, 0)
  groupTotals[group] = groupTotal
  total += groupTotal
})

console.log('📊 GERÇEK MÜFREDAT TOPLAMI')
console.log('='.repeat(60))
Object.entries(groupTotals).forEach(([group, total]) => {
  console.log(`${group}: ${total} saat`)
})
console.log('='.repeat(60))
console.log(`GENEL TOPLAM: ${total} saat`)
console.log('')

// Detaylı liste
console.log('📚 DETAYLI DERS LİSTESİ')
console.log('='.repeat(60))
Object.entries(REAL_CATALOG).forEach(([group, courses]) => {
  console.log(`\n${group.toUpperCase()} (${groupTotals[group]} saat):`)
  Object.entries(courses).forEach(([course, hours]) => {
    console.log(`  • ${course}: ${hours} saat`)
  })
})

console.log('\n\n📝 ÖNEMLİ NOTLAR:')
console.log('='.repeat(60))
console.log('1. "Diğer Faaliyetler" (240 saat) normal ders DEĞİL:')
console.log('   → Bunlar haftalık programda "özel etkinlik" olarak girilmeli')
console.log('   → Müdüriyet Saati, Sosyal Faaliyetler boş slotları doldurur')
console.log('')
console.log('2. Alt dersler var:')
console.log('   → Bilgisayar Destekli Polis (12 saat): SAID, ESBA, KBS, BHP')
console.log('   → Polis Uygulamaları (42 saat): Adli(30), Trafik(12)')
console.log('')
console.log('3. Sınav dönemleri:')
console.log('   → "Tek Sınav 1. Dön" = İlk 2 ay')
console.log('   → "Tek Sınav 2. Dön" = Son 2 ay')
