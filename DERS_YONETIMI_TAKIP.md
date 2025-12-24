# 📚 DERS VE MÜFREDAT YÖNETİMİ - İLERLEME TAKİBİ

**Başlangıç:** 25 Aralık 2025  
**Durum:** Başlangıç - Schema Analizi

---

## 🎯 GENEL HEDEF

Dönem bazlı ders/müfredat yönetim sistemi:
- Dönemlik plan (4-6 ay boyunca hangi dersler)
- Aylık saat dağılımı (her ay hangi ders kaç saat)
- Haftalık çizelge (hangi gün, saat, sınıf, eğitmen)
- Günlük gerçekleşme (yapıldı/yapılmadı, yoklama)

---

## 📋 AŞAMALAR

### ✅ AŞAMA 0: Mevcut Durum Analizi (TAMAMLANDI)

**Yapılan:**
- [x] Schema incelendi
- [x] Eksikler belirlendi
- [x] Akış tasarlandı

**Tespit Edilen Eksikler:**
- ❌ Dönemlik ders planı modeli yok
- ❌ Aylık saat dağılımı yok
- ❌ Günlük ders gerçekleşme kaydı yok
- ✅ Haftalık çizelge var (ScheduleEntry)
- ✅ Course (Ders) modeli var

---

### 🔄 AŞAMA 1: Schema Güncelleme (DEVAM EDİYOR)

**Hedef:** Eksik modelleri ekleyip migration yapmak

#### Adım 1.1: Yeni Modelleri Tasarla ⏳
**Durum:** Bekliyor

**Eklenecek Modeller:**

**A) TermCoursePlan (Dönemlik Ders Planı)**
```prisma
// Dönem süresince bu ders toplam kaç saat yapılacak
model TermCoursePlan {
  id       String @id @default(cuid())
  
  termId   String
  term     Term @relation(fields: [termId], references: [id])
  
  courseId String
  course   Course @relation(fields: [courseId], references: [id])
  
  totalPlannedHours Int    // Dönem boyunca toplam hedef saat
  actualHours       Int @default(0) // Gerçekleşen toplam saat
  
  // Aylık dağılım
  monthlyPlans MonthlyCoursePlan[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([termId, courseId])
  @@map("term_course_plans")
}
```

**B) MonthlyCoursePlan (Aylık Ders Planı)**
```prisma
// Her ay hangi ders kaç saat yapılacak
model MonthlyCoursePlan {
  id String @id @default(cuid())
  
  termCoursePlanId String
  termCoursePlan   TermCoursePlan @relation(fields: [termCoursePlanId], references: [id])
  
  month Int // 1-12
  year  Int // 2026
  
  plannedHours Int // Bu ay hedef saat
  actualHours  Int @default(0) // Gerçekleşen
  
  // Günlük dersler
  dailyLessons DailyLesson[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([termCoursePlanId, month, year])
  @@map("monthly_course_plans")
}
```

**C) DailyLesson (Günlük Gerçekleşen Ders)**
```prisma
// Gerçekten yapılan ders kayıtları
model DailyLesson {
  id String @id @default(cuid())
  
  monthlyPlanId String?
  monthlyPlan   MonthlyCoursePlan? @relation(fields: [monthlyPlanId], references: [id])
  
  scheduleEntryId String?
  scheduleEntry   ScheduleEntry? @relation(fields: [scheduleEntryId], references: [id])
  
  date DateTime // Hangi gün
  
  classId String
  class   Class @relation(fields: [classId], references: [id])
  
  courseId String
  course   Course @relation(fields: [courseId], references: [id])
  
  instructorId String
  instructor   Instructor @relation(fields: [instructorId], references: [id])
  
  startTime String // "09:00"
  endTime   String // "12:00"
  
  durationHours Float // Kaç saat yapıldı (3.0)
  
  isCompleted Boolean @default(false)
  isCancelled Boolean @default(false)
  cancelReason String?
  
  notes String? // Ders notları
  
  // Yoklama kayıtları
  attendances Attendance[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([date, classId])
  @@index([courseId, date])
  @@map("daily_lessons")
}
```

**Yapılacaklar:**
- [ ] Schema.prisma dosyasını aç
- [ ] Yeni modelleri ekle
- [ ] İlişkileri kontrol et (Term, Course, Class, Instructor)
- [ ] Mevcut Course ve ScheduleEntry'ye yeni relation'lar ekle

---

#### Adım 1.2: Migration Oluştur ve Çalıştır ⏳
**Durum:** Bekliyor

**Yapılacaklar:**
- [ ] `npx prisma migrate dev --name add_course_planning_models`
- [ ] Migration dosyasını kontrol et
- [ ] Migration'ı çalıştır
- [ ] Prisma Client'ı yeniden generate et

---

#### Adım 1.3: Seed Data Hazırla (Opsiyonel) ⏳
**Durum:** Bekliyor

**Yapılacaklar:**
- [ ] Test için örnek ders planı verisi
- [ ] Seed script'i hazırla

---

### 📦 AŞAMA 2: API Route'ları Oluştur (BEKLİYOR)

**Hedef:** Backend endpoint'lerini hazırlamak

#### Adım 2.1: Dönemlik Plan API'leri
- [ ] `GET /api/terms/[id]/courses` - Dönemdeki tüm dersler
- [ ] `POST /api/terms/[id]/courses` - Derse dönem planı ekle
- [ ] `PUT /api/term-course-plans/[id]` - Plan güncelle
- [ ] `DELETE /api/term-course-plans/[id]` - Plan sil

#### Adım 2.2: Aylık Plan API'leri
- [ ] `GET /api/term-course-plans/[id]/monthly` - Aylık planlar
- [ ] `POST /api/monthly-course-plans` - Aylık plan oluştur
- [ ] `PUT /api/monthly-course-plans/[id]` - Aylık plan güncelle

#### Adım 2.3: Günlük Ders API'leri
- [ ] `GET /api/daily-lessons?date=2026-03-01&classId=xxx` - Günlük dersler
- [ ] `POST /api/daily-lessons` - Ders kaydı oluştur
- [ ] `PUT /api/daily-lessons/[id]` - Ders güncelle (tamamlandı, iptal)

---

### 🎨 AŞAMA 3: UI Bileşenleri (BEKLİYOR)

**Hedef:** Tamamen modüler UI bileşenleri

#### Adım 3.1: Dönem Ders Planı Sayfası (`/terms/[id]/courses`)
- [ ] `src/features/courses/` klasör yapısı oluştur
- [ ] CourseList bileşeni (dönemdeki tüm dersler)
- [ ] CourseCard bileşeni (ders kartı)
- [ ] AddCourseModal bileşeni
- [ ] useCourses hook

#### Adım 3.2: Aylık Plan Görünümü
- [ ] MonthlyPlanView bileşeni
- [ ] Ay seçici
- [ ] Ders saat dağılımı tablosu
- [ ] İlerleme göstergeleri (hedef vs gerçekleşen)

#### Adım 3.3: Haftalık Çizelge
- [ ] WeeklySchedule bileşeni
- [ ] Gün/saat grid görünümü
- [ ] Sürükle-bırak (drag-drop) özelliği
- [ ] Çakışma kontrolü

#### Adım 3.4: Günlük Ders Takibi
- [ ] DailyLessonList bileşeni
- [ ] Tarih seçici (calendar)
- [ ] Ders durumu (tamamlandı/iptal/bekliyor)
- [ ] Yoklama entegrasyonu

---

### 🧪 AŞAMA 4: Test ve Optimizasyon (BEKLİYOR)

- [ ] API endpoint testleri
- [ ] UI bileşen testleri
- [ ] Performance testi
- [ ] Kullanıcı kabul testleri

---

## 📊 İLERLEME ÖZETİ

| Aşama | Durum | İlerleme |
|-------|-------|----------|
| 0. Analiz | ✅ Tamamlandı | 100% |
| 1. Schema | 🔄 Devam Ediyor | 0% |
| 2. API | ⏳ Bekliyor | 0% |
| 3. UI | ⏳ Bekliyor | 0% |
| 4. Test | ⏳ Bekliyor | 0% |

**Toplam İlerleme:** 20%

---

## 🚀 ŞU ANKİ ADIM

**AŞAMA 1 - Adım 1.1:** Schema'ya yeni modeller ekleniyor

**Ne Yapılacak:**
1. `prisma/schema.prisma` dosyasını aç
2. TermCoursePlan, MonthlyCoursePlan, DailyLesson modellerini ekle
3. Mevcut Course ve ScheduleEntry modellerine relation ekle
4. Syntax kontrol et

**Sonraki Adım:** Migration oluştur

---

*Son Güncelleme: 25 Aralık 2025 - Başlangıç*
