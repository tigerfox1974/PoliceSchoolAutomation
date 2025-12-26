# 🎯 POLİS OKULU - ÖNCELİK SIRASI VE KALAN İŞLER

> **Son Güncelleme:** 26 Aralık 2025 - 20:30  
> **Durum:** Aktif Geliştirme  
> **Tamamlanma:** %30 (6/20 modül)  
> **Bugünkü İlerleme:** 3 FAZ, 20+ commit, 3000+ satır kod

---

## 📊 GENEL İLERLEME

```
██████░░░░░░░░░░░░░░ %30 Tamamlandı
```

**Tamamlanan Modüller:** 6/20
- ✅ Dönem Yönetimi (Terms) - TAM ÖZELLİKLİ
- ✅ Dersler (Courses) - TAM ÖZELLİKLİ + 27 Ders
- ✅ Sınıflar (Classes) - TEMEL + Otomatik Oluşturma
- ✅ Özel Etkinlikler (Special Events)
- ✅ Konferanslar (Conferences)
- ✅ Dıştan Gelen Eğitmenler (External Speakers)

**Devam Eden:** Eğitmenler Modülü (Temel hazır, ders ataması bekleniyor)
**Bekleyen:** 14 modül

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

### ✅ FAZ 1.1: DERSLER MODÜLÜ - TAMAMLANDI! ✅

> **Tamamlanma:** 26 Aralık 2025 - 20:05  
> **Süre:** ~2 saat  
> **Durum:** %100 Tamamlandı
> **Özellikler:** CRUD, Alt Dersler, Filtreler, Sıralama, Kart/Liste, Modal, Toast

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

- [x] **1.1.12** Test dersleri oluştur ✅
  - 27 gerçek ders eklendi (66. Dönem + İtfaiye)
  - Polis: 16, İtfaiye: 6, Ortak: 5
  - Lab dersleri: 3 (BDP, BLG, EBYS)
  
- [x] **1.1.13** CRUD işlemlerini test et ✅
- [x] **1.1.14** Linter kontrolü ✅
- [x] **1.1.15** Commit & Push ✅

**Çıktı:**
```
✅ 27 ders başarıyla eklendi
✅ Alt ders sistemi çalışıyor (TAL101 → 6 alt ders)
✅ Program kapsamı doğru (Polis/İtfaiye/Ortak)
✅ Lab işaretlemesi doğru (3 ders)
✅ API'ler hatasız çalışıyor
```

**Commit:** `38ddbb1` - İtfaiye dersleri ve alt ders sistemi

---

### ✅ FAZ 1.2: SINIFLAR MODÜLÜ - TAMAMLANDI! ✅

> **Tamamlanma:** 26 Aralık 2025 - 20:22  
> **Süre:** 15 dakika  
> **Durum:** %100 Tamamlandı (Temel özellikler)

#### Backend - API Routes

- [x] **1.2.1** `GET /api/terms/{termId}/classes` ✅ (Zaten vardı)
- [x] **1.2.2** `POST /api/terms/{termId}/classes` ✅ (Zaten vardı)

#### Frontend - UI Sayfaları

- [x] **1.2.4** `/terms/{termId}/classes` - Sınıf yönetimi sayfası ✅
  - Modern kart tasarımı
  - Kapasite ve doluluk göstergesi
  - Progress bar (öğrenci doluluk oranı)
  - Lab ikonu (Bilgisayar Lab için)
  
- [x] **1.2.5** "Standart Sınıfları Otomatik Oluştur" butonu ✅
  - Tek tıkla 7 sınıf (A, B, C, D, E, F + Lab)
  - Her biri 30 kapasite
  - Toast bildirimleri
  
**Çıktı:**
```
✅ Otomatik sınıf oluşturma çalışıyor
✅ Doluluk göstergesi ve progress bar
✅ Modern kart tasarımı
✅ Toast bildirimleri
```

**Commit:** `e02470f` - Classes module with auto-create

---

### 🔄 FAZ 1.3: EĞİTMENLER MODÜLÜ - TEMEL TAMAMLANDI (60%)

> **Başlangıç:** 26 Aralık 2025 - 20:22  
> **Durum:** Temel özellikler hazır, ders ataması bekleniyor

#### Backend - API Routes

- [x] **1.3.1** `GET /api/instructors` - Eğitmen listesi ✅
  - Filter: type (CADRE, EXTERNAL), isActive
  - Soft delete filter
  
- [x] **1.3.2** `POST /api/instructors` - Eğitmen oluştur ✅
  - Temel bilgiler (TC, ad, soyad, email, telefon)
  - Tip (Kadrolu/Dış Kaynak)
  - Rütbe (Kadrolu için)
  - Kurum (Dış Kaynak için)
  
- [x] **1.3.3** `PUT /api/instructors/{id}` - Eğitmen güncelle ✅
- [x] **1.3.4** `DELETE /api/instructors/{id}` - Soft delete ✅

#### Ders Ataması (BEKLEYEN)

- [ ] **1.3.5** `POST /api/courses/{courseId}/instructors` - Eğitmen ata
  - Role: MAIN (ana) veya SUBSTITUTE (yedek)
  - Priority (yedekler için sıralama)
  
- [ ] **1.3.6** `GET /api/courses/{courseId}/instructors` - Dersin eğitmenleri
- [ ] **1.3.7** `DELETE /api/courses/{courseId}/instructors/{instructorId}` - Atamayı kaldır

#### Frontend - UI Sayfaları

- [x] **1.3.8** `/instructors` - Eğitmen listesi ✅
  - Kart görünümü (avatar, badges)
  - Filtreleme (Kadrolu/Dış Kaynak)
  - İşlem butonları (Detay, Düzenle)
  
- [ ] **1.3.9** `/instructors/new` - Yeni eğitmen formu (BEKLEYEN)
- [ ] **1.3.10** `/instructors/{id}` - Eğitmen detay (BEKLEYEN)
  - Atanmış dersler listesi
  - Ana dersler / Yedek dersler ayırımı
  
- [ ] **1.3.11** Ders atama modal komponenti (BEKLEYEN)
  - Ders seçimi (dropdown)
  - Rol seçimi (Ana/Yedek)
  - Öncelik (yedek ise)

**Tamamlanan:**
```
✅ CRUD API'leri hazır
✅ Liste sayfası çalışıyor
✅ Kart görünümü modern
✅ Filtreleme ve badges
✅ Soft delete çalışıyor
```

**Bekleyen:**
```
⏳ Yeni eğitmen formu
⏳ Detay sayfası
⏳ Ders atama sistemi
```

**Commit:** `a90270c` - Instructors module basic

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

---

## 🎊 BUGÜNKÜ TAMAMLANANLAR (26 Aralık 2025)

### ✅ **Ana Başarılar:**

**1. Dersler Modülü (TAM ÖZELLİKLİ):**
- ✅ CRUD API'leri
- ✅ 27 gerçek ders eklendi (66. Dönem Polis + İtfaiye)
- ✅ Alt ders sistemi (TAL101 → 6 alt ders, %100 ağırlık kontrolü)
- ✅ Kart ve Liste görünümü
- ✅ Gelişmiş filtreleme (Program, Lab, Saat aralığı)
- ✅ Sıralama (6 farklı kriter)
- ✅ Modal ve Toast sistemi
- ✅ Modüler yapı (features/courses)

**2. Sınıflar Modülü:**
- ✅ API zaten vardı (yeniden kullanıldı)
- ✅ Sınıf yönetim sayfası
- ✅ Otomatik 7 sınıf oluşturma (A-F + Lab)
- ✅ Doluluk göstergesi ve progress bar

**3. Eğitmenler Modülü (Temel):**
- ✅ CRUD API'leri
- ✅ Liste sayfası
- ✅ Kart görünümü
- ✅ Tip filtreleme (Kadrolu/Dış)
- ⏳ Ders ataması bekleniyor

**4. Ana Sayfa Dashboard:**
- ✅ Modern dashboard tasarımı
- ✅ 9 modül kartı (6 aktif, 3 yakında)
- ✅ İstatistik banner
- ✅ Hızlı erişim linkleri
- ✅ Hover animasyonları

**5. Kritik Düzeltmeler:**
- ✅ Soft delete tüm modüllerde (Terms, Courses, Instructors)
- ✅ Foreign key sorunları çözüldü
- ✅ isDeleted filtreleri eklendi

**6. UI/UX İyileştirmeleri:**
- ✅ Tutarlı tablo tasarımı (Terms ve Courses aynı)
- ✅ ConfirmDialog tüm silme işlemlerinde
- ✅ Toast bildirimleri (alert() yerine)
- ✅ Tooltip'ler işlem butonlarında
- ✅ Modüler component yapısı

---

### 📊 **Bugünkü İstatistikler:**

**Commit Sayısı:** 20+  
**Toplam Satır:** 3000+ satır  
**Süre:** ~3 saat  
**Dosya Sayısı:** 30+ yeni dosya

**Önemli Commit'ler:**
- `35372f2` - Özel Etkinlikler, Konferanslar
- `ab9c62e` - Courses Backend API
- `38ddbb1` - 27 gerçek ders + alt dersler
- `bcecc56` - Gelişmiş filtreleme
- `5d4f701` - Terms liste modern tasarım
- `12a8e67` - Modal ve Toast sistemi
- `e8fec48` - Ana sayfa dashboard
- `e02470f` - Classes modülü
- `d8ecfcf` - Soft delete kritik düzeltme
- `dd4ed0a` - Instructors aktif edildi

---

**📌 ŞU ANKİ HEDEF:** Eğitmen verilerini sisteme ekle, sonra FAZ 2'ye geç

**🚀 HAZIR!**

