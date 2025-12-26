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

- [x] **ADIM 0.1:** Mevcut Prisma şeması incelendi
- [x] **ADIM 0.2:** SpecialEvent modeli zaten mevcut ✅
- [x] **ADIM 0.3:** ExternalSpeaker modeli zaten mevcut ✅
- [x] **ADIM 0.4:** Conference modeli zaten mevcut ✅
- [x] **ADIM 0.5:** DailyLesson modeli zaten güncellenmiş ✅
- [x] **ADIM 0.6:** TermSettings modeli eklendi ✅
- [x] **ADIM 0.7:** Course modelinde conferences ilişkisi zaten mevcut ✅
- [x] **ADIM 0.9:** Seed dosyası oluşturuldu ✅

---

## 🔄 DEVAM EDEN ADIMLAR

### ADIM 0.8: Migration Hazırla ve Çalıştır

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

**Amaç:** Veritabanına yeni tabloları ve alanları ekle

**NOT:** Veritabanı bağlantısı gereklidir. Eğer veritabanı çalışmıyorsa, önce PostgreSQL'i başlatın.

**Komutlar:**

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

### ADIM 0.9: Seed Verilerini Çalıştır

**Amaç:** Test için örnek özel etkinlikler oluştur

**NOT:** Seed dosyası zaten oluşturuldu (`prisma/seed.ts`). Veritabanı bağlantısı gereklidir.

**Seed'i Çalıştır:**
```bash
npm run db:seed
# veya
npx prisma db seed
```

**Beklenen Çıktı:**
```
🌱 Seed işlemi başlatılıyor...
✅ Özel Etkinlikler oluşturuldu: 3
✅ Dış Konuşmacılar oluşturuldu: 2
✅ Konferanslar oluşturuldu: 2
🎉 Seed işlemi tamamlandı!
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
- [x] **ADIM 0.1:** Mevcut şemayı incele ✅
- [x] **ADIM 0.2:** SpecialEvent modelini ekle ✅ (Zaten mevcut)
- [x] **ADIM 0.3:** ExternalSpeaker modelini ekle ✅ (Zaten mevcut)
- [x] **ADIM 0.4:** Conference modelini ekle ✅ (Zaten mevcut)
- [x] **ADIM 0.5:** DailyLesson modelini güncelle ✅ (Zaten güncellenmiş)
- [x] **ADIM 0.6:** TermSettings modelini güncelle ✅ (Eklendi)
- [x] **ADIM 0.7:** Course modelini güncelle ✅ (Zaten mevcut)
- [ ] **ADIM 0.8:** Migration çalıştır ⏳ (Veritabanı bağlantısı gerekiyor)
- [x] **ADIM 0.9:** Seed verilerini güncelle ✅ (Dosya oluşturuldu)
- [ ] **ADIM 0.10:** Veritabanını test et ⏳ (Veritabanı bağlantısı gerekiyor)

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
**DURUM:** FAZ 0 - %80 Tamamlandı  
**SONRAKİ ADIM:** Veritabanı bağlantısını kontrol et ve migration çalıştır (ADIM 0.8)

**Yapılanlar:**
- ✅ TermSettings modeli eklendi
- ✅ Seed dosyası oluşturuldu (`prisma/seed.ts`)
- ✅ package.json'a seed konfigürasyonu eklendi
- ✅ Prisma schema doğrulandı
