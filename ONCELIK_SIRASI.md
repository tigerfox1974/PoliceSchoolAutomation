# 🎯 POLİS OKULU - ÖNCELİK SIRASI VE KALAN İŞLER

> **Son Güncelleme:** 26 Aralık 2025  
> **Durum:** Aktif Geliştirme  
> **Tamamlanma:** %15 (3/20 modül)

---

## 📊 GENEL İLERLEME

```
████░░░░░░░░░░░░░░░░ %15 Tamamlandı
```

**Tamamlanan Modüller:** 3/20
- ✅ Özel Etkinlikler (Special Events)
- ✅ Konferanslar (Conferences)
- ✅ Dıştan Gelen Eğitmenler (External Speakers)

**Devam Eden:** -
**Bekleyen:** 17 modül

---

## 🔥 PHASE 1: TEMEL MODÜLLER (1 Hafta - 5 Gün)

### ✅ Tamamlanan Alt Fazlar

#### FAZ 1.0: Özel Etkinlikler ve Konferanslar ✅
- ✅ `SpecialEvent` modeli (Veritabanı)
- ✅ `Conference` modeli (Veritabanı)
- ✅ `ExternalSpeaker` modeli (Veritabanı)
- ✅ API Routes oluşturuldu
- ✅ Sayfalar oluşturuldu
- ✅ Prisma generate çalıştırıldı
- ✅ Commit & Push yapıldı

**Tamamlanma:** %100  
**Süre:** 2 saat  
**Commit:** `35372f2` - "feat: Özel Etkinlikler, Konferanslar ve Dıştan Gelen Eğitmenler modülleri eklendi"

---

### 🔄 FAZ 1.1: DERSLER MODÜLÜ 🚨 **[ŞU AN BURADAYIZ]**

> **Kritik:** Bu modül olmadan ders programı yapılamaz!  
> **Tahmini Süre:** 4-5 saat  
> **Başlangıç:** 26 Aralık 2025

#### Backend - API Routes

- [x] **1.1.1** `POST /api/courses` - Ders oluştur ✅
  - Gerekli alanlar: name, code, fourMonthHours, sixMonthHours
  - Opsiyonel: requiresLab, programScope
  - Validasyon: code unique olmalı
  
- [x] **1.1.2** `GET /api/courses` - Tüm dersleri listele ✅
  - Filter: programScope (COMMON, POLIS_ONLY, ITFAIYE_ONLY)
  - Sort: name, code, hours
  - Include: parentCourse, subCourses
  
- [x] **1.1.3** `GET /api/courses/{id}` - Ders detayı ✅
  - Include: Alt dersler, atanmış eğitmenler
  
- [x] **1.1.4** `PUT /api/courses/{id}` - Ders güncelle ✅
  - Tüm alanlar güncellenebilir
  
- [x] **1.1.5** `DELETE /api/courses/{id}` - Ders sil ✅
  - Soft delete (isDeleted = true)
  - Kontrol: Aktif programda kullanılıyor mu?

#### Alt Ders Sistemi

- [x] **1.1.6** `POST /api/courses/{id}/sub-courses` - Alt ders ekle ✅
  - Parent ders ID'si ile bağlantı
  - Weight percentage (örn: %40, %60)
  
- [x] **1.1.7** `GET /api/courses/{id}/sub-courses` - Alt dersleri listele ✅

#### Frontend - UI Sayfaları

- [x] **1.1.8** `/courses` - Ana liste sayfası ✅
  - Kart görünümü (name, code, hours, lab, scope)
  - Filtreleme (programScope, requiresLab)
  - Arama (name, code)
  - "Yeni Ders" butonu
  
- [x] **1.1.9** `/courses/new` - Yeni ders oluştur ✅
  - Form alanları:
    * Ders Adı (string, required)
    * Ders Kodu (string, required, unique)
    * 4 Aylık Hedef Saat (number)
    * 6 Aylık Hedef Saat (number)
    * Lab Gerekli mi? (checkbox)
    * Program Kapsamı (dropdown: Ortak/Polis/İtfaiye)
  - Validasyon
  - Alert bildirimleri
  
- [x] **1.1.10** `/courses/{id}` - Ders detay sayfası ✅
  - Görüntüleme modu
  - Düzenleme formu
  - Alt ders listesi
  - Silme fonksiyonu
  
- [ ] **1.1.11** Alt ders modal komponenti
  - Parent derse alt ders ekleme
  - Weight percentage girişi

#### Test & Validasyon

- [ ] **1.1.12** Test dersleri oluştur
  - Ceza Yasası (40s/55s, Lab: Hayır, Kapsam: Polis)
  - Trafik (30s/40s, Lab: Hayır, Kapsam: Ortak)
  - Bilgisayar Kullanımı (20s/30s, Lab: Evet, Kapsam: Ortak)
  - İtfaiye Meslek Dersleri (60s/80s, Lab: Hayır, Kapsam: İtfaiye)
  
- [ ] **1.1.13** CRUD işlemlerini test et
- [ ] **1.1.14** Linter kontrolü
- [ ] **1.1.15** Commit & Push

**Beklenen Çıktı:**
```
✅ Dersler listesi görüntüleniyor
✅ Yeni ders oluşturulabiliyor
✅ Dersler düzenlenebiliyor
✅ Alt ders sistemi çalışıyor
✅ Lab ve program kapsamı işaretlenebiliyor
```

---

### 📋 FAZ 1.2: SINIFLAR MODÜLÜ

> **Tahmini Süre:** 2-3 saat  
> **Önkoşul:** Dönem oluşturulmuş olmalı

#### Backend - API Routes (Zaten Mevcut, Düzenleme Gerekebilir)

- [ ] **1.2.1** `GET /api/terms/{termId}/classes` (Var, test et)
- [ ] **1.2.2** `POST /api/terms/{termId}/classes` - Güncelle
  - Toplu sınıf oluşturma (A-F)
  - Bilgisayar Lab işaretleme
- [ ] **1.2.3** `PUT /api/terms/{termId}/classes/{id}` - Sınıf güncelle

#### Frontend - UI Sayfaları

- [ ] **1.2.4** `/terms/{termId}/classes` - Sınıf yönetimi sayfası
  - Sınıf listesi (A, B, C, D, E, F + Bilgisayar Lab)
  - Kapasite bilgisi
  - Program tipi (Polis/İtfaiye)
  - Lab işareti
  
- [ ] **1.2.5** "Sınıfları Otomatik Oluştur" butonu
  - A, B, C, D, E sınıfları → Polis (kapasite: 30)
  - F sınıfı → İtfaiye (kapasite: 30)
  - Bilgisayar Lab → Özel (kapasite: 30)
  
- [ ] **1.2.6** Sınıf düzenleme modal
- [ ] **1.2.7** Test & Commit

**Beklenen Çıktı:**
```
✅ 6 sınıf + 1 Lab tanımlanmış
✅ Program tipleri atanmış (Polis/İtfaiye)
✅ Lab işareti doğru
```

---

### 👨‍🏫 FAZ 1.3: EĞİTMENLER MODÜLÜ

> **Tahmini Süre:** 3-4 saat  
> **Önkoşul:** Dersler modülü tamamlanmış olmalı

#### Backend - API Routes

- [ ] **1.3.1** `GET /api/instructors` - Eğitmen listesi
  - Filter: type (STAFF, EXTERNAL), isActive
  - Include: courses (ana ve yedek)
  
- [ ] **1.3.2** `POST /api/instructors` - Eğitmen oluştur
  - Temel bilgiler (ad, soyad, email, telefon)
  - Tip (Kadrolu/Dış)
  - Unvan
  
- [ ] **1.3.3** `PUT /api/instructors/{id}` - Eğitmen güncelle
- [ ] **1.3.4** `DELETE /api/instructors/{id}` - Soft delete

#### Ders Ataması

- [ ] **1.3.5** `POST /api/courses/{courseId}/instructors` - Eğitmen ata
  - Role: MAIN (ana) veya SUBSTITUTE (yedek)
  - Priority (yedekler için sıralama)
  
- [ ] **1.3.6** `GET /api/courses/{courseId}/instructors` - Dersin eğitmenleri
- [ ] **1.3.7** `DELETE /api/courses/{courseId}/instructors/{instructorId}` - Atamayı kaldır

#### Frontend - UI Sayfaları

- [ ] **1.3.8** `/instructors` - Eğitmen listesi
  - Tablo görünümü
  - Filtreleme (Kadrolu/Dış)
  - Arama
  
- [ ] **1.3.9** `/instructors/new` - Yeni eğitmen formu
- [ ] **1.3.10** `/instructors/{id}` - Eğitmen detay
  - Atanmış dersler listesi
  - Ana dersler / Yedek dersler ayırımı
  
- [ ] **1.3.11** Ders atama modal komponenti
  - Ders seçimi (dropdown)
  - Rol seçimi (Ana/Yedek)
  - Öncelik (yedek ise)
  
- [ ] **1.3.12** Test & Commit

**Beklenen Çıktı:**
```
✅ Eğitmenler listelenebiliyor
✅ Yeni eğitmen eklenebiliyor
✅ Eğitmen → Ders ataması yapılabiliyor
✅ Ana ders / Yedek ders ayırımı var
```

---

## 🔥 PHASE 2: DERS PROGRAMI (1-2 Hafta)

### 📅 FAZ 2.1: DÖNEM AYARLARI

> **Tahmini Süre:** 2-3 saat

- [ ] **2.1.1** `TermSettings` modeli kontrolü (zaten var mı?)
- [ ] **2.1.2** `POST /api/terms/{termId}/settings` - Ayarları kaydet
  - İlk ders başlangıç saati
  - Ders süresi (45 dk)
  - Tenefüs süresi (15 dk)
  - Öğle yemeği süresi (60-90 dk)
  - ETÜD süresi (90 dk)
  
- [ ] **2.1.3** TimeSlot otomatik hesaplama algoritması
  - 1-5. dersler: firstLessonStart'tan başla
  - 5. dersten sonra öğle yemeği
  - 6-7. dersler: öğle yemeğinden sonra
  
- [ ] **2.1.4** `/terms/{termId}/settings` - Ayarlar sayfası
  - Form girişi
  - Hesaplanan saat dilimlerini önizleme
  
- [ ] **2.1.5** Test & Commit

---

### 📊 FAZ 2.2: HAFTALIK PROGRAM

> **Tahmini Süre:** 4-5 saat  
> **En Karmaşık Modül!**

#### Backend - Temel Yapı

- [ ] **2.2.1** `POST /api/terms/{termId}/schedule` - Program oluştur
  - Week number, year
  - ScheduleEntry kayıtları oluştur
  
- [ ] **2.2.2** `GET /api/terms/{termId}/schedule?week=X&year=Y`
  - Haftalık program getir
  - Include: class, course, instructor
  
- [ ] **2.2.3** `PUT /api/schedule-entries/{id}` - Ders değiştir
  - Eğitmen değiştirme
  - Ders değiştirme
  - Çakışma kontrolü

#### Çakışma Kontrolleri

- [ ] **2.2.4** Eğitmen çakışma kontrolü
  - Aynı anda iki derste olamaz
  
- [ ] **2.2.5** Bilgisayar Lab çakışma kontrolü
  - Aynı anda sadece 1 sınıf Lab'da olabilir
  
- [ ] **2.2.6** Nöbet kontrolü
  - Nöbet günü: Ders veremez
  - Nöbet ertesi: Ders veremez (dinlenme)

#### Frontend - Grid Görünümü

- [ ] **2.2.7** `/terms/{termId}/schedule` - Ana program sayfası
  - 7 (sınıf) × 5 (gün) × 7 (saat) = 245 hücre
  - Her hücre: Ders + Eğitmen
  - Renk kodları (Lab: mavi, Özel etkinlik: turuncu)
  
- [ ] **2.2.8** Ders atama modal
  - Sınıf seçili (hücreye tıklayınca)
  - Ders dropdown
  - Eğitmen dropdown (o ders için yetkililer)
  - Çakışma uyarısı (real-time)
  
- [ ] **2.2.9** Toplu işlem butonu
  - "Tüm A Sınıfına Ceza Yasası Ata" gibi
  
- [ ] **2.2.10** Çakışma uyarı modal
  - Lab çakışması
  - Eğitmen çakışması
  - Nöbet uyarısı
  
- [ ] **2.2.11** Test & Commit

---

### 📆 FAZ 2.3: GÜNLÜK PROGRAM

> **Tahmini Süre:** 3-4 saat

#### Backend - DailyLesson İşlemleri

- [ ] **2.3.1** `GET /api/daily-lessons?date=YYYY-MM-DD`
  - O günün tüm dersleri
  - Status: PLANNED, COMPLETED, CANCELLED
  
- [ ] **2.3.2** `PUT /api/daily-lessons/{id}` - Güncelle
  - actualInstructorId (yedek atama)
  - actualCourseId (ders değişikliği)
  - status değiştirme
  
- [ ] **2.3.3** `POST /api/daily-lessons/{id}/complete` - Dersi tamamla
  - Yukarı senkronizasyon tetikle
  - Müfredat güncelle

#### Otomatik Yedek Atama

- [ ] **2.3.4** `GET /api/courses/{courseId}/suggest-substitute`
  - Öncelik sıralı yedek listesi
  - Müsaitlik kontrolü
  
- [ ] **2.3.5** Otomatik atama algoritması
  - Nöbet kontrolü
  - Yedek varsa ata
  - Yoksa uyarı ver

#### Frontend - Günlük Görünüm

- [ ] **2.3.6** `/schedule/daily?date=YYYY-MM-DD` - Günlük sayfa
  - Timeline görünümü (08:00 - 16:00)
  - Her saat için tüm sınıflar
  - Durum göstergesi (✓ Tamamlandı, ⏸ Bekliyor, ❌ İptal)
  
- [ ] **2.3.7** Yedek eğitmen atama modal
  - Önerilen yedekler listesi
  - Manuel seçim
  - Gerekçe girişi
  
- [ ] **2.3.8** Ders tamamla butonu
  - Yoklama entegrasyonu
  - Senkronizasyon onayı
  
- [ ] **2.3.9** Test & Commit

---

## 🤖 PHASE 3: OTOMATIK PLANLAMA (1 Hafta)

### 🧮 FAZ 3.1: DÖNEM PLANI OTOMATİK OLUŞTURMA

> **Tahmini Süre:** 3-4 saat

- [ ] **3.1.1** `TermCoursePlan` modeli kontrolü
- [ ] **3.1.2** Ağırlık hesaplama algoritması
- [ ] **3.1.3** Çalışma günü hesaplama (sınav haftaları hariç)
- [ ] **3.1.4** Aylık dağılım algoritması
- [ ] **3.1.5** API: `POST /api/terms/{termId}/plan/generate`
- [ ] **3.1.6** UI: "Otomatik Plan Oluştur" butonu
- [ ] **3.1.7** Önizleme modal
- [ ] **3.1.8** Test & Commit

---

### 🔄 FAZ 3.2: VAGON ROTASYON ALGORİTMASI

> **Tahmini Süre:** 4-5 saat

- [ ] **3.2.1** Eğitmen rotasyon algoritması
  - A → B → C → D → E → F sıralı geçiş
  - Lab'da olan sınıfı atla
  - Müfredat dışı sınıfı atla
  
- [ ] **3.2.2** Program kapsamı filtresi
  - POLIS_ONLY → Sadece A-E
  - ITFAIYE_ONLY → Sadece F
  - COMMON → Tüm sınıflar
  
- [ ] **3.2.3** Blok ders optimizasyonu
  - Mümkünse 2 saat üst üste
  
- [ ] **3.2.4** Test & Commit

---

### 📈 FAZ 3.3: MÜFREDAT TAKİBİ

> **Tahmini Süre:** 2-3 saat

- [ ] **3.3.1** İş yükü vs Müfredat ayrımı
  - Eğitmen: 6 sınıfa ders verdi → 6 saat iş
  - Müfredat: Aynı konu → 1 saat ilerleme
  
- [ ] **3.3.2** `InstructorWorkload` modeli
- [ ] **3.3.3** Haftalık/Aylık senkronizasyon
- [ ] **3.3.4** İlerleme raporu API
- [ ] **3.3.5** Test & Commit

---

## 📊 PHASE 4: RAPORLAMA VE DASHBOARD (3-4 Gün)

- [ ] **4.1** Dashboard widget'ları
- [ ] **4.2** Dönem ilerleme raporu
- [ ] **4.3** Eğitmen iş yükü raporu
- [ ] **4.4** Lab kullanım raporu
- [ ] **4.5** PDF/Excel export
- [ ] **4.6** Test & Commit

---

## 🐛 PHASE 5: TEST VE DÜZELTMELER (1 Hafta)

- [ ] **5.1** End-to-end test senaryoları
- [ ] **5.2** Performans optimizasyonu
- [ ] **5.3** Hata düzeltmeleri
- [ ] **5.4** UI/UX iyileştirmeleri
- [ ] **5.5** Dokümantasyon

---

## 📝 NOTLAR

### Kritik Kararlar
- ✅ Özel Etkinlikler önce yapıldı (çünkü basit)
- ✅ Şimdi Dersler → Sınıflar → Eğitmenler → Program sırası
- ⚠️ Otomatik planlama en sona bırakıldı (manuel önce çalışmalı)

### Teknik Borçlar
- WebSocket entegrasyonu (gerçek zamanlı güncelleme) → v2.0
- Gelişmiş raporlama → v2.0
- Mobil görünüm optimizasyonu → v2.0

### Risk Alanları
- Haftalık program grid'i (245 hücre) → Performans?
- Çakışma kontrolleri → Karmaşık?
- Otomatik algoritma → Test süresi uzun?

---

## ✅ KABUL KRİTERLERİ

Her faz tamamlandığında:
- [ ] Tüm API'ler test edildi (Postman/Thunder Client)
- [ ] UI fonksiyonel ve hatasız
- [ ] Linter hataları yok
- [ ] Commit mesajı detaylı ve Türkçe
- [ ] README güncellendi (gerekirse)

---

**📌 ŞU ANKİ HEDEF:** FAZ 1.1 - Dersler Modülü (4-5 saat)

**🚀 BAŞLA!**

