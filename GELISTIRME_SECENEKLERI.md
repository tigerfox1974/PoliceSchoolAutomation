# HAFTALIK PROGRAM GELİŞTİRME SEÇENEKLERİ

## 🎯 Yapılacak Geliştirmeler

### 1. Beden Eğitimi Özel Kuralı
**Durum:** Beden eğitimi genelde Perşembe günü 6-7. ders saatlerine yazılır.

**Seçenekler:**

#### SEÇENEK: Öncelikli Rezervasyon (ONAYLANDI)
- **Açıklama:** Beden eğitimi dersinin toplam ders saati kadar her hafta Perşembe 6-7. ders saatleri rezerve edilir
- **Mantık:** 
  - Beden eğitimi dersi varsa → Perşembe 6-7. ders saatlerini önce rezerve et
  - Toplam ders saati kadar her hafta bu saatler ayrılır
  - Diğer dersler bu saatleri dolu bilerek dağıtılır
  - Bu saatler dolu olma gibi bir durum söz konusu olmayacak
- **Avantaj:** Kesin kural, diğer dersler için net
- **Uygulama:** Beden eğitimi önce yazılır, sonra diğer dersler dağıtılır

**ONAY:** ✓ Kullanıcı onayladı

---

### 2. Resmi Tatiller (KKTC)

**Durum:** Resmi tatil günlerinde ders yazılmamalı.

**Seçenekler:**

#### SEÇENEK: Holiday Modeli + UI (ONAYLANDI)
- **Açıklama:** Veritabanında `Holiday` modeli oluştur, kullanıcı arayüzü ile tüm resmi tatilleri belirler ve işler
- **Model Yapısı:**
  ```prisma
  model Holiday {
    id          String   @id @default(cuid())
    termId      String
    term        Term     @relation(fields: [termId], references: [id], onDelete: Cascade)
    date        DateTime @db.Date
    endDate     DateTime? @db.Date // Aralık tatiller için
    description String    // "23 Nisan", "Ramazan Bayramı 1. Gün"
    holidayType String    @default("NATIONAL") // NATIONAL, RELIGIOUS, TERM_BREAK
    isRange     Boolean   @default(false) // Tek gün mü, aralık mı?
    createdAt   DateTime  @default(now())
    updatedAt   DateTime  @updatedAt
    
    @@index([termId])
    @@index([date])
  }
  ```
- **API Endpoints:**
  - `GET /api/terms/[termId]/holidays` - Tatil listesi
  - `POST /api/terms/[termId]/holidays` - Tatil ekle
  - `PUT /api/holidays/[id]` - Tatil güncelle
  - `DELETE /api/holidays/[id]` - Tatil sil
- **UI:** Dönem sayfasında "Resmi Tatiller" bölümü, form ile ekleme
- **Algoritma:** 
  - Haftalık program oluşturulurken `Holiday` tablosu kontrol edilir
  - Sistem hangi günlerin tatil olduğunu bilir ve dersleri ona göre dağıtır
  - Tek gün veya aralık (başlangıç-bitiş tarihi) desteklenir
- **Avantaj:** Esnek, her dönem için farklı tatiller, kullanıcı kontrolü

**ONAY:** ✓ Kullanıcı onayladı

---

### 3. Sınav Haftaları

**Durum:** Sınav haftalarında ders yazılmamalı. Sınav haftası bir haftanın içinde başlayıp diğer haftaya kadar devam edebilir.

**Seçenekler:**

#### SEÇENEK A: ExamSchedule Modeli Oluştur (Önerilen)
- **Açıklama:** Veritabanında `ExamSchedule` modeli oluştur, başlangıç-bitiş tarihi ile
- **Model Yapısı:**
  ```prisma
  model ExamSchedule {
    id          String   @id @default(cuid())
    termId      String
    term        Term     @relation(fields: [termId], references: [id], onDelete: Cascade)
    examType    ExamType // MIDTERM, FINAL
    startDate   DateTime @db.Date
    endDate     DateTime @db.Date
    description String?  @db.Text
    blocksLessons Boolean @default(true) // Sınav haftası ders yapılmaz
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    
    @@index([termId])
    @@index([startDate, endDate])
  }
  ```
- **API Endpoints:**
  - `GET /api/terms/[termId]/exam-schedules` - Sınav listesi
  - `POST /api/terms/[termId]/exam-schedules` - Sınav ekle
  - `PUT /api/exam-schedules/[id]` - Sınav güncelle
  - `DELETE /api/exam-schedules/[id]` - Sınav sil
- **UI:** Dönem sayfasında "Sınav Haftaları" bölümü, form ile ekleme
- **Algoritma:** 
  - Haftalık program oluşturulurken `ExamSchedule` tablosu kontrol edilir
  - `startDate` ve `endDate` arasındaki tüm günler atlanır
  - Hafta sınırlarını aşabilir (örn: Çarşamba başlar, Salı biter)
- **Avantaj:** Esnek, her dönem için farklı sınav tarihleri
- **Dezavantaj:** Manuel giriş gerektirir

#### SEÇENEK B: TermSettings içinde JSON
- **Açıklama:** `TermSettings` modelinde `examWeeks` JSON alanı kullanılır (zaten var)
- **Mantık:** 
  - Sınav haftaları JSON formatında saklanır
  - `[{ startDate: "2024-11-01", endDate: "2024-11-05", type: "MIDTERM" }]`
- **Avantaj:** Ekstra model gerekmez
- **Dezavantaj:** JSON sorgulama zor, ilişkisel veri yok

**Öneri:** SEÇENEK A (ExamSchedule Modeli) - Daha temiz ve sorgulanabilir

---

## 📋 Uygulama Planı

### Adım 1: Beden Eğitimi Kuralı
1. `generateWeekProgram` fonksiyonunda beden eğitimi kontrolü ekle
2. Ders adı "BEDEN EĞİTİMİ" içeriyorsa → Perşembe 6-7. ders saatlerini önce kontrol et
3. Müsaitse oraya yaz, değilse normal algoritma ile devam et

### Adım 2: Holiday Modeli
1. `prisma/schema.prisma` dosyasına `Holiday` modeli ekle
2. Migration çalıştır
3. API endpoints oluştur (`/api/terms/[termId]/holidays`)
4. UI: Dönem sayfasına "Resmi Tatiller" bölümü ekle
5. Haftalık program algoritmasında `Holiday` kontrolü ekle

### Adım 3: ExamSchedule Modeli
1. `prisma/schema.prisma` dosyasına `ExamSchedule` modeli ekle
2. Migration çalıştır
3. API endpoints oluştur (`/api/terms/[termId]/exam-schedules`)
4. UI: Dönem sayfasına "Sınav Haftaları" bölümü ekle
5. Haftalık program algoritmasında `ExamSchedule` kontrolü ekle

---

## ✅ Onay Beklenen Kararlar

1. **Beden Eğitimi:** SEÇENEK A (Otomatik Tercih) ✓
2. **Resmi Tatiller:** SEÇENEK A (Holiday Modeli) ✓
3. **Sınav Haftaları:** SEÇENEK A (ExamSchedule Modeli) ✓

**Onayınızı bekliyorum, sonrasında uygulamaya başlayacağım.**

