# HAFTALIK PROGRAM ALGORİTMA ANALİZ RAPORU

> **Tarih:** 2 Ocak 2026  
> **Durum:** Mevcut Algoritma Analizi ve Yeni Algoritma Önerisi

---

## 🔍 MEVCUT ALGORİTMA SORUNLARI

### 1. Counter (Sayaç) Sorunu
**Sorun:**
- Dersin toplam ders saatine ulaşınca durması gerekiyor
- Artık o dersin dağılımı yapılmamalı
- Şu anda sayaç sadece gösterim için kullanılıyor, algoritma kontrolü yok

**Mevcut Durum:**
- `occurrenceCount` sadece GET endpoint'inde hesaplanıyor
- POST (oluşturma) sırasında kontrol edilmiyor
- Ders toplam saatine ulaşsa bile yazılmaya devam ediyor

**Çözüm:**
- Her ders için dönem başından itibaren kaç kez yazıldığını hesapla
- `totalPlannedHours` ile karşılaştır
- Eğer ulaşıldıysa, o dersi atla

---

### 2. Eşit Dağılım Sorunu
**Sorun:**
- Bazı derslerin ders saati çoksa her aya ve haftaya eşit oranda dağıtılmalı
- Bazı derslerin ders saatleri az olabilir (15 saat gibi)
- Eşit oranda dağıtım yapılmalı, 3 haftada bitirilmemeli
- Tüm dersler mevcut, toplam ders saatleri belli

**Mevcut Durum:**
- Algoritma `Math.ceil(monthlyPlan.plannedHours / 4)` ile haftalık saat hesaplıyor
- Bu yanlış! Çünkü:
  - Ayın 4 haftası olmayabilir (5 hafta olabilir)
  - Eşit dağılım yapmıyor
  - Bazı dersler erken bitiyor

**Çözüm:**
- Aylık plan verilerini kullan (kullanıcı zaten planlamış)
- Her ders için o ayın toplam hafta sayısını hesapla
- Haftalık saat = `monthlyPlan.plannedHours / oAyınHaftaSayısı`
- Dönem başından itibaren kaç kez yazıldığını takip et
- Eşit dağılım için: `kalanSaat / kalanHafta` hesapla

---

### 3. Aylık Plan Kullanımı
**Sorun:**
- Haftalık program oluştururken aylık plandaki dağılımı kullanmalı
- Kullanıcı aylık program arayüzünde dersleri hangi ayda kaç saat gösterileceğine kadar planlıyor
- Oradan verileri çekmek daha sağlıklı

**Mevcut Durum:**
- Aylık planlar getiriliyor ama yanlış kullanılıyor
- `Math.ceil(monthlyPlan.plannedHours / 4)` ile haftalık saat hesaplanıyor
- Ayın gerçek hafta sayısı hesaplanmıyor

**Çözüm:**
- Hafta hangi aya ait? (weekStartDate'in ayı)
- O ay için aylık planları getir
- O ayın toplam hafta sayısını hesapla
- Her ders için: `monthlyPlan.plannedHours / oAyınHaftaSayısı` = haftalık saat

---

## 🎯 YENİ ALGORİTMA ÖNERİSİ

### Adım 1: Hafta Bilgilerini Hesapla
```typescript
// Hafta hangi aya ait?
const weekMonth = weekStartDate.getMonth() + 1
const weekYear = weekStartDate.getFullYear()

// O ayın toplam hafta sayısını hesapla
const monthStartDate = new Date(weekYear, weekMonth - 1, 1)
const monthEndDate = new Date(weekYear, weekMonth, 0)
const weeksInMonth = calculateWeeksInMonth(monthStartDate, monthEndDate, term)
```

### Adım 2: Aylık Planları Getir
```typescript
// O ay için aylık planları getir
const monthlyPlans = await prisma.monthlyCoursePlan.findMany({
  where: {
    termCoursePlan: { termId },
    month: weekMonth,
    year: weekYear,
    plannedHours: { gt: 0 },
  },
  include: {
    termCoursePlan: {
      include: {
        course: {
          include: {
            courseInstructors: {
              include: { instructor: true },
            },
          },
        },
      },
    },
  },
})
```

### Adım 3: Her Ders İçin Sayaç Kontrolü
```typescript
// Her ders için dönem başından itibaren kaç kez yazıldığını hesapla
for (const monthlyPlan of monthlyPlans) {
  const course = monthlyPlan.termCoursePlan.course
  const totalPlannedHours = monthlyPlan.termCoursePlan.totalPlannedHours
  
  // Dönem başından itibaren bu ders kaç kez yazılmış?
  const occurrenceCount = await prisma.dailyLesson.count({
    where: {
      termId,
      courseId: course.id,
      specificDate: { lte: weekEndDate },
      isCancelled: false,
    },
  })
  
  // Eğer toplam saatine ulaştıysa, bu dersi atla
  if (occurrenceCount >= totalPlannedHours) {
    continue // Bu ders artık yazılmayacak
  }
  
  // Kalan saat ve hafta sayısını hesapla
  const remainingHours = totalPlannedHours - occurrenceCount
  const remainingWeeks = calculateRemainingWeeks(weekEndDate, term.endDate)
  
  // Eşit dağılım için haftalık saat
  const weeklyHours = Math.max(1, Math.ceil(remainingHours / remainingWeeks))
}
```

### Adım 4: Gün Bazlı Doldurma (Her Gün 7 Ders Saati)
```typescript
// Her gün için:
for (const dayName of workingDays) {
  // 1. Dolu slotları bul (sabit dersler: Müdüriyet, Sosyal/Sportif, Beden Eğitimi)
  // 2. Boş slotları bul
  // 3. Dersleri boş slotlara doldur (sayaç kontrolü ile)
  // 4. Eğer hala boş slot varsa, kalan derslerle doldur
  // 5. Her gün 7 ders saati dolu olmalı
}
```

---

## 📊 ÖRNEK HESAPLAMA

### Senaryo: 15 Saatlik Ders, 18 Haftalık Dönem

**Eski Algoritma (YANLIŞ):**
```
Aylık plan: 15 saat / 4 ay = 3.75 saat/ay
Haftalık: 3.75 / 4 = 0.9375 → Math.ceil = 1 saat/hafta
Sonuç: 18 haftada 18 saat yazılır (15 saatten fazla!)
```

**Yeni Algoritma (DOĞRU):**
```
Toplam: 15 saat
Dönem: 18 hafta
Haftalık: 15 / 18 = 0.83 → Her hafta 1 saat (eşit dağılım)
Kontrol: Her hafta sayaç kontrolü yapılır
Sonuç: 15 haftada 15 saat yazılır, 3 hafta boş kalır (DOĞRU)
```

---

## 🔧 UYGULAMA PLANI

### 1. Sayaç Kontrolü Ekle
- Her ders için dönem başından itibaren kaç kez yazıldığını hesapla
- `totalPlannedHours` ile karşılaştır
- Eğer ulaşıldıysa, o dersi atla

### 2. Eşit Dağılım Hesaplama
- Hafta hangi aya ait? (weekStartDate'in ayı)
- O ayın toplam hafta sayısını hesapla
- Her ders için: `monthlyPlan.plannedHours / oAyınHaftaSayısı` = haftalık saat
- Veya: `kalanSaat / kalanHafta` = haftalık saat (daha akıllı)

### 3. Gün Bazlı Doldurma
- Her gün için 7 slot dolu olmalı
- Sabit dersleri yerleştir
- Boş slotları derslerle doldur
- Sayaç kontrolü ile dersleri filtrele

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Aylık Plan Önceliği:**
   - Kullanıcı aylık programda dersleri hangi ayda kaç saat gösterileceğine kadar planlıyor
   - Haftalık program bu verileri kullanmalı
   - Öğretmen yok, sınıf yok kuralları biliyoruz

2. **Sayaç Kontrolü:**
   - Dersin toplam saatine ulaşınca durmalı
   - Artık o dersin dağılımı yapılmamalı
   - Akıllı bir yapı olmalı

3. **Eşit Dağılım:**
   - Bazı derslerin ders saati çoksa her aya ve haftaya eşit oranda dağıtılmalı
   - Bazı derslerin ders saatleri az olabilir (15 saat gibi)
   - Eşit oranda dağıtım yapılmalı, 3 haftada bitirilmemeli

4. **Gelecek Özellikler:**
   - Sınav haftası nasıl eklenecek
   - Konferanslar nasıl eklenecek
   - Dıştan gelen hocaların dersleri nasıl eklenip planlanacak

---

## ✅ SONUÇ VE ÖNERİLER

### Mevcut Sorunlar:
1. ❌ Counter kontrolü yok (ders toplam saatine ulaşınca durmuyor)
2. ❌ Eşit dağılım yok (bazı dersler erken bitiyor)
3. ❌ Aylık plan verileri yanlış kullanılıyor
4. ❌ Her gün 7 ders saati dolu olmuyor

### Önerilen Çözüm:
1. ✅ Sayaç kontrolü ekle (dönem başından itibaren kaç kez yazıldığını hesapla)
2. ✅ Eşit dağılım hesapla (kalan saat / kalan hafta)
3. ✅ Aylık plan verilerini doğru kullan (o ayın hafta sayısını hesapla)
4. ✅ Gün bazlı doldurma (her gün 7 slot dolu olmalı)

---

**Rapor Hazırlayan:** AI Assistant  
**Tarih:** 2 Ocak 2026  
**Durum:** Onay Bekliyor ⏳

