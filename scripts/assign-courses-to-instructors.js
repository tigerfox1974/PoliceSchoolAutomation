// Eğitmen - Ders Atamaları (Görseldeki verilerle)

const assignments = [
  // HUKUK DERSLERİ
  { instructor: 'KAYABAŞI', course: 'CZH101', role: 'MAIN' }, // Osman KAYABAŞI → Ceza Hukuku
  { instructor: 'TÜRK', course: 'CMK101', role: 'MAIN' }, // İrfan TÜRK → Ceza Muhakemeleri
  { instructor: 'GÜMÜŞOK', course: 'POL101', role: 'MAIN' }, // Yeşim GÜMÜŞOK → Polisliğe Giriş
  { instructor: 'İNECİ', course: 'POL201', role: 'MAIN' }, // Feyvaz İNECİ → Polis Yetkisi
  { instructor: 'TULUHAN', course: 'HUK101', role: 'MAIN' }, // Ahmet TULUHAN → Hukuk Giriş
  
  // MESLEK DERSLERİ
  { instructor: 'SOYER', course: 'TRF101', role: 'MAIN' }, // Ahmet SOYER → Trafik
  { instructor: 'ÜZEN', course: 'IST101', role: 'MAIN' }, // Hasan ÜZEN → İstihbarat
  { instructor: 'İLERİ', course: 'YZS101', role: 'MAIN' }, // Çetin İLERİ → Teknik Yazışma
  { instructor: 'ERDEN', course: 'OYG101', role: 'MAIN' }, // Celal ERDEN → Olay Yeri
  { instructor: 'KIRÇAY', course: 'TOP101', role: 'MAIN' }, // İmur KIRÇAY → Toplumsal Olaylar (Polis)
  
  // UYGULAMALI DERSLER
  { instructor: 'İLERİ', course: 'BDN101', role: 'MAIN' }, // Çetin İLERİ → Beden Eğitimi
  { instructor: 'BAYTUNÇ', course: 'BDP101', role: 'MAIN' }, // Andım BAYTUNÇ → Bilgisayar Polis Uyg (SAID, ESBA, KBS, BHP)
  { instructor: 'MURATLAR', course: 'BLG101', role: 'MAIN' }, // Murat MURATLAR → Bilgisayar (Word-Excel)
  { instructor: 'UYSAL', course: 'EBYS101', role: 'MAIN' }, // Muharrem UYSAL → EBYS
  { instructor: 'HÜSSEİN', course: 'EBYS101', role: 'SUBSTITUTE' }, // Yalçın HÜSSEİN → EBYS (Yardımcı)
  { instructor: 'USLU', course: 'MUD101', role: 'MAIN' }, // Ali USLU → Polis Müdahale
  { instructor: 'AMCAOĞLU', course: 'MUD101', role: 'SUBSTITUTE' }, // Selçuk AMCAOĞLU → Polis Müdahale (Yardımcı)
  { instructor: 'KERVANLI', course: 'MUD101', role: 'SUBSTITUTE' }, // Gürcan KERVANLI → Polis Müdahale (Yardımcı)
  { instructor: 'SARI', course: 'MUD101', role: 'SUBSTITUTE' }, // Ersin SARI → Polis Müdahale (Yardımcı)
  { instructor: 'KAYABAŞI', course: 'UYG101', role: 'MAIN' }, // Osman KAYABAŞI → Polis Uygulamaları (Adli 30 + Trafik 12)
  { instructor: 'TÜRK', course: 'UYG101', role: 'SUBSTITUTE' }, // İrfan TÜRK → Polis Uygulamaları (Yardımcı)
  { instructor: 'KARPUZCU', course: 'UYG101', role: 'SUBSTITUTE' }, // Serdar KARPUZCU → Polis Uygulamaları (Yardımcı)
  { instructor: 'SOYER', course: 'UYG101', role: 'SUBSTITUTE' }, // Ahmet SOYER → Polis Uygulamaları (Yardımcı)
  { instructor: 'ÇAVUŞOĞLU', course: 'SLH101', role: 'MAIN' }, // Aykut ÇAVUŞOĞLU → Silah Bilgisi
  { instructor: 'BOZDEMİR', course: 'SLH101', role: 'SUBSTITUTE' }, // Aysu BOZDEMİR → Silah (Yardımcı)
  { instructor: 'İNCEKALAN', course: 'SLH101', role: 'SUBSTITUTE' }, // Yusuf İNCEKALAN → Silah (Yardımcı)
  { instructor: 'ÇALIŞKAN', course: 'YND101', role: 'MAIN' }, // Bayram ÇALIŞKAN → Yanaşık Düzen
  { instructor: 'KIRÇAY', course: 'YND101', role: 'SUBSTITUTE' }, // İmur KIRÇAY → Yanaşık Düzen (Yardımcı)
  
  // GENEL KÜLTÜR
  { instructor: 'KARAFİSTAN', course: 'ING101', role: 'MAIN' }, // Huriye KARAFİSTAN → İngilizce
  { instructor: 'METİN', course: 'PSI101', role: 'MAIN' }, // Fadil METİN → Sosyal Psikoloji
  { instructor: 'YAĞLI', course: 'ILK101', role: 'MAIN' }, // Safiye YAĞLI → İlk Yardım (Sağlık Bakanlığı - Hemşire)
  
  // İTFAİYE DERSLERİ
  { instructor: 'GÜRPINAR', course: 'YNG101', role: 'MAIN' }, // Ramadan GÜRPINAR → Yangınlar (114 saat)
  { instructor: 'KAYIKÇI', course: 'YNG101', role: 'SUBSTITUTE' },
  { instructor: 'KAZMA', course: 'YNG101', role: 'SUBSTITUTE' },
  { instructor: 'MANAVOĞLU', course: 'YNG101', role: 'SUBSTITUTE' },
  { instructor: 'DAVULCU', course: 'YNG101', role: 'SUBSTITUTE' },
  { instructor: 'ECERSOY', course: 'YNG101', role: 'SUBSTITUTE' },
  { instructor: 'TABAKÇI', course: 'YNG101', role: 'SUBSTITUTE' },
  { instructor: 'GÜRPINAR', course: 'TAL101', role: 'MAIN' }, // Ramadan GÜRPINAR → Talimatlar
  { instructor: 'İLERİ', course: 'TAL101A', role: 'MAIN' }, // Çetin İLERİ → Yangınları Önlemede İtfaiye Raporları
  { instructor: 'GÜMÜŞOK', course: 'TAL101D', role: 'MAIN' }, // Yeşim GÜMÜŞOK → Polis Kimlik Kartları
  { instructor: 'ERDEN', course: 'TAL101E', role: 'MAIN' }, // Celal ERDEN → Olay Yeri
  { instructor: 'GÜMÜŞOK', course: 'TAL101F', role: 'MAIN' }, // Yeşim GÜMÜŞOK → Kılık Kıyafet
  { instructor: 'KIRÇAY', course: 'TOP201', role: 'MAIN' }, // İmur KIRÇAY → Toplumsal Olaylar (Polis Taktikleri)
];

async function assignCourses() {
  console.log('🔗 Eğitmen - Ders atamaları yapılıyor...\n');
  
  // Önce tüm eğitmenleri ve dersleri çek
  const instructorsRes = await fetch('http://localhost:3000/api/instructors');
  const instructorsData = await instructorsRes.json();
  const instructors = instructorsData.instructors || [];
  
  const coursesRes = await fetch('http://localhost:3000/api/courses');
  const coursesData = await coursesRes.json();
  const courses = coursesData.courses || [];
  
  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (const assignment of assignments) {
    // Eğitmeni bul (soyadına göre)
    const instructor = instructors.find(i => i.lastName.toUpperCase().includes(assignment.instructor.toUpperCase()));
    
    if (!instructor) {
      console.log(`⚠️  ${assignment.instructor} - Eğitmen bulunamadı`);
      skipped++;
      continue;
    }
    
    // Dersi bul (koda göre)
    const course = courses.find(c => c.code === assignment.course);
    
    if (!course) {
      console.log(`⚠️  ${assignment.course} - Ders bulunamadı`);
      skipped++;
      continue;
    }
    
    try {
      // CourseInstructor kaydı oluştur
      const res = await fetch(`http://localhost:3000/api/courses/${course.id}/instructors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructorId: instructor.id })
      });
      
      if (res.ok) {
        console.log(`✅ ${instructor.rank} ${instructor.firstName} ${instructor.lastName} → ${course.name} (${assignment.role})`);
        success++;
      } else {
        const error = await res.json();
        // Zaten atanmış ise skip
        if (error.error && error.error.includes('zaten')) {
          console.log(`⚠️  ${instructor.lastName} → ${course.code} (zaten atanmış)`);
          skipped++;
        } else {
          console.log(`❌ ${instructor.lastName} → ${course.code} - ${error.error}`);
          failed++;
        }
      }
    } catch (error) {
      console.log(`❌ Atama hatası`);
      failed++;
    }
  }

  console.log(`\n📊 ÖZET:`);
  console.log(`✅ Başarılı: ${success}`);
  console.log(`❌ Başarısız: ${failed}`);
  console.log(`⚠️  Atlandı: ${skipped}`);
  console.log(`📚 Toplam Atama: ${assignments.length}`);
  console.log(`\n⚠️  NOT: CourseInstructor API endpoint'i oluşturulmalı!`);
}

assignCourses();

