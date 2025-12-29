# 📋 HAFTALIK PROGRAM MODÜLÜ - ANALİZ RAPORU

> **Tarih:** 30 Aralık 2025  
> **Modül:** FAZ 2.4 - Haftalık Program  
> **Durum:** Analiz ve Tasarım Aşaması

---

## 🎯 GENEL BAKIŞ

Haftalık program modülü, **Aylık Program** verilerinden otomatik olarak haftalık ders çizelgesi oluşturan bir sistemdir. Görsellerden çıkarılan gereksinimler ve önerilen çözüm yaklaşımı bu raporda detaylandırılmıştır.

---

## 📊 GÖRSEL ANALİZİ

### 1. Yapısal Özellikler

#### Tablo Formatı
- **Yatay Eksen:** 7 Ders Sütunu (1. DERS - 7. DERS)
- **Dikey Eksen:** 7 Gün (Pazartesi - Pazar)
- **Sol Sütun:** TARİH (Gün adı + Tarih bilgisi)
- **Başlık:** Hafta numarası (örn: "4. HAFTA", "5. HAFTA")

#### Zaman Aralıkları (TermSettings'den alınacak)
```
1. DERS: 08:15 - 09:00  (45 dakika)
2. DERS: 09:15 - 10:00  (45 dakika)
3. DERS: 10:15 - 11:00  (45 dakika)
4. DERS: 11:15 - 12:00  (45 dakika)
5. DERS: 12:15 - 13:00  (45 dakika)
[Öğle Yemeği: 13:00 - 14:00]
6. DERS: 14:00 - 14:45  (45 dakika)
7. DERS: 15:00 - 15:45  (45 dakika)
```

**Not:** Görsellerde 08:15 başlangıç var, TermSettings'de 08:00 olabilir. Bu ayarlanabilir olmalı.

### 2. İçerik Formatı

#### Normal Ders Hücreleri
- **Format:** `DERS ADI-NUMARA`
- **Örnek:** "CEZA HUKUKU VE POLİS UYGULAMALARI-9"
- **Renk Kodlaması:** Her ders farklı renk (görsel organizasyon için)

#### Özel Girişler
1. **HAFTA SONU TATİLİ** (Cumartesi-Pazar)
   - Tüm 7 ders hücresi birleştirilmiş
   - Beyaz arka plan
   - Tek hücrede gösterilir

2. **RESMİ TATİL**
   - Belirli günler için (örn: 19-22 Mart 2026)
   - Tüm ders saatleri için gösterilir
   - Koyu mavi arka plan

3. **YOKLAMA**
   - Özel etkinlik (genelde Cuma 1. DERS)
   - Kırmızı arka plan
   - Format: "YOKLAMA-NUMARA"

4. **MÜDÜRİYET**
   - Özel etkinlik (genelde Cuma 7. DERS)
   - Koyu mavi arka plan
   - Format: "MÜDÜRİYET-NUMARA"

5. **KONFERANS**
   - Özel etkinlik (blok ders olabilir)
   - Mor arka plan
   - Format: "KONFERANS-NUMARA [Konu]"
   - Örnek: "KONFERANS-9 Uyuşturucu Maddeler ve Zararları"

### 3. Renk Kodlaması (Görsel Organizasyon)

Görsellerden çıkarılan renk kategorileri:
- **Açık Mavi:** Hukuk/Polis Uygulamaları dersleri
- **Sarı:** Teknik/Mesleki dersler
- **Yeşil:** Beden eğitimi, Yanaşık Düzen
- **Mor:** Konferans, İngilizce
- **Turuncu:** Polis Uygulamaları
- **Koyu Mavi:** Sosyal/Sportif Faaliyetler, Müdüriyet
- **Kırmızı:** Yoklama
- **Gri:** Bilgisayar dersleri

**Not:** Renk kodlaması opsiyonel olabilir, ancak görsel organizasyon için faydalı.

---

## 🔄 MEVCUT VERİ YAPISI ANALİZİ

### 1. Mevcut Modeller

#### ✅ TermSettings
- `firstLessonStart`: "08:00" veya "08:15"
- `lessonDuration`: 45 dakika
- `breakDuration`: 15 dakika
- `lunchBreakStart`: "12:45" veya "13:00"
- `lunchBreakDuration`: 60 dakika
- `workingDays`: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY]

#### ✅ MonthlyCoursePlan
- `month`: 1-12
- `year`: 2026
- `plannedHours`: Bu ay için planlanan saat
- `actualHours`: Gerçekleşen saat

#### ✅ TermCoursePlan
- `totalPlannedHours`: Dönem toplam saat
- `course`: Ders bilgisi
- `monthlyPlans`: Aylık planlar

#### ✅ TimeSlot (Mevcut)
- `slotNumber`: 1-7
- `startTime`: "08:15"
- `endTime`: "09:00"
- `dayOfWeek`: MONDAY, TUESDAY, etc.

#### ✅ ScheduleEntry (Mevcut - Haftalık Program İçin)
- `termId`: Dönem
- `classId`: Sınıf
- `courseId`: Ders
- `instructorId`: Eğitmen
- `dayOfWeek`: Haftanın günü
- `timeSlotId`: Ders saati
- `specificDate`: Belirli tarih (opsiyonel)
- `effectiveFrom`: Geçerlilik başlangıç
- `effectiveTo`: Geçerlilik bitiş

#### ✅ DailyLesson (Mevcut - Günlük Program İçin)
- `date`: Tarih
- `scheduleEntryId`: Haftalık plan referansı
- `isCompleted`: Tamamlandı mı?
- `isCancelled`: İptal edildi mi?

#### ✅ PublicHoliday (Mevcut)
- `date`: Tarih
- `name`: Tatil adı
- `isRecurring`: Yıllık tekrarlanan mı?

#### ✅ SpecialEvent (Mevcut)
- `name`: Etkinlik adı (YOKLAMA, MÜDÜRİYET)
- `date`: Tarih
- `timeSlotId`: Hangi ders saati

#### ✅ Conference (Mevcut)
- `title`: Konferans başlığı
- `date`: Tarih
- `timeSlotId`: Hangi ders saati
- `instructorId`: Konuşmacı

---

## 🎯 GEREKSİNİMLER

### 1. Fonksiyonel Gereksinimler

#### FR1: Haftalık Program Oluşturma
- **Girdi:** 
  - Dönem ID
  - Hafta numarası (1-N)
  - Aylık plan verileri
- **Çıktı:** 
  - 7 gün x 7 ders tablosu
  - Her hücrede ders bilgisi veya özel etkinlik

#### FR2: Otomatik Ders Dağıtımı
- Aylık planlanan saatleri haftalık derslere dağıt
- Her ders için haftada kaç saat verileceğini hesapla
- Dersleri hafta içi günlere eşit dağıt

#### FR3: Eğitmen Ataması
- Her ders için uygun eğitmen ataması
- Eğitmen müsaitlik kontrolü
- Eğitmen iş yükü dengesi

#### FR4: Sınıf Bazlı Planlama
- Her sınıf için ayrı haftalık program
- Sınıf bazlı ders saatleri
- Lab gereksinimli dersler için özel planlama

#### FR5: Özel Etkinlikler
- Hafta sonu tatili işaretleme
- Resmi tatil işaretleme
- Yoklama ekleme
- Müdüriyet ekleme
- Konferans ekleme

#### FR6: Çakışma Kontrolü
- Aynı eğitmen aynı saatte iki sınıfta olamaz
- Lab için aynı saatte sadece bir sınıf
- Sınıf bazlı çakışma kontrolü

### 2. Teknik Gereksinimler

#### TR1: Veritabanı
- `ScheduleEntry` modeli kullanılacak (mevcut)
- Her hafta için `ScheduleEntry` kayıtları oluşturulacak
- `specificDate` alanı ile hafta bazlı planlama

#### TR2: API Endpoints
```
GET    /api/terms/{termId}/weekly-schedule/{weekNumber}
POST   /api/terms/{termId}/weekly-schedule/generate
PUT    /api/terms/{termId}/weekly-schedule/{weekNumber}
DELETE /api/terms/{termId}/weekly-schedule/{weekNumber}
GET    /api/terms/{termId}/weekly-schedule/{weekNumber}/export
```

#### TR3: Frontend Sayfası
```
/terms/{termId}/schedule/weekly/{weekNumber}
```

---

## 🧮 ALGORİTMA TASARIMI

### 1. Haftalık Program Oluşturma Algoritması

#### Adım 1: Hafta Bilgilerini Hesapla
```typescript
function calculateWeekInfo(term: Term, weekNumber: number) {
  const startDate = new Date(term.startDate)
  const weekStartDate = addWeeks(startDate, weekNumber - 1)
  const weekEndDate = addDays(weekStartDate, 6)
  
  return {
    weekStartDate,
    weekEndDate,
    weekDays: getWeekDays(weekStartDate) // Pazartesi-Pazar
  }
}
```

#### Adım 2: Aylık Planları Haftalık Saatlere Dönüştür
```typescript
function convertMonthlyToWeekly(monthlyPlan: MonthlyCoursePlan) {
  // Bu ay kaç hafta var?
  const weeksInMonth = getWeeksInMonth(monthlyPlan.month, monthlyPlan.year)
  
  // Haftalık ortalama saat
  const weeklyHours = monthlyPlan.plannedHours / weeksInMonth
  
  // Tam sayıya yuvarla (örn: 2.5 → 2 veya 3)
  const roundedWeeklyHours = Math.round(weeklyHours)
  
  return {
    courseId: monthlyPlan.termCoursePlan.courseId,
    weeklyHours: roundedWeeklyHours,
    remainingHours: monthlyPlan.plannedHours - (roundedWeeklyHours * weeksInMonth)
  }
}
```

#### Adım 3: Dersleri Hafta İçi Günlere Dağıt
```typescript
function distributeLessonsToDays(
  courseId: string,
  weeklyHours: number,
  workingDays: DayOfWeek[]
) {
  // Örnek: 5 saat, 5 çalışma günü → Her güne 1 saat
  const hoursPerDay = Math.floor(weeklyHours / workingDays.length)
  const remainder = weeklyHours % workingDays.length
  
  const distribution = workingDays.map((day, index) => ({
    day,
    hours: hoursPerDay + (index < remainder ? 1 : 0)
  }))
  
  return distribution
}
```

#### Adım 4: Ders Saatlerini Belirle
```typescript
function assignTimeSlots(
  day: DayOfWeek,
  hours: number,
  availableSlots: TimeSlot[]
) {
  // Mevcut dolu slotları kontrol et
  const occupiedSlots = getOccupiedSlots(day)
  
  // Boş slotları bul
  const freeSlots = availableSlots.filter(
    slot => !occupiedSlots.includes(slot.id)
  )
  
  // İhtiyaç kadar slot seç
  return freeSlots.slice(0, hours)
}
```

#### Adım 5: Eğitmen Ataması
```typescript
function assignInstructor(
  courseId: string,
  day: DayOfWeek,
  timeSlot: TimeSlot
) {
  // Bu ders için atanmış eğitmenleri bul
  const courseInstructors = getCourseInstructors(courseId)
  
  // Bu gün ve saatte müsait olanları filtrele
  const availableInstructors = courseInstructors.filter(
    instructor => isInstructorAvailable(instructor.id, day, timeSlot.id)
  )
  
  // İş yüküne göre en az yüklü olanı seç
  return selectInstructorByWorkload(availableInstructors)
}
```

#### Adım 6: ScheduleEntry Oluştur
```typescript
function createScheduleEntry(
  termId: string,
  classId: string,
  courseId: string,
  instructorId: string,
  dayOfWeek: DayOfWeek,
  timeSlotId: string,
  specificDate: Date,
  weekNumber: number
) {
  return prisma.scheduleEntry.create({
    data: {
      termId,
      classId,
      courseId,
      instructorId,
      dayOfWeek,
      timeSlotId,
      specificDate,
      effectiveFrom: getWeekStartDate(weekNumber),
      effectiveTo: getWeekEndDate(weekNumber),
      slotIndex: getSlotIndex(timeSlotId),
      isLabSession: course.requiresLab,
      // ... diğer alanlar
    }
  })
}
```

### 2. Özel Durumlar İşleme

#### Hafta Sonu Tatili
```typescript
function markWeekendHoliday(weekStartDate: Date) {
  const saturday = getSaturday(weekStartDate)
  const sunday = getSunday(weekStartDate)
  
  // ScheduleEntry oluşturma, özel etkinlik olarak işaretle
  createSpecialEvent('HAFTA SONU TATİLİ', saturday, null)
  createSpecialEvent('HAFTA SONU TATİLİ', sunday, null)
}
```

#### Resmi Tatil
```typescript
function checkPublicHolidays(weekStartDate: Date, weekEndDate: Date) {
  const holidays = await prisma.publicHoliday.findMany({
    where: {
      date: {
        gte: weekStartDate,
        lte: weekEndDate
      }
    }
  })
  
  holidays.forEach(holiday => {
    createSpecialEvent('RESMİ TATİL', holiday.date, null)
  })
}
```

#### Özel Etkinlikler
```typescript
function addSpecialEvents(weekStartDate: Date, weekEndDate: Date) {
  // Yoklama (Cuma 1. DERS)
  const friday = getFriday(weekStartDate)
  createSpecialEvent('YOKLAMA', friday, timeSlot1)
  
  // Müdüriyet (Cuma 7. DERS)
  createSpecialEvent('MÜDÜRİYET', friday, timeSlot7)
  
  // Konferanslar
  const conferences = await getConferences(weekStartDate, weekEndDate)
  conferences.forEach(conf => {
    createConferenceEvent(conf)
  })
}
```

### 3. Çakışma Kontrolü

#### Eğitmen Çakışması
```typescript
function checkInstructorConflict(
  instructorId: string,
  day: DayOfWeek,
  timeSlotId: string,
  specificDate: Date
) {
  const existing = await prisma.scheduleEntry.findFirst({
    where: {
      instructorId,
      dayOfWeek: day,
      timeSlotId,
      specificDate,
      isCancelled: false
    }
  })
  
  return existing !== null
}
```

#### Lab Çakışması
```typescript
function checkLabConflict(
  day: DayOfWeek,
  timeSlotId: string,
  specificDate: Date
) {
  const existing = await prisma.scheduleEntry.findFirst({
    where: {
      dayOfWeek: day,
      timeSlotId,
      specificDate,
      isLabSession: true,
      isCancelled: false
    }
  })
  
  return existing !== null
}
```

---

## 🎨 UI/UX TASARIMI

### 1. Sayfa Yapısı

```
/terms/{termId}/schedule/weekly/{weekNumber}
```

#### Header
- Hafta numarası (örn: "4. HAFTA")
- Hafta tarih aralığı (örn: "2-8 Mart 2026")
- Önceki/Sonraki hafta navigasyonu
- Export butonları (PDF, Excel, Word)

#### Ana Tablo
- 7 sütun (1. DERS - 7. DERS)
- 7 satır (Pazartesi - Pazar)
- Her hücre:
  - Ders adı + numara
  - Eğitmen adı (küçük yazı)
  - Sınıf bilgisi (küçük yazı)
  - Renk kodlaması

#### Özel Durumlar
- Hafta sonu: Birleştirilmiş hücre, "HAFTA SONU TATİLİ"
- Resmi tatil: Koyu mavi arka plan, "RESMİ TATİL"
- Yoklama: Kırmızı arka plan
- Müdüriyet: Koyu mavi arka plan
- Konferans: Mor arka plan

### 2. İnteraktif Özellikler

#### Düzenleme
- Hücreye tıklayınca modal açılır
- Ders değiştirme
- Eğitmen değiştirme
- Saat değiştirme
- İptal etme

#### Filtreleme
- Sınıf bazlı filtreleme
- Eğitmen bazlı filtreleme
- Ders bazlı filtreleme

#### Export
- PDF: Tablo formatında
- Excel: Düzenlenebilir format
- Word: Doküman formatı

---

## 📝 VERİTABANI ŞEMASI GÜNCELLEMELERİ

### Mevcut Modeller Yeterli
- ✅ `ScheduleEntry` - Haftalık program kayıtları için
- ✅ `TimeSlot` - Ders saatleri için
- ✅ `PublicHoliday` - Resmi tatiller için
- ✅ `SpecialEvent` - Özel etkinlikler için
- ✅ `Conference` - Konferanslar için

### Opsiyonel Eklemeler

#### WeeklySchedule (Hafta Özeti)
```prisma
model WeeklySchedule {
  id String @id @default(cuid())
  
  termId String
  term Term @relation(fields: [termId], references: [id])
  
  weekNumber Int // 1, 2, 3, ...
  weekStartDate DateTime
  weekEndDate DateTime
  
  isGenerated Boolean @default(false)
  generatedAt DateTime?
  
  scheduleEntries ScheduleEntry[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([termId, weekNumber])
  @@index([termId, weekStartDate])
  @@map("weekly_schedules")
}
```

**Not:** Bu model opsiyonel. `ScheduleEntry` ile de yapılabilir, ancak hafta bazlı sorgular için performans artışı sağlar.

---

## 🚀 İMPLEMENTASYON PLANI

### Faz 1: Temel Algoritma (2-3 gün)
1. Hafta bilgilerini hesaplama
2. Aylık planları haftalık saatlere dönüştürme
3. Dersleri günlere dağıtma
4. ScheduleEntry oluşturma

### Faz 2: Eğitmen Ataması (1-2 gün)
1. Eğitmen müsaitlik kontrolü
2. İş yükü dengesi
3. Çakışma kontrolü

### Faz 3: Özel Durumlar (1 gün)
1. Hafta sonu tatili
2. Resmi tatil kontrolü
3. Özel etkinlikler (Yoklama, Müdüriyet, Konferans)

### Faz 4: UI Geliştirme (2-3 gün)
1. Haftalık program sayfası
2. Tablo görünümü
3. Düzenleme modalları
4. Export fonksiyonları

### Faz 5: Test ve Optimizasyon (1-2 gün)
1. Algoritma testleri
2. Çakışma kontrolü testleri
3. Performans optimizasyonu
4. UI/UX iyileştirmeleri

**Toplam Tahmini Süre:** 7-11 gün

---

## ⚠️ RİSKLER VE ÇÖZÜMLER

### Risk 1: Çakışmalar
**Sorun:** Aynı eğitmen aynı saatte iki sınıfta olabilir.  
**Çözüm:** Çakışma kontrolü algoritması + manuel düzenleme imkanı.

### Risk 2: Lab Çakışması
**Sorun:** Aynı saatte iki sınıf Lab'a gidemez.  
**Çözüm:** Lab mutex kontrolü + alternatif saat önerileri.

### Risk 3: Saat Dağılımı Eşitsizliği
**Sorun:** Bazı günler çok dolu, bazıları boş olabilir.  
**Çözüm:** Dengeleme algoritması + manuel ayarlama.

### Risk 4: Eğitmen Müsaitlik Eksikliği
**Sorun:** Yeterli eğitmen olmayabilir.  
**Çözüm:** Uyarı mesajları + alternatif eğitmen önerileri.

---

## ✅ ÖNERİLER

### 1. Algoritma Yaklaşımı
- **Öneri:** İki aşamalı algoritma
  1. **Planlama Aşaması:** Aylık planlardan haftalık saatleri hesapla
  2. **Atama Aşaması:** Dersleri günlere ve saatlere atayıp eğitmen ata

### 2. Kullanıcı Kontrolü
- **Öneri:** Otomatik oluşturma + manuel düzenleme
  - Sistem otomatik oluşturur
  - Kullanıcı istediği değişiklikleri yapabilir
  - Değişiklikler kaydedilir

### 3. Performans
- **Öneri:** Toplu işlem + cache
  - Tüm hafta için toplu ScheduleEntry oluşturma
  - Hafta bazlı cache kullanımı
  - Lazy loading (sadece görünen hafta yüklenir)

### 4. Görsel Organizasyon
- **Öneri:** Renk kodlaması + filtreleme
  - Ders tipine göre renk
  - Eğitmen bazlı filtreleme
  - Sınıf bazlı filtreleme

---

## 📋 SONUÇ

Haftalık program modülü, mevcut veri yapıları (TermSettings, MonthlyCoursePlan, ScheduleEntry) kullanılarak geliştirilebilir. Önerilen algoritma iki aşamalı (planlama + atama) yaklaşım ile çakışmaları minimize eder ve kullanıcı kontrolü sağlar.

**Önerilen Başlangıç:** Faz 1 (Temel Algoritma) ile başlanması ve adım adım diğer fazlara geçilmesi.

---

**Hazırlayan:** AI Assistant  
**Onay Bekleniyor:** Kullanıcı onayından sonra implementasyona geçilecek.

