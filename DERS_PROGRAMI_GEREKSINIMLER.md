# Ders Programı ve Otomatik Planlama Sistemi - Gereksinimler Dokümanı

## 📋 Genel Bakış

Bu doküman, polis okulu için otomatik ders planlama sisteminin tüm gereksinimlerini, kurallarını ve implementasyon detaylarını içermektedir. Kodlamaya geçmeden önce tüm detaylar bu dokümanda netleştirilecektir.

**Amaç:** 
- Dönem bazlı ders planlarını otomatik oluşturmak
- Aylık, haftalık ve günlük dağılımları yapmak
- Eğitmen müsaitliğini, nöbet durumlarını ve sınav dönemlerini yönetmek
- 7 saat/gün kuralını her koşulda korumak
- Boş ders bırakmamak (eğitmen yoksa otomatik yedek atama)

---

## 🎯 Sabit Kurallar ve Kısıtlamalar

### 1. Zaman Kısıtlamaları
- **Günlük Ders Saati:** 7 saat (SABİT - asla değişmez)
- **Haftalık Çalışma:** 5 gün (Pazartesi-Cuma)
- **Haftalık Toplam:** 35 saat
- **Ders Saatleri:** 08:00-15:00 arası (1 saat öğle arası dahil)

### 2. Boş Ders Yasağı
- Hiçbir gün boş ders bırakılamaz
- Eğitmen müsait değilse sistem otomatik yedek eğitmen atamalı
- Yedek yoksa uyarı vermeli ama yine de bir eğitmen atamalı
- Kullanıcı manuel müdahale edebilmeli

### 3. Sınıflar
- **Toplam:** 7 sınıf
  - Sınıf A
  - Sınıf B
  - Sınıf C
  - Sınıf D
  - Sınıf E
  - Sınıf F
  - Bilgisayar Laboratuvarı (özel)

### 4. Bilgisayar Laboratuvarı Kuralı
- Bir sınıfın bilgisayar dersi varsa, o ders Bilgisayar Lab'da yapılır
- Aynı anda sadece bir sınıf Bilgisayar Lab'ı kullanabilir
- Sistem çakışmaları otomatik önlemeli
- Lab olmayan dersler normal sınıflarda yapılır

---

## 📚 Ders Tanımları ve Saat Hedefleri

### 1. Ders Modeli Yapısı
Her ders şu bilgileri içermelidir:
```
Ders Adı: string
4 Aylık Dönem Hedefi: number (saat)
6 Aylık Dönem Hedefi: number (saat)
Ağırlık Katsayısı: number (hesaplanan)
Bilgisayar Lab Gerekli mi: boolean
```

### 2. Örnek Ders Tanımları
```
Ceza Yasası:
  - 4 aylık: 40 saat
  - 6 aylık: 55 saat
  - Ağırlık: Yüksek (toplam saat fazla)
  - Lab: Hayır

Bilgisayar Kullanımı:
  - 4 aylık: 20 saat
  - 6 aylık: 30 saat
  - Ağırlık: Orta
  - Lab: Evet
```

### 3. Ağırlık Katsayısı Hesaplama
```
Ağırlık = (Dönem Hedef Saati) / (Toplam Tüm Dersler Saati)

Örnek:
Ceza Yasası 40 saat
Bilgisayar 20 saat
Trafik 30 saat
Toplam = 90 saat

Ağırlıklar:
- Ceza Yasası: 40/90 = 0.44 (44%)
- Bilgisayar: 20/90 = 0.22 (22%)
- Trafik: 30/90 = 0.33 (33%)
```

---

## 👨‍🏫 Eğitmen Kuralları ve Müsaitlik

### 1. Eğitmen Tipleri

#### A. Kadrolu Eğitmenler
- Okulun tam zamanlı çalışanları
- Nöbet görevi vardır
- Nöbet kuralları:
  - Nöbet günü: Ders vermez (sistem otomatik bloke eder)
  - Nöbet ertesi gün: Varsayılan olarak ders vermez
  - Kullanıcı, "Uyarı: Eğitmen dün nöbetteydi" mesajıyla onaylayarak yine de atayabilir

#### B. Dış Eğitmenler
- Sözleşmeli veya dışarıdan gelen eğitmenler
- Nöbet görevi yoktur
- Her gün ders verebilirler

### 2. Eğitmen Müsaitlik Yönetimi
```
Eğitmen Modeli eklemeler:
- instructorType: "KADROLU" | "DIS"
- canTeachAfterDuty: boolean (varsayılan: false)
- dutySchedule: DutySchedule[] (ilişki)
```

### 3. Çakışma Kontrolü
- Bir eğitmen aynı anda iki farklı sınıfta ders veremez
- Sistem otomatik çakışma kontrolü yapmalı
- Çakışma varsa alternatif saat veya eğitmen önerisi sunmalı

---

## 📅 Sınav Dönemleri ve Özel Günler

### 1. Sınav Haftaları
- **4 Aylık Dönem:**
  - 1 Ara Sınav Haftası (genellikle 2. ayın sonunda)
  - 1 Final Sınavı Haftası (dönem sonunda)
  
- **6 Aylık Dönem:**
  - 1 Ara Sınav Haftası (genellikle 3. ayın sonunda)
  - 1 Final Sınavı Haftası (dönem sonunda)

### 2. Sınav Haftası Kuralları
- Sınav haftalarında ders yapılmaz
- Tüm planlama görünümlerinde (dönem/aylık/haftalık/günlük) gösterilir
- Sistem sınav haftalarını atlayarak planlama yapar
- Kullanıcı sınav tarihlerini dönem oluştururken belirler

### 3. Resmi Tatiller ve Özel Günler
- Resmi tatiller sistem takviminde tanımlı olmalı
- Bu günlerde ders yapılmaz
- Planlama otomatiği bu günleri atlar

---

## 🔄 Otomatik Planlama Akışı (Cascade Logic)

### 1. Hiyerarşik Yapı
```
┌─────────────────────────────────┐
│  Ders Tanımları                 │
│  (4/6 aylık saat hedefleri)     │
└───────────┬─────────────────────┘
            │
            ↓ Ağırlığa göre dağıt
┌─────────────────────────────────┐
│  Dönem Planı                    │
│  (hangi dersler, toplam saat)   │
└───────────┬─────────────────────┘
            │
            ↓ Aylara böl
┌─────────────────────────────────┐
│  Aylık Planlar                  │
│  (her ay her ders kaç saat)     │
└───────────┬─────────────────────┘
            │
            ↓ Haftalara dağıt
┌─────────────────────────────────┐
│  Haftalık Program               │
│  (7 saat/gün × 5 gün = 35 saat) │
└───────────┬─────────────────────┘
            │
            ↓ Günlük gerçekleşme
┌─────────────────────────────────┐
│  Günlük Dersler                 │
│  (yoklama, gerçek uygulama)     │
└─────────────────────────────────┘
```

### 2. Dönem Planı Oluşturma
**Input:**
- Dönem bilgileri (başlangıç/bitiş tarihleri)
- Seçilen dersler ve hedef saatleri
- Sınav tarihleri

**Algoritma:**
1. Toplam çalışma günü hesapla (sınav haftaları ve tatiller hariç)
2. Toplam kullanılabilir saat = çalışma günü × 7 saat/gün
3. Her ders için hedef saate göre ağırlık hesapla
4. Ağırlığa göre saatleri dağıt

**Output:**
```
TermCoursePlan {
  termId: UUID
  courseId: UUID
  totalPlannedHours: number
  totalActualHours: number (başlangıçta 0)
}
```

### 3. Aylık Plan Oluşturma
**Input:**
- Dönem planı (TermCoursePlan)
- Dönemin kaç ay olduğu

**Algoritma:**
1. Her ders için toplam planı aylara böl
2. Ayın çalışma günlerini hesapla
3. Ağırlığa göre saatleri dağıt
4. Sınav aylarında sınav haftasını dikkate al

**Output:**
```
MonthlyCoursePlan {
  termCoursePlanId: UUID
  month: number (1-12)
  year: number
  plannedHours: number
  actualHours: number (başlangıçta 0)
}
```

### 4. Haftalık Program Oluşturma
**Input:**
- Aylık planlar (MonthlyCoursePlan)
- Eğitmen müsaitliği
- Nöbet programı
- Sınıf kapasiteleri

**Algoritma:**
1. Haftanın 35 saatini (7×5) dersler arasında dağıt
2. Ağırlığa göre ders sıklığını belirle
3. Eğitmen müsaitliğini kontrol et
4. Bilgisayar Lab çakışmalarını önle
5. Çakışma yoksa schedule_entries tablosuna kaydet

**Output:**
```
ScheduleEntry {
  classId: UUID
  courseId: UUID
  instructorId: UUID
  dayOfWeek: number (1-5)
  startTime: string
  endTime: string
  effectiveFrom: Date
  effectiveTo: Date
}
```

### 5. Günlük Ders Kayıtları
**Input:**
- Haftalık program (ScheduleEntry)
- Günün tarihi

**Algoritma:**
1. O güne ait schedule_entries'leri getir
2. Her ders için DailyLesson kaydı oluştur
3. Eğitmen müsait mi kontrol et (nöbet, hastalık)
4. Müsait değilse yedek eğitmen öner veya ata

**Output:**
```
DailyLesson {
  id: UUID
  date: Date
  scheduleEntryId: UUID
  actualInstructorId: UUID (farklı olabilir)
  attendanceId: UUID (nullable)
  status: "PLANNED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED"
  notes: string
}
```

---

## 🗄️ Veritabanı Şeması Değişiklikleri

### 1. Yeni Modeller

#### A. TermCoursePlan (Dönem Ders Planı)
```prisma
model TermCoursePlan {
  id                 String   @id @default(uuid())
  termId             String
  term               Term     @relation(fields: [termId], references: [id], onDelete: Cascade)
  courseId           String
  course             Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  totalPlannedHours  Int      // Dönem için planlanan toplam saat
  totalActualHours   Int      @default(0) // Gerçekleşen toplam saat
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  monthlyPlans       MonthlyCoursePlan[]
  
  @@unique([termId, courseId])
  @@index([termId])
  @@index([courseId])
}
```

#### B. MonthlyCoursePlan (Aylık Ders Planı)
```prisma
model MonthlyCoursePlan {
  id                String          @id @default(uuid())
  termCoursePlanId  String
  termCoursePlan    TermCoursePlan  @relation(fields: [termCoursePlanId], references: [id], onDelete: Cascade)
  month             Int             // 1-12
  year              Int
  plannedHours      Int
  actualHours       Int             @default(0)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@unique([termCoursePlanId, month, year])
  @@index([termCoursePlanId])
  @@index([month, year])
}
```

#### C. DailyLesson (Günlük Ders Kaydı)
```prisma
model DailyLesson {
  id                  String        @id @default(uuid())
  date                DateTime      @db.Date
  scheduleEntryId     String
  scheduleEntry       ScheduleEntry @relation(fields: [scheduleEntryId], references: [id], onDelete: Cascade)
  actualInstructorId  String        // Gerçekleşen eğitmen (farklı olabilir)
  actualInstructor    Instructor    @relation(fields: [actualInstructorId], references: [id])
  attendanceId        String?       @unique
  attendance          Attendance?   @relation(fields: [attendanceId], references: [id])
  status              String        // PLANNED, COMPLETED, CANCELLED, RESCHEDULED
  notes               String?       @db.Text
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
  
  @@unique([scheduleEntryId, date])
  @@index([date])
  @@index([actualInstructorId])
}
```

#### D. ExamSchedule (Sınav Takvimi)
```prisma
model ExamSchedule {
  id          String   @id @default(uuid())
  termId      String
  term        Term     @relation(fields: [termId], references: [id], onDelete: Cascade)
  examType    String   // MIDTERM, FINAL
  startDate   DateTime @db.Date
  endDate     DateTime @db.Date
  description String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([termId])
  @@index([startDate, endDate])
}
```

### 2. Mevcut Modellere Eklemeler

#### Course Modeline Eklemeler:
```prisma
model Course {
  // Mevcut alanlar...
  
  fourMonthHours    Int?     // 4 aylık dönem için hedef saat
  sixMonthHours     Int?     // 6 aylık dönem için hedef saat
  requiresLab       Boolean  @default(false) // Bilgisayar lab gerekli mi?
  
  termCoursePlans   TermCoursePlan[]
}
```

#### Class Modeline Eklemeler:
```prisma
model Class {
  // Mevcut alanlar...
  
  isComputerLab     Boolean  @default(false) // Bilgisayar laboratuvarı mı?
}
```

#### Instructor Modeline Eklemeler:
```prisma
model Instructor {
  // Mevcut alanlar...
  
  instructorType    String   @default("KADROLU") // KADROLU, DIS
  canTeachAfterDuty Boolean  @default(false) // Nöbet ertesi gün ders verebilir mi?
  
  dailyLessons      DailyLesson[]
}
```

#### ScheduleEntry Modeline Eklemeler:
```prisma
model ScheduleEntry {
  // Mevcut alanlar...
  
  dailyLessons      DailyLesson[]
}
```

---

## 🤖 Otomatik Planlama Algoritması Detayları

### 1. Algoritma Adımları

#### Adım 1: Çalışma Günlerini Hesapla
```typescript
function calculateWorkingDays(termStart: Date, termEnd: Date, examSchedules: ExamSchedule[]): number {
  let workingDays = 0;
  let currentDate = new Date(termStart);
  
  while (currentDate <= termEnd) {
    // Hafta sonu mu?
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      // Sınav haftası mı?
      const isExamWeek = examSchedules.some(exam => 
        currentDate >= exam.startDate && currentDate <= exam.endDate
      );
      
      // Resmi tatil mi?
      const isHoliday = checkIfHoliday(currentDate);
      
      if (!isExamWeek && !isHoliday) {
        workingDays++;
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
}
```

#### Adım 2: Toplam Ders Saatini Hesapla
```typescript
function calculateTotalAvailableHours(workingDays: number): number {
  return workingDays * 7; // Her gün 7 saat
}
```

#### Adım 3: Ders Ağırlıklarını Hesapla
```typescript
function calculateCourseWeights(courses: Course[], termDuration: '4_MONTH' | '6_MONTH'): Map<string, number> {
  const weights = new Map<string, number>();
  const totalHours = courses.reduce((sum, course) => {
    const hours = termDuration === '4_MONTH' ? course.fourMonthHours : course.sixMonthHours;
    return sum + (hours || 0);
  }, 0);
  
  courses.forEach(course => {
    const hours = termDuration === '4_MONTH' ? course.fourMonthHours : course.sixMonthHours;
    weights.set(course.id, (hours || 0) / totalHours);
  });
  
  return weights;
}
```

#### Adım 4: Dönem Planını Oluştur
```typescript
function createTermPlan(
  term: Term, 
  courses: Course[], 
  weights: Map<string, number>,
  totalHours: number
): TermCoursePlan[] {
  return courses.map(course => ({
    termId: term.id,
    courseId: course.id,
    totalPlannedHours: Math.round(totalHours * (weights.get(course.id) || 0)),
    totalActualHours: 0
  }));
}
```

#### Adım 5: Aylık Dağılım
```typescript
function distributeToMonths(termPlan: TermCoursePlan, termDuration: number): MonthlyCoursePlan[] {
  const monthlyPlans: MonthlyCoursePlan[] = [];
  const hoursPerMonth = Math.round(termPlan.totalPlannedHours / termDuration);
  
  for (let i = 0; i < termDuration; i++) {
    monthlyPlans.push({
      termCoursePlanId: termPlan.id,
      month: getMonthNumber(i),
      year: getYearNumber(i),
      plannedHours: hoursPerMonth,
      actualHours: 0
    });
  }
  
  // Kalan saatleri son aya ekle
  const remaining = termPlan.totalPlannedHours - (hoursPerMonth * termDuration);
  if (remaining > 0) {
    monthlyPlans[monthlyPlans.length - 1].plannedHours += remaining;
  }
  
  return monthlyPlans;
}
```

#### Adım 6: Haftalık Program Oluştur
```typescript
function createWeeklySchedule(
  monthlyPlans: MonthlyCoursePlan[],
  instructors: Instructor[],
  dutySchedules: DutySchedule[],
  classes: Class[]
): ScheduleEntry[] {
  const scheduleEntries: ScheduleEntry[] = [];
  const HOURS_PER_WEEK = 35; // 7 saat × 5 gün
  
  // Her sınıf için
  classes.forEach(class => {
    // Her gün için (Pzt-Cuma)
    for (let day = 1; day <= 5; day++) {
      // Her saat için (7 saat)
      for (let hour = 0; hour < 7; hour++) {
        // Hangi dersi vereceğimizi ağırlığa göre seç
        const course = selectCourseByWeight(monthlyPlans);
        
        // Eğitmen seç (müsaitlik kontrolü ile)
        const instructor = selectAvailableInstructor(
          course,
          day,
          hour,
          instructors,
          dutySchedules,
          scheduleEntries // Çakışma kontrolü için
        );
        
        // Bilgisayar lab kontrolü
        const classroom = course.requiresLab 
          ? findComputerLab(classes, day, hour, scheduleEntries)
          : class;
        
        scheduleEntries.push({
          classId: classroom.id,
          courseId: course.id,
          instructorId: instructor.id,
          dayOfWeek: day,
          startTime: calculateStartTime(hour),
          endTime: calculateEndTime(hour),
          effectiveFrom: term.startDate,
          effectiveTo: term.endDate
        });
      }
    }
  });
  
  return scheduleEntries;
}
```

#### Adım 7: Günlük Ders Kayıtları Oluştur
```typescript
function createDailyLessons(date: Date, scheduleEntries: ScheduleEntry[]): DailyLesson[] {
  const dayOfWeek = date.getDay();
  
  // O güne ait schedule entries'leri filtrele
  const todaysSchedule = scheduleEntries.filter(entry => 
    entry.dayOfWeek === dayOfWeek &&
    date >= entry.effectiveFrom &&
    date <= entry.effectiveTo
  );
  
  return todaysSchedule.map(entry => {
    // Eğitmen nöbette mi kontrol et
    const isOnDuty = checkIfOnDuty(entry.instructorId, date);
    const wasOnDutyYesterday = checkIfOnDuty(entry.instructorId, subtractDays(date, 1));
    
    // Yedek eğitmen gerekli mi?
    const needsSubstitute = isOnDuty || 
      (wasOnDutyYesterday && !instructor.canTeachAfterDuty);
    
    const actualInstructor = needsSubstitute 
      ? findSubstituteInstructor(entry.courseId, date)
      : entry.instructorId;
    
    return {
      date,
      scheduleEntryId: entry.id,
      actualInstructorId: actualInstructor,
      attendanceId: null,
      status: 'PLANNED',
      notes: needsSubstitute ? 'Yedek eğitmen atandı' : null
    };
  });
}
```

### 2. Yardımcı Fonksiyonlar

#### Eğitmen Müsaitlik Kontrolü
```typescript
function isInstructorAvailable(
  instructorId: string,
  date: Date,
  hour: number,
  dutySchedules: DutySchedule[],
  scheduleEntries: ScheduleEntry[]
): boolean {
  // Nöbette mi?
  const isOnDuty = dutySchedules.some(duty => 
    duty.instructorId === instructorId && 
    isSameDay(duty.date, date)
  );
  if (isOnDuty) return false;
  
  // Dün nöbette miydi?
  const yesterday = subtractDays(date, 1);
  const wasOnDutyYesterday = dutySchedules.some(duty =>
    duty.instructorId === instructorId &&
    isSameDay(duty.date, yesterday)
  );
  if (wasOnDutyYesterday) {
    const instructor = getInstructor(instructorId);
    if (!instructor.canTeachAfterDuty) return false;
  }
  
  // Aynı saatte başka dersi var mı?
  const hasConflict = scheduleEntries.some(entry =>
    entry.instructorId === instructorId &&
    entry.dayOfWeek === date.getDay() &&
    hoursOverlap(entry.startTime, entry.endTime, hour)
  );
  if (hasConflict) return false;
  
  return true;
}
```

#### Bilgisayar Lab Müsaitlik Kontrolü
```typescript
function isComputerLabAvailable(
  date: Date,
  hour: number,
  scheduleEntries: ScheduleEntry[]
): boolean {
  const computerLab = findComputerLab();
  
  return !scheduleEntries.some(entry =>
    entry.classId === computerLab.id &&
    entry.dayOfWeek === date.getDay() &&
    hoursOverlap(entry.startTime, entry.endTime, hour)
  );
}
```

---

## 🎨 Kullanıcı Arayüzü Gereksinimleri

### 1. Sayfa Yapısı

#### Ana Sayfalar
```
/courses                    → Ders tanımları listesi (4/6 aylık saatler)
/courses/[id]               → Ders detayı ve düzenleme
/courses/[id]/schedule      → Dersin program geçmişi

/terms/[id]/plan            → Dönem planı oluştur/görüntüle
/terms/[id]/plan/monthly    → Aylık plan görünümü
/terms/[id]/plan/weekly     → Haftalık program görünümü
/terms/[id]/plan/daily      → Günlük ders kayıtları

/schedule                   → Haftalık program ana görünüm (tüm sınıflar)
/schedule/daily             → Günlük görünüm (bugünün dersleri)
```

### 2. Dönem Planı Oluşturma (UI Flow)

#### Adım 1: Ders Seçimi
```
[Dönem Planı Oluştur]

Dönem: 2024-2025 Güz Dönemi
Süre: ○ 4 Aylık  ○ 6 Aylık

Dersler:
┌─────────────────────────────────────────────────────┐
│ ☑ Ceza Yasası         [40 saat] [55 saat]           │
│ ☑ Trafik              [30 saat] [40 saat]           │
│ ☑ Bilgisayar Kullanımı [20 saat] [30 saat] 💻       │
│ ☐ İlk Yardım          [15 saat] [20 saat]           │
│ ☑ Fiziksel Eğitim     [35 saat] [50 saat]           │
└─────────────────────────────────────────────────────┘

Toplam Seçili: 4 ders
Toplam Saat: 125 saat (4 aylık) / 175 saat (6 aylık)

[İptal]  [İleri →]
```

#### Adım 2: Sınav Tarihleri
```
[Sınav Takvimi]

Ara Sınav:
  Başlangıç: [01/11/2024]
  Bitiş:     [05/11/2024]

Final Sınavı:
  Başlangıç: [15/01/2025]
  Bitiş:     [19/01/2025]

⚠️ Bu haftalarda ders yapılmayacaktır.

[← Geri]  [İleri →]
```

#### Adım 3: Otomatik Planlama
```
[Otomatik Planlama]

Çalışma Günleri: 85 gün
Toplam Saat: 595 saat (85 gün × 7 saat)
Planlanan Ders Saati: 125 saat
Kalan: 470 saat (diğer aktiviteler için)

Ders Dağılımı:
├─ Ceza Yasası:          40 saat (32%)
├─ Trafik:               30 saat (24%)
├─ Bilgisayar Kullanımı: 20 saat (16%) 💻
└─ Fiziksel Eğitim:      35 saat (28%)

[← Geri]  [Planı Oluştur]
```

#### Adım 4: Plan Görünümü
```
[Dönem Planı - 2024-2025 Güz]

┌────────────────────────────────────────────────┐
│ Eylül 2024          │ Plan: 30s │ Gerçek: 25s  │
│ Ekim 2024           │ Plan: 32s │ Gerçek: 32s  │
│ Kasım 2024 (SINAV)  │ Plan: 15s │ Gerçek: 14s  │
│ Aralık 2024         │ Plan: 28s │ Gerçek: 0s   │
└────────────────────────────────────────────────┘

[Haftalık Programa Git]  [Düzenle]  [İptal Et]
```

### 3. Haftalık Program Görünümü

```
[Haftalık Program - Tüm Sınıflar]

Hafta: 16-20 Aralık 2024

          Pazartesi    Salı         Çarşamba     Perşembe     Cuma
08:00-09:00 [Sınıf A]    [Sınıf A]    [Sınıf A]    [Sınıf A]    [Sınıf A]
            Ceza         Trafik       Bilgisayar💻 Fiziksel     Ceza
            [Ahmet B.]   [Mehmet K.]  [Lab]        [Ali Y.]     [Ahmet B.]

09:00-10:00 [Sınıf B]    [Sınıf B]    [Sınıf B]    [Sınıf B]    [Sınıf B]
            ...

[Günlük Görünüme Geç]  [Yazdır]  [Dışa Aktar]
```

### 4. Günlük Ders Kayıtları

```
[Günlük Dersler - 18 Aralık 2024]

08:00-09:00  Sınıf A - Bilgisayar Kullanımı
             Eğitmen: Mehmet K. (Plan: Ahmet B. - Dün nöbetteydi)
             Durum: ✓ Tamamlandı
             Yoklama: [Yoklama Gör]
             
09:00-10:00  Sınıf A - Fiziksel Eğitim
             Eğitmen: Ali Y.
             Durum: ⏸ Planlandı
             
⚠️  11:00-12:00 Sınıf B - Trafik
             Eğitmen: YOK (Acil yedek gerekli!)
             [Yedek Eğitmen Ata]

[Önceki Gün]  [Bugün]  [Sonraki Gün]
```

### 5. Eğitmen Nöbet Uyarısı (Modal)

```
┌──────────────────────────────────────────────┐
│ ⚠️  Eğitmen Uyarısı                          │
├──────────────────────────────────────────────┤
│                                               │
│ Ahmet B. dün nöbetteydi.                     │
│                                               │
│ Sistem ayarlarına göre nöbet ertesi gün      │
│ ders vermemesi önerilir.                     │
│                                               │
│ Yine de bu eğitmeni atamak istiyor musunuz?  │
│                                               │
├──────────────────────────────────────────────┤
│                    [İptal]  [Devam Et]       │
└──────────────────────────────────────────────┘
```

---

## 📡 API Endpoint'leri

### 1. Dönem Planı API'leri

```typescript
// Dönem planı oluştur (otomatik algoritma ile)
POST /api/terms/[termId]/course-plans
Body: {
  courseIds: string[],
  examSchedules: { examType: string, startDate: Date, endDate: Date }[]
}
Response: TermCoursePlan[]

// Dönem planını getir
GET /api/terms/[termId]/course-plans
Response: TermCoursePlan[]

// Aylık planları getir
GET /api/terms/[termId]/course-plans/monthly?month=10&year=2024
Response: MonthlyCoursePlan[]

// Haftalık programı getir
GET /api/terms/[termId]/schedule?week=42&year=2024
Response: ScheduleEntry[]

// Günlük dersleri getir
GET /api/daily-lessons?date=2024-12-18
Response: DailyLesson[]

// Günlük ders güncelle (yedek eğitmen ata, durum değiştir)
PUT /api/daily-lessons/[id]
Body: {
  actualInstructorId?: string,
  status?: string,
  notes?: string
}
Response: DailyLesson
```

### 2. Ders Yönetimi API'leri

```typescript
// Ders listesi
GET /api/courses
Response: Course[]

// Ders oluştur
POST /api/courses
Body: {
  name: string,
  code: string,
  fourMonthHours: number,
  sixMonthHours: number,
  requiresLab: boolean
}
Response: Course

// Ders güncelle
PUT /api/courses/[id]
Body: Partial<Course>
Response: Course
```

### 3. Eğitmen Müsaitlik API'leri

```typescript
// Eğitmen müsaitliğini kontrol et
GET /api/instructors/[id]/availability?date=2024-12-18
Response: {
  available: boolean,
  reason?: string // "ON_DUTY" | "AFTER_DUTY" | "CONFLICT"
}

// Yedek eğitmen bul
GET /api/instructors/substitute?courseId=xxx&date=2024-12-18&hour=2
Response: Instructor[]
```

---

## 🔄 İmplementasyon Seçenekleri

### Seçenek A: Tam Sistem (1-2 Hafta)
**Kapsamı:**
- Tüm veritabanı değişiklikleri
- Otomatik planlama algoritması (tam özellikli)
- Tüm API endpoint'leri
- Tam UI (dönem/aylık/haftalık/günlük görünümler)
- Eğitmen müsaitlik yönetimi
- Bilgisayar lab kontrolü
- Nöbet entegrasyonu

**Avantajlar:**
✅ Tek seferde tamamlanır
✅ Sistem entegre çalışır
✅ Tüm özellikler hazır

**Dezavantajlar:**
❌ 1-2 hafta sürer
❌ Büyük değişiklik riski
❌ Test süresi uzun

### Seçenek B: Adım Adım (3-4 Gün) ⭐ ÖNERİLEN
**Faz 1: Temel Yapı (1 gün)**
- Veritabanı modelleri ekle
- Migration çalıştır
- Basit CRUD API'leri

**Faz 2: Dönem Planı (1 gün)**
- Manuel ders seçimi UI
- TermCoursePlan oluşturma
- Basit aylık dağılım (eşit bölme)

**Faz 3: Haftalık Program (1 gün)**
- Manuel eğitmen atama
- Haftalık görünüm
- Çakışma kontrolleri

**Faz 4: Otomatik Planlama (1 gün)**
- Algoritma geliştir
- Test ve optimize et
- UI'ye entegre et

**Avantajlar:**
✅ Her faz test edilebilir
✅ Erken geri bildirim
✅ Risk düşük
✅ Hatalar kolay bulunur

**Dezavantajlar:**
❌ İlk fazlarda manuel işlem gerekir
❌ Toplam süre biraz daha uzun

### Seçenek C: Hibrit (1 Hafta)
**Kapsamı:**
- Tüm veritabanı değişiklikleri (gün 1)
- Basit otomatik planlama algoritması (gün 2-3)
  - Sadece ağırlığa göre dağıtım
  - Gelişmiş özellikler sonra
- Temel UI (gün 4-5)
- İyileştirmeler (gün 6-7)

**Avantajlar:**
✅ Dengeli yaklaşım
✅ Hızlı başlangıç
✅ Çalışan prototip erken hazır

**Dezavantajlar:**
❌ İlk algoritma basit olacak
❌ Sonradan iyileştirme gerekir

---

## 📝 Faz Detayları (Seçenek B - Adım Adım)

### FAZ 1: Veritabanı ve Temel API (Gün 1)

**Yapılacaklar:**
1. Schema güncellemeleri
   - [ ] TermCoursePlan modeli ekle
   - [ ] MonthlyCoursePlan modeli ekle
   - [ ] DailyLesson modeli ekle
   - [ ] ExamSchedule modeli ekle
   - [ ] Course modeline fourMonthHours, sixMonthHours ekle
   - [ ] Class modeline isComputerLab ekle
   - [ ] Instructor modeline instructorType, canTeachAfterDuty ekle

2. Migration
   - [ ] `npx prisma migrate dev --name add_course_planning_models`
   - [ ] Test data oluştur

3. Temel API'ler
   - [ ] POST /api/courses (ders oluştur)
   - [ ] PUT /api/courses/[id] (ders güncelle)
   - [ ] POST /api/terms/[termId]/course-plans (dönem planı oluştur)
   - [ ] GET /api/terms/[termId]/course-plans (dönem planını getir)

**Test:**
- Postman ile API'leri test et
- Veritabanında kayıtları doğrula

### FAZ 2: Dönem Planı UI (Gün 2)

**Yapılacaklar:**
1. Ders tanımları sayfası
   - [ ] /courses sayfası oluştur
   - [ ] Ders listesi (fourMonthHours, sixMonthHours görüntülensin)
   - [ ] Ders oluştur modal
   - [ ] Ders düzenle modal

2. Dönem planı oluşturma
   - [ ] /terms/[id]/plan sayfası
   - [ ] Ders seçimi UI (checkbox ile seçim)
   - [ ] Sınav tarihleri girişi
   - [ ] "Planı Oluştur" butonu
   - [ ] Manuel saat girişi (şimdilik algoritma yok)

3. Dönem planı görünümü
   - [ ] Oluşturulan planı tablo halinde göster
   - [ ] Toplam planlanan/gerçekleşen saatleri göster

**Test:**
- Yeni ders ekle (4 aylık: 40 saat, 6 aylık: 55 saat)
- Dönem planı oluştur (manuel saat gir)
- Planı görüntüle

### FAZ 3: Haftalık Program (Gün 3)

**Yapılacaklar:**
1. Haftalık program API'leri
   - [ ] POST /api/schedule-entries (haftalık program oluştur)
   - [ ] GET /api/schedule-entries (haftalık programı getir)
   - [ ] PUT /api/schedule-entries/[id] (düzenle)

2. Haftalık program UI
   - [ ] /schedule sayfası
   - [ ] Grid görünüm (5 gün × 7 saat × 7 sınıf)
   - [ ] Manuel ders/eğitmen atama
   - [ ] Çakışma kontrolü (frontend)

3. Eğitmen müsaitlik kontrolü
   - [ ] Nöbet kontrolü entegre et
   - [ ] Uyarı modal'ı (nöbet ertesi gün)
   - [ ] Çakışma uyarıları

**Test:**
- Haftalık program oluştur
- Çakışma durumlarını test et
- Nöbet uyarısını test et

### FAZ 4: Otomatik Planlama Algoritması (Gün 4)

**Yapılacaklar:**
1. Algoritma fonksiyonları
   - [ ] calculateWorkingDays()
   - [ ] calculateCourseWeights()
   - [ ] createTermPlan()
   - [ ] distributeToMonths()
   - [ ] createWeeklySchedule()

2. API entegrasyonu
   - [ ] POST /api/terms/[termId]/course-plans/generate (otomatik oluştur)
   - [ ] Algoritma sonucunu döndür

3. UI entegrasyonu
   - [ ] "Otomatik Plan Oluştur" butonu
   - [ ] Algoritma çalışırken loading göster
   - [ ] Sonucu önizleme göster
   - [ ] "Onayla" veya "İptal Et" seçenekleri

**Test:**
- Otomatik plan oluştur
- Ağırlık dağılımını kontrol et
- Farklı senaryo test et (4 aylık vs 6 aylık)

---

## ✅ Kabul Kriterleri

### Dönem Planı
- [x] Kullanıcı dersleri seçebilmeli
- [x] 4 aylık ve 6 aylık saat hedefleri görülmeli
- [x] Sınav tarihleri girilebilmeli
- [x] Otomatik plan oluşturulabilmeli
- [x] Ağırlığa göre saat dağılımı yapılmalı
- [x] Planlanan/gerçekleşen saatler görülmeli

### Haftalık Program
- [x] 7 sınıf × 5 gün × 7 saat grid gösterilmeli
- [x] Eğitmen ataması yapılabilmeli
- [x] Çakışmalar önlenmeli
- [x] Bilgisayar lab çakışması kontrol edilmeli
- [x] Nöbet durumu kontrol edilmeli
- [x] Nöbet ertesi gün uyarı verilmeli

### Günlük Dersler
- [x] Günlük ders listesi görülmeli
- [x] Eğitmen değiştirilebilmeli (yedek atama)
- [x] Ders durumu güncellenebilmeli
- [x] Yoklama entegrasyonu olmalı

### Otomatik Algoritma
- [x] Çalışma günlerini doğru hesaplamalı
- [x] Sınav haftalarını atlamalı
- [x] Ağırlıklı dağılım yapmalı
- [x] 7 saat/gün kuralını korumalı
- [x] Eğitmen müsaitliğini kontrol etmeli

---

## 🚀 Sonraki Adımlar

### Hemen Şimdi Karar Verilmesi Gerekenler:
1. **Hangi implementasyon seçeneği seçilecek?**
   - [ ] Seçenek A: Tam sistem (1-2 hafta)
   - [ ] Seçenek B: Adım adım (3-4 gün) ⭐
   - [ ] Seçenek C: Hibrit (1 hafta)

2. **İlk yapılacak iş:**
   - [ ] Schema değişikliklerini yap
   - [ ] Migration oluştur
   - [ ] Test data hazırla

3. **Ek gereksinimler var mı?**
   - Resmi tatil takvimi nasıl yönetilecek?
   - 6 aylık dönem için kaç ara sınav olacak?
   - Eğitmen yetkilendirmesi olacak mı?
   - Raporlama gereksinimleri neler?

---

## 📊 İstatistikler ve Tahminler

### Veritabanı Değişiklikleri:
- Yeni model sayısı: 4
- Güncellenecek model sayısı: 4
- Toplam yeni ilişki: 8

### Kod Tahminleri:
- API route dosyası: ~15 dosya
- React component: ~25 component
- Hook: ~10 hook
- Utility fonksiyon: ~20 fonksiyon
- Toplam satır (tahmini): ~8,000-10,000 satır

### Test Senaryoları:
- Birim test: ~50 test
- Entegrasyon testi: ~30 test
- E2E test: ~15 senaryo

---

## 📌 Notlar ve Uyarılar

### Kritik Kararlar:
- ⚠️ Algoritma ne kadar esnek olmalı? (Manuel müdahale ne kadar?)
- ⚠️ Gerçek zamanlı güncellemeler gerekli mi? (WebSocket?)
- ⚠️ Geçmiş dönem verileri migrate edilecek mi?

### Teknik Riskler:
- Büyük gridler performans sorununa yol açabilir (virtualization gerekebilir)
- Algoritma karmaşık çakışma senaryolarında zorlanabilir
- Nöbet verileri güncel tutulmalı (eski veri algoritma bozar)

### Kullanıcı Deneyimi:
- Loading süreleri uzun olabilir (progress bar şart)
- Hata mesajları açıklayıcı olmalı
- Geri alma (undo) özelliği olmalı
- Değişiklik geçmişi tutulmalı (audit log)

---

## ✨ Gelecek İyileştirmeler (v2)

Temel sistem çalışınca eklenebilecekler:
- 📱 Mobil uygulama (eğitmen görünümü)
- 📧 Email bildirimleri (program değişiklikleri)
- 📊 Gelişmiş raporlama (eğitmen iş yükü, sınıf kullanımı)
- 🔄 Toplu program değişikliği
- 📅 Google Calendar entegrasyonu
- 🤖 Makine öğrenimi ile optim planlama
- 🎯 Eğitmen tercih sistemi
- 📈 İstatistiksel analizler

---

**Doküman Durumu:** ✅ Tamamlandı - Kodlamaya Hazır  
**Son Güncelleme:** 25 Aralık 2025  
**Versiyon:** 1.0  
**Hazırlayan:** GitHub Copilot

---

## 🎯 Sonuç

Bu doküman, ders programı ve otomatik planlama sisteminin tüm gereksinimlerini detaylı şekilde içermektedir. Kodlamaya geçmeden önce:

1. **Implementasyon seçeneğini belirleyin** (A, B veya C)
2. **Eksik gereksinimleri tamamlayın** (resmi tatiller, 6 aylık sınav sayısı, vb.)
3. **Onay verin** ve kodlamaya başlayalım!

Bu dokümandaki her detay, geliştime sırasında referans alınacaktır. Herhangi bir değişiklik gerekirse bu doküman güncellenecektir.
