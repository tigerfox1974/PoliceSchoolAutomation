---
mode: agent
description: PoliceSchoolAutomation için Faz 1 schedule validator okuma katmanını güvenli şekilde uygula.
---

Bu görevde PoliceSchoolAutomation reposunda **schedule validator dönüşümünün Faz 1** aşamasını uygula.

# Görev Tanımı
Amaç, mevcut weekly schedule sistemini hemen kökten değiştirmek değil; önce **validator okuma katmanını** ekleyerek gerçek sorunları raporlayabilir hale getirmektir.

Bu görevde:
- mevcut generator davranışını mümkün olduğunca koru
- yalnızca validator, derived progress ve debug/raporlama katmanı ekle
- mevcut sistemi bozacak büyük refactor yapma
- Faz 2 generator dönüşümüne veri sağlayacak güvenli altyapıyı hazırla

# Önce Oku
Kod yazmadan önce mutlaka şu dosyaları oku ve dikkate al:
- `.github/copilot-instructions.md`
- `.github/instructions/schedule-planning.instructions.md`
- `.github/validators/schedule-validator-rules.md`
- `SCHEDULE_VALIDATOR_IMPLEMENTATION_PLAN.md`
- `SCHEDULE_PHASE1_CHANGESET.md`
- `src/app/api/terms/[id]/weekly-schedule/route.ts`
- `src/app/api/terms/[id]/weekly-schedule/algorithms/scheduleValidators.ts`
- `src/app/api/terms/[id]/weekly-schedule/algorithms/counterControl.ts`
- `src/app/api/terms/[id]/weekly-schedule/algorithms/specialEvents.ts`
- `src/app/api/terms/[id]/weekly-schedule/algorithms/slotFiller.ts`
- `prisma/schema.prisma`

# Kesin Operasyon Kuralları
Aşağıdaki kuralları esas al:

1. Akademik gün yapısı: **5 sabah dersi + öğle arası + 2 öğleden sonra dersi**.
2. ETÜD akademik validator’a dahil değildir; sadece günlük görünümde hatırlatma amaçlı olabilir.
3. Boş ders saati kabul edilmez. 7 gerçek ders slotunun tamamı dolu olmalıdır.
4. Bir eğitmen aynı anda sadece **tek bir sınıfta** olabilir.
5. Eğitmen gün içinde sınıf sınıf dolaşabilir.
6. Aynı ders aynı gün farklı sınıflarda farklı saatlerde işlenebilir.
7. Aynı sınıfta aynı ders blok (2-3 saat) olabilir.
8. Bilgisayar sınıfı ortak fiziksel kaynaktır; aynı anda yalnızca **bir sınıf** kullanabilir.
9. Bu ortak kaynak çakışması yalnız tek term içinde değil, aynı anda aktif diğer term’ler arasında da dikkate alınmalıdır.
10. Konu takibi yoktur; resmi ilerleme **sınıf bazlı işlenen toplam ders saati** üzerinden izlenmelidir.
11. Üst özet metriklerinde ders bazında **ortalama ilerleme + en geride sınıf uyarısı** gösterilmelidir.
12. Özel etkinlikler term bazında açılıp kapanabilir; hard-coded zorunlu kabul edilmemelidir.
13. Önce özel/sabit etkinlikler yerleşir, sonra dersler yerleşir.
14. Nihai karar sınıf bazlı ilerleme verisidir; aylık genel plan yalnız referans ve uyarı katmanıdır.

# Bu Fazda Ne Yapılacak
Sadece Faz 1’i uygula.

## 1. Yeni Derived Progress Katmanı Ekle
Aşağıdaki yeni dosyaları oluştur:

### `src/lib/schedule/progress/classCourseProgress.ts`
Bu dosyada derived hesaplamalar yap.

Eklenmesi beklenen fonksiyonlar:
- `getClassCourseActualHours(termId: string)`
- `getClassCourseRemainingHours(termId: string)`
- `getClassCourseProgressSummary(termId: string)`
- `getCourseAverageProgress(termId: string)`
- `getMostBehindClasses(termId: string)`

Beklenen mantık:
- `DailyLesson` kayıtlarından hesapla
- sınıf + ders bazında kaç saat işlendiğini çıkar
- blok dersler varsa süre kadar say
- kalan saatleri negatif yapma
- üst özet için ortalama ilerleme hesapla
- ayrıca en geride sınıf/sınıfları üret

## 2. Yeni Structural Validator Katmanı Ekle
### `src/lib/schedule/validators/structuralValidator.ts`
Eklenmesi beklenen fonksiyonlar:
- `validateNoLunchBreakLessons(...)`
- `validateNoClassSlotCollisions(...)`
- `validateNoInstructorSlotCollisions(...)`
- `validateNoEmptyAcademicSlots(...)`
- `buildStructuralValidationReport(...)`

Beklenen kontroller:
- öğle arası slotunda ders var mı
- aynı sınıf aynı tarih+slotta iki kayda sahip mi
- aynı eğitmen aynı tarih+slotta iki kayda sahip mi
- her sınıf için her akademik günde 7 gerçek slot dolu mu

Not:
- `TimeSlot.isBreak` alanı varsa bunu kullan
- fakat mevcut varsayılan slot modelinin yanlış olabileceğini unutma; bunu raporla ama bu fazda tüm slot modelini kökten refactor etme

## 3. Yeni Resource Validator Katmanı Ekle
### `src/lib/schedule/validators/resourceValidator.ts`
Eklenmesi beklenen fonksiyonlar:
- `validateComputerLabConflicts(...)`
- `validateCrossTermSharedResourceConflicts(...)`
- `buildResourceValidationReport(...)`

Beklenen kontroller:
- aynı anda birden fazla sınıf bilgisayar sınıfını kullanıyor mu
- farklı aktif term’ler arasında aynı anda bilgisayar sınıfı çakışması var mı

Not:
- bilgisayar sınıfı için şimdilik pratik bir inferred kontrol yapılabilir
- lab gerektiren dersleri aynı slotta sayarak başla
- daha sofistike kaynak modeli Faz 2+ konusu olabilir

## 4. Summary Metrics Katmanı Ekle
### `src/lib/schedule/progress/summaryMetrics.ts`
Eklenmesi beklenen fonksiyon:
- `buildCourseSummaryMetrics(...)`

Bu fonksiyon en az şunları döndürmeli:
- ders adı
- ders bazında ortalama ilerleme yüzdesi
- en geride sınıf/sınıflar
- kalan saat özeti

## 5. Weekly Schedule Route’a Validation Entegrasyonu Yap
Dosya:
- `src/app/api/terms/[id]/weekly-schedule/route.ts`

Yapılacaklar:
1. GET için opsiyonel `includeValidation=true` query param desteği ekle.
2. GET response’una `validation` alanı ekle.
3. POST generate sonucuna `validation` veya `debug.validation` özeti ekle.
4. Bu validation alanında şu bölümler olsun:
   - `structural`
   - `resources`
   - `progress`
5. Eğer validation istenmemişse mevcut response yapısını gereksiz yere bozma.
6. Hata fırlatmak yerine Faz 1’de öncelikle raporla.

Örnek response şekli:
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
          "courseName": "Ceza Yasası",
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

## 6. Mevcut Dosyalarda Minimal Adapter Güncellemeleri Yap
### `src/app/api/terms/[id]/weekly-schedule/algorithms/scheduleValidators.ts`
- mevcut fonksiyonları bozma
- yeni validator katmanına ince adapter/facade gibi bağlanabilir hale getir
- bütün logic’i bu dosyada büyütme

### `src/app/api/terms/[id]/weekly-schedule/algorithms/counterControl.ts`
- mevcut sayaç fonksiyonlarını bozma
- ama sınıf bazlı derived progress’e geçiş için yardımcı/uyumlu yapıyı hazırla
- gerekirse yeni küçük yardımcı fonksiyonlar ekle

### `src/app/api/terms/[id]/weekly-schedule/algorithms/specialEvents.ts`
- hard-coded etkinliklerin otomatik eklenmesini hemen kaldırma
- ama validator/debug tarafında bunların raporlanmasını sağla
- hangi etkinliklerin otomatik geldiğini görünür yap

### `src/app/api/terms/[id]/weekly-schedule/algorithms/slotFiller.ts`
- Faz 1’de generator’ı kökten değiştirme
- ama debug açıklamaları veya rapor için uygun veri üretimini kolaylaştır
- slot seçim mantığını bozma

# Bu Fazda Özellikle Yapılmayacaklar
Aşağıdakileri bu görevde yapma:
- weekly generator’ı baştan yazma
- tüm sınıflara aynı anda aynı ders basma problemini bu fazda kökten çözmeye çalışma
- schema migration yapma
- `prisma/schema.prisma` üzerinde kalıcı yeni model ekleme
- yönetici override UI oluşturma
- özel etkinlik konfigürasyon sistemini tam refactor etme

# Hard Error ve Warning Ayrımı
Bu fazda çoğu şeyi raporla; üretimi hemen durdurma.
Ama raporda kesin olarak ayır:

## Hard Error olarak işaretlenecekler
- boş akademik slot
- öğle arası slotuna ders yazılması
- aynı sınıfın aynı slotta iki kaydı
- aynı eğitmenin aynı slotta iki kaydı
- bilgisayar sınıfının aynı anda iki sınıfa verilmesi
- working day dışında normal ders
- exam week veya resmi tatilde normal ders
- negatif remaining hour

## Warning olarak işaretlenecekler
- aylık plan ile fiili sınıf bazlı ilerleme arasındaki sapma
- bazı derslerin aşırı yoğun haftaya sahip olması
- bazı sınıfların diğerlerinden geri kalması
- yönetici override gerektirebilecek dengesizlikler

# Kod Kalitesi ve Çalışma Kuralları
- minimal diff uygula
- var olan API shape’i gereksiz yere bozma
- açıklayıcı fonksiyon isimleri kullan
- iş kuralı ağır yerlerde yorum ekle
- sessiz hata gizleme yapma
- TODO yerine açık risk notu veya debug raporu üret

# Çıktı Formatı
Görevi tamamlarken şu sırayla ilerle:
1. Okuduğun ilgili dosyaları listele
2. Faz 1 kapsamında oluşturduğun yeni dosyaları listele
3. Değiştirdiğin mevcut dosyaları listele
4. Eklediğin validator rapor alanlarını özetle
5. Bu fazda özellikle bilerek dokunmadığın alanları belirt
6. Faz 2 için hangi ana problemlerin kaldığını yaz

# Tamamlandı Demeden Önce Kontrol Et
- Kod build’i bozuyor mu?
- includeValidation olmadan mevcut GET çalışıyor mu?
- includeValidation=true ile validation objesi dönüyor mu?
- POST generate sonucunda validation/debug özeti dönüyor mu?
- sınıf bazlı progress summary hesaplanabiliyor mu?
- ortalama ilerleme + en geride sınıf uyarısı üretilebiliyor mu?

Bu görevde hedef, sistemi hemen tamamen düzeltmek değil; güvenli Faz 1 validator altyapısını kurmaktır.
