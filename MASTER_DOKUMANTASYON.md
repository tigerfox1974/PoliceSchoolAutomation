# 📚 POLİS OKULU EĞİTİM SİSTEMİ - MASTER DOKÜMANTASYON

> **Son Güncelleme:** 2 Ocak 2026  
> **Amaç:** Tüm kurallar, modüller ve ilişkiler tek bir yerde

---

## 📋 İÇİNDEKİLER

1. [Modül Yapısı](#modül-yapısı)
2. [Haftalık Program Kuralları](#haftalık-program-kuralları)
3. [Günlük Program Kuralları](#günlük-program-kuralları)
4. [Entegrasyon Kuralları](#entegrasyon-kuralları)
5. [Veritabanı İlişkileri](#veritabanı-ilişkileri)

---

## 🏗️ MODÜL YAPISI

### Ana Modüller (Ana Sayfa Kartları)

#### 1. 📅 DERS PROGRAMI MODÜLÜ (Ana Modül)
**Durum:** ⚠️ Geliştiriliyor (Pasif Kart)

**Alt Modüller:**
- **Dönem Planı** (`/terms/[id]/plan`)
  - Ders seçimi
  - Toplam saat hedefi
  - Aylık dağılım
  
- **Aylık Plan** (`/terms/[id]/plan/monthly`)
  - Her ay için planlanan/gerçekleşen saat
  - İlerleme takibi
  
- **Haftalık Program** (`/terms/[id]/schedule/weekly/[weekNumber]`)
  - Haftalık ders çizelgesi
  - Ders dağılımı
  - Eğitmen atamaları
  
- **Günlük Program** (`/terms/[id]/schedule/daily`) ⚠️ EKSİK
  - Günlük ders kayıtları
  - Gerçekleşme takibi
  - Yedek eğitmen atama

**İlişkiler:**
```
Dönem Planı → Aylık Plan → Haftalık Program → Günlük Program
     ↓              ↓              ↓                  ↓
  TermCoursePlan MonthlyCoursePlan DailyLesson (haftalık) DailyLesson (günlük)
```

#### 2. 🎯 ÖZEL ETKİNLİKLER MODÜLÜ (Aktif)
**Durum:** ✅ Tamamlandı

**Alt Modüller:**
- **Özel Etkinlikler** (`/special-events`)
  - YOKLAMA (Cuma 1. ders, opsiyonel)
  - MÜDİRİYET (Cuma 7. ders, her hafta)
  - SOSYAL VE SPORTİF FAALİYETLER (Çarşamba 6-7. ders, her hafta)
  - İNTİBAK EĞİTİMİ (İlk hafta, tüm hafta)
  
- **Konferanslar** (`/conferences`)
  - Dış konuşmacılar
  - Konferans planlama
  
- **Dış Konuşmacılar** (`/external-speakers`)
  - Konuşmacı yönetimi

**İlişkiler:**
```
SpecialEvent → DailyLesson (haftalık programda kullanılır)
Conference → DailyLesson (günlük programda kullanılır)
```

---

## 📅 HAFTALIK PROGRAM KURALLARI

### Genel Amaç
**O hafta hangi dersi kaç kere yazabiliriz ki o dersin toplam ders saatine düzenli bir şekilde ulaşalım.**

### Temel Kurallar

#### 1. Bir Günde Bir Ders Sadece Bir Kez
- Aynı günde aynı ders birden fazla saatte yazılmaz
- Haftalık görünümde her ders günde sadece bir kez görünür
- **Kontrol:** Veritabanında `courseId + specificDate` kombinasyonu kontrol edilir

#### 2. Eğitmen Ataması (Haftalık Program)
- **ÖNEMLİ:** Haftalık programda eğitmen çakışma kontrolü **ÖNEMLİ DEĞİL**
- Haftalık program genel bir programdır, sadece dönemin planlaması yapılırken ışık tutar
- Eğitmen isimleri haftalık programda görünmese de olur
- **Eğitmen kontrolü günlük programda çok önemlidir** (nöbet, müsaitlik, yedek atama)
- Haftalık programda eğitmen ataması yapılabilir ama çakışma kontrolü yapılmaz

#### 3. Ders Dağılım Algoritması
- Dönem boyunca toplam planlanan saat kadar günlere yazılır
- Haftalık saat sayısı = (Aylık plan / 4 hafta)
- Haftalık saat sayısı kadar güne dağıtılır
- Çalışma günleri karıştırılır (eğitmene arka arkaya ders yazılmaması için)

#### 4. Lab Çakışma Kontrolü
- **Açıklama:** Okulda sadece 1 tane Bilgisayar Laboratuvarı var
- Lab gerektiren dersler (örn: Bilgisayar Kullanımı, EBYS) aynı saatte çakışamaz
- **Örnek:** Pazartesi 09:00'da Sınıf A Lab'da Bilgisayar dersi varsa, Sınıf B aynı saatte Lab'da başka bir ders yapamaz
- **Kontrol:** Veritabanında `specificDate + timeSlotId + requiresLab: true` kombinasyonu kontrol edilir
- Lab gerektiren ders yazılırken, o saatte başka lab dersi var mı kontrol edilir

### Sabit Dersler (Öncelikli - Her Hafta)

#### 1. Çarşamba 6-7. Ders: Sosyal ve Sportif Faaliyetler
- Her Çarşamba 6-7. ders saatleri
- `requiresInstructor: false`
- Normal derslerden önce rezerve edilir
- **DİNAMİK:** Günlük programda iptal edilebilir veya değiştirilebilir

#### 2. Cuma 7. Ders: Haftalık Müdüriyet Toplantısı
- Her Cuma 7. ders saati
- `requiresInstructor: false`
- Normal derslerden önce rezerve edilir
- **DİNAMİK:** Günlük programda iptal edilebilir (örn: Müdür okulda değilse)
- **Örnek:** 6. hafta Cuma günü müdüriyet saati müdürün okulda olmamasından dolayı yapılamayabilir

#### 3. İlk Hafta: İntibak Eğitimi
- Tüm hafta (Pazartesi-Pazar, tüm saatler)
- Sadece ilk hafta
- Normal dersler yazılmaz

#### 4. Cuma 1. Ders: Yoklama
- Her hafta değil, belirli haftalarda
- **DİNAMİK:** Günlük programda yapılıp yapılmayacağına karar verilir
- Haftalık programda rezerve edilir ama günlük programda esnek

### Özel Ders Kuralları

#### Beden Eğitimi Dersi
- **Öncelikli Rezervasyon:** Perşembe 6-7. ders saatleri
- Beden eğitimi dersinin toplam ders saati kadar her hafta bu saatler rezerve edilir
- **ÖNEMLİ:** Bu saatler dolu olma gibi bir durum söz konusu olmayacak
- Diğer dersler bu saatleri dolu bilerek dağıtılır
- Beden eğitimi önce yazılır, sonra diğer dersler dağıtılır

### Ders Yazılmayacak Günler

#### 1. Sınav Haftaları
- Sınav haftalarında normal ders yazılmaz
- **4 Aylık:** 1 Ara Sınav + 1 Final
- **6 Aylık:** 2 Ara Sınav + 1 Final
- Başlangıç-bitiş tarihi ile belirlenir
- Hafta sınırlarını aşabilir (örn: Çarşamba başlar, Salı biter)

#### 2. Resmi Tatiller (KKTC)
- Resmi tatil günlerinde ders yazılmaz
- **Yönetim:** Kullanıcı arayüzü ile tüm resmi tatilleri belirler ve işler
- Tek gün veya aralık (başlangıç-bitiş tarihi)
- Sistem haftalık ve günlük ders programını planlarken hangi günlerin tatil olduğunu kontrol eder
- Tatil günlerinde dersler dağıtılmaz

#### 3. Hafta Sonu
- Cumartesi ve Pazar günleri ders yazılmaz

### Algoritma Sırası

1. **Sabit Dersleri Önce Ekle**
   - İntibak Eğitimi (ilk hafta)
   - Müdüriyet Toplantısı (her Cuma 7. ders)
   - Sosyal ve Sportif Faaliyetler (her Çarşamba 6-7. ders)

2. **Çalışma Günlerini Hesapla**
   - Hafta sonu hariç
   - Sınav haftaları hariç
   - Resmi tatiller hariç

3. **Beden Eğitimi Önceliği:**
   - Beden eğitimi dersi varsa → Perşembe 6-7. ders saatlerini önce rezerve et
   - Toplam ders saati kadar her hafta bu saatler ayrılır
   - Diğer dersler bu saatleri dolu bilerek dağıtılır

4. **Her Ders İçin:**
   - Haftalık saat sayısını hesapla
   - Günleri karıştır
   - Her gün için:
     - Bu günde bu ders zaten var mı? (veritabanı kontrolü - TÜM HAFTALAR İÇİN)
     - Lab çakışması var mı? (lab dersi ise)
     - Müsait slot bul ve yaz
   - **NOT:** Eğitmen çakışma kontrolü haftalık programda yapılmaz (günlük programda önemli)

5. **Önemli:**
   - Haftalık programda yazılan 1 ders saati = O gün o dersin 6 sınıfta sırayla işleneceği anlamına gelir
   - Haftalık program genel görünümdür, detaylar günlük programda belirlenir

---

## 📆 GÜNLÜK PROGRAM KURALLARI

### Genel Amaç
**Günlük program, haftalık programdan türetilir ve gerçekleşen dersleri takip eder.**

### Temel Kurallar

#### 1. Haftalık Programdan Türetme
- Günlük program, haftalık programdaki `DailyLesson` kayıtlarından oluşturulur
- Her `DailyLesson` kaydı bir gün için bir ders saati temsil eder
- **ÖNEMLİ:** Haftalık program oluşturulurken direkt `DailyLesson` kayıtları oluşturuluyor (ScheduleEntry yok)

#### 2. Gerçekleşme Takibi
- `status`: PLANNED, COMPLETED, CANCELLED, RESCHEDULED, SUBSTITUTED
- `actualCourseId`: Gerçekte verilen ders (planlanandan farklı olabilir)
- `actualInstructorId`: Gerçekte veren eğitmen (planlanandan farklı olabilir)

#### 3. Yedek Eğitmen Atama
- Planlanan eğitmen müsait değilse yedek eğitmen atanır
- Nöbet günü: Eğitmen ders veremez
- Nöbet ertesi gün: Eğitmen ders veremez (dinlenme)

#### 4. Senkronizasyon (Yukarı Cascade)
- Günlük program değişikliği → Haftalık programa yansır
- Günlük program değişikliği → Aylık plana yansır
- Günlük program değişikliği → Dönem planına yansır
- **DURUM:** ⚠️ Henüz implement edilmedi

---

## 🔄 ENTEGRASYON KURALLARI

### Günlük → Haftalık Entegrasyonu

#### Kural 1: Değişiklik Yansıması
```
Günlük Program Değişikliği:
  - Ders değişti (actualCourseId ≠ plannedCourseId)
  - Eğitmen değişti (actualInstructorId ≠ plannedInstructorId)
  - Ders iptal edildi (status: CANCELLED)
  
↓ Otomatik Yansıma ↓

Haftalık Program:
  - İlgili DailyLesson kaydı güncellenir
  - Haftalık görünümde değişiklik görünür
```

#### Kural 2: Gerçekleşme Takibi
```
Günlük Program:
  - Ders tamamlandı (status: COMPLETED)
  
↓ Otomatik Hesaplama ↓

Aylık Plan:
  - actualHours += 1
  
Dönem Planı:
  - totalActualHours += 1
```

#### Kural 3: Özel Etkinlikler
```
Özel Etkinlikler (YOKLAMA, MÜDİRİYET):
  - Haftalık programda rezerve edilir
  - Günlük programda görünür
  - Müfredattan sayılmaz (countsTowardCurriculum: false)
```

### Haftalık → Günlük Entegrasyonu

#### Kural 1: Otomatik Oluşturma
```
Haftalık Program Oluşturuldu:
  - DailyLesson kayıtları oluşturuldu
  
↓ Her Gün İçin ↓

Günlük Program:
  - O güne ait DailyLesson kayıtları gösterilir
  - Durum: PLANNED (henüz gerçekleşmedi)
```

#### Kural 2: Dinamik Değişiklikler
```
Günlük Programda:
  - Sabit dersler iptal edilebilir (Müdüriyet, Yoklama)
  - Dersler değiştirilebilir
  - Eğitmenler değiştirilebilir
  
↓ Otomatik Yansıma ↓

Haftalık Program:
  - İlgili DailyLesson kaydı güncellenir
  - Haftalık görünümde değişiklik görünür
```

#### Kural 3: Eğitmen Kontrolü (Günlük Programda)
```
Günlük Program Oluşturulurken:
  - Eğitmen nöbet kontrolü yapılır
  - Nöbet günü: Eğitmen atanmaz veya yedek atanır
  - Nöbet ertesi gün: Eğitmen atanmaz veya yedek atanır
  - Müsaitlik kontrolü yapılır
```

---

## 🗄️ VERİTABANI İLİŞKİLERİ

### Ana Modeller

#### TermCoursePlan (Dönem Planı)
```prisma
- termId: Dönem
- courseId: Ders
- totalPlannedHours: Toplam planlanan saat
- totalActualHours: Toplam gerçekleşen saat
```

#### MonthlyCoursePlan (Aylık Plan)
```prisma
- termCoursePlanId: Dönem planı referansı
- month: Ay (1-12)
- year: Yıl
- plannedHours: Bu ay planlanan saat
- actualHours: Bu ay gerçekleşen saat
```

#### DailyLesson (Haftalık + Günlük)
```prisma
- termId: Dönem
- classId: Sınıf
- courseId: Ders
- instructorId: Eğitmen
- specificDate: Belirli tarih
- dayOfWeek: Haftanın günü
- timeSlotId: Ders saati
  
// Özel Etkinlikler
- isSpecialEvent: Özel etkinlik mi?
- specialEventId: Özel etkinlik referansı
  
// Gerçekleşme Takibi (EKSİK)
- status: PLANNED, COMPLETED, CANCELLED
- actualCourseId: Gerçekte verilen ders
- actualInstructorId: Gerçekte veren eğitmen
```

#### SpecialEvent (Özel Etkinlikler)
```prisma
- eventType: YOKLAMA, MANAGEMENT, SOCIAL_SPORTS, ORIENTATION
- dayOfWeek: Haftanın günü (1-5)
- slotIndex: Ders saati (1-7)
- requiresInstructor: Eğitmen gerekli mi?
```

### İlişki Zinciri

```
Term
  ↓
TermCoursePlan (Dönem Planı)
  ↓
MonthlyCoursePlan (Aylık Plan)
  ↓
DailyLesson (Haftalık Program) ← SpecialEvent (Özel Etkinlikler)
  ↓
DailyLesson (Günlük Program - Gerçekleşme)
  ↓
MonthlyCoursePlan.actualHours (Güncellenir)
  ↓
TermCoursePlan.totalActualHours (Güncellenir)
```

---

## ⚠️ EKSİK ÖZELLİKLER

### 1. Günlük Program Modülü
- ❌ Günlük program sayfası yok
- ❌ Gerçekleşme takibi yok
- ❌ Yedek eğitmen atama sistemi yok
- ❌ Senkronizasyon (yukarı cascade) yok

### 2. Haftalık Program İyileştirmeleri
- ❌ Resmi tatil kontrolü yok
- ❌ Sınav haftası kontrolü yok
- ❌ Beden eğitimi özel kuralı yok

### 3. Entegrasyon
- ❌ Günlük → Haftalık senkronizasyon yok
- ❌ Günlük → Aylık senkronizasyon yok
- ❌ Günlük → Dönem senkronizasyonu yok

---

## 📝 ÖNEMLİ NOTLAR

1. **Haftalık Program = Genel Görünüm**
   - Hangi ders hangi gün
   - Sınıf bilgisi gösterilmez

2. **Günlük Program = Detaylı Görünüm**
   - Hangi ders hangi sınıfa, hangi saatte
   - Gerçekleşme takibi
   - Yedek eğitmen atamaları

3. **Bir Ders Haftalık Programda:**
   - Bir günde bir kez görünür
   - **ÖNEMLİ:** Haftalık programda yazılan 1 ders saati = O gün o dersin 6 sınıfta sırayla işleneceği anlamına gelir
   - Günlük programda o gün 6 sınıfa da yazılır (sırayla)

4. **Eğitmen (Haftalık vs Günlük):**
   - **Haftalık Program:** Eğitmen çakışma kontrolü önemli değil, genel planlama
   - **Günlük Program:** Eğitmen kontrolü çok önemli (nöbet, müsaitlik, yedek atama)
   - Günlük programda: Bir günde farklı saatlerde farklı dersler verebilir
   - Günlük programda: Aynı saatte sadece bir ders verebilir

---

## 🎯 SONRAKİ ADIMLAR

### Öncelik 1: Günlük Program Modülü
1. Günlük program sayfası oluştur
2. Gerçekleşme takibi ekle
3. Yedek eğitmen atama sistemi
4. Senkronizasyon (yukarı cascade)

### Öncelik 2: Haftalık Program İyileştirmeleri
1. Resmi tatil kontrolü
2. Sınav haftası kontrolü
3. Beden eğitimi özel kuralı

### Öncelik 3: Entegrasyon
1. Günlük → Haftalık senkronizasyon
2. Günlük → Aylık senkronizasyon
3. Günlük → Dönem senkronizasyonu

---

**Bu dokümantasyon, tüm kuralları ve ilişkileri tek bir yerde toplar. Her geliştirme öncesi bu dokümantasyona bakılmalıdır.**

