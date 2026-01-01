 # 🚀 POLİS OKULU - İMPLEMENTASYON PLANI

> **Durum:** Aktif Geliştirme  
> **Başlangıç:** 25 Aralık 2025  
> **Hedef Süre:** 20-26 iş günü (4-5 hafta)  
> **Referans Doküman:** DERS_PROGRAMI_GEREKSINIMLER.md

---

## 📊 GENEL İLERLEME

- [ ] **FAZ 0:** Veritabanı ve Temel Yapı (3-4 gün)
- [ ] **FAZ 1:** Özel Etkinlikler Yönetimi (4-5 gün)
- [ ] **FAZ 2:** Blok Ders ve Fiziksel Alan (3-4 gün)
- [ ] **FAZ 3:** Günlük Program Entegrasyonu (4-5 gün)
- [ ] **FAZ 4:** Senkronizasyon (3-4 gün)
- [ ] **FAZ 5:** Raporlama ve Dashboard (3-4 gün)

---

# FAZ 0: VERİTABANI VE TEMEL YAPI (3-4 Gün)

**Hedef:** Yeni modelleri Prisma şemasına ekle ve veritabanını hazırla

## ✅ TAMAMLANAN ADIMLAR

_Bu bölüm tamamlanan adımlar için kullanılacak_

---

## 🔄 DEVAM EDEN ADIMLAR

### ADIM 0.1: Mevcut Prisma Şemasını İncele

**Amaç:** Mevcut yapıyı anla, nereye ekleme yapılacağını belirle

**Yapılacaklar:**
- [ ] `prisma/schema.prisma` dosyasını aç
- [ ] Mevcut modelleri listele
- [ ] İlişkileri not et

**Komut:**
```powershell
# Prisma şemasını görüntüle
Get-Content prisma/schema.prisma
```

**Beklenen Mevcut Modeller:**
- Term
- Class
- Course
- Instructor
- ScheduleEntry
- DailyLesson (mevcut hali)
- Attendance
- Holiday
- DutySchedule

---

### ADIM 0.2: SpecialEvent Modelini Ekle

**Amaç:** YOKLAMA, MÜDİRİYET gibi özel etkinlikleri yönet

**Prisma Schema'ya Eklenecek Kod:**

```prisma
// ===================================
// ÖZEL ETKİNLİKLER SİSTEMİ
// ===================================

enum SpecialEventType {
  YOKLAMA           // Her Cuma 1. ders (opsiyonel)
  MANAGEMENT        // Her Cuma 7. ders (Müdüriyet)
  SOCIAL_SPORTS     // Sosyal ve Sportif Faaliyetler
  CEREMONY          // Törenler
  ORIENTATION       // İntibak Haftası
  OTHER             // Diğer
}

model SpecialEvent {
  id                     String             @id @default(uuid())
  eventType              SpecialEventType
  eventTitle             String
  description            String?            @db.Text
  duration               Int                @default(1) // Kaç ders saati
  
  // Zamansal bilgiler
  dayOfWeek              Int?               // 1=Pazartesi, 5=Cuma (NULL=tüm günler için)
  slotIndex              Int?               // Hangi ders saati (1-7, NULL=değişken)
  
  // Özellikler
  requiresInstructor     Boolean            @default(false) // Eğitmen ataması gerekli mi?
  allClassesTogether     Boolean            @default(false) // Tüm sınıflar birlikte mi?
  countsTowardCurriculum Boolean            @default(false) // Müfredattan sayılır mı?
  
  // Yönetimsel bilgiler
  managedBy              String?            // "Okul Müdürü", "Eğitmen Gözetmenliği"
  notes                  String?            @db.Text
  
  // İlişkiler
  dailyLessons           DailyLesson[]
  
  createdAt              DateTime           @default(now())
  updatedAt              DateTime           @updatedAt
  
  @@index([eventType])
  @@index([dayOfWeek, slotIndex])
}
```

**Yapılacaklar:**
- [ ] Yukarıdaki kodu `prisma/schema.prisma` dosyasına ekle
- [ ] Dosyayı kaydet

**Ekleme Yeri:**
- `DutySchedule` modelinden **sonra**
- `// Future Models` yorumundan **önce**

---

### ADIM 0.3: ExternalSpeaker Modelini Ekle

**Amaç:** Dış konuşmacıları yönet

**Prisma Schema'ya Eklenecek Kod:**

```prisma
// ===================================
// DIŞ KONUŞMACILAR SİSTEMİ
// ===================================

model ExternalSpeaker {
  id              String       @id @default(uuid())
  firstName       String
  lastName        String
  title           String?      // "Prof. Dr.", "Doç. Dr.", "Uzman"
  organization    String?      // "İstanbul Üniversitesi", "Emniyet Müdürlüğü"
  department      String?      // "Yangın Mühendisliği", "Hukuk Fakültesi"
  
  // İletişim
  email           String?      @unique
  phone           String?
  address         String?      @db.Text
  
  // Uzmanlık Alanları (JSON array)
  expertise       Json?        // ["Yangın Güvenliği", "Afet Yönetimi"]
  bio             String?      @db.Text
  
  // İlişkiler
  conferences     Conference[]
  
  // Yönetim
  isActive        Boolean      @default(true)
  notes           String?      @db.Text
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([lastName, firstName])
  @@index([organization])
  @@index([isActive])
}
```

**Yapılacaklar:**
- [ ] Yukarıdaki kodu `prisma/schema.prisma` dosyasına ekle
- [ ] `SpecialEvent` modelinden **sonra** ekle

---

### ADIM 0.4: Conference Modelini Ekle

**Amaç:** Konferansları yönet

**Prisma Schema'ya Eklenecek Kod:**

```prisma
// ===================================
// KONFERANS SİSTEMİ
// ===================================

enum ConferenceStatus {
  PLANNED
  CONFIRMED
  COMPLETED
  CANCELLED
}

model Conference {
  id                     String            @id @default(uuid())
  conferenceTitle        String
  topic                  String            @db.Text
  description            String?           @db.Text
  
  // Konuşmacı Bilgileri
  externalSpeakerId      String?
  externalSpeaker        ExternalSpeaker?  @relation(fields: [externalSpeakerId], references: [id], onDelete: SetNull)
  
  // Zamansal bilgiler
  scheduledDate          DateTime?         @db.Date
  duration               Int               @default(2) // Genellikle çift ders (2 saat)
  startSlot              Int?              // Başlangıç ders saati (genellikle 6)
  endSlot                Int?              // Bitiş ders saati (genellikle 7)
  
  // Hedef kitle (JSON array)
  targetClasses          Json?             // ["A", "B", "C"] veya ["ALL"]
  isAllClasses           Boolean           @default(false)
  
  // Yer ve ekipman
  requiresSpecialRoom    Boolean           @default(false)
  specialRoomType        String?           // "AUDITORIUM", "CONFERENCE_HALL"
  requiredEquipment      Json?             // ["Projeksiyon", "Ses Sistemi"]
  
  // Müfredat
  countsTowardCurriculum Boolean           @default(false)
  courseId               String?           // Hangi ders müfredatına sayılır (varsa)
  course                 Course?           @relation(fields: [courseId], references: [id], onDelete: SetNull)
  
  // İlişkiler
  dailyLessons           DailyLesson[]
  
  // Yönetim
  status                 ConferenceStatus  @default(PLANNED)
  organizerId            String?           // Organize eden kullanıcı ID
  notes                  String?           @db.Text
  
  createdAt              DateTime          @default(now())
  updatedAt              DateTime          @updatedAt
  
  @@index([scheduledDate])
  @@index([status])
  @@index([externalSpeakerId])
  @@index([courseId])
}
```

**Yapılacaklar:**
- [ ] Yukarıdaki kodu `prisma/schema.prisma` dosyasına ekle
- [ ] `ExternalSpeaker` modelinden **sonra** ekle

---

### ADIM 0.5: DailyLesson Modelini Güncelle

**Amaç:** Özel etkinlik, blok ders, fiziksel aktivite alanlarını ekle

**Mevcut DailyLesson Modelini Bul ve Güncelle:**

**EKLEME YERİ:** Mevcut `DailyLesson` modelinin içine aşağıdaki alanları ekle

```prisma
model DailyLesson {
  // ... mevcut alanlar ...
  
  // ⭐ ÖZEL ETKİNLİK ALANLARI (YENİ)
  isSpecialEvent         Boolean           @default(false)
  specialEventId         String?
  specialEvent           SpecialEvent?     @relation(fields: [specialEventId], references: [id], onDelete: SetNull)
  conferenceId           String?
  conference             Conference?       @relation(fields: [conferenceId], references: [id], onDelete: SetNull)
  
  // ⭐ BLOK DERS SİSTEMİ (YENİ)
  isBlockSchedule        Boolean           @default(false)
  blockDuration          Int?              // Blok ders ise kaç saat (3-5)
  blockTitle             String?           // "İTFAİYE MESLEK DERSLERİ"
  blockStartSlot         Int?              // Bloğun başlangıç slotu (1-7)
  blockEndSlot           Int?              // Bloğun bitiş slotu (1-7)
  
  // ⭐ FİZİKSEL AKTİVİTE DERSLERİ (YENİ)
  isPhysicalActivity     Boolean           @default(false)
  requiresSpecialArea    Boolean           @default(false) // Spor salonu, atölye, açık alan
  specialAreaType        String?           // "GYM", "WORKSHOP", "OUTDOOR", "LAB"
  
  // ... mevcut alanlar devam eder ...
}
```

**Yapılacaklar:**
- [ ] Mevcut `DailyLesson` modelini bul
- [ ] Yukarıdaki alanları ekle
- [ ] `plannedInstructorId` ve `actualInstructorId` alanlarını `String?` (nullable) yap

**Değiştir:**
```prisma
plannedInstructorId  String
actualInstructorId   String
```

**Şuna:**
```prisma
plannedInstructorId  String?  // Nullable - Özel etkinlikler için gerekli değil
actualInstructorId   String?  // Nullable - Özel etkinlikler için gerekli değil
```

**İndeksleri Ekle:**
```prisma
@@index([isSpecialEvent])
@@index([isBlockSchedule])
@@index([specialEventId])
@@index([conferenceId])
```

---

### ADIM 0.6: TermSettings Modelini Güncelle

**Amaç:** ETÜD saati süresini ekle

**Bul ve Ekle:**

```prisma
model TermSettings {
  // ... mevcut alanlar ...
  
  lunchBreakDuration Int      @default(60)      // Öğle yemeği süresi (dakika)
  etudDuration       Int      @default(90)      // YENİ: ETÜD süresi (dakika)
  
  // ... devam eder ...
}
```

**Yapılacaklar:**
- [ ] `TermSettings` modelini bul
- [ ] `etudDuration` alanını ekle

---

### ADIM 0.7: Course Modelini Güncelle

**Amaç:** Conference ilişkisini ekle

**Bul ve Ekle:**

```prisma
model Course {
  // ... mevcut alanlar ...
  
  termCoursePlans       TermCoursePlan[]
  courseInstructors     CourseInstructor[]
  conferences           Conference[]       // YENİ: Bu derse bağlı konferanslar
  
  // ... devam eder ...
}
```

**Yapılacaklar:**
- [ ] `Course` modelini bul
- [ ] `conferences` ilişkisini ekle

---

### ADIM 0.8: Migration Hazırla ve Çalıştır

**Amaç:** Veritabanına yeni tabloları ve alanları ekle

**Komutlar:**

```powershell
# 1. Migration dosyası oluştur (önce kontrol et)
npx prisma migrate dev --name add_special_events_system --create-only

# 2. Migration dosyasını incele
# prisma/migrations/<timestamp>_add_special_events_system/migration.sql

# 3. Sorun yoksa migration'ı uygula
npx prisma migrate dev

# 4. Prisma Client'ı yeniden oluştur
npx prisma generate
```

**Yapılacaklar:**
- [ ] Migration oluştur (--create-only ile)
- [ ] SQL dosyasını incele
- [ ] Migration'ı uygula
- [ ] Client'ı generate et

**Beklenen Çıktı:**
```
✔ Generated Prisma Client
✔ The migration has been applied successfully

The following migration(s) have been applied:

migrations/
  └─ 20251225XXXXXX_add_special_events_system/
    └─ migration.sql
```

**Olası Hatalar ve Çözümler:**

**Hata 1:** "Prisma schema validation failed"
- **Çözüm:** Syntax hatası var, modelleri tekrar kontrol et
- **Komut:** `npx prisma validate`

**Hata 2:** "Foreign key constraint failed"
- **Çözüm:** İlişkilerde hata var, relation alanlarını kontrol et

**Hata 3:** "Column already exists"
- **Çözüm:** Migration önceden çalıştırılmış, reset gerekebilir
- **Komut:** `npx prisma migrate reset` (DİKKAT: Tüm verileri siler!)

---

### ADIM 0.9: Seed Verilerini Güncelle

**Amaç:** Test için örnek özel etkinlikler oluştur

**Dosya:** `prisma/seed.ts`

**Eklenecek Kod:**

```typescript
// Özel Etkinlikler (YOKLAMA, MÜDİRİYET)
const specialEvents = await Promise.all([
  // YOKLAMA - Her Cuma 1. ders
  prisma.specialEvent.create({
    data: {
      eventType: 'YOKLAMA',
      eventTitle: 'Haftalık Yoklama',
      description: 'Çevremizi Tanıyalım, Okul Kuralları ve Dilekçe Yazma',
      duration: 1,
      dayOfWeek: 5, // Cuma
      slotIndex: 1,
      requiresInstructor: false,
      allClassesTogether: true,
      countsTowardCurriculum: false,
      managedBy: 'Eğitmen Gözetmenliği',
    },
  }),
  
  // MÜDİRİYET - Her Cuma 7. ders
  prisma.specialEvent.create({
    data: {
      eventType: 'MANAGEMENT',
      eventTitle: 'Müdüriyet Toplantısı',
      description: 'Haftalık değerlendirme ve duyurular',
      duration: 1,
      dayOfWeek: 5, // Cuma
      slotIndex: 7,
      requiresInstructor: false,
      allClassesTogether: true,
      countsTowardCurriculum: false,
      managedBy: 'Okul Müdürü',
    },
  }),
  
  // SOSYAL VE SPORTİF FAALİYETLER
  prisma.specialEvent.create({
    data: {
      eventType: 'SOCIAL_SPORTS',
      eventTitle: 'Sosyal ve Sportif Faaliyetler',
      description: 'Öğrencilerin sosyal ve sportif gelişimi',
      duration: 2,
      requiresInstructor: false,
      allClassesTogether: false,
      countsTowardCurriculum: false,
      notes: 'Genellikle 6. ve 7. ders saatlerinde',
    },
  }),
]);

console.log('✅ Özel Etkinlikler oluşturuldu:', specialEvents.length);

// Dış Konuşmacılar
const externalSpeakers = await Promise.all([
  prisma.externalSpeaker.create({
    data: {
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      title: 'Prof. Dr.',
      organization: 'İstanbul Üniversitesi',
      department: 'Yangın Mühendisliği',
      email: 'ahmet.yilmaz@istanbul.edu.tr',
      phone: '+90 212 555 1234',
      expertise: ['Yangın Güvenliği', 'Afet Yönetimi', 'İlk Yardım'],
      bio: 'Yangın güvenliği alanında 20 yıllık deneyime sahip akademisyen',
      isActive: true,
    },
  }),
  
  prisma.externalSpeaker.create({
    data: {
      firstName: 'Mehmet',
      lastName: 'Kaya',
      title: 'Albay',
      organization: 'Güvenlik Kuvvetleri Komutanlığı',
      department: 'Taktik Eğitim',
      phone: '+90 312 555 5678',
      expertise: ['Askeri Taktik', 'Güvenlik', 'Disiplin'],
      bio: 'Güvenlik kuvvetlerinde 25 yıl görev yapmış deneyimli subay',
      isActive: true,
    },
  }),
]);

console.log('✅ Dış Konuşmacılar oluşturuldu:', externalSpeakers.length);

// Konferanslar
const conferences = await Promise.all([
  prisma.conference.create({
    data: {
      conferenceTitle: 'Yangın ve Tabii Afetler',
      topic: 'Yangın güvenliği önlemleri ve afet durumunda alınacak tedbirler',
      description: 'Yangın söndürme teknikleri, afet yönetimi ve ilk müdahale',
      externalSpeakerId: externalSpeakers[0].id,
      duration: 2,
      startSlot: 6,
      endSlot: 7,
      isAllClasses: true,
      requiresSpecialRoom: true,
      specialRoomType: 'AUDITORIUM',
      requiredEquipment: ['Projeksiyon', 'Ses Sistemi', 'Mikrofon'],
      countsTowardCurriculum: true,
      status: 'PLANNED',
    },
  }),
  
  prisma.conference.create({
    data: {
      conferenceTitle: 'Güvenlik Kuvvetleri Komutanlığı Tanıtımı',
      topic: 'Güvenlik kuvvetlerinin görevleri, yetkileri ve organizasyon yapısı',
      description: 'Askeri hiyerarşi, disiplin kuralları ve taktik eğitim',
      externalSpeakerId: externalSpeakers[1].id,
      duration: 2,
      startSlot: 6,
      endSlot: 7,
      isAllClasses: true,
      requiresSpecialRoom: true,
      specialRoomType: 'CONFERENCE_HALL',
      status: 'PLANNED',
    },
  }),
]);

console.log('✅ Konferanslar oluşturuldu:', conferences.length);
```

**Yapılacaklar:**
- [ ] `prisma/seed.ts` dosyasını aç
- [ ] Yukarıdaki kodu `main()` fonksiyonunun içine ekle
- [ ] En sona, diğer seed işlemlerinden **sonra** ekle

**Seed'i Çalıştır:**
```powershell
npx prisma db seed
```

**Beklenen Çıktı:**
```
✅ Özel Etkinlikler oluşturuldu: 3
✅ Dış Konuşmacılar oluşturuldu: 2
✅ Konferanslar oluşturuldu: 2
```

---

### ADIM 0.10: Veritabanını Test Et

**Amaç:** Yeni tabloların ve verilerin doğru oluştuğunu kontrol et

**Test Komutları:**

```powershell
# Prisma Studio'yu aç (GUI)
npx prisma studio
```

**Kontrol Edilecekler:**
- [ ] `SpecialEvent` tablosu var mı? (3 kayıt olmalı)
- [ ] `ExternalSpeaker` tablosu var mı? (2 kayıt olmalı)
- [ ] `Conference` tablosu var mı? (2 kayıt olmalı)
- [ ] `DailyLesson` tablosunda yeni alanlar var mı?
  - `isSpecialEvent`
  - `specialEventId`
  - `conferenceId`
  - `isBlockSchedule`
  - `blockDuration`
  - `blockTitle`
  - `isPhysicalActivity`
  - `requiresSpecialArea`
  - `specialAreaType`

**SQL ile Test:**
```sql
-- SpecialEvent kayıtlarını kontrol et
SELECT * FROM "SpecialEvent";

-- ExternalSpeaker kayıtlarını kontrol et
SELECT * FROM "ExternalSpeaker";

-- Conference kayıtlarını kontrol et
SELECT * FROM "Conference";

-- DailyLesson şemasını kontrol et
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'DailyLesson'
ORDER BY ordinal_position;
```

---

## 📋 FAZ 0 KONTROL LİSTESİ

**Tamamlanması Gerekenler:**
- [ ] **ADIM 0.1:** Mevcut şemayı incele
- [ ] **ADIM 0.2:** SpecialEvent modelini ekle
- [ ] **ADIM 0.3:** ExternalSpeaker modelini ekle
- [ ] **ADIM 0.4:** Conference modelini ekle
- [ ] **ADIM 0.5:** DailyLesson modelini güncelle
- [ ] **ADIM 0.6:** TermSettings modelini güncelle
- [ ] **ADIM 0.7:** Course modelini güncelle
- [ ] **ADIM 0.8:** Migration çalıştır
- [ ] **ADIM 0.9:** Seed verilerini güncelle
- [ ] **ADIM 0.10:** Veritabanını test et

**FAZ 0 Başarı Kriterleri:**
- ✅ Tüm yeni modeller veritabanına eklendi
- ✅ Migration başarılı
- ✅ Seed verileri oluşturuldu
- ✅ Prisma Studio'da veriler görünüyor
- ✅ Hata yok

---

# 🚧 SONRAKİ FAZLAR (Henüz Başlanmadı)

## FAZ 1: ÖZEL ETKİNLİKLER YÖNETİMİ (4-5 Gün)
_FAZ 0 tamamlandıktan sonra detaylandırılacak_

## FAZ 2: BLOK DERS VE FİZİKSEL ALAN (3-4 Gün)
_FAZ 1 tamamlandıktan sonra detaylandırılacak_

## FAZ 3: GÜNLÜK PROGRAM ENTEGRASYONU (4-5 Gün)
_FAZ 2 tamamlandıktan sonra detaylandırılacak_

## FAZ 4: SENKRONİZASYON (3-4 Gün)
_FAZ 3 tamamlandıktan sonra detaylandırılacak_

## FAZ 5: RAPORLAMA VE DASHBOARD (3-4 Gün)
_FAZ 4 tamamlandıktan sonra detaylandırılacak_

---

## 📝 NOTLAR VE İPUÇLARI

### Genel İpuçları
- Her adımdan sonra commit yap
- Hata alırsan, önceki commite dön
- Migration dosyalarını asla manuel düzenleme
- Seed script'i her zaman çalışabilir durumda tut

### Sık Kullanılan Komutlar
```powershell
# Prisma şemasını doğrula
npx prisma validate

# Migration durumunu kontrol et
npx prisma migrate status

# Veritabanını sıfırla (DİKKAT: Tüm verileri siler!)
npx prisma migrate reset

# Prisma Studio'yu aç
npx prisma studio

# Client'ı yeniden oluştur
npx prisma generate
```

### Sorun Giderme
- **Problem:** Migration çalışmıyor
  - **Çözüm:** `npx prisma migrate reset` çalıştır (test ortamında)

- **Problem:** Seed verileri oluşmuyor
  - **Çözüm:** `prisma/seed.ts` dosyasında syntax hatası var, kontrol et

- **Problem:** Prisma Client tip hatası veriyor
  - **Çözüm:** `npx prisma generate` tekrar çalıştır, VS Code'u yeniden başlat

---

## 🎯 GÜNCELLEME GEÇMİŞİ

**25 Aralık 2025:**
- ✅ İmplementasyon planı oluşturuldu
- ✅ FAZ 0 detaylandırıldı
- 🔄 FAZ 0 başlatılacak

---

**SON GÜNCELLEME:** 25 Aralık 2025  
**DURUM:** FAZ 0 - Hazır  
**SONRAKİ ADIM:** ADIM 0.1'i başlat
