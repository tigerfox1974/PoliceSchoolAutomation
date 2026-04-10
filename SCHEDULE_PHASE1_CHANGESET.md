# Schedule Phase 1 Concrete Changeset

Bu dokuman, PoliceSchoolAutomation projesinde schedule validator donusumunun **Faz 1** asamasinda uygulanacak somut degisiklik listesini tanimlar.

Faz 1'in amaci mevcut davranişi tamamen bozmadan:
- validator okuma katmani eklemek
- kritik hatalari erken yakalamak
- generator refactor'una gecmeden once gercek sorun haritasini cikarmak

---

## Faz 1 Stratejisi

Bu fazda ana prensip:
**Mevcut weekly generator'i hemen kokten degistirme.**
Once salt kontrol ve raporlama ekle.

Bu faz sonunda sistem su sorulara cevap verebilmeli:
- Hangi slotlar bos kaliyor?
- Ogle arasi yanlis kullaniyor mu?
- Ayni egitmen ayni saatte iki yerde mi?
- Ayni sinif ayni saatte iki yerde mi?
- Bilgisayar sinifi ortak kaynak cakismasi var mi?
- Sinif bazli ders saati ilerlemesi ne durumda?
- Genel ozet + en geride sinif uyarisi nasil gorunmeli?

---

## 1. Yeni Eklenecek Yardimci Dosyalar

### 1.1 `src/lib/schedule/validators/structuralValidator.ts`
Amac:
- class-slot cakismasi
- instructor-slot cakismasi
- ogle arasi kullanimi
- bos slot kontrolu

Eklenmesi beklenen fonksiyonlar:
- `validateNoLunchBreakLessons(...)`
- `validateNoClassSlotCollisions(...)`
- `validateNoInstructorSlotCollisions(...)`
- `validateNoEmptyAcademicSlots(...)`
- `buildStructuralValidationReport(...)`

### 1.2 `src/lib/schedule/validators/resourceValidator.ts`
Amac:
- bilgisayar sinifi / ortak kaynak cakismalari
- farkli aktif term'ler arasi ortak kaynak kullanimi

Eklenmesi beklenen fonksiyonlar:
- `validateComputerLabConflicts(...)`
- `validateCrossTermSharedResourceConflicts(...)`
- `buildResourceValidationReport(...)`

### 1.3 `src/lib/schedule/progress/classCourseProgress.ts`
Amac:
- sinif bazli resmi ilerleme hesaplamak
- UI ve raporlama icin derived veri saglamak

Eklenmesi beklenen fonksiyonlar:
- `getClassCourseActualHours(termId)`
- `getClassCourseRemainingHours(termId)`
- `getClassCourseProgressSummary(termId)`
- `getCourseAverageProgress(termId)`
- `getMostBehindClasses(termId)`

### 1.4 `src/lib/schedule/progress/summaryMetrics.ts`
Amac:
- ust ozet metriklerini standart hale getirmek

Eklenmesi beklenen fonksiyonlar:
- `buildCourseSummaryMetrics(...)`

Bu fonksiyon su sonucu vermeli:
- resmi karar: sinif bazli ilerleme
- ust ozet: ortalama ilerleme
- ek uyari: en geride sinif / siniflar

---

## 2. Mevcut Dosyalarda Yapilacak Degisiklikler

### 2.1 `src/app/api/terms/[id]/weekly-schedule/route.ts`
Bu dosyada Faz 1 icin sadece kontrol entegrasyonu yap.

Yapilacaklar:
1. GET response'una opsiyonel validator raporu ekle
2. POST weekly generate sonucuna validator debug ozeti ekle
3. `TimeSlot.isBreak` olan slotlarin akademik slot sayimina dahil edilip edilmedigini raporla
4. Generator bittikten sonra su derived raporlari calistir:
   - structural report
   - resource report
   - class progress summary
5. Simdilik generator davranisini minimum degistir; sadece raporla

Ek alan onerisi:
```ts
{
  validation: {
    structural: {...},
    resources: {...},
    progress: {...}
  }
}
```

### 2.2 `src/app/api/terms/[id]/weekly-schedule/algorithms/scheduleValidators.ts`
Bu dosya buyutulebilir ama Faz 1'de tum mantigi burada toplama.

Yapilacaklar:
- mevcut hafif validator fonksiyonlarini koru
- ama yeni genis validator mantigini `src/lib/schedule/validators/**` altina tasi
- bu dosya artik daha cok adapter/facade gibi calissin

### 2.3 `src/app/api/terms/[id]/weekly-schedule/algorithms/counterControl.ts`
Bu dosya su an ders bazli sayac uretiyor ama sinif bazli resmi gerceklesmeyi vermiyor.

Faz 1 degisikligi:
- mevcut fonksiyonlari bozma
- yeni derived helper'lara gecis icin yorum ve adapter ekle
- yeni fonksiyonlar ekle:
  - `getClassCourseCounters(...)`
  - `getCourseAverageCounters(...)`

Not:
Bu fazda schema degistirmeden `dailyLesson` uzerinden hesap yap.

### 2.4 `src/app/api/terms/[id]/weekly-schedule/algorithms/specialEvents.ts`
Yapilacaklar:
- hardcoded event mantiklari icin validator uyarisi ekle
- su anda aktif olmayan ama otomatik eklenen event'leri raporla
- term bazli konfig ile aktif/pasif olma ihtiyacini TODO degil, acik risk notu olarak isle

Faz 1'de degismez ama raporlamasi gerekir:
- orientation
- management
- social_sports

### 2.5 `src/app/api/terms/[id]/weekly-schedule/algorithms/slotFiller.ts`
Faz 1'de generator mantigini kokten bozma.
Ama su riskler raporlansin:
- ayni ders ayni gunde tekrar kisitinin aktif olup olmadigi
- tum siniflara ayni mantigin uygulanip uygulanmadigi
- sinif-slot yerine ders-slot dusunulup dusunulmedigi

Bu dosyaya yeni rapor ureten debug yardimcilari eklenebilir:
- `explainSlotSelection(...)`
- `explainRejectedCandidates(...)`

---

## 3. Yeni API / Debug Ciktilari

### 3.1 Weekly Schedule GET icin
Opsiyonel query param:
- `includeValidation=true`

Beklenen cikti:
```json
{
  "weekNumber": 3,
  "weekDays": [...],
  "validation": {
    "structural": {
      "emptySlots": 0,
      "lunchBreakViolations": 0,
      "classConflicts": [],
      "instructorConflicts": []
    },
    "resources": {
      "computerLabConflicts": [],
      "crossTermSharedResourceConflicts": []
    },
    "progress": {
      "courseSummaries": [
        {
          "courseId": "...",
          "courseName": "Ceza Yasasi",
          "averageProgressPct": 42,
          "mostBehindClasses": [
            { "classId": "...", "classCode": "D", "remainingHours": 18 }
          ]
        }
      ]
    }
  }
}
```

### 3.2 Weekly Schedule POST icin
Generator sonucu debug bolumune ek alanlar:
- `emptyAcademicSlots`
- `lunchBreakViolations`
- `classSlotConflicts`
- `instructorSlotConflicts`
- `computerLabConflicts`
- `crossTermResourceConflicts`
- `courseAverageProgressSummary`
- `mostBehindClassesSummary`

---

## 4. Faz 1'de Henuz Dokunulmayacaklar

Sunlara bu fazda koklu mudahale yapma:
- weekly generator'in ana secim algoritmasi
- tum siniflara ayni dersi ayni anda basma problemi
- schema migration
- term bazli event config yapisinin tam refactor'u
- yonetici override UI

Bunlar Faz 2+ isidir.

---

## 5. Faz 1 Basari Kriterleri

Faz 1 tamamlandi sayilabilmesi icin sistem su raporlari uretebilmeli:

1. **Bos slot raporu**
   - hangi gun
   - hangi sinif
   - hangi slot

2. **Ogle arasi ihlal raporu**
   - isBreak=true slotta ders var mi

3. **Egitmen cakisma raporu**
   - ayni tarih + slotta ayni instructor birden fazla kayitta mi

4. **Sinif cakisma raporu**
   - ayni sinif ayni tarih + slotta iki kayit var mi

5. **Bilgisayar sinifi cakisma raporu**
   - ayni anda birden fazla sinif lab kullaniyor mu
   - aktif diger term'lerle ortak kaynak cakismasi var mi

6. **Sinif bazli ilerleme raporu**
   - her sinif + ders icin actual ve remaining saat

7. **Ust ozet metrikleri**
   - ders bazinda ortalama ilerleme
   - en geride sinif uyarisi

---

## 6. Faz 1 Icin Copilot Gorev Sirasi

Copilot'a gorev verirken su sirayla calistir:

1. `src/lib/schedule/progress/classCourseProgress.ts` olustur
2. `src/lib/schedule/progress/summaryMetrics.ts` olustur
3. `src/lib/schedule/validators/structuralValidator.ts` olustur
4. `src/lib/schedule/validators/resourceValidator.ts` olustur
5. `route.ts` icine `includeValidation` akisini ekle
6. GET ve POST response'larina validation ozetini bagla
7. Sadece raporlama yaptigini, generator davranisini kokten degistirmedigini kontrol et

---

## 7. Faz 1 Sonrasi Beklenen Karar Noktasi

Bu faz bitince su karar verilecek:
- mevcut generator yama ile kurtarilir mi?
- yoksa Faz 2'de sinif-slot tabanli yeni generator'a gecis sart mi?

Beklenti:
Buyuk olasilikla yeni generator gerekecek.
Ama Faz 1 verisi bunu kanitlayacak.

---

## 8. Ozet

Faz 1 kod degisikliginin amaci yeni schedule sistemini hemen yazmak degil; mevcut sistemin nerede gercek operasyon modelinden saptigini sayisal ve dogrulanabilir sekilde gostermektir.

Bu faz sonunda proje ekibi artik tahminle degil, validator raporlariyla karar verecektir.
