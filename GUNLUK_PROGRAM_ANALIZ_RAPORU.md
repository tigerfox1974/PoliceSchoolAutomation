# 📋 GÜNLÜK PROGRAM MODÜLÜ - DURUM ANALİZİ RAPORU

> **Tarih:** 2 Ocak 2026  
> **Modül:** FAZ 2.5 - Günlük Program  
> **Durum:** Analiz ve Hazırlık Aşaması

---

## 🎯 GENEL BAKIŞ

Bu rapor, **DERS_PROGRAMI_GEREKSINIMLER.md** dokümantasyonuna göre mevcut durumu analiz eder ve günlük program modülü için gereken adımları belirler.

---

## ✅ TAMAMLANAN MODÜLLER

### 1. ✅ FAZ 2.1: Dönem Ayarları (TermSettings)
- **Durum:** %100 Tamamlandı
- **Özellikler:**
  - Ders saatleri ayarları (ilk ders başlangıç, ders süresi, tenefüs)
  - Öğle yemeği ayarları
  - ETÜD ayarları (opsiyonel)
  - Çalışma günleri tanımı
  - Sınav haftaları tanımı

### 2. ✅ FAZ 2.2: Dönem Planı (TermCoursePlan)
- **Durum:** %100 Tamamlandı
- **Özellikler:**
  - Ders seçimi ve toplam planlanan saat girişi
  - Dönem boyunca toplam hedef saat takibi
  - Gerçekleşen saat takibi (totalActualHours)
  - CRUD işlemleri

### 3. ✅ FAZ 2.3: Aylık Program (MonthlyCoursePlan)
- **Durum:** %100 Tamamlandı
- **Özellikler:**
  - Otomatik aylık plan oluşturma
  - Her ay için planlanan/gerçekleşen saat takibi
  - Manuel saat düzenleme (toplam korunuyor)
  - Filtreleme, sıralama, export (PDF, Excel, Word)
  - İlerleme çubukları ve tamamlanma oranları

### 4. ✅ FAZ 2.4: Haftalık Program
- **Durum:** %90 Tamamlandı (Eksikler var)
- **Tamamlanan Özellikler:**
  - Tüm haftalar için otomatik program oluşturma
  - Hafta navigasyonu (dropdown ile direkt seçim)
  - Maksimum hafta sayısı sınırlaması
  - Ders renk kodlaması (her ders için tutarlı renk)
  - Sınıf bilgisi kaldırıldı (sadece ders ve eğitmen gösteriliyor)
  - Aynı günde aynı ders tekrarı önlendi
- **Eksik Özellikler:**
  - ❌ ScheduleEntry modeli yok (şu an direkt DailyLesson oluşturuluyor)
  - ❌ Haftalık program görünümünde sınıf bazlı gösterim yok (genel program gösteriliyor)
  - ❌ Resmi tatil kontrolü yok
  - ❌ Özel etkinlikler (YOKLAMA, MÜDÜRİYET, KONFERANS) entegrasyonu yok

---

## ❌ EKSİK MODÜL: FAZ 2.5 - GÜNLÜK PROGRAM

### Mevcut Durum Analizi

#### 1. Veritabanı Modeli (DailyLesson)
**Mevcut Alanlar:**
```prisma
✅ termId, classId, courseId, instructorId
✅ dayOfWeek, timeSlotId, specificDate
✅ isSpecialEvent, specialEventId, conferenceId
✅ isBlockSchedule, blockDuration
✅ isPhysicalActivity, requiresSpecialArea
✅ isCancelled, cancelReason
```

**Eksik Alanlar (Dokümantasyona göre):**
```prisma
❌ scheduleEntryId          // Haftalık programdan referans
❌ plannedCourseId          // Planlanan ders (farklı olabilir)
❌ actualCourseId           // Gerçekte verilen ders
❌ plannedInstructorId      // Planlanan eğitmen
❌ actualInstructorId       // Gerçekte veren eğitmen
❌ status                   // PLANNED, COMPLETED, CANCELLED, RESCHEDULED, SUBSTITUTED
❌ substitutionReason       // INSTRUCTOR_ABSENT, NO_SUBSTITUTE, OTHER
❌ syncedToWeekly           // Haftalık plana yansıdı mı?
❌ syncedToMonthly          // Aylık plana yansıdı mı?
❌ syncedToTerm             // Dönem planına yansıdı mı?
❌ curriculumUnitCompleted  // Müfredat takibi
❌ slotIndex                // Hangi ders saati (1-7)
```

#### 2. API Endpoint'leri
**Eksik:**
- ❌ `POST /api/terms/{termId}/daily-lessons/generate` - Haftalık programdan günlük ders kayıtları oluştur
- ❌ `GET /api/terms/{termId}/daily-lessons?date=YYYY-MM-DD` - Belirli bir günün derslerini getir
- ❌ `PUT /api/daily-lessons/{id}` - Ders durumunu güncelle (COMPLETED, CANCELLED, vb.)
- ❌ `POST /api/daily-lessons/{id}/substitute` - Yedek eğitmen ata
- ❌ `POST /api/daily-lessons/{id}/sync` - Yukarı senkronizasyon tetikle

#### 3. Frontend Sayfaları
**Eksik:**
- ❌ `/terms/{termId}/schedule/daily` - Günlük program görünümü
- ❌ `/terms/{termId}/schedule/daily/[date]` - Belirli bir günün detaylı görünümü
- ❌ Günlük ders durumu güncelleme UI'ı
- ❌ Yedek eğitmen atama modal'ı
- ❌ Gerçekleşme takibi UI'ı

#### 4. Algoritmalar
**Eksik:**
- ❌ Haftalık programdan günlük ders kayıtları oluşturma
- ❌ Nöbet kontrolü (24 saat nöbet sistemi)
- ❌ Yedek eğitmen bulma algoritması
- ❌ Gerçekleşme takibi (actualHours güncelleme)
- ❌ Otomatik senkronizasyon (yukarı cascade)

---

## 🔄 DOKÜMANTASYONA GÖRE GEREKEN AKIŞ

### 1. Haftalık Programdan Günlük Ders Kayıtları Oluşturma

**Dokümantasyondaki Algoritma:**
```typescript
function createDailyLessons(date: Date, scheduleEntries: ScheduleEntry[]): DailyLesson[] {
  // 1. O güne ait schedule entries'leri filtrele
  // 2. Her entry için DailyLesson oluştur
  // 3. Eğitmen nöbette mi kontrol et
  // 4. Nöbet ertesi gün mü kontrol et (24 saat nöbet sistemi)
  // 5. Yedek eğitmen bul veya PENDING_INSTRUCTOR olarak işaretle
  // 6. Status: PLANNED, COMPLETED, CANCELLED, RESCHEDULED, SUBSTITUTED
}
```

**Mevcut Durum:**
- ❌ ScheduleEntry modeli yok
- ❌ Şu an direkt DailyLesson oluşturuluyor (haftalık program oluşturulurken)
- ❌ Nöbet kontrolü yok
- ❌ Yedek eğitmen sistemi yok

### 2. Nöbet Kontrolü (24 Saat Nöbet Sistemi)

**Dokümantasyondaki Kural:**
- Nöbet günü: DERS VEREMEZ
- Nöbet ertesi gün: DERS VEREMEZ (dinlenme)

**Mevcut Durum:**
- ❌ DutySchedule modeli yok
- ❌ Nöbet kontrolü yok
- ❌ Yedek eğitmen atama sistemi yok

### 3. Gerçekleşme Takibi ve Senkronizasyon

**Dokümantasyondaki Akış:**
```
DailyLesson COMPLETED olunca:
  ↓
1. MonthlyCoursePlan.actualHours += 1
2. TermCoursePlan.totalActualHours += 1
3. syncedToWeekly = true
4. syncedToMonthly = true
5. syncedToTerm = true
```

**Mevcut Durum:**
- ❌ actualHours güncelleme yok
- ❌ Senkronizasyon flag'ları yok
- ❌ Otomatik cascade güncelleme yok

---

## 📊 MEVCUT İMPLEMENTASYON İLE DOKÜMANTASYON KARŞILAŞTIRMASI

### ✅ Uyumlu Olanlar

1. **Veritabanı Yapısı:**
   - ✅ TermCoursePlan modeli uyumlu
   - ✅ MonthlyCoursePlan modeli uyumlu
   - ✅ DailyLesson modeli temel yapı uyumlu (eksik alanlar var)

2. **Haftalık Program Oluşturma:**
   - ✅ Aylık planlardan haftalık saat hesaplama uyumlu
   - ✅ Eğitmen atama uyumlu
   - ✅ Çakışma kontrolü (sınıf, eğitmen, lab) uyumlu

### ❌ Uyumsuz Olanlar

1. **ScheduleEntry Modeli:**
   - ❌ Dokümantasyonda ScheduleEntry modeli var (haftalık program için)
   - ❌ Mevcut implementasyonda direkt DailyLesson oluşturuluyor
   - ⚠️ **KARAR GEREKLİ:** ScheduleEntry modeli eklenmeli mi, yoksa direkt DailyLesson ile devam mı?

2. **Günlük Program Oluşturma:**
   - ❌ Dokümantasyonda: Haftalık program → Günlük ders kayıtları
   - ❌ Mevcut durumda: Haftalık program oluşturulurken direkt DailyLesson oluşturuluyor
   - ⚠️ **SORUN:** Günlük program için ayrı bir oluşturma adımı yok

3. **Nöbet ve Yedek Eğitmen Sistemi:**
   - ❌ Dokümantasyonda: 24 saat nöbet sistemi, otomatik yedek atama
   - ❌ Mevcut durumda: Nöbet kontrolü yok, yedek eğitmen sistemi yok

4. **Gerçekleşme Takibi:**
   - ❌ Dokümantasyonda: actualHours otomatik güncelleniyor
   - ❌ Mevcut durumda: actualHours güncelleme yok

---

## 🎯 GÜNLÜK PROGRAM İÇİN GEREKEN ADIMLAR

### ADIM 1: Veritabanı Şeması Güncelleme

**1.1. DailyLesson Modeline Eksik Alanları Ekle:**
```prisma
model DailyLesson {
  // ... mevcut alanlar ...
  
  // ⭐ YENİ ALANLAR
  plannedCourseId      String?  // Planlanan ders
  actualCourseId       String?  // Gerçekte verilen ders
  plannedInstructorId  String?  // Planlanan eğitmen
  actualInstructorId   String?  // Gerçekte veren eğitmen (mevcut instructorId ile birleştirilebilir)
  
  status               String   @default("PLANNED") // PLANNED, COMPLETED, CANCELLED, RESCHEDULED, SUBSTITUTED
  substitutionReason   String?  // INSTRUCTOR_ABSENT, NO_SUBSTITUTE, OTHER
  
  syncedToWeekly       Boolean  @default(false)
  syncedToMonthly      Boolean  @default(false)
  syncedToTerm         Boolean  @default(false)
  
  curriculumUnitCompleted Boolean @default(true)
  slotIndex            Int?      // Hangi ders saati (1-7)
}
```

**1.2. DutySchedule Modeli Ekle (Nöbet Takibi):**
```prisma
model DutySchedule {
  id           String   @id @default(cuid())
  instructorId String
  instructor   Instructor @relation(fields: [instructorId], references: [id])
  date         DateTime @db.Date
  startTime    String   // "08:00"
  endTime      String   // "08:00" (ertesi gün)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@unique([instructorId, date])
  @@index([date])
  @@map("duty_schedules")
}
```

### ADIM 2: API Endpoint'leri Oluşturma

**2.1. Günlük Ders Kayıtları Oluşturma:**
```typescript
POST /api/terms/{termId}/daily-lessons/generate
Body: { date: "2026-01-26" }
// Haftalık programdan o gün için DailyLesson kayıtları oluştur
// Nöbet kontrolü yap
// Yedek eğitmen bul
```

**2.2. Günlük Ders Listesi:**
```typescript
GET /api/terms/{termId}/daily-lessons?date=2026-01-26
// Belirli bir günün tüm derslerini getir
// Sınıf bazlı grupla
```

**2.3. Ders Durumu Güncelleme:**
```typescript
PUT /api/daily-lessons/{id}
Body: { status: "COMPLETED", actualCourseId: "...", actualInstructorId: "..." }
// Ders durumunu güncelle
// Otomatik senkronizasyon tetikle
```

### ADIM 3: Algoritmalar

**3.1. Haftalık Programdan Günlük Ders Kayıtları:**
- Haftalık programdaki DailyLesson kayıtlarını kullan
- Nöbet kontrolü ekle
- Yedek eğitmen bulma algoritması ekle

**3.2. Nöbet Kontrolü:**
- DutySchedule tablosundan nöbet kontrolü
- 24 saat nöbet sistemi (nöbet günü + ertesi gün)

**3.3. Yedek Eğitmen Bulma:**
- Aynı derse atanmış yedek eğitmenleri bul
- Müsaitlik kontrolü
- Otomatik atama veya öneri

**3.4. Senkronizasyon:**
- DailyLesson COMPLETED olunca
- MonthlyCoursePlan.actualHours güncelle
- TermCoursePlan.totalActualHours güncelle
- Flag'ları işaretle

### ADIM 4: Frontend

**4.1. Günlük Program Sayfası:**
- Tarih seçici
- Sınıf bazlı görünüm
- Ders durumu güncelleme
- Yedek eğitmen atama

**4.2. Gerçekleşme Takibi:**
- Planlanan vs Gerçekleşen saat gösterimi
- İlerleme çubukları
- Tamamlanma oranları

---

## ⚠️ KRİTİK KARARLAR

### 1. ScheduleEntry Modeli
**Soru:** ScheduleEntry modeli eklenmeli mi?

**Seçenekler:**
- **A) ScheduleEntry ekle:** Haftalık program için ayrı model, günlük program için DailyLesson
- **B) Direkt DailyLesson kullan:** Haftalık program zaten DailyLesson oluşturuyor

**Öneri:** **B) Direkt DailyLesson kullan** - Mevcut implementasyon zaten çalışıyor, ScheduleEntry eklemek gereksiz karmaşıklık yaratır.

### 2. Günlük Program Oluşturma Zamanı
**Soru:** Günlük program ne zaman oluşturulmalı?

**Seçenekler:**
- **A) Haftalık program oluşturulurken:** Şu anki durum
- **B) Gün başında otomatik:** Her gün sabah otomatik oluştur
- **C) Manuel:** Kullanıcı istediğinde oluştur

**Öneri:** **A) Haftalık program oluşturulurken** - Zaten yapılıyor, sadece nöbet kontrolü ve yedek eğitmen eklenmeli.

---

## 📋 ÖNCELİK SIRASI

### YÜKSEK ÖNCELİK (Günlük Program İçin Zorunlu)

1. ✅ DailyLesson modeline eksik alanları ekle
2. ✅ Nöbet kontrolü algoritması (basit versiyon)
3. ✅ Günlük program görünümü sayfası
4. ✅ Ders durumu güncelleme (COMPLETED)
5. ✅ Gerçekleşme takibi (actualHours güncelleme)

### ORTA ÖNCELİK (İyileştirmeler)

1. ⚠️ Yedek eğitmen otomatik atama sistemi
2. ⚠️ DutySchedule modeli ve nöbet yönetimi
3. ⚠️ Otomatik senkronizasyon (yukarı cascade)
4. ⚠️ Resmi tatil kontrolü
5. ⚠️ Özel etkinlikler entegrasyonu

### DÜŞÜK ÖNCELİK (Gelecek Versiyonlar)

1. 📚 Müfredat takibi (curriculumUnitCompleted)
2. 📚 WebSocket ile gerçek zamanlı güncelleme
3. 📚 Bildirim sistemi

---

## ✅ SONUÇ VE ÖNERİLER

### Mevcut Durum
- ✅ Dönem Planı, Aylık Program, Haftalık Program %90 tamamlandı
- ❌ Günlük Program henüz başlamadı
- ⚠️ Bazı eksik alanlar var ama temel yapı hazır

### Önerilen Yaklaşım

1. **Önce Eksik Alanları Ekle:**
   - DailyLesson modeline status, syncedTo* flag'ları ekle
   - Basit nöbet kontrolü ekle (DutySchedule olmadan, manuel kontrol ile başla)

2. **Günlük Program Görünümü:**
   - Mevcut DailyLesson kayıtlarını göster
   - Ders durumu güncelleme UI'ı
   - Gerçekleşme takibi

3. **Sonra İyileştirmeler:**
   - Yedek eğitmen sistemi
   - Otomatik senkronizasyon
   - Nöbet yönetimi

### Doğru İlerliyor muyuz?

**CEVAP: EVET, doğru ilerliyoruz!**

- ✅ Temel yapı doğru kurulmuş
- ✅ Dokümantasyona uyumlu ilerliyoruz
- ✅ Sadece günlük program modülü kaldı
- ⚠️ Bazı eksikler var ama bunlar iyileştirme olarak eklenebilir

---

## 🚀 SONRAKİ ADIMLAR

1. **Onay Al:** Bu raporu incele, kararları onayla
2. **Veritabanı Güncelle:** DailyLesson modeline eksik alanları ekle
3. **API Endpoint'leri:** Günlük program için API'leri oluştur
4. **Frontend:** Günlük program görünümü sayfası
5. **Test:** Tüm akışı test et

---

**Rapor Hazırlayan:** AI Assistant  
**Tarih:** 2 Ocak 2026  
**Durum:** Onay Bekliyor ⏳

