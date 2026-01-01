// Gerçek Katalog vs Mevcut Seed Karşılaştırması

const REAL_4_MONTH = {
  // Toplam normal dersler: 490 saat
  courses: [
    // HUKUK (182)
    { name: 'Ceza Hukuku ve Uygulamaları', hours: 40, existing: 'Ceza Hukuku ve Uygulamalari' },
    { name: 'Ceza Muhakemeleri Usul Yasası ve Uygulamaları', hours: 40, existing: 'Ceza Muhakemeleri Usul Yasasi ve Uygulamalari' },
    { name: 'Polisliğe Giriş', hours: 24, existing: 'Polislige Giris' },
    { name: 'Polise Yetki, Görev Veren Yasa ve Uygulamalar', hours: 46, existing: 'Polise Yetki, Gorev Veren Yasa ve Uygulamalar' },
    { name: 'Hukuka Giriş ve İnsan Hakları', hours: 12, existing: 'Hukuka Giris ve Insan Haklari' },
    
    // MESLEK (76)
    { name: 'Mesleki Trafik Eğitimi ve Güvenliği', hours: 28, existing: 'Meslek Trafik Egitimi ve Guvenligi' },
    { name: 'Devlet Güvenliği ve İstihbarat', hours: 8, existing: 'Devlet Guvenligi ve Istihbarat' },
    { name: 'Mesleki Teknik Yazışma Usul ve Esasları', hours: 12, existing: 'Meslek Teknik Yazisma Usul ve Esaslari' },
    { name: 'Olay Yeri Güvenliği', hours: 8, existing: 'Olay Yeri Guvenligi' },
    { name: 'Toplumsal Olaylar ve Önleyici Hizmetler Uygulamaları', hours: 20, existing: 'Toplumsal Olaylar ve Onleyici Hizmetler Uygulamalari' },
    
    // UYGULAMALI (157)
    { name: 'Beden Eğitimi', hours: 16, existing: 'Beden Egitimi' },
    { name: 'Bilgisayar Destekli Polis Uygulamaları', hours: 12, existing: 'Bilgisayar Destekli Polis Uygulamalari' },
    { name: 'Temel Seviye Bilgisayar Kullanımı (Word-Excel)', hours: 14, existing: 'Temel Seviye Bilgisayar Kullanimi (Word-Excel)' },
    { name: 'Elektronik Belge Yönetim Sistemi (EBYS)', hours: 8, existing: 'Elektronik Belge Yonetim Sistemi (EBYS)' },
    { name: 'Polis Müdahale Yöntem ve Teknikleri', hours: 20, existing: 'Polis Mudahale Yontemi ve Teknikleri' },
    { name: 'Polis Uygulamaları', hours: 42, existing: 'Polis Uygulamalari' },
    { name: 'Silah Bilgisi ve Atış', hours: 30, existing: 'Silah Bilgisi ve Atis' },
    { name: 'Yanaşık Düzen', hours: 15, existing: 'Yanasik Duzen' },
    
    // GENEL KÜLTÜR (75)
    { name: 'İngilizce', hours: 30, existing: 'Ingilizce' },
    { name: 'Sosyal Psikoloji', hours: 10, existing: 'Sosyal Psikoloji' },
    { name: 'Sağlık Bilgisi ve İlk Yardım', hours: 35, existing: 'Saglik Bilgisi ve Ilk Yardim' },
  ],
  
  // KONFERANSLAR (18 saat) - courseType: 'CONFERENCE'
  conferences: [
    { name: 'Yangın ve Tabi Afetler', hours: 2, missing: true },
    { name: 'Uyuşturucu Maddeler ve Zararları', hours: 2, missing: true },
    { name: 'Polis - Halkla İlişkiler', hours: 2, missing: true },
    { name: 'Kriminalistik Konuları', hours: 6, missing: true },
    { name: 'Güvenlik Kuvvetleri Komutanlığı Tanıtımı ve Bilgilendirme Konferansı', hours: 2, missing: true },
    { name: 'Tarih', hours: 2, missing: true },
    { name: 'Beden Dili ve Kriz Anlarında İletişim ve Duygu Kontrolü', hours: 2, missing: true },
  ],
  
  // DİĞER FAALİYETLER (240 saat) - specialEventType
  activities: [
    { name: 'İntibak Eğitimi', hours: 35, type: 'INTIBAK' },
    { name: 'Sınavlar', hours: 71, type: 'EXAM' },
    { name: 'Sosyal ve Sportif Faaliyetler', hours: 20, type: 'SOCIAL_SPORTS' },
    { name: 'Resmi Tatil', hours: 51, type: 'HOLIDAY' },
    { name: 'Tören Hazırlığı ve Tören', hours: 28, type: 'CEREMONY' },
    { name: 'Müdüriyet Saati', hours: 13, type: 'ADMINISTRATIVE' },
  ]
}

console.log('✅ MEVCUT SEED\'DE DOĞRU OLANLAR:')
console.log('='.repeat(60))
let totalMatch = 0
REAL_4_MONTH.courses.forEach(c => {
  console.log(`✓ ${c.existing}: ${c.hours} saat`)
  totalMatch += c.hours
})
console.log(`\nToplam: ${totalMatch}/490 saat`)

console.log('\n\n❌ EKSİK: KONFERANSLAR (18 saat)')
console.log('='.repeat(60))
REAL_4_MONTH.conferences.forEach(c => {
  console.log(`✗ ${c.name}: ${c.hours} saat`)
})

console.log('\n\n⚠️  EKSİK: DİĞER FAALİYETLER (240 saat)')
console.log('='.repeat(60))
console.log('Bu faaliyetler Course tablosuna DEĞİL,')
console.log('SpecialEvent olarak tanımlanmalı ve haftalık')
console.log('programda otomatik veya manuel yerleştirilmeli:')
REAL_4_MONTH.activities.forEach(a => {
  console.log(`  • ${a.name}: ${a.hours} saat (${a.type})`)
})

console.log('\n\n📊 ÖZET:')
console.log('='.repeat(60))
console.log(`Normal Dersler: ${totalMatch} saat ✅ (Mevcut seed doğru)`)
console.log(`Konferanslar: 18 saat ❌ (Eksik, eklenecek)`)
console.log(`Diğer Faaliyetler: 240 saat ⚠️  (Sistem değişikliği gerekiyor)`)
console.log(`TOPLAM: 728 saat`)

console.log('\n\n🔧 YAPILACAKLAR:')
console.log('='.repeat(60))
console.log('1. ✅ Normal dersler tamam (21 ders)')
console.log('2. ❌ Konferansları ekle (7 konferans)')
console.log('3. ⚠️  Diğer Faaliyetler için:')
console.log('   a) SpecialEventType enum\'a ekle:')
console.log('      - INTIBAK_WEEK')
console.log('      - EXAM_PERIOD')
console.log('      - SOCIAL_SPORTS')
console.log('      - PUBLIC_HOLIDAY')
console.log('      - CEREMONY_PREP')
console.log('      - ADMINISTRATIVE_HOUR')
console.log('   b) Haftalık algoritma boş slot bulunca bunlardan birini atsın')
console.log('   c) "Resmi Tatiller" için ayrı PublicHolidays tablosu')
