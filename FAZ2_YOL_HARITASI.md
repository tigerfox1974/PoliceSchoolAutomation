# 🗺️ FAZ 2: DERS PROGRAMI MODÜLÜ - YOL HARİTASI

> **Başlangıç Tarihi:** 27 Aralık 2025  
> **Tahmini Süre:** 1-2 Hafta  
> **Durum:** Planlama Aşaması  
> **Öncelik:** YÜKSEK (Temel modül)

---

## 📊 MEVCUT DURUM ANALİZİ

### ✅ Hazır Olanlar

1. **Veritabanı Modelleri:**
   - ✅ `TimeSlot` modeli mevcut (satır 554-566)
   - ✅ `DailyLesson` modeli mevcut (satır 569-633) - Çok detaylı, özel etkinlikler, konferanslar, blok dersler için alanlar var
   - ✅ `ScheduleSwap` modeli mevcut (takas kayıtları için)
   - ✅ `PublicHoliday` modeli mevcut (resmi tatiller için)

2. **Temel Modüller:**
   - ✅ Terms (Dönemler) - CRUD hazır
   - ✅ Courses (Dersler) - CRUD hazır, 27 ders mevcut
   - ✅ Classes (Sınıflar) - CRUD hazır, otomatik oluşturma var
   - ✅ Instructors (Eğitmenler) - CRUD hazır, 35 eğitmen + 44 ders ataması mevcut
   - ✅ SpecialEvents (Özel Etkinlikler) - CRUD hazır
   - ✅ Conferences (Konferanslar) - CRUD hazır

3. **UI Bileşenleri:**
   - ✅ Toast ve ConfirmDialog sistemi
   - ✅ Modal component'leri
   - ✅ Kart/Liste görünümü toggle
   - ✅ Arama, filtreleme, sıralama sistemleri

### ❌ Eksik Olanlar

1. **Veritabanı:**
   - ❌ `TermSettings` modeli YOK - Dönem bazlı ayarlar için gerekli
   - ❌ `TimeSlot` kayıtları YOK - Seed edilmeli veya otomatik oluşturulmalı

2. **API Route'ları:**
   - ❌ `/api/terms/{termId}/settings` - Dönem ayarları
   - ❌ `/api/terms/{termId}/schedule` - Haftalık program
   - ❌ `/api/daily-lessons` - Günlük dersler
   - ❌ `/api/time-slots` - Ders saatleri yönetimi

3. **UI Sayfaları:**
   - ❌ `/terms/{termId}/settings` - Dönem ayarları sayfası
   - ❌ `/terms/{termId}/schedule` - Haftalık program sayfası
   - ❌ `/schedule/daily` - Günlük program sayfası

---

## 🎯 FAZ 2.1: DÖNEM AYARLARI (İLK ADIM)

> **Tahmini Süre:** 2-3 saat  
> **Öncelik:** EN YÜKSEK (Diğer fazların temeli)

### Adım 1: Veritabanı Modeli Oluşturma

**1.1. TermSettings Modeli Ekle (prisma/schema.prisma)**

```prisma
model TermSettings {
  id String @id @default(cuid())
  
  termId String @unique
  term   Term   @relation(fields: [termId], references: [id], onDelete: Cascade)
  
  // Ders Saatleri Ayarları
  firstLessonStart String // "08:00" - İlk ders başlangıç saati
  lessonDuration   Int    @default(45) // Ders süresi (dakika)
  breakDuration    Int    @default(15) // Tenefüs süresi (dakika)
  
  // Öğle Yemeği
  lunchBreakStart String // "12:00" - Öğle yemeği başlangıç
  lunchBreakDuration Int @default(60) // Öğle yemeği süresi (dakika)
  
  // ETÜD (Opsiyonel)
  hasStudyHall Boolean @default(false) // ETÜD var mı?
  studyHallStart String? // "17:00"
  studyHallDuration Int? @default(90) // ETÜD süresi (dakika)
  
  // Haftalık Çalışma Günleri
  workingDays DayOfWeek[] // [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY]
  
  // Sınav Haftaları (Ders yapılmayacak)
  examWeeks Json? // [{ startDate: "2024-11-01", endDate: "2024-11-05", type: "MIDTERM" }]
  
  // Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("term_settings")
}
```

**1.2. Term Modeline İlişki Ekle**

```prisma
model Term {
  // ... mevcut alanlar
  settings TermSettings?
  // ...
}
```

**1.3. Migration Çalıştır**

```bash
npx prisma migrate dev --name add_term_settings
npx prisma generate
```

### Adım 2: TimeSlot Seed/Oluşturma Sistemi

**2.1. TimeSlot Seed Script Oluştur (scripts/seed-time-slots.js)**

- Standart KKTC mesai saatleri:
  - 1. Ders: 08:00 - 08:45
  - 2. Ders: 09:00 - 09:45
  - 3. Ders: 10:00 - 10:45
  - 4. Ders: 11:00 - 11:45
  - 5. Ders: 12:00 - 12:45
  - Öğle Yemeği: 12:45 - 13:45
  - 6. Ders: 14:00 - 14:45
  - 7. Ders: 15:00 - 15:45

**2.2. Veya Otomatik Oluşturma Fonksiyonu**

- TermSettings kaydedildiğinde otomatik TimeSlot'lar oluşturulsun

### Adım 3: Backend API - TermSettings

**3.1. API Route Oluştur: `src/app/api/terms/[id]/settings/route.ts`**

```typescript
// GET /api/terms/{termId}/settings
// POST /api/terms/{termId}/settings
// PUT /api/terms/{termId}/settings
```

**Özellikler:**
- GET: Mevcut ayarları getir (yoksa varsayılanları döndür)
- POST/PUT: Ayarları kaydet
- TimeSlot'ları otomatik oluştur/güncelle

### Adım 4: Frontend - Settings Sayfası

**4.1. Sayfa Oluştur: `src/app/terms/[id]/settings/page.tsx`**

**Form Alanları:**
- İlk Ders Başlangıç Saati (time picker)
- Ders Süresi (dakika)
- Tenefüs Süresi (dakika)
- Öğle Yemeği Başlangıç (time picker)
- Öğle Yemeği Süresi (dakika)
- ETÜD Var mı? (checkbox)
- ETÜD Başlangıç (time picker, conditional)
- ETÜD Süresi (dakika, conditional)
- Çalışma Günleri (checkbox list: Pazartesi-Cuma)

**4.2. Önizleme Bölümü**

- Hesaplanan TimeSlot'ları göster:
  ```
  1. Ders: 08:00 - 08:45
  2. Ders: 09:00 - 09:45
  ...
  Öğle Yemeği: 12:45 - 13:45
  6. Ders: 14:00 - 14:45
  7. Ders: 15:00 - 15:45
  ```

**4.3. Kaydet Butonu**

- Toast bildirimi
- Başarılı olursa TimeSlot'ları otomatik oluştur

### Adım 5: Test & Commit

- [ ] TermSettings modeli oluşturuldu
- [ ] Migration çalıştırıldı
- [ ] API route'ları test edildi
- [ ] Settings sayfası çalışıyor
- [ ] TimeSlot'lar otomatik oluşturuluyor
- [ ] Linter hataları yok
- [ ] Commit & Push

**Tahmini Süre:** 2-3 saat

---

## 🎯 FAZ 2.2: HAFTALIK PROGRAM (EN KARMAŞIK)

> **Tahmini Süre:** 4-5 saat  
> **Öncelik:** YÜKSEK

### Adım 1: Backend API - Schedule

**1.1. API Route: `src/app/api/terms/[termId]/schedule/route.ts`**

```typescript
// GET /api/terms/{termId}/schedule?week=42&year=2024
// POST /api/terms/{termId}/schedule (toplu oluşturma)
```

**GET Endpoint:**
- Hafta numarası ve yıl parametreleri
- O haftanın tüm DailyLesson kayıtlarını getir
- Include: class, course, instructor, timeSlot
- Filtrele: dayOfWeek, classId

**POST Endpoint:**
- Haftalık program oluştur (tüm sınıflar için)
- Özel etkinlikleri otomatik ekle (YOKLAMA, MÜDİRİYET)

**1.2. API Route: `src/app/api/daily-lessons/[id]/route.ts`**

```typescript
// GET /api/daily-lessons/{id}
// PUT /api/daily-lessons/{id} (ders değiştir, eğitmen değiştir)
// DELETE /api/daily-lessons/{id}
```

**PUT Endpoint Özellikleri:**
- courseId değiştirme
- instructorId değiştirme
- Çakışma kontrolü (validation)

### Adım 2: Çakışma Kontrolü Sistemi

**2.1. Utility Fonksiyon: `src/lib/schedule/conflict-checker.ts`**

**Fonksiyonlar:**
- `checkInstructorConflict()` - Eğitmen aynı anda iki derste olamaz
- `checkLabConflict()` - Lab'da aynı anda sadece 1 sınıf
- `checkDutyConflict()` - Nöbet günü ve ertesi gün kontrolü

**2.2. Çakışma Kontrolü API: `src/app/api/schedule/check-conflict/route.ts`**

```typescript
// POST /api/schedule/check-conflict
// Body: { classId, dayOfWeek, timeSlotId, instructorId, courseId }
// Response: { hasConflict: boolean, conflicts: [...] }
```

### Adım 3: Frontend - Haftalık Program Sayfası

**3.1. Sayfa: `src/app/terms/[termId]/schedule/page.tsx`**

**Özellikler:**
- Hafta seçici (önceki/sonraki hafta butonları)
- Grid görünümü: 7 sınıf × 5 gün × 7 saat = 245 hücre
- Her hücre: Ders adı + Eğitmen adı
- Renk kodları:
  - Lab dersleri: Mavi arka plan
  - Özel etkinlikler: Turuncu arka plan
  - Konferanslar: Mor arka plan
  - Normal dersler: Beyaz/Gri

**3.2. Hücre Tıklama Modal**

- Ders atama modal açılır
- Sınıf zaten seçili (hücreden geliyor)
- Ders dropdown (o sınıf için uygun dersler)
- Eğitmen dropdown (o ders için yetkili eğitmenler)
- Çakışma uyarısı (real-time kontrol)
- Kaydet butonu

**3.3. Toplu İşlem Butonu**

- "Tüm A Sınıfına Ceza Yasası Ata" gibi
- Modal: Sınıf seç, Ders seç, Eğitmen seç, Hafta seç
- Toplu oluşturma

**3.4. Çakışma Uyarı Modal**

- Lab çakışması
- Eğitmen çakışması
- Nöbet uyarısı
- "Yine de devam et?" seçeneği

### Adım 4: Test & Commit

- [ ] API route'ları test edildi
- [ ] Çakışma kontrolleri çalışıyor
- [ ] Grid görünümü responsive
- [ ] Ders atama modal çalışıyor
- [ ] Toplu işlem çalışıyor
- [ ] Çakışma uyarıları gösteriliyor
- [ ] Linter hataları yok
- [ ] Commit & Push

**Tahmini Süre:** 4-5 saat

---

## 🎯 FAZ 2.3: GÜNLÜK PROGRAM

> **Tahmini Süre:** 3-4 saat  
> **Öncelik:** ORTA

### Adım 1: Backend API - Daily Lessons

**1.1. API Route: `src/app/api/daily-lessons/route.ts`**

```typescript
// GET /api/daily-lessons?date=2024-12-18&termId=xxx
// Response: DailyLesson[] (o günün tüm dersleri)
```

**1.2. API Route: `src/app/api/daily-lessons/[id]/complete/route.ts`**

```typescript
// POST /api/daily-lessons/{id}/complete
// Dersi tamamla, müfredat güncelle
```

### Adım 2: Yedek Eğitmen Öneri Sistemi

**2.1. API Route: `src/app/api/courses/[courseId]/suggest-substitute/route.ts`**

```typescript
// GET /api/courses/{courseId}/suggest-substitute?date=2024-12-18&hour=2
// Response: { substitutes: [...], recommendation: "..." }
```

**Öncelik Sırası:**
1. O dersin SUBSTITUTE eğitmenleri (priority sıralı)
2. Müsaitlik kontrolü (nöbet, çakışma yok)
3. Kendi dersinin ilerleme durumu (önemli!)

### Adım 3: Frontend - Günlük Program Sayfası

**3.1. Sayfa: `src/app/schedule/daily/page.tsx`**

**Özellikler:**
- Tarih seçici (date picker)
- Timeline görünümü (08:00 - 16:00)
- Her saat için tüm sınıflar listelenir
- Durum göstergesi:
  - ✓ Tamamlandı (yeşil)
  - ⏸ Bekliyor (sarı)
  - ❌ İptal (kırmızı)
  - ⚠️ Yedek atama gerekli (turuncu)

**3.2. Yedek Eğitmen Atama Modal**

- Önerilen yedekler listesi
- Manuel seçim
- Gerekçe girişi
- Kaydet

**3.3. Ders Tamamla Butonu**

- Dersi tamamla
- Yoklama entegrasyonu (gelecekte)
- Senkronizasyon onayı

### Adım 4: Test & Commit

- [ ] API route'ları test edildi
- [ ] Yedek öneri sistemi çalışıyor
- [ ] Timeline görünümü çalışıyor
- [ ] Yedek atama modal çalışıyor
- [ ] Ders tamamla butonu çalışıyor
- [ ] Linter hataları yok
- [ ] Commit & Push

**Tahmini Süre:** 3-4 saat

---

## 📋 GENEL YOL HARİTASI ÖZET

### Hafta 1: Temel Altyapı

**Gün 1-2: FAZ 2.1 (Dönem Ayarları)**
- ✅ TermSettings modeli
- ✅ TimeSlot seed/oluşturma
- ✅ Settings API
- ✅ Settings UI sayfası

**Gün 3-4: FAZ 2.2 Başlangıç (Haftalık Program - Backend)**
- ✅ Schedule API route'ları
- ✅ Çakışma kontrolü sistemi
- ✅ DailyLesson CRUD API'leri

**Gün 5: FAZ 2.2 Devam (Haftalık Program - Frontend)**
- ✅ Grid görünümü
- ✅ Ders atama modal
- ✅ Toplu işlem

### Hafta 2: Gelişmiş Özellikler

**Gün 6-7: FAZ 2.3 (Günlük Program)**
- ✅ Daily lessons API
- ✅ Yedek öneri sistemi
- ✅ Timeline görünümü
- ✅ Yedek atama modal

**Gün 8-9: Test & İyileştirmeler**
- ✅ End-to-end test
- ✅ Performans optimizasyonu
- ✅ UI/UX iyileştirmeleri
- ✅ Bug fix'ler

**Gün 10: Dokümantasyon & Deploy**
- ✅ README güncelleme
- ✅ API dokümantasyonu
- ✅ Deploy hazırlığı

---

## ⚠️ KRİTİK NOKTALAR

### 1. TimeSlot Yönetimi

- TimeSlot'lar TermSettings'e bağlı olmalı mı?
- Veya global TimeSlot'lar mı olmalı?
- **Öneri:** TermSettings'e bağlı, her dönem kendi saatlerini belirleyebilsin

### 2. Çakışma Kontrolü Karmaşıklığı

- Eğitmen çakışması: Basit (aynı timeSlot kontrolü)
- Lab çakışması: Basit (aynı timeSlot + requiresLab kontrolü)
- Nöbet kontrolü: Karmaşık (OfficerDuty tablosundan kontrol)

### 3. Performans

- 245 hücreli grid: Virtual scrolling gerekebilir
- Çakışma kontrolleri: Database index'leri önemli
- Real-time güncellemeler: WebSocket (v2.0)

### 4. Özel Etkinlikler Entegrasyonu

- YOKLAMA: Her Cuma 1. ders
- MÜDİRİYET: Her Cuma 7. ders
- Otomatik ekleme: Haftalık program oluşturulurken

---

## 🚀 BAŞLANGIÇ ADIMLARI

### 1. İlk Yapılacaklar (Bugün)

1. ✅ Bu yol haritasını oluştur
2. ⏳ TermSettings modeli ekle (prisma/schema.prisma)
3. ⏳ Migration çalıştır
4. ⏳ TimeSlot seed script oluştur
5. ⏳ Settings API route oluştur (GET, POST, PUT)

### 2. Yarın Yapılacaklar

1. ⏳ Settings UI sayfası
2. ⏳ TimeSlot otomatik oluşturma
3. ⏳ Test & Commit

### 3. Sonraki Adımlar

1. ⏳ FAZ 2.2'ye geç (Haftalık Program)

---

## 📝 NOTLAR

- **Öncelik:** FAZ 2.1 (Dönem Ayarları) mutlaka önce tamamlanmalı
- **Bağımlılık:** FAZ 2.2 ve 2.3, FAZ 2.1'e bağlı
- **Test:** Her faz sonunda mutlaka test edilmeli
- **Commit:** Her faz ayrı commit olmalı

---

**🎯 HEDEF:** 2 hafta içinde tam fonksiyonel ders programı modülü

**✅ BAŞARILI OLMA KRİTERLERİ:**
- Dönem ayarları kaydedilebiliyor
- Haftalık program oluşturulabiliyor
- Çakışma kontrolleri çalışıyor
- Günlük program görüntülenebiliyor
- Yedek eğitmen atanabiliyor

---

**Son Güncelleme:** 27 Aralık 2025  
**Durum:** Planlama Tamamlandı, Uygulamaya Hazır ✅

