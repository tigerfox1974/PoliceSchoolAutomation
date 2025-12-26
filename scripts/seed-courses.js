// 66. Dönem Polis Temel Eğitimi - Gerçek Ders Verileri
const courses = [
  // HUKUK DERSLERİ
  { name: "Ceza Hukuku ve Uygulamaları", code: "CZH101", fourMonthHours: 40, sixMonthHours: 55, requiresLab: false, programScope: "POLIS_ONLY" },
  { name: "Ceza Muhakemeleri Usul Yasası ve Uygulamaları", code: "CMK101", fourMonthHours: 40, sixMonthHours: 55, requiresLab: false, programScope: "POLIS_ONLY" },
  { name: "Polisliğe Giriş", code: "POL101", fourMonthHours: 24, sixMonthHours: 32, requiresLab: false, programScope: "POLIS_ONLY" },
  { name: "Polise Yetki, Görev Veren Yasa ve Uygulamalar", code: "POL201", fourMonthHours: 46, sixMonthHours: 60, requiresLab: false, programScope: "POLIS_ONLY" },
  { name: "Hukuka Giriş ve İnsan Hakları", code: "HUK101", fourMonthHours: 12, sixMonthHours: 18, requiresLab: false, programScope: "POLIS_ONLY" },
  
  // MESLEK DERSLERİ
  { name: "Meslek Trafik Eğitimi ve Güvenliği", code: "TRF101", fourMonthHours: 28, sixMonthHours: 40, requiresLab: false, programScope: "POLIS_ONLY" },
  { name: "Devlet Güvenliği ve İstihbarat", code: "IST101", fourMonthHours: 8, sixMonthHours: 12, requiresLab: false, programScope: "POLIS_ONLY" },
  { name: "Meslek Teknik Yazışma Usul ve Esasları", code: "YZS101", fourMonthHours: 12, sixMonthHours: 18, requiresLab: false, programScope: "POLIS_ONLY" },
  { name: "Olay Yeri Güvenliği", code: "OYG101", fourMonthHours: 8, sixMonthHours: 12, requiresLab: false, programScope: "POLIS_ONLY" },
  { name: "Toplumsal Olaylar ve Önleyici Hizmetler Uygulamaları", code: "TOP101", fourMonthHours: 20, sixMonthHours: 28, requiresLab: false, programScope: "POLIS_ONLY" },
  
  // UYGULAMALI DERSLER
  { name: "Beden Eğitimi", code: "BDN101", fourMonthHours: 16, sixMonthHours: 24, requiresLab: false, programScope: "COMMON" },
  { name: "Bilgisayar Destekli Polis Uygulamaları", code: "BDP101", fourMonthHours: 12, sixMonthHours: 18, requiresLab: true, programScope: "POLIS_ONLY", description: "SAID, ESBA, KBS, BHP(Portal)" },
  { name: "Temel Seviye Bilgisayar Kullanımı (Word-Excel)", code: "BLG101", fourMonthHours: 14, sixMonthHours: 20, requiresLab: true, programScope: "COMMON" },
  { name: "Elektronik Belge Yönetim Sistemi (EBYS)", code: "EBYS101", fourMonthHours: 8, sixMonthHours: 12, requiresLab: true, programScope: "POLIS_ONLY" },
  { name: "Polis Müdahale Yöntemi ve Teknikleri", code: "MUD101", fourMonthHours: 20, sixMonthHours: 28, requiresLab: false, programScope: "POLIS_ONLY" },
  { name: "Polis Uygulamaları", code: "UYG101", fourMonthHours: 42, sixMonthHours: 56, requiresLab: false, programScope: "POLIS_ONLY", description: "Adli(30 Saat) + Trafik(12 Saat)" },
  { name: "Silah Bilgisi ve Atış", code: "SLH101", fourMonthHours: 30, sixMonthHours: 40, requiresLab: false, programScope: "POLIS_ONLY" },
  { name: "Yanaşık Düzen", code: "YND101", fourMonthHours: 15, sixMonthHours: 20, requiresLab: false, programScope: "POLIS_ONLY", description: "Askeri taktik düzen eğitimi" },
  
  // GENEL KÜLTÜR DERSLERİ
  { name: "İngilizce", code: "ING101", fourMonthHours: 30, sixMonthHours: 42, requiresLab: false, programScope: "COMMON" },
  { name: "Sosyal Psikoloji", code: "PSI101", fourMonthHours: 10, sixMonthHours: 14, requiresLab: false, programScope: "COMMON" },
  { name: "Sağlık Bilgisi ve İlk Yardım", code: "ILK101", fourMonthHours: 35, sixMonthHours: 48, requiresLab: false, programScope: "COMMON" }
];

async function seedCourses() {
  console.log('🚀 Dersler yükleniyor...\n');
  
  let success = 0;
  let failed = 0;

  for (const course of courses) {
    try {
      const response = await fetch('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`✅ ${course.code} - ${course.name}`);
        success++;
      } else {
        console.log(`❌ ${course.code} - HATA: ${result.error}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${course.code} - Bağlantı hatası`);
      failed++;
    }
  }

  console.log(`\n📊 ÖZET:`);
  console.log(`✅ Başarılı: ${success}`);
  console.log(`❌ Başarısız: ${failed}`);
  console.log(`📚 Toplam: ${courses.length}`);
}

seedCourses();

