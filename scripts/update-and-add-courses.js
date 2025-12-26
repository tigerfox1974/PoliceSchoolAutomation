// ORTAK dersleri güncelle ve İTFAİYE derslerini ekle

const COMMON_COURSES = [
  'BDN101', // Beden Eğitimi
  'SLH101', // Silah Bilgisi ve Atış
  'YND101', // Yanaşık Düzen
  'ILK101', // Sağlık Bilgisi ve İlk Yardım
  'BLG101', // Temel Bilgisayar
];

const ITFAIYE_COURSES = [
  {
    name: "Uygulamalı Eğitim (İtfaiye Şubelerinde)",
    code: "ITF301",
    fourMonthHours: 248,
    sixMonthHours: 330,
    requiresLab: false,
    programScope: "ITFAIYE_ONLY",
    description: "İtfaiye şubelerinde pratik uygulama eğitimi"
  },
  {
    name: "Talimatlar",
    code: "TAL101",
    fourMonthHours: 9,
    sixMonthHours: 14,
    requiresLab: false,
    programScope: "ITFAIYE_ONLY",
    description: "İtfaiye talimatları ve prosedürler (Alt derslerle)"
  },
  {
    name: "Yangınlar",
    code: "YNG101",
    fourMonthHours: 114,
    sixMonthHours: 152,
    requiresLab: false,
    programScope: "ITFAIYE_ONLY",
    description: "Yangın teorisi, söndürme teknikleri ve yangın güvenliği"
  },
  {
    name: "Toplumsal Olaylar (Polis Taktikleri)",
    code: "TOP201",
    fourMonthHours: 7,
    sixMonthHours: 10,
    requiresLab: false,
    programScope: "ITFAIYE_ONLY",
    description: "Toplumsal olaylarda itfaiye görevi ve polis iş birliği"
  },
  {
    name: "İntibak Eğitimi",
    code: "INT101",
    fourMonthHours: 35,
    sixMonthHours: 50,
    requiresLab: false,
    programScope: "COMMON",
    description: "Yeni öğrencilerin okula uyum eğitimi"
  },
  {
    name: "Halkla İlişkiler",
    code: "HLK101",
    fourMonthHours: 4,
    sixMonthHours: 6,
    requiresLab: false,
    programScope: "COMMON",
    description: "Toplumla ilişkiler ve iletişim becerileri"
  }
];

async function updateAndAddCourses() {
  console.log('🔄 Ortak dersler güncelleniyor...\n');
  
  for (const courseCode of COMMON_COURSES) {
    try {
      // Önce dersi bul
      const response = await fetch('http://localhost:3000/api/courses');
      const data = await response.json();
      const course = data.courses.find(c => c.code === courseCode);
      
      if (course) {
        // COMMON'a güncelle
        const updateRes = await fetch(`http://localhost:3000/api/courses/${course.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ programScope: 'COMMON' })
        });
        
        if (updateRes.ok) {
          console.log(`✅ ${courseCode} → ORTAK (COMMON)`);
        } else {
          const error = await updateRes.json();
          console.log(`❌ ${courseCode} - HATA: ${error.error}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${courseCode} - Bağlantı hatası`);
    }
  }
  
  console.log('\n🔥 İtfaiye dersleri ekleniyor...\n');
  
  let success = 0;
  let failed = 0;
  
  for (const course of ITFAIYE_COURSES) {
    try {
      const response = await fetch('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`✅ ${course.code} - ${course.name} (${course.fourMonthHours}s)`);
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
  console.log(`✅ İtfaiye Dersi Eklendi: ${success}`);
  console.log(`❌ Başarısız: ${failed}`);
  console.log(`📚 Toplam İtfaiye: ${ITFAIYE_COURSES.length}`);
}

updateAndAddCourses();

