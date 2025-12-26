// TALİMATLAR dersine alt dersler ekle

async function addSubLessons() {
  // Önce TALİMATLAR dersini bul
  const response = await fetch('http://localhost:3000/api/courses');
  const data = await response.json();
  const talimatlar = data.courses.find(c => c.code === 'TAL101');
  
  if (!talimatlar) {
    console.log('❌ TALİMATLAR dersi bulunamadı!');
    return;
  }
  
  console.log(`✓ TALİMATLAR dersi bulundu: ${talimatlar.id}\n`);
  console.log('🔥 Alt dersler ekleniyor...\n');
  
  const subCourses = [
    {
      name: "Yangınları Önlemede İtfaiye Raporları Talimatı",
      code: "TAL101A",
      fourMonthHours: 3,
      sixMonthHours: 4,
      weightPercentage: 33.33,
      description: "İtfaiye rapor yazma talimatları"
    },
    {
      name: "Emareler",
      code: "TAL101B",
      fourMonthHours: 1,
      sixMonthHours: 2,
      weightPercentage: 11.11,
      description: "Emniyet ve işaret sistemleri"
    },
    {
      name: "Kayıp ve Buluntu Eşyalar",
      code: "TAL101C",
      fourMonthHours: 1,
      sixMonthHours: 2,
      weightPercentage: 11.11,
      description: "Kayıp eşya talimatı"
    },
    {
      name: "Polis Kimlik Kartları",
      code: "TAL101D",
      fourMonthHours: 1,
      sixMonthHours: 2,
      weightPercentage: 11.11,
      description: "Kimlik kartları düzenleme ve kullanım talimatı"
    },
    {
      name: "Olay Yeri",
      code: "TAL101E",
      fourMonthHours: 2,
      sixMonthHours: 3,
      weightPercentage: 22.22,
      description: "Olay yeri inceleme ve yönetim talimatı"
    },
    {
      name: "Polis Mensuplarının Kılık Kıyafet Tüzüğü",
      code: "TAL101F",
      fourMonthHours: 1,
      sixMonthHours: 2,
      weightPercentage: 11.11,
      description: "Kılık kıyafet kuralları ve tüzüğü"
    }
  ];
  
  let success = 0;
  let failed = 0;
  
  for (const subCourse of subCourses) {
    try {
      const res = await fetch(`http://localhost:3000/api/courses/${talimatlar.id}/sub-courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subCourse)
      });
      
      const result = await res.json();
      
      if (res.ok) {
        console.log(`✅ ${subCourse.code} - ${subCourse.name} (%${subCourse.weightPercentage})`);
        success++;
      } else {
        console.log(`❌ ${subCourse.code} - HATA: ${result.error}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${subCourse.code} - Bağlantı hatası`);
      failed++;
    }
  }
  
  console.log(`\n📊 ÖZET:`);
  console.log(`✅ Alt Ders Eklendi: ${success}`);
  console.log(`❌ Başarısız: ${failed}`);
  console.log(`📚 Toplam: ${subCourses.length}`);
  console.log(`\n✓ TALİMATLAR ana dersi şimdi ${success} alt derse sahip!`);
}

addSubLessons();

