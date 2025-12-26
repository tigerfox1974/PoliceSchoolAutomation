# POLİS OKULU EĞİTİM VE OPERASYON YÖNETİM SİSTEMİ - TEKNİK ANAYASA

## 📋 Genel Bakış ve Operasyonel Kapsam

Bu doküman, Polis Meslek Eğitim Merkezi için özel olarak tasarlanmış, çoklu program (Polis ve İtfaiye) destekli ve kısıtlı kaynak (Tek Bilgisayar Laboratuvarı) yönetimine sahip operasyonel yönetim sisteminin teknik anayasasıdır.

**Sistemin Temel Özellikleri:**
- Esnek saat dilimi yönetimi (dönem başında belirlenir)
- Eğitmenler günlük tüm sınıflara ders verir (sıra önemli değil)
- Müfredat konu bazlı ilerler (6 sınıfa ders = müfredattan 1 saat)

**Amaç:** 
- 6 Sınıf (A-F) ve 1 Lab arasındaki trafiği yönetmek
- Polis ve İtfaiye müfredatlarını çakışmadan yürütmek
- Eğitmenlerin sınıflar arası rotasyonunu (Vagon mantığı) sağlamak
- Müfredat ilerlemesini "Konu Bazlı" takip etmek (6 sınıfa ders anlatılsa da müfredattan 1 saat düşülmesi)
- Dönem bazlı ders planlarını otomatik oluşturmak
- Eğitmen müsaitliğini, nöbet durumlarını ve sınav dönemlerini yönetmek
- 7 saat/gün kuralını her koşulda korumak
- Boş ders bırakmamak (eğitmen yoksa otomatik yedek atama)

---

## 🎯 Sabit Kurallar ve Kısıtlamalar

### 1. Zaman Kısıtlamaları ve Esnek Saat Yönetimi
- **Günlük Ders Saati:** 7 saat (SABİT - asla değişmez)
- **Haftalık Çalışma:** 5 gün (Pazartesi-Cuma)
- **Haftalık Toplam:** 35 saat
- **Ders Saatleri:** Yönetici tarafından dönem başında belirlenir (ESNEK)

**⭐ Esnek Saat Dilimi Sistemi:**

**Değişebilen Parametreler (Dönem Başında Belirlenir):**
- Ders süresi: **45 dakika** (standart, değiştirilebilir)
- Tenefüs süresi: **10-15 dakika** (dönem başı belirlenir)
- Öğle yemeği: **60-90 dakika** (dönem başı belirlenir)
- Günde toplam: **7 ders** (sabah + öğleden sonra dağılımı esnek)
- İlk ders başlangıç saati: **08:00-08:30 arası** (dönem başı belirlenir)
- Akşam yemeği sonrası: **ETÜD saati** (ders sayılmaz, eğitmen ataması yapılmaz)

**Yönetici Tanımlı Saat Dilimleri:**
```
Örnek 1: Sabah 08:00 başlangıç, 1 saat öğle yemeği
┌──────────────────────────────────────────┐
│ 1. Ders: 08:00 - 08:45 (45 dk)          │
│ Tenefüs: 08:45 - 09:00 (15 dk)          │
│ 2. Ders: 09:00 - 09:45 (45 dk)          │
│ Tenefüs: 09:45 - 10:00 (15 dk)          │
│ 3. Ders: 10:00 - 10:45 (45 dk)          │
│ Tenefüs: 10:45 - 11:00 (15 dk)          │
│ 4. Ders: 11:00 - 11:45 (45 dk)          │
│ Tenefüs: 11:45 - 12:00 (15 dk)          │
│ 5. Ders: 12:00 - 12:45 (45 dk)          │
│ 🍽️ Öğle Yemeği: 12:45 - 13:45 (60 dk)   │
│ 6. Ders: 13:45 - 14:30 (45 dk)          │
│ Tenefüs: 14:30 - 14:45 (15 dk)          │
│ 7. Ders: 14:45 - 15:30 (45 dk)          │
└──────────────────────────────────────────┘

Örnek 2: Sabah 08:15 başlangıç, 1.5 saat öğle yemeği
┌──────────────────────────────────────────┐
│ 1. Ders: 08:15 - 09:00 (45 dk)          │
│ Tenefüs: 09:00 - 09:15 (15 dk)          │
│ 2. Ders: 09:15 - 10:00 (45 dk)          │
│ Tenefüs: 10:00 - 10:15 (15 dk)          │
│ 3. Ders: 10:15 - 11:00 (45 dk)          │
│ Tenefüs: 11:00 - 11:15 (15 dk)          │
│ 4. Ders: 11:15 - 12:00 (45 dk)          │
│ Tenefüs: 12:00 - 12:15 (15 dk)          │
│ 5. Ders: 12:15 - 13:00 (45 dk)          │
│ 🍽️ Öğle Yemeği: 13:00 - 14:30 (90 dk)   │
│ 6. Ders: 14:30 - 15:15 (45 dk)          │
│ Tenefüs: 15:15 - 15:30 (15 dk)          │
│ 7. Ders: 15:30 - 16:15 (45 dk)          │
└──────────────────────────────────────────┘
```

**Sistem Otomatik Hesaplama:**
- Yönetici sadece **ilk ders başlangıç saati** ve **öğle yemeği süresi** girer
- Sistem otomatik olarak 45dk ders + 15dk tenefüs mantığıyla tüm saatleri hesaplar
- 5. dersten sonra öğle yemeği arası eklenir
- 6. ve 7. dersler öğle yemeği sonrası otomatik yerleştirilir

### 2. Boş Ders Yasağı ve Akıllı Yedek Atama Sistemi
- ❌ Hiçbir gün boş ders bırakılamaz (sistem zorlar)
- Eğitmen müsait değilse **otomatik akıllı öneri sistemi** devreye girer

**⭐ Otomatik Atama Akışı (Kritik):**

**Senaryo:** Ahmet Bey (Ceza Yasası) hasta oldu, Pazartesi 09:00 dersi boş kaldı.

**ADIM 1: Sistem Otomatik Önerileri Listeler**
```
🤖 Otomatik Öneriler (Öncelik Sıralı):

1️⃣ YEDEK EĞİTMENLER (Varsa) - En Yüksek Öncelik
   ├─ Mehmet Bey (Ceza Yasası Yedek) - ✓ Müsait
   │   → Nöbette: ⭐ ÖNERİLİR (Yüksek öncelik)
   │   → Ceza Yasası verecek → Ceza Yasası saatinden düşer
   │
   └─ Ali Bey (Ceza Yasası Yedek) - ❌ O saatte başka ders var

2️⃣ KADROLU EĞİTMENLER (Yedek yok ise)
   ├─ Fatma Hanım (Ana: Trafik) - ✓ Müsait
   │   → Trafik dersini verecek → Trafik saatinden düşer
   │   → Ceza Yasası verilmedi → Ceza Yasası ertelenir
   │   → İlerleme: 12/30 saat (geride)
   │
   └─ Zeynep Hanım (Ana: Bilgisayar) - ✓ Müsait
       → Bilgisayar dersini verecek → Bilgisayar saatinden düşer
       → İlerleme: 25/30 saat (ileride)
```

**ADIM 2: Yönetici Müdahale Eder**
```
Yönetici seçenekleri:

✅ SEÇENEK A: Sistem Önerisini Onayla
   → En üstteki öneriyi kabul et (Mehmet Bey - Yedek)
   → Tek tıkla ata

✅ SEÇENEK B: Listeden Başkasını Seç
   → Sistem önerisi dışında (örn: Fatma Hanım'ı tercih et)
   → Gerekçe: "Fatma Hanım az ders verdi, dengelemek için"

✅ SEÇENEK C: Liste Dışı Manuel Seç
   → Sistemin önermediği birini seç
   → Örn: Dış eğitmen (acil çağır)
   → Gerekçe girişi zorunlu

❌ SEÇENEK D: Boş Bırak → SİSTEM İZİN VERMEZ!
   → "Ders boş bırakılamaz" hata mesajı
   → Yönetici atama yapana kadar form kaydedilmez
```

**ADIM 3: Sistem Kaydı ve Güncelleme**
```
✓ Seçilen eğitmen DailyLesson.actualInstructorId'ye atanır
✓ ScheduleChange kaydı oluşturulur (audit trail)
✓ Saat düşümü:
   - Yedek öğretmen seçildiyse → Yedek olduğu ders saatinden düşer
   - Kadrolu öğretmen seçildiyse → Kendi ana dersi saatinden düşer
   - Hasta öğretmenin dersi verilmediyse → O dersten düşmez
✓ Yukarı senkronizasyon tetiklenir (haftalık → aylık → dönem)
```

**Kritik Kurallar:**
- ❌ Eğitmen yetkisi olmayan dersi ASLA veremez
- ✓ Sadece ana dersi veya yedek olduğu dersleri verebilir
- ✓ Sistem otomatik önerir, yönetici son kararı verir
- ❌ Boş ders ASLA kaydedilemez (sistem engeller)

**⭐ ETÜD SAATİ (Akşam Yemeği Sonrası):**

ETÜD Saati, 7 ders saati sonrası, akşam yemeği sonrası belirlenen saat dilimlerinde gerçekleştirilir.
- **Örnek:** 15:35-17:00 (saatler dönem başında belirlenir)
- **Amaç:** 7 ders saati sonrası ek çalışma zamanı
- **Müfredattan sayılmaz:** ETÜD müfredat ilerlemesine dahil değildir
- **Eğitmen ataması yapılmaz:** Gözetmen eğitmen olabilir ama zorunlu değil
- **Öğrenci çalışması:** Öğrenciler kendi derslerini, ödevlerini yapar
- **Program Notasyonu:** ETÜD saati günlük programda ayrı gösterilir (ders değil)

---

**⭐ SAAT HESAPLAMA VE MÜFREDAT TAKİP KURALLARI:**

Eğitmen günlük tüm uygun sınıflara ders verir. Hesaplama mantığı:

### 🔄 Çift Katmanlı Hesaplama Sistemi

**1. Eğitmen İş Yükü (Instructor Workload):**
- Eğitmen fiziksel olarak kaç sınıfa ders verdiyse, o kadar saat çalışmış sayılır
- Maaş/Ek ders hesabı buna göre yapılır
- **Örnek:** Ceza Yasası hocası A, B, C, D, E, F sınıflarına ders verdi → **6 Saat** çalışma

**2. Müfredat İlerlemesi (Curriculum Progress):**
- Aynı konu 6 farklı sınıfa anlatılsa bile, müfredattan **sadece 1 saat** düşer
- Çünkü aslında "Aynı Konu" anlatılmıştır (Örn: "Suç ve Ceza Kavramları")
- **Örnek:** Ceza Yasası dersi (Hedef: 40 Saat), bugün 6 sınıfa anlatıldı → Müfredattan **1 Saat** düştü, kalan **39 Saat**

### 📊 Senaryo Örnekleri

**Senaryo 1: Standart Rotasyon (Circuit)**
```
Gün: Pazartesi
Ders: Ceza Yasası (Dönem Hedefi: 40 Saat)
Hoca: Ahmet Bey

Program:
08:00-08:45 → A Sınıfı (Ceza Yasası - Konu 1: Suç Tanımı)
08:55-09:40 → B Sınıfı (Ceza Yasası - Konu 1: Suç Tanımı)
09:50-10:35 → C Sınıfı (Ceza Yasası - Konu 1: Suç Tanımı)
10:45-11:30 → D Sınıfı (Ceza Yasası - Konu 1: Suç Tanımı)
11:40-12:25 → E Sınıfı (Ceza Yasası - Konu 1: Suç Tanımı)

Sonuç:
✓ Ahmet Bey İş Yükü: 5 Saat (5 sınıfa ders verdi)
✓ Müfredat İlerlemesi: 1 Saat ("Suç Tanımı" konusu tamamlandı)
✓ Ceza Yasası Kalan: 39 Saat
```

**Senaryo 2: Aynı Gün Farklı Sırada Ders**
```
Gün: Salı
Ders: Ceza Yasası (Konu 2: Ceza Türleri)
Hoca: Ahmet Bey

Program:
08:00-08:45 → C Sınıfı (Ceza Yasası)
08:55-09:40 → A Sınıfı (Ceza Yasası)
09:50-10:35 → E Sınıfı (Ceza Yasası)
10:45-11:30 → B Sınıfı (Ceza Yasası)
11:40-12:25 → D Sınıfı (Ceza Yasası)
13:45-14:30 → F Sınıfı (Ceza Yasası)

Sonuç:
✓ Ahmet Bey İş Yükü: 6 Saat (6 sınıfa ders verdi)
✓ Müfredat İlerlemesi: 1 Saat ("Ceza Türleri" konusu tamamlandı)
✓ Tüm sınıflar aynı konuyu aldı
✓ Sıra önemli değil, önemli olan günün sonunda herkese verilmesi
```

**Senaryo 3: Yedek Eğitmen (Aynı Ders)**
```
Plan: Ahmet Bey (Ana: Ceza Yasası) - HASTA
Gerçek: Mehmet Bey (Yedek: Ceza Yasası) - CEZA YASASI VERDİ

Program:
08:00-08:45 → A Sınıfı (Mehmet - Ceza Yasası)
08:55-09:40 → B Sınıfı (Mehmet - Ceza Yasası)

Sonuç:
✓ Mehmet Bey İş Yükü: 2 Saat
✓ Müfredat İlerlemesi: 1 Saat (Konu devam etti)
✓ Mehmet'in kendi dersinden (Trafik) düşmez
✓ Ceza Yasası'ndan düşer
```

**Senaryo 4: Program Kapsamı Dışı Sınıf (İtfaiye)**
```
Gün: Çarşamba
Ders: Polis Müdahale Teknikleri (Sadece Polis Müfredatında)
Hoca: Ahmet Bey

Program:
08:00-08:45 → A Sınıfı (Polis) ✓
08:55-09:40 → B Sınıfı (Polis) ✓
09:50-10:35 → C Sınıfı (Polis) ✓
10:45-11:30 → D Sınıfı (Polis) ✓
11:40-12:25 → E Sınıfı (Polis) ✓
             → F Sınıfı (İtfaiye) ✗ GİRİLMEZ (Müfredatında yok)

Sonuç:
✓ Ahmet Bey İş Yükü: 5 Saat (F'ye girilmedi)
✓ Müfredat İlerlemesi: 1 Saat (Polis sınıflarına anlatıldı)
✓ F Sınıfı etkilenmez (zaten müfredatında yok)
```

**📌 Özet Kurallar:**
1. **İş Yükü:** Fiziksel ders sayısı (Sınıf başına 1 saat)
2. **Müfredat:** Konu bazlı ilerleme (Sınıf sayısından bağımsız)
3. **Atlanan Sınıf:** Sistem uyarı verir, telafi planlanır
4. **Farklı Ders:** Verilen dersin müfredatı ilerler, planlanandan ilerlemez

### 3. Sınıflar ve Müfredat Yapısı
- **Toplam:** 7 sınıf (fiziksel)
  - Sınıf A
  - Sınıf B
  - Sınıf C
  - Sınıf D
  - Sınıf E
  - Sınıf F
  - Bilgisayar Laboratuvarı (özel)

**⭐ Program Türü Sistemi:**

Her sınıf bir program türüne aittir: **POLIS** veya **İTFAİYE**. Her program kendi müfredatına göre ders görür.

**Önemli:** Bir eğitmen dersi verirken, o dersin müfredatında olmayan sınıflara girmez.
- Örnek: "Polis Müdahale Teknikleri" dersi İtfaiye sınıfına verilmez
- Eğitmen o gün sadece müfredatta olan sınıflara girer
- Günün sonunda kaç sınıfa ders verdiyse o kadar saat iş yükü
- Müfredattan ise sadece 1 saat düşer (aynı konu işlendi)
```

### 4. Bilgisayar Laboratuvarı Kuralı
- **Hangi sınıfın programında bilgisayar dersi varsa**, o sınıf o ders saatinde Bilgisayar Lab'a gider
- Ders işlenir, ders bitince sınıf kendi sınıfına geri döner
- Aynı anda sadece bir sınıf Bilgisayar Lab'ı kullanabilir (mutex kaynak)
- Sistem çakışmaları otomatik önlemeli
- Lab olmayan dersler normal sınıflarda yapılır
- **Önemli:** Lab'a gitme durumu `isLabSession` alanında işaretlenir

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

**💻 "Bilgisayar Lab Gerekli mi?" Açıklaması:**

Bu alan, dersin bilgisayar laboratuvarında mı yoksa normal sınıfta mı yapılacağını belirtir.

**Neden Gerekli:**
1. **Özel Sınıf Gereksinimi:** Bazı dersler (Bilgisayar Kullanımı, EBYS) bilgisayar laboratuvarında yapılmalı
2. **Çakışma Önleme:** Okulda 1 tane Bilgisayar Lab var, aynı anda sadece 1 sınıf kullanabilir
3. **Otomatik Atama:** Sistem lab gerektiren dersleri otomatik olarak Bilgisayar Lab'a atar

**Örnek:**
```
✅ requiresLab = true
- Bilgisayar Kullanımı
- Elektronik Belge Yönetim Sistemi (EBYS)
- Temel Seviye Bilgisayar Kullanımı

❌ requiresLab = false
- Ceza Yasası, Trafik, Polis Yetkisi, Fiziksel Eğitim (Normal sınıfta)
```

**Sistem Kontrolü:**
```
❌ YANLIŞ: Pazartesi 09:00
   - Sınıf A → Bilgisayar Kullanımı (Lab'da)
   - Sınıf B → EBYS (Lab'da) ← ÇAKIŞMA!

✅ DOĞRU: Sistem önler
   - Sınıf A → Pazartesi 09:00 (Lab)
   - Sınıf B → Pazartesi 10:00 (Lab) ← Farklı saat
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
- **24 Saat Nöbet Görevi Vardır**

**⭐ Nöbet Sistemi (24 Saat Esası):**

**Nöbet Planlaması:**
- Nöbetler **aylık** hazırlanır
- Nöbet tutacak kişilerin sayısına göre **haftanın her günü** nöbetçi olacak şekilde sırayla devam eder
- Örnek: 7 eğitmen varsa → Her gün farklı biri nöbette (Pzt: Ahmet, Salı: Mehmet, Çar: Ali...)
- **Nöbet Arayüzü:** Ayrı bir modülde geliştirilecek ve sisteme entegre edilecek

**Nöbet Kuralları:**
- **Nöbet Günü:** Eğitmen ders VEREMEZ ❌ (24 saat görevde)
- **Nöbet Ertesi Gün:** Eğitmen ders VEREMEZ ❌ (dinlenme)
- Nöbet tutan eğitmenlerin çoğunluğu aynı zamanda ders veren eğitmenlerdir
- Sistem otomatik olarak nöbet günü ve ertesi günü o eğitmeni ders planından çıkarır

**Veri Kaynağı:**
```typescript
// Aylık nöbet çizelgeleri manuel girilir veya import edilir
GET /api/duty-schedules?month=12&year=2024
Response: [
  {
    instructorId: "uuid",
    dutyDate: "2024-12-25",
    shiftType: "24_HOUR", // 24 saat nöbet
    // Bu eğitmen 25 ve 26 Aralık ders veremez
  }
]

#### B. Dış Eğitmenler
- Sözleşmeli veya dışarıdan gelen eğitmenler (örn: Olay Yeri İnceleme Ekibi)
- Nöbet görevi yoktur
- **Müsaitlik:** ÖNCEDEN MANUEL OLARAK PLANLANIR
  - Sabit gün/saat yok, her defasında farklı olabilir
  - Örn: Bu hafta Salı 09:00-12:00, gelecek hafta Perşembe 10:00-15:00
  - Yönetici planlama yaparken dış eğitmeni seçer ve istediği gün/saate atar
  - Normal ScheduleEntry olarak kaydedilir, özel kilit mekanizması yok

### 2. Yedek Eğitmen Sistemi

**Tanım:**
- Yedek eğitmen = Birden fazla dersi verebilecek yeterliliğe sahip eğitmen
- Ana dersi başka olabilir (Örn: Ana dersi Trafik, yedek olarak Ceza Yasası da verebilir)
- İhtiyaç olursa **ders oluştururken** tanımlanır
- Bir dersin **birden fazla yedek eğitmeni** olabilir

**Örnek:**
```
Eğitmen: Mehmet Bey
├─ Ana Dersi: Trafik
└─ Yedek Olduğu Dersler: Ceza Yasası, Polis Uygulamaları
```

**Yetkilendirme:**
- Ders oluşturulurken "Yedek Eğitmenler" alanı doldurulur
- Eğitmen, yetki verilen dersleri verebilir
- Sistem otomatik kontrol eder (yetkisiz ders veremez)

### 3. Eğitmen Müsaitlik Yönetimi
```
Eğitmen Modeli eklemeler:
- instructorType: "KADROLU" | "DIS"
- canTeachAfterDuty: boolean (varsayılan: false)
- mainCourses: Course[] (ana dersleri)
- substituteCourses: Course[] (yedek olduğu dersler)
- dutySchedule: DutySchedule[] (ilişki)

Not: Dış eğitmenler için sabit availableDays alanı YOK!
     Her planlama manuel yapılır, ScheduleEntry'de kaydedilir.
```

### 3. Çakışma Kontrolü
- Bir eğitmen aynı anda iki farklı sınıfta ders veremez
- Sistem otomatik çakışma kontrolü yapmalı
- Çakışma varsa alternatif saat veya eğitmen önerisi sunmalı

---

## 🎪 Özel Etkinlikler ve Aktiviteler

Polis Okulu programında normal dersler dışında özel etkinlikler ve aktiviteler bulunmaktadır. Bunlar ders sayılmaz ve eğitmen ataması gerektirmez (bazı istisnalar hariç).

### 1. YOKLAMA Sistemi

**Tanım:**
- Her hafta programa YOKLAMA saati eklenir (genellikle Cuma günü 1. ders)
- Ancak her Cuma yapılacağı anlamına gelmez
- Bazı haftalarda yapılır, bazı haftalarda yapılmayabilir
- Planlama aşamasında programa eklenir, uygulama aşamasında o hafta yapılıp yapılmayacağına karar verilir

**Özellikler:**
- **Eğitmen Ataması:** YOK ❌
- **Gözetmenlik:** Tüm eğitmenler gözetmen olarak görev yapar
- **Sınıflar:** Tüm sınıflar (A-F) aynı anda yoklamaya girer
- **Süre:** 1 ders saati (genellikle 45 dakika)
- **Müfredattan Sayılma:** HAYIR ❌
- **Ders Kategorisi:** Özel Etkinlik

**Excel Programlarda:**
```
Örnek: 13 Şubat 2026 Cuma
1. Ders: YOKLAMA-1 Çevremizi Tanıyalım, Okul Kuralları ve Dilekçe Yazma
```

**Sistem Davranışı:**
```typescript
YOKLAMA Kaydı:
- slotIndex: 1 (genellikle 1. ders)
- isSpecialEvent: true
- eventType: "YOKLAMA"
- requiresInstructor: false
- allClassesTogether: true
- eventTitle: "Çevremizi Tanıyalım, Okul Kuralları..."
```

### 2. KONFERANS Sistemi

**Tanım:**
- Dışarıdan gelen konuk konuşmacıların verdiği oturumlar
- Özel konular hakkında bilgilendirme amaçlı
- Genellikle çift ders (2 saat üst üste, 6. ve 7. ders saatleri)

**Özellikler:**
- **Konuşmacı:** Dış konuk (üniversite hocası, uzman, askeri personel, vb.)
- **Eğitmen Ataması:** Dış konuşmacı sisteme kaydedilir
- **Süre:** Genellikle 2 ders saati (90 dakika)
- **Müfredattan Sayılma:** EVET ✓ (müfredatta tanımlı ise)
- **Sınıflar:** Tek sınıf veya tüm sınıflar birlikte olabilir

**Excel Programlarda Örnekler:**
```
Polis Programı:
- KONFERANS-1: Yangın ve Tabii Afetler (6. ve 7. ders)
- KONFERANS-3: Tarih (6. ve 7. ders)
- KONFERANS-5: Güvenlik Kuvvetleri Komutanlığı Tanıtımı (6. ve 7. ders)

İtfaiye Programı:
- KONFERANS-3: Güvenlik Kuvvetleri Komutanlığı Tanıtım ve Bilgilendirme (6. ve 7. ders)
```

**Sistem Davranışı:**
```typescript
KONFERANS Kaydı:
- isSpecialEvent: true
- eventType: "CONFERENCE"
- requiresInstructor: true  // Dış konuşmacı
- duration: 2  // Çift ders
- externalSpeaker: {
    name: "Prof. Dr. Ahmet Yılmaz",
    title: "Yangın Uzmanı",
    organization: "İstanbul Üniversitesi"
  }
- conferenceTitle: "Yangın ve Tabii Afetler"
```

**Konferans Planlama:**
1. Yönetici konferans ekler
2. Dış konuşmacı bilgileri girilir
3. Tarih ve saat belirlenir (genellikle 6. ve 7. ders)
4. Tüm sınıflar veya belirli sınıflar seçilir
5. Sistem otomatik olarak 2 ders saati bloğu oluşturur

### 3. MÜDİRİYET Sistemi

**Tanım:**
- Polis Okulu yatılı okul olduğu için hafta sonu okuldan ayrılmadan yapılan özel toplantı
- Okul müdürü tarafından öğrencilerle yapılan kısa toplantı (1 saat)
- Genellikle Cuma günü 7. ders saati (son ders)
- **DERS DEĞİL!** Yönetimsel aktivite

**Özellikler:**
- **Eğitmen Ataması:** YOK ❌
- **Yürütücü:** Okul müdürü veya yönetim
- **Süre:** 1 ders saati
- **Müfredattan Sayılma:** HAYIR ❌
- **Amaç:** Haftalık değerlendirme, duyurular, öğrenci geri bildirimleri

**Excel Programlarda:**
```
Örnek: Her Cuma 7. Ders
- MÜDİRİYET-1
- MÜDİRİYET-2
- MÜDİRİYET-3
```

**Sistem Davranışı:**
```typescript
MÜDİRİYET Kaydı:
- slotIndex: 7  // Son ders
- dayOfWeek: 5  // Cuma
- isSpecialEvent: true
- eventType: "MANAGEMENT"
- requiresInstructor: false
- managedBy: "Okul Müdürü"
- eventTitle: "Haftalık Müdüriyet Toplantısı"
```

### 4. SOSYAL VE SPORTİF FAALİYETLER

**Tanım:**
- Öğrencilerin sosyal ve sportif gelişimine yönelik aktiviteler
- Genellikle 6. ve 7. ders saatlerinde (çift ders)
- **DERS DEĞİL!** Aktivite
- **Eğitmen ataması YAPILMAZ** ❌

**Özellikler:**
- **Eğitmen Ataması:** YOK ❌
- **Gözetmenlik:** Gerekirse gözetmen öğretmen olabilir
- **Süre:** Genellikle 2 ders saati
- **Müfredattan Sayılma:** HAYIR ❌
- **Mekan:** Spor salonu, açık alan, vb.

**Excel Programlarda:**
```
Polis ve İtfaiye Programlarında:
- SOSYAL VE SPORTİF FAALİYETLER-1 (6. ders)
- SOSYAL VE SPORTİF FAALİYETLER-2 (7. ders)
```

**Sistem Davranışı:**
```typescript
SOSYAL VE SPORTİF FAALİYETLER Kaydı:
- isSpecialEvent: true
- eventType: "SOCIAL_SPORTS"
- requiresInstructor: false
- duration: 2  // Çift ders
- requiresSpecialArea: true  // Spor salonu
- eventTitle: "Sosyal ve Sportif Faaliyetler"
```

### 5. BLOK DERS Sistemi (İtfaiye Özel)

**Tanım:**
- Özellikle İtfaiye öğrencilerinin derslerinde kullanılan yapı
- Aynı ders birden fazla saat üst üste verilir (kesintisiz)
- Pratik uygulamalar ve atölye çalışmaları için ideal

**Özellikler:**
- **Süre:** 3-5 saat kesintisiz
- **Amaç:** Pratik eğitim, laboratuvar, atölye çalışması
- **Eğitmen Ataması:** VAR ✓
- **Müfredattan Sayılma:** EVET ✓

**Excel Programlarda (İtfaiye):**
```
Örnek: 11 Şubat 2026 Çarşamba
1. Ders: İTFAİYE MESLEK DERSLERİ
2. Ders: İTFAİYE MESLEK DERSLERİ
3. Ders: İTFAİYE MESLEK DERSLERİ
4. Ders: İTFAİYE MESLEK DERSLERİ
5. Ders: YANAŞIK DÜZEN-2
6. Ders: SOSYAL VE SPORTİF FAALİYETLER-1
7. Ders: SOSYAL VE SPORTİF FAALİYETLER-2

→ İlk 4 ders BLOK şeklinde (kesintisiz 4 saat)
```

**Sistem Davranışı:**
```typescript
BLOK DERS Kaydı:
- isBlockSchedule: true
- blockDuration: 4  // 4 saat kesintisiz
- blockTitle: "İTFAİYE MESLEK DERSLERİ"
- startSlot: 1
- endSlot: 4
- requiresInstructor: true
- requiresSpecialArea: true  // Atölye/Lab
```

**Blok Ders Planlama Kuralları:**
1. Blok dersler kesintisiz olmalı (ara tenefüsler dahil)
2. Aynı eğitmen tüm bloğu vermeli
3. Aynı sınıf tüm bloğu almalı
4. Öğle yemeği arası blok içinde olmamalı (blok biter, yemek arası, sonra devam)
5. Blok için özel alan (atölye/lab) rezerve edilmeli

### 6. Fiziksel Aktivite Dersleri

#### A. YANAŞIK DÜZEN
- **Tanım:** Askerî taktik düzen eğitimi
- **Eğitmen:** Özel yetkilendirilmiş eğitmen (askerî eğitim geçmişi)
- **Mekan:** Açık alan, plato
- **Müfredattan Sayılma:** EVET ✓
- **Ders mi:** EVET ✓ (normal ders gibi işlem görür)

#### B. BEDEN EĞİTİMİ
- **Tanım:** Genel fiziksel aktivite ve spor eğitimi
- **Eğitmen:** Beden eğitimi öğretmeni
- **Mekan:** Spor salonu
- **Müfredattan Sayılma:** EVET ✓
- **Ders mi:** EVET ✓ (normal ders gibi işlem görür)

**ÖNEMLİ:** Bu iki ders birbirinden FARKLI ve farklı eğitmenlere sahip!

```typescript
YANAŞIK DÜZEN vs BEDEN EĞİTİMİ:

Yanaşık Düzen:
- courseType: "TACTICAL"
- instructorQualification: "Askerî Eğitim"
- requiresSpecialArea: true (Açık alan/Plato)

Beden Eğitimi:
- courseType: "PHYSICAL_EDUCATION"
- instructorQualification: "Beden Eğitimi Öğretmeni"
- requiresSpecialArea: true (Spor salonu)
```

### 7. TALİMATLAR Dersi

**Tanım:**
- Çeşitli yönetmelik, talimat ve prosedürlerin öğretildiği ders
- Birçok farklı talimat içerir (İdari Talimatlar, Güvenlik Talimatları, vb.)
- Normal ders gibi müfredatta yer alır

**Özellikler:**
- **Eğitmen Ataması:** VAR ✓
- **Müfredattan Sayılma:** EVET ✓
- **Ders mi:** EVET ✓ (normal ders)

**Excel Programlarda:**
```
İtfaiye Programı:
- TALİMATLAR-1
- TALİMATLAR-2
- TALİMATLAR-3
```

---

## 📅 Sınav Dönemleri ve Özel Günler

### 1. Sınav Haftaları
- **4 Aylık Dönem:**
  - 1 Ara Sınav Haftası (genellikle 2. ayın sonunda)
  - 1 Final Sınavı Haftası (dönem sonunda)
  - **Bütünleme Sınavı** (final sonrası)
  - **Mazeret Sınavı** (gerektiğinde)
  
- **6 Aylık Dönem:**
  - 2 Ara Sınav Haftası (genellikle 2. ve 4. ayın sonunda)
  - 1 Final Sınavı Haftası (dönem sonunda)
  - **Bütünleme Sınavı** (final sonrası)
  - **Mazeret Sınavı** (gerektiğinde)

**Önemli:** Bütünleme ve mazeret sınavları kesinlikle sisteme dahildir ve planlamada dikkate alınmalıdır.

### 2. Sınav Haftası Kuralları
- **Sınav haftası = Tüm hafta ders kesimi ✓**
- Sadece sınavlar yapılır, hiç ders işlenmez
- Tüm planlama görünümlerinde (dönem/aylık/haftalık/günlük) "SINAV HAFTASI" işareti gösterilir
- Sistem sınav haftalarını otomatik atlayarak planlama yapar
- Kullanıcı sınav tarihlerini dönem oluştururken belirler
- Sınav günleri ayrı ayrı girilmez, sadece başlangıç-bitiş tarihi girilir

**Örnek:**
```
Ara Sınav: 11-15 Kasım 2024 (Tüm hafta)
→ Bu hafta hiç ders yapılmaz
→ Sadece sınavlar var
→ Sistem 18 Kasım'dan itibaren derslere devam eder
```

### 3. Resmi Tatiller ve Özel Günler
- **Yönetim:** Yönetici veya yetkili kullanıcı planlama aşamasında resmi tatilleri **manuel olarak tek tek** girer
- Resmi tatiller belirlenen tarihler: 23 Nisan, 19 Mayıs, 30 Ağustos, 29 Ekim, vb.
- Bu günlerde ders yapılmaz
- Planlama algoritması bu günleri otomatik atlar
- UI'de resmi tatil girişi için özel form olmalı

**⭐ Holiday Veritabanı Modeli:**
```prisma
model Holiday {
  id          String   @id @default(uuid())
  termId      String
  term        Term     @relation(fields: [termId], references: [id], onDelete: Cascade)
  date        DateTime @db.Date
  endDate     DateTime? @db.Date // Aralık tatili için (örn: 9 günlük yarıyıl tatili)
  description String    // "Cumhuriyet Bayramı", "Ramazan Bayramı 1. Gün"
  holidayType String    @default("NATIONAL") // NATIONAL, RELIGIOUS, TERM_BREAK
  isRange     Boolean   @default(false) // Tek gün mü, aralık mı?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([termId])
  @@index([date])
  @@index([holidayType])
}
```

**Örnek Tatil Girişleri:**
```typescript
// Tek günlük tatil
{
  date: "2025-04-23",
  description: "23 Nisan Ulusal Egemenlik ve Çocuk Bayramı",
  holidayType: "NATIONAL",
  isRange: false
}

// Aralık tatili
{
  date: "2025-01-27",
  endDate: "2025-02-04",
  description: "Yarıyıl Tatili",
  holidayType: "TERM_BREAK",
  isRange: true
}

---

## 🔄 Otomatik Planlama Akışı (Cascade Logic)

### 1. Hiyerarşik Yapı ve Çift Yönlü Senkronizasyon

#### 🔽 Planlama Akışı (Aşağı Cascade)
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
│  plannedHours + actualHours     │
└───────────┬─────────────────────┘
            │
            ↓ Aylara böl
┌─────────────────────────────────┐
│  Aylık Planlar                  │
│  (her ay her ders kaç saat)     │
│  plannedHours + actualHours     │
└───────────┬─────────────────────┘
            │
            ↓ Haftalara dağıt
┌─────────────────────────────────┐
│  Haftalık Program               │
│  (7 saat/gün × 5 gün = 35 saat) │
│  scheduleEntries (plan)         │
└───────────┬─────────────────────┘
            │
            ↓ Günlük kopyala
┌─────────────────────────────────┐
│  Günlük Dersler                 │
│  (yoklama, gerçek uygulama)     │
│  actualInstructor, status       │
└─────────────────────────────────┘
```

#### 🔼 Gerçekleşme Akışı (Yukarı Cascade) ⭐ KRİTİK!
```
Günlük Ders DEĞİŞTİ
(Örn: X dersi verilmedi, Y dersi verildi)
        │
        ↓ Otomatik güncelle
Haftalık Program
(effectiveUntil güncelle, yeni entry ekle)
        │
        ↓ Otomatik güncelle
Aylık Plan
(actualHours güncelle)
        │
        ↓ Otomatik güncelle
Dönem Planı
(actualHours güncelle)
```

**Dinamik Yapı:**
- Dönem planı → Değişebilir ✓
- Haftalık plan → Değişebilir ✓
- Günlük plan → Gün içinde bile değişebilir ✓
- Değişiklikler **otomatik yukarı yansır** ✓
- Tüm değişiklikler **audit log**'a kaydedilir ✓

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
  scheduleEntryId: UUID (orijinal plan)
  plannedCourseId: UUID (planlanan ders)
  actualCourseId: UUID (gerçekte verilen ders - farklı olabilir)
  plannedInstructorId: UUID (planlanan eğitmen)
  actualInstructorId: UUID (gerçekte veren eğitmen)
  attendanceId: UUID (nullable)
  status: "PLANNED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED" | "SUBSTITUTED"
  substitutionReason: string? ("INSTRUCTOR_ABSENT" | "NO_SUBSTITUTE" | "OTHER")
  notes: string
  
  // 📚 Müfredat Takibi (V2.0)
  curriculumUnitCompleted: boolean (Bu sınıf bu konuyu tamamladı mı?)
  slotIndex: number (1-7, hangi ders saati)
  
  // Otomatik güncelleme için
  syncedToWeekly: boolean
  syncedToMonthly: boolean
  syncedToTerm: boolean
}
```

**Senkronizasyon Tetikleyici:**
- DailyLesson durumu "COMPLETED" olunca → Otomatik yukarı yayılır
- actualCourseId !== plannedCourseId ise:
  - actualCourse.actualHours += 1 (veya ders süresi)
  - plannedCourse.actualHours değişmez
- Haftalık, aylık, dönemlik planlar otomatik güncellenir

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
  @@index([termId, totalActualHours]) // İlerleme sorguları için
  @@index([updatedAt]) // Son güncellemeleri sıralamak için
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
  id                   String        @id @default(uuid())
  date                 DateTime      @db.Date
  scheduleEntryId      String
  scheduleEntry        ScheduleEntry @relation(fields: [scheduleEntryId], references: [id], onDelete: Cascade)
  
  // Plan vs Gerçekleşen
  plannedCourseId      String
  plannedCourse        Course        @relation("PlannedCourse", fields: [plannedCourseId], references: [id])
  actualCourseId       String        // Gerçekte verilen ders (farklı olabilir)
  actualCourse         Course        @relation("ActualCourse", fields: [actualCourseId], references: [id])
  
  plannedInstructorId  String?
  plannedInstructor    Instructor?   @relation("PlannedInstructor", fields: [plannedInstructorId], references: [id])
  actualInstructorId   String?       // Gerçekte veren eğitmen (farklı olabilir, null olabilir)
  actualInstructor     Instructor?   @relation("ActualInstructor", fields: [actualInstructorId], references: [id])
  
  // ⭐ Özel Etkinlik Alanları (YOKLAMA, KONFERANS, MÜDİRİYET, vb.)
  isSpecialEvent       Boolean       @default(false)
  specialEventId       String?       // Özel etkinlik bağlantısı (YOKLAMA, MÜDİRİYET için)
  specialEvent         SpecialEvent? @relation(fields: [specialEventId], references: [id], onDelete: SetNull)
  conferenceId         String?       // Konferans bağlantısı
  conference           Conference?   @relation(fields: [conferenceId], references: [id], onDelete: SetNull)
  
  // ⭐ Blok Ders Sistemi (İtfaiye için kritik)
  isBlockSchedule      Boolean       @default(false)
  blockDuration        Int?          // Blok ders ise kaç saat (3-5)
  blockTitle           String?       // "İTFAİYE MESLEK DERSLERİ"
  blockStartSlot       Int?          // Bloğun başlangıç slotu (1-7)
  blockEndSlot         Int?          // Bloğun bitiş slotu (1-7)
  
  // ⭐ Fiziksel Aktivite Dersleri
  isPhysicalActivity   Boolean       @default(false)
  requiresSpecialArea  Boolean       @default(false) // Spor salonu, atölye, açık alan
  specialAreaType      String?       // "GYM", "WORKSHOP", "OUTDOOR", "LAB"
  
  // Durum ve detaylar
  attendanceId         String?       @unique
  attendance           Attendance?   @relation(fields: [attendanceId], references: [id])
  status               String        // PLANNED, COMPLETED, CANCELLED, RESCHEDULED, SUBSTITUTED
  substitutionReason   String?       // INSTRUCTOR_ABSENT, NO_SUBSTITUTE, OTHER
  isSubstituteTeacher  Boolean       @default(false) // Yedek eğitmen mi?
  notes                String?       @db.Text
  
  // ⚡ Gerçek Zamanlı Senkronizasyon (Her işlem anında)
  syncedToWeekly       Boolean       @default(false) // Haftalık plana yansıdı mı?
  syncedToMonthly      Boolean       @default(false) // Aylık plana yansıdı mı?
  syncedToTerm         Boolean       @default(false) // Dönem planına yansıdı mı?
  
  // 📚 Müfredat İlerleme Takibi (V2.0 - Circuit Training)
  curriculumUnitCompleted Boolean    @default(true) 
  // true: Bu sınıf bu konuyu tamamladı, müfredattan düş
  // false: Bu sınıf atlandı (Lab'daydı vb.), konuyu tamamlamadı
  
  slotIndex            Int          // Hangi ders saati (1-7)
  
  // Not: Her DailyLesson güncellemesinde (status COMPLETED):
  // 1. Eğitmen İş Yükü: InstructorWorkload.actualHours += 1
  // 2. Müfredat İlerleme: 
  //    - curriculumUnitCompleted = true ise:
  //      Course.curriculumProgress += (1 / kaç sınıfa verildi)
  //    - Örn: 6 sınıfa verildi, her sınıf completed → 1/6 * 6 = 1 saat müfredat
  // 3. Flag'lar true'ya çekilir
  // 4. WebSocket ile tüm bağlı kullanıcılara broadcast edilir
  
  // Değişiklik geçmişi
  scheduleChanges      ScheduleChange[]
  
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt
  
  @@unique([scheduleEntryId, date])
  @@index([date])
  @@index([actualInstructorId])
  @@index([actualCourseId])
  @@index([status])
  @@index([isSpecialEvent])
  @@index([isBlockSchedule])
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
  blocksLessons Boolean @default(true) // Sınav haftası ders yapılmaz (tüm hafta)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([termId])
  @@index([startDate, endDate])
}

// ⭐ Sınav Haftası Kuralı:
// Sınav haftası = Tüm hafta boyunca ders kesimi
// Sadece sınavlar yapılır, hiç ders işlenmez
// Sistem otomatik olarak bu tarihleri atlayarak planlama yapar
```

#### E. CourseInstructor (Ders-Eğitmen Yetkilendirme)
```prisma
model CourseInstructor {
  id            String     @id @default(uuid())
  courseId      String
  course        Course     @relation(fields: [courseId], references: [id], onDelete: Cascade)
  instructorId  String
  instructor    Instructor @relation(fields: [instructorId], references: [id], onDelete: Cascade)
  role          String     // MAIN, SUBSTITUTE
  priority      Int        @default(0) // Yedekler arasında öncelik (0 = en yüksek)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  
  @@unique([courseId, instructorId, role])
  @@index([courseId])
  @@index([instructorId])
}

// 📝 Kurallar:
// 1. Her dersin SADECE 1 MAIN eğitmeni olabilir
// 2. Bir dersin BİRDEN FAZLA SUBSTITUTE (yedek) eğitmeni olabilir
// 3. SUBSTITUTE eğitmenler priority ile sıralanır (0 = en yüksek öncelik)
// 4. Ana eğitmen yokluğunda, yedek eğitmenler dersi devam ettirebilir
// 5. Yedek eğitmen donanım/bilgi bakımından o dersi verebilecek kapasitededir
```

#### F. ScheduleChange (Değişiklik Geçmişi - Audit Trail)
```prisma
model ScheduleChange {
  id                    String    @id @default(uuid())
  dailyLessonId         String?
  dailyLesson           DailyLesson? @relation(fields: [dailyLessonId], references: [id], onDelete: SetNull)
  // ⭐ onDelete: SetNull → DailyLesson silinirse ScheduleChange kalır, sadece link null olur
  // Neden? Audit trail hiçbir zaman silinmemeli (yasal gereklilik)
  
  changeType            String    // INSTRUCTOR_CHANGE, COURSE_CHANGE, CANCELLATION
  originalInstructorId  String?
  originalInstructor    Instructor? @relation("OriginalInstructor", fields: [originalInstructorId], references: [id], onDelete: SetNull)
  newInstructorId       String?
  newInstructor         Instructor? @relation("NewInstructor", fields: [newInstructorId], references: [id], onDelete: SetNull)
  originalCourseId      String?
  originalCourse        Course?   @relation("OriginalCourse", fields: [originalCourseId], references: [id], onDelete: SetNull)
  newCourseId           String?
  newCourse             Course?   @relation("NewCourse", fields: [newCourseId], references: [id], onDelete: SetNull)
  
  // Güvenlik ve Audit
  reason                String?   @db.Text
  approvedBy            String?   // Yönetici user ID
  createdBy             String    // Değişikliği yapan kullanıcı ID (zorunlu)
  ipAddress             String?   // IP adresi
  userAgent             String?   @db.Text // Browser bilgisi
  
  createdAt             DateTime  @default(now())
  
  @@index([dailyLessonId])
  @@index([createdAt])
  @@index([createdBy])
}

// 🔐 Cascade Delete Stratejisi Açıklaması:
//
// onDelete: Cascade → Ana kayıt silinince ilişkili kayıtlar da silinir
//   Örnek: Term silinince TermCoursePlan'lar da silinir (mantıklı)
//
// onDelete: SetNull → Ana kayıt silinince ilişki null olur, kayıt kalır
//   Örnek: DailyLesson silinince ScheduleChange kalır (audit trail korunur)
//
// onDelete: Restrict → Ana kayıtta ilişkili kayıt varsa silinmez
//   Örnek: Instructor'ın aktif dersi varsa silinemez (hata verir)
```

#### G. InstructorWorkload (Eğitmen İş Yükü Takibi)
```prisma
model InstructorWorkload {
  id              String     @id @default(uuid())
  instructorId    String
  instructor      Instructor @relation(fields: [instructorId], references: [id], onDelete: Cascade)
  termId          String
  term            Term       @relation(fields: [termId], references: [id], onDelete: Cascade)
  weekNumber      Int        // Yılın kaçıncı haftası (1-53)
  year            Int
  
  // 💼 İş Yükü Takibi (Fiziksel Ders Sayısı)
  plannedHours    Int        @default(0) // Bu hafta planlanan saat
  actualHours     Int        @default(0) // Bu hafta gerçekleşen saat (Sınıf başına +1)
  maxWeeklyHours  Int        @default(35) // Bu eğitmen için maksimum saat
  utilization     Float      @default(0) // Kullanım oranı (actualHours / maxWeeklyHours)
  
  // 📚 Müfredat Katkısı (Konu Bazlı İlerleme)
  curriculumContribution Float @default(0)
  // Örn: 6 sınıfa ders verdi, her biri completed → 6 saat iş + 1 saat müfredat katkı
  
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  
  @@unique([instructorId, termId, weekNumber, year])
  @@index([instructorId, termId])
  @@index([weekNumber, year])
  @@index([utilization]) // Düşük yüklü eğitmenleri bulmak için
}

// ⚡ Otomatik Güncelleme:
// Her DailyLesson COMPLETED olduğunda:
// 1. actualHours += 1 (Fiziksel ders)
// 2. curriculumContribution += (1 / o günkü toplam sınıf sayısı)
//    - Örn: Bugün 5 sınıfa ders verildi → her sınıf +0.2 müfredat katkı
// 3. utilization = actualHours / maxWeeklyHours
```

#### I. DutySchedule (Nöbet Çizelgesi)
```prisma
model DutySchedule {
  id           String     @id @default(uuid())
  instructorId String
  instructor   Instructor @relation(fields: [instructorId], references: [id], onDelete: Cascade)
  dutyDate     DateTime   @db.Date
  shiftType    String     @default("24_HOUR") // 24 saat nöbet
  notes        String?    @db.Text
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  
  @@unique([instructorId, dutyDate])
  @@index([dutyDate])
  @@index([instructorId])
}

// 📖 Açıklama:
// - Nöbetler aylık hazırlanır ve sisteme girilir
// - 24 saat nöbet esası
// - Nöbet günü: Eğitmen ders VEREMEZ
// - Nöbet ertesi gün: Eğitmen ders VEREMEZ (dinlenme)
// - Nöbet Arayüzü: Ayrı modülde geliştirilecek
```

#### J. TermSettings (Dönem Ayarları - Esnek Saat Yönetimi)
```prisma
model TermSettings {
  id                String   @id @default(uuid())
  termId            String   @unique
  term              Term     @relation(fields: [termId], references: [id], onDelete: Cascade)
  
  // Saat Dilimleri Ayarları
  firstLessonStart  String   @default("08:00") // İlk ders başlangıç saati
  lessonDuration    Int      @default(45)      // Ders süresi (dakika)
  breakDuration     Int      @default(15)      // Tenefüs süresi (dakika)
  lunchBreakStart   Int      @default(5)       // Öğle yemeği hangi dersten sonra (5. ders)
  lunchBreakDuration Int     @default(60)      // Öğle yemeği süresi (dakika)
  etudDuration      Int      @default(90)      // ETÜD süresi (dakika) - Akşam yemeği sonrası
  
  // Otomatik hesaplanan saat dilimleri (JSON)
  hourSlots         Json     // [{"slot": 1, "start": "08:00", "end": "08:45"}, ...]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// Sistem otomatik hesaplar:
// 1-5. dersler: firstLessonStart'tan başlar, 45dk ders + 15dk tenefüs
// Öğle yemeği: 5. dersten sonra
// 6-7. dersler: Öğle yemeğinden sonra
// ETÜD: 7. dersten sonra, akşam yemeği sonrası (müfredattan sayılmaz)
```

#### K. SpecialEvent (Özel Etkinlikler - YOKLAMA, MÜDİRİYET)
```prisma
model SpecialEvent {
  id              String        @id @default(uuid())
  eventType       String        // YOKLAMA, MANAGEMENT, SOCIAL_SPORTS, CEREMONY
  eventTitle      String
  description     String?       @db.Text
  duration        Int           @default(1) // Kaç ders saati (genellikle 1)
  
  // Zamansal bilgiler
  dayOfWeek       Int?          // 1=Pazartesi, 5=Cuma (YOKLAMA ve MÜDİRİYET için)
  slotIndex       Int?          // Hangi ders saati (1-7)
  
  // Özellikler
  requiresInstructor      Boolean @default(false) // Eğitmen ataması gerekli mi?
  allClassesTogether      Boolean @default(false) // Tüm sınıflar birlikte mi?
  countsTowardCurriculum  Boolean @default(false) // Müfredattan sayılır mı?
  
  // Yönetimsel bilgiler
  managedBy       String?       // "Okul Müdürü", "Eğitmen Gözetmenliği"
  notes           String?       @db.Text
  
  // İlişkiler
  dailyLessons    DailyLesson[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([eventType])
  @@index([dayOfWeek, slotIndex])
}

// Örnekler:
// YOKLAMA:
//   - eventType: "YOKLAMA"
//   - dayOfWeek: 5 (Cuma)
//   - slotIndex: 1
//   - requiresInstructor: false
//   - allClassesTogether: true
//   - managedBy: "Eğitmen Gözetmenliği"
//
// MÜDİRİYET:
//   - eventType: "MANAGEMENT"
//   - dayOfWeek: 5 (Cuma)
//   - slotIndex: 7
//   - requiresInstructor: false
//   - allClassesTogether: true
//   - managedBy: "Okul Müdürü"
//
// SOSYAL_SPORTS:
//   - eventType: "SOCIAL_SPORTS"
//   - duration: 2
//   - requiresInstructor: false
//   - requiresSpecialArea: true
```

#### L. Conference (Konferans Sistemi)
```prisma
model Conference {
  id                  String          @id @default(uuid())
  conferenceTitle     String
  topic               String          @db.Text
  description         String?         @db.Text
  
  // Konuşmacı Bilgileri
  externalSpeakerId   String?
  externalSpeaker     ExternalSpeaker? @relation(fields: [externalSpeakerId], references: [id], onDelete: SetNull)
  
  // Zamansal bilgiler
  scheduledDate       DateTime?       @db.Date
  duration            Int             @default(2) // Genellikle çift ders (2 saat)
  
  // Hedef kitle
  targetClasses       Json?           // ["A", "B", "C"] veya ["ALL"]
  isAllClasses        Boolean         @default(false)
  
  // Yer ve ekipman
  requiresSpecialRoom Boolean         @default(false)
  specialRoomType     String?         // "AUDITORIUM", "CONFERENCE_HALL"
  requiredEquipment   Json?           // ["Projeksiyon", "Ses Sistemi"]
  
  // Müfredat
  countsTowardCurriculum Boolean      @default(false)
  courseId            String?         // Hangi ders müfredatına sayılır (varsa)
  course              Course?         @relation(fields: [courseId], references: [id], onDelete: SetNull)
  
  // İlişkiler
  dailyLessons        DailyLesson[]
  
  // Yönetim
  status              String          @default("PLANNED") // PLANNED, CONFIRMED, COMPLETED, CANCELLED
  organizerId         String?         // Organize eden kullanıcı ID
  notes               String?         @db.Text
  
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
  
  @@index([scheduledDate])
  @@index([status])
  @@index([externalSpeakerId])
}
```

#### M. ExternalSpeaker (Dış Konuşmacılar)
```prisma
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
  
  // Uzmanlık Alanları
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

#### J. TermSettings (Dönem Ayarları - Esnek Saat Yönetimi)
```

### 2. Mevcut Modellere Eklemeler

#### Course Modeline Eklemeler:
```prisma
model Course {
  // Mevcut alanlar...
  
  fourMonthHours    Int?     // 4 aylık dönem için hedef saat
  sixMonthHours     Int?     // 6 aylık dönem için hedef saat
  requiresLab       Boolean  @default(false) // Bilgisayar lab gerekli mi?
  
  // 🎯 Program Kapsamı (V2.0 - KRİTİK)
  programScope      String   @default("COMMON") // COMMON, POLIS_ONLY, ITFAIYE_ONLY
  // "COMMON": Hem Polis hem İtfaiye alır
  // "POLIS_ONLY": Sadece Polis sınıflarına atanır (A-E)
  // "ITFAIYE_ONLY": Sadece İtfaiye sınıfına atanır (F)
  
  // 📚 Müfredat Hedefi (Konu Bazlı Saat)
  curriculumHours   Int?     // Örn: 40 Konu/Saat (Sınıf tekrar sayısı önemsiz)
  // Not: fourMonthHours/sixMonthHours → Eğitmen iş yükü planlaması için
  //      curriculumHours → Müfredat ilerleme takibi için
  
  termCoursePlans   TermCoursePlan[]
  courseInstructors CourseInstructor[] // Ana ve yedek eğitmenler
  conferences       Conference[]       // Bu derse bağlı konferanslar
  
  // Değişiklik takibi için
  originalScheduleChanges ScheduleChange[] @relation("OriginalCourse")
  newScheduleChanges      ScheduleChange[] @relation("NewCourse")
  
  @@index([programScope]) // Program filtreleme için
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
  
  // 👔 Unvan ve Tip
  title             String?  // Örn: "Emniyet Müdürü", "Dr.", "Komiser", "İtfaiye Uzmanı"
  
  type              String   @default("STAFF") // STAFF (Sabit Kadro), EXTERNAL (Dış Eğitmen)
  // Not: "STAFF" = Okulun sabit kadrosu, tam zamanlı, 24 saat nöbet tutar
  //      "EXTERNAL" = Dışarıdan gelen eğitmen, sözleşmeli, nöbet tutmaz
  
  maxWeeklyHours    Int      @default(35)    // Haftalık maksimum ders saati
  
  // Not: 24 Saat Nöbet Sistemi
  // - Nöbet günü: Ders VEREMEZ (24 saat görevde)
  // - Nöbet ertesi: Ders VEREMEZ (dinlenme)
  // - DutySchedule tablosundan otomatik kontrol edilir
  
  courseInstructors CourseInstructor[] // Ana ve yedek olduğu dersler
  dailyLessons      DailyLesson[] @relation("ActualInstructor")
  plannedLessons    DailyLesson[] @relation("PlannedInstructor")
  workloadRecords   InstructorWorkload[] // Haftalık iş yükü takibi
  dutySchedules     DutySchedule[] // Nöbet çizelgesi
  
  // Değişiklik takibi için
  originalScheduleChanges ScheduleChange[] @relation("OriginalInstructor")
  newScheduleChanges      ScheduleChange[] @relation("NewInstructor")
  
  @@index([type]) // Sabit Kadro/Dış filtreleme için
}
```

#### ScheduleEntry Modeline Eklemeler:
```prisma
model ScheduleEntry {
  // Mevcut alanlar...
  
  slotIndex         Int      // Hangi ders saati (1-7)
  // 1 = 08:00-08:45, 2 = 08:55-09:40, ..., 7 = 14:40-15:25
  
  programType       String   @default("POLIS") // POLIS, ITFAIYE
  // İtfaiyeciler için ayrı program oluşturulur, aynı mantık
  
  // 💻 Mekan Yönetimi
  isLabSession      Boolean  @default(false)
  // 📖 Açıklama:
  // true: Bu saatte sınıf Bilgisayar Lab'a GİDER (fiziksel taşınma)
  //       - Sınıf kendi sınıfından kalkar, Lab'a gider
  //       - Ders işlenir, ders bitince geri döner
  // false: Sınıf kendi sınıfında kalır (normal ders)
  // 
  // ⚠️ Lab mutex kontrolü: Aynı slot'ta sadece 1 sınıfın isLabSession=true olabilir
  
  dailyLessons      DailyLesson[]
  
  // ⚡ Performans Index'leri
  @@index([dayOfWeek, slotIndex])           // Gün + slot sorgular
  @@index([slotIndex])                      // Slot bazlı sorgular
  @@index([effectiveFrom, effectiveTo])     // Tarih aralığı sorguları
  @@index([classId, dayOfWeek])             // Sınıf + gün sorguları
  @@index([instructorId, dayOfWeek])        // Eğitmen + gün sorguları
  @@index([courseId])                       // Ders bazlı sorgular
  @@index([programType])                    // Program türü filtreleme
  @@index([isLabSession])                   // Lab oturumu filtreleme
}
```

---

## 🔄 Döngüsel (Circuit) Eğitim Algoritması ve Vagon Mantığı

Sisteminin otomatik planlama motoru **"Gezici Eğitmen - Sabit Müfredat İlerlemesi"** prensibiyle çalışır.

### 1. Vagon Mantığı (Trainer Movement / Circuit Training)

**Amaç:** Eğitmen okula geldiğinde, boşluk vermeden sınıfları sırayla gezmesi hedeflenir.

**Temel Mantık:**
```
Eğitmen → Sınıf A (1. Ders) → Sınıf B (2. Ders) → Sınıf C (3. Ders) → ...
         └─────────────── Vagon Rotasyonu ───────────────────────┘
```

**Rotasyon Kuralları:**

1. **Sıralı Geçiş:** Eğitmen A'dan başlar, B, C, D, E, F sırasıyla gezer
2. **Atlama İstisnaları:**
   - Eğer C Sınıfı o saatte Lab'da ise → C atlanır, D'ye geçilir
   - Eğer E Sınıfı İtfaiye ise ve ders Polis özel ise → E atlanır
3. **Boşluk Yönetimi:** Atlanan vagonlarda eğitmen idari işlerle ilgilenebilir veya başka sınıfa atanabilir

**Örnek Rotasyon:**
```
Pazartesi - Ahmet Bey (Ceza Yasası - Polis Dersi)

08:00-08:45  A Sınıfı (Polis) → ✓ Ders Verildi
08:55-09:40  B Sınıfı (Polis) → ✓ Ders Verildi
09:50-10:35  C Sınıfı (Lab'da) → ✗ ATLANDİ
10:45-11:30  D Sınıfı (Polis) → ✓ Ders Verildi
11:40-12:25  E Sınıfı (Polis) → ✓ Ders Verildi
             F Sınıfı (İtfaiye) → ✗ ATLANDİ (Ders kapsamında değil)

Sonuç:
- Ahmet İş Yükü: 4 Saat
- Müfredat: 1 Saat
- C ve F sınıfları bu konuda geride
```

### 2. Program Türü Filtresi (Scope Check)

Her ders atanırken `programScope` kontrol edilir:

**A. Polis Özel Ders (POLIS_ONLY):**
```typescript
Course: "Polis Müdahale Yöntemleri"
programScope: "POLIS_ONLY"

→ Atanabilir: A, B, C, D, E Sınıfları
→ Atlanamaz: F Sınıfı (İtfaiye)
```

**B. İtfaiye Özel Ders (ITFAIYE_ONLY):**
```typescript
Course: "Yangın Güvenliği"
programScope: "ITFAIYE_ONLY"

→ Atanabilir: F Sınıfı
→ Atlanamaz: A, B, C, D, E (Polis)
```

**C. Ortak Ders (COMMON):**
```typescript
Course: "İlk Yardım"
programScope: "COMMON"

→ Atanabilir: Tüm sınıflar (A-F)
→ Tam rotasyon planlanır
```

### 3. Blok Ders Yönetimi (Verimlilik Optimizasyonu)

**Amaç:** Eğitmen sınıfa girdiğinde verimi artırmak için **peş peşe 2 saat** tercih edilir.

**Algoritma Tercihi:**
```
Öncelik 1: Blok Atama (2 Saat Üst Üste)
  A Sınıfı → 08:00-08:45 (1. Ders) + 08:55-09:40 (2. Ders)
  
Öncelik 2: Tek Saat (Blok Mümkün Değilse)
  A Sınıfı → 08:00-08:45 (1. Ders)
  B Sınıfı → 08:55-09:40 (2. Ders)
```

**Blok Atama Örneği:**
```
Ceza Yasası - Ahmet Bey (Blok Tercihli)

Pazartesi:
08:00-09:40  A Sınıfı (2 Saat Blok)
09:50-11:30  B Sınıfı (2 Saat Blok)
11:40-12:25  C Sınıfı (1 Saat - Öğle öncesi)

Salı:
08:00-09:40  D Sınıfı (2 Saat Blok)
09:50-10:35  E Sınıfı (1 Saat)

Sonuç:
- 5 Sınıfa toplam 8 saat ders verildi
- Ahmet İş Yükü: 8 Saat
- Müfredat: 4 Saat (4 farklı konu işlendi)
```

### 4. Otomatik Planlama Algoritması Adımları

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
    const instructor = getInstructor(entry.instructorId);
    
    // Eğitmen nöbette mi kontrol et (Aylık nöbet çizelgesinden)
    const isOnDuty = checkIfOnDuty(entry.instructorId, date);
    const wasOnDutyYesterday = checkIfOnDuty(entry.instructorId, subtractDays(date, 1));
    
    // ⭐ 24 Saat Nöbet Sistemi
    // Nöbet günü: DERS VEREMEZ
    // Nöbet ertesi gün: DERS VEREMEZ (dinlenme)
    const needsSubstitute = isOnDuty || wasOnDutyYesterday;
    
    let actualInstructor = entry.instructorId;
    let status = 'PLANNED';
    let notes = null;
    
    if (needsSubstitute) {
      // Otomatik yedek bul
      const substitute = findSubstituteInstructor(entry.courseId, date);
      
      if (substitute) {
        actualInstructor = substitute.id;
        const reason = isOnDuty ? 'nöbette' : 'dün nöbetteydi';
        notes = `Otomatik yedek: ${substitute.name} (${instructor.name} ${reason})`;
      } else {
        // ❌ Yedek bulunamadı → Yönetici müdahalesi gerekli
        actualInstructor = null;
        status = 'PENDING_INSTRUCTOR'; // Yönetici atama yapana kadar bekliyor
        const reason = isOnDuty ? 'nöbette' : 'dün nöbetteydi';
        notes = `⚠️ Yedek eğitmen bulunamadı - ${instructor.name} ${reason}`;
        
        // Yöneticiye bildirim gönder
        sendNotification({
          type: 'URGENT',
          message: `${entry.course.name} dersi için acil eğitmen ataması gerekiyor!`,
          date: date,
          courseId: entry.courseId
        });
      }
    }
    
    return {
      date,
      scheduleEntryId: entry.id,
      plannedCourseId: entry.courseId,
      actualCourseId: entry.courseId,
      plannedInstructorId: entry.instructorId,
      actualInstructorId: actualInstructor,
      attendanceId: null,
      status: status,
      notes: notes,
      syncedToWeekly: false,
      syncedToMonthly: false,
      syncedToTerm: false
    };
  });
}

// ⚡ Gerçek Zamanlı Senkronizasyon Trigger
async function onDailyLessonComplete(dailyLessonId: string) {
  const lesson = await prisma.dailyLesson.update({
    where: { id: dailyLessonId },
    data: { status: 'COMPLETED' }
  });
  
  // 1. Aylık plana senkronize et
  await updateMonthlyPlan(lesson.actualCourseId, lesson.date);
  
  // 2. Dönem planına senkronize et
  await updateTermPlan(lesson.actualCourseId);
  
  // 3. Eğitmen iş yükünü güncelle
  await updateInstructorWorkload(lesson.actualInstructorId, lesson.date);
  
  // 4. Senkronizasyon flag'larını işaretle
  await prisma.dailyLesson.update({
    where: { id: dailyLessonId },
    data: {
      syncedToWeekly: true,
      syncedToMonthly: true,
      syncedToTerm: true
    }
  });
  
  // 5. WebSocket ile tüm bağlı kullanıcılara broadcast
  websocket.broadcast('lesson:completed', {
    lessonId: dailyLessonId,
    courseId: lesson.actualCourseId,
    date: lesson.date
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
): {
  available: boolean;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  reason?: string;
} {
  // ⭐ Nöbette mi? → 24 saat nöbet, DERS VEREMEZ!
  const isOnDuty = dutySchedules.some(duty => 
    duty.instructorId === instructorId && 
    isSameDay(duty.date, date)
  );
  if (isOnDuty) {
    return { available: false, priority: 'NORMAL', reason: 'ON_DUTY_24H' };
  }
  
  // Dün nöbette miydi? → Dinlenme günü, DERS VEREMEZ!
  const yesterday = subtractDays(date, 1);
  const wasOnDutyYesterday = dutySchedules.some(duty =>
    duty.instructorId === instructorId &&
    isSameDay(duty.date, yesterday)
  );
  if (wasOnDutyYesterday) {
    return { available: false, priority: 'NORMAL', reason: 'AFTER_DUTY_REST' };
  }
  
  // Aynı saatte başka dersi var mı?
  const hasConflict = scheduleEntries.some(entry =>
    entry.instructorId === instructorId &&
    entry.dayOfWeek === date.getDay() &&
    hoursOverlap(entry.startTime, entry.endTime, hour)
  );
  if (hasConflict) {
    return { available: false, priority: 'NORMAL', reason: 'SCHEDULE_CONFLICT' };
  }
  
  // Nöbet günü ise yüksek öncelikle önerilir
  if (isOnDuty) {
    return { available: true, priority: 'HIGH', reason: 'ON_DUTY_RECOMMENDED' };
  }
  
  return { available: true, priority: 'NORMAL' };
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

/instructors                → Eğitmen listesi
/instructors/[id]           → Eğitmen detayı
/instructors/[id]/courses   → Eğitmenin ana/yedek dersleri

/terms/[id]/plan            → Dönem planı oluştur/görüntüle
/terms/[id]/plan/monthly    → Aylık plan görünümü
/terms/[id]/plan/weekly     → Haftalık program görünümü
/terms/[id]/plan/daily      → Günlük ders kayıtları
/terms/[id]/holidays        → Resmi tatil takvimi girişi ⭐

/schedule                   → Haftalık program ana görünüm (tüm sınıflar)
/schedule/daily             → Günlük görünüm (bugünün dersleri)

Not: Dış eğitmen için ayrı müsaitlik sayfası yok,
     doğrudan haftalık program oluştururken seçilir.
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

### 5. Dış Eğitmen Atama Süreci (Manuel Planlama) ⭐

**Önemli:** Dış eğitmenler için sabit müsaitlik takvimi YOK!
Her planlama manuel yapılır, istenen gün/saate atama yapılır.

**Akış:**

```
ADIM 1: Yönetici haftalık program oluşturuyor

[Haftalık Program - Pazartesi 09:00-10:00]

Sınıf: A Sınıfı
Ders: Olay Yeri Güvenliği

Eğitmen Seç:
┌────────────────────────────────────────┐
│ ○ Ahmet Bey (Kadrolu)                    │
│ ● Celal ERDEN (Dış Eğitmen) ⭐          │
│ ○ Mehmet Bey (Kadrolu)                   │
└────────────────────────────────────────┘

[İptal]  [Kaydet]

---

ADIM 2: Atama tamamlandı

✓ Pazartesi 09:00-10:00 - Celal ERDEN (Dış Eğitmen)

→ Normal atama gibi işlem görür
→ İstenirse değiştirilebilir (başka eğitmen atanabilir)
→ Özel kilit yok, standart ScheduleEntry

---

ADIM 3: Gelecek hafta farklı gün/saate atanabilir

[Haftalık Program - Çarşamba 14:00-16:00]
→ Celal ERDEN yine seçilebilir
→ Farklı gün/saat, sorun yok!
```

**Nasıl Çalışır:**
1. Yönetici manuel olarak ders programı oluşturur
2. Her ders için eğitmen seçer (dış eğitmen dahil)
3. Dış eğitmen seçilince normal ScheduleEntry oluşturulur (özel kilit yok)
4. İstenirse bu atama değiştirilebilir, başka eğitmen atanabilir
5. Sonraki hafta başka gün/saate yine aynı veya başka dış eğitmen atanabilir
6. Sistem sabit müsaitlik takip etmez, her atama bağımsızdır

### 6. Resmi Tatil Takvimi Girişi (Yeni Sayfa) ⭐

```
[Resmi Tatil Takvimi - 2024-2025 Güz Dönemi]

Tanımlı Tatiller:
┌─────────────────────────────────────────────┐
│ 📅 29 Ekim 2024 (Salı)                      │
│    Cumhuriyet Bayramı                        │
│                           [Düzenle] [Sil]   │
├─────────────────────────────────────────────┤
│ 📅 23 Nisan 2025 (Çarşamba)                 │
│    Ulusal Egemenlik ve Çocuk Bayramı        │
│                           [Düzenle] [Sil]   │
└─────────────────────────────────────────────┘

[+ Yeni Tatil Ekle]

--- Modal: Yeni Tatil Ekle ---
Tarih: [____/____/____]
Açıklama: [_____________________]
Tür: ○ Tek Gün  ○ Aralık (Başlangıç-Bitiş)

[İptal]  [Kaydet]
```

### 7. Eğitmen Nöbet Uyarısı (Modal)

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

### 1. Operasyon Yönetimi (V2.0 - Yeni)

```typescript
// Operasyon Merkezi - Günlük Görünüm
GET /api/operation/daily-view?date=2025-01-27
Response: {
  date: "2025-01-27",
  slots: [
    {
      slotIndex: 1,
      startTime: "08:00",
      endTime: "08:45",
      classes: [
        {
          classId: "uuid",
          className: "A Sınıfı",
          programType: "POLIS",
          course: { name: "Ceza Yasası" },
          instructor: { name: "Ahmet YILMAZ", title: "Emniyet Müdürü" },
          location: "A Sınıfı", // veya "Bilgisayar Lab"
          isLabSession: false,
          status: "COMPLETED"
        },
        // ... B, C, D, E, F sınıfları
      ]
    },
    // ... 7 ders slotu
  ],
  summary: {
    totalLessons: 42, // 7 slot × 6 sınıf
    completedLessons: 38,
    cancelledLessons: 2,
    labConflicts: 0
  }
}

// Acil Yedek Atama
POST /api/operation/assign-substitute
Body: {
  dailyLessonId: "uuid",
  reason: "INSTRUCTOR_ABSENT",
  substituteInstructorId: "uuid" // veya null (sistem önerisini kullan)
}
Response: {
  success: true,
  assigned: {
    instructorName: "Mehmet KAR",
    reason: "Otomatik: Yedek eğitmen (Ahmet YILMAZ hasta)"
  }
}

// Etüt İşaretleme (Ders Verilmedi)
POST /api/operation/mark-as-study-hall
Body: {
  dailyLessonId: "uuid",
  reason: "Eğitmen bulunamadı, etüt yapıldı"
}
Response: {
  status: "CANCELLED",
  curriculumUnitCompleted: false // Müfredattan düşmez
}

// Müfredat İlerleme Raporu
GET /api/reports/curriculum-progress?termId=uuid&courseId=uuid
Response: {
  courseName: "Ceza Yasası",
  totalCurriculumHours: 40,
  completedHours: 12,
  remainingHours: 28,
  progressPercentage: 30,
  classCoverage: [
    {
      className: "A Sınıfı",
      completedUnits: 12,
      missedUnits: 0,
      status: "ON_TRACK"
    },
    {
      className: "C Sınıfı",
      completedUnits: 10,
      missedUnits: 2, // Lab rotasyonundan 2 konu kaçırdı
      status: "BEHIND"
    }
  ]
}
```

### 2. Dönem Planı API'leri

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

### 3. Eğitmen Müsaitlik ve Yedek Sistemi API'leri

```typescript
// Eğitmen müsaitliğini kontrol et
GET /api/instructors/[id]/availability?date=2024-12-18
Response: {
  available: boolean,
  reason?: string // "ON_DUTY" | "AFTER_DUTY" | "CONFLICT" | "NOT_AVAILABLE_DAY"
}

// Akıllı yedek eğitmen önerisi (öncelik sıralı)
GET /api/courses/[courseId]/suggest-substitute?date=2024-12-18&hour=2
Response: {
  substitutes: [
    {
      instructor: Instructor,
      isAuthorized: boolean, // Bu dersin yedek eğitmeni mi?
      priority: number,
      teachingOwnCourse: boolean, // Kendi dersini mi verecek?
      ownCourseProgress: { // Kendi dersinin ilerleme durumu
        totalPlanned: number,
        totalActual: number,
        remaining: number
      }
    }
  ],
  recommendation: string // Önerilen seçim açıklaması
}

// Ders-eğitmen yetkilendirme yönetimi
POST /api/courses/[courseId]/instructors
Body: {
  instructorId: string,
  role: "MAIN" | "SUBSTITUTE",
  priority?: number
}
Response: CourseInstructor

DELETE /api/courses/[courseId]/instructors/[instructorId]
Response: { success: boolean }

// Değişiklik geçmişi
GET /api/schedule-changes?date=2024-12-18&type=INSTRUCTOR_CHANGE
Response: ScheduleChange[]
```

### 4. Resmi Tatil API'leri ⭐ YENİ

```typescript
// Resmi tatil listesi
GET /api/terms/[termId]/holidays
Response: Holiday[]

// Resmi tatil ekle
POST /api/terms/[termId]/holidays
Body: {
  date: Date,
  description: string,
  isRange?: boolean,
  endDate?: Date
}
Response: Holiday

// Resmi tatil sil
DELETE /api/holidays/[id]
Response: { success: boolean }

// Not: Dış eğitmen müsaitlik API'si yok!
// Dış eğitmen manuel olarak ScheduleEntry'ye atanabilir.
// Sistem atanan saatleri otomatik kilitler.
```

### 5. Senkronizasyon API'leri

```typescript
// Günlük dersi tamamla ve yukarı senkronize et
PUT /api/daily-lessons/[id]/complete
Body: {
  actualCourseId: string,
  actualInstructorId: string,
  notes?: string
}
Response: {
  dailyLesson: DailyLesson,
  syncResult: {
    weeklyUpdated: boolean,
    monthlyUpdated: boolean,
    termUpdated: boolean
  }
}

// Manuel senkronizasyon tetikle (hata durumunda)
POST /api/sync/daily-to-term
Body: {
  dailyLessonIds: string[]
}
Response: {
  synced: number,
  failed: number,
  errors: string[]
}

// İlerleme raporu (dönem/aylık/haftalık karşılaştırma)
GET /api/terms/[termId]/progress
Response: {
  courses: [
    {
      courseId: string,
      courseName: string,
      termPlanned: number,
      termActual: number,
      monthlyProgress: [
        { month: number, planned: number, actual: number }
      ]
    }
  ]
}
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

### ✅ Netleştirilmiş Kararlar:

1. **Resmi Tatil Takvimi:** ✓ Yönetici planlama aşamasında manuel girer (tek tek)
2. **6 Aylık Dönem Sınavları:** ✓ 2 Ara Sınav + 1 Final (bütünleme yok)
3. **Dış Eğitmen Sistemi:** ✓ Manuel planlama, sabit müsaitlik yok, her seferinde farklı gün/saat
4. **Yedek Eğitmen Sistemi:** ✓ Ders bazlı yetkilendirme (CourseInstructor modeli)
5. **Saat Hesaplama:** ✓ Verilen ders hangi ders ise o dersten düşer, verilmeyen düşmez
6. **Çift Yönlü Senkronizasyon:** ✓ Günlük değişiklik otomatik yukarı yansır
7. **Geçmiş Veri Migrasyonu:** ✓ Şimdilik yok, ileride olabilir (UI esnekliği sağlanacak)

### ❓ Açıklamalar:

**WebSocket / Gerçek Zamanlı Güncelleme:**
- **Ne İşe Yarar:** Birden fazla kullanıcı aynı anda sistemi kullanırsa, bir kullanıcının yaptığı değişiklik (örn: ders atama) diğer kullanıcıların ekranında **anında** görünür.
- **Örnek:** 
  - Yönetici A, Pazartesi 09:00'a ders atar
  - Yönetici B aynı anda haftalık programı görüntülüyor
  - WebSocket ile Yönetici B'nin ekranı otomatik yenilenir (sayfa yenilemeden)
- **Gerekli mi?** İlk fazda hayır, sonradan eklenebilir. Sayfa yenileme yeterli başlangıç için.

**Geçmiş Veri Migrasyonu:**
- **Ne Demek:** Sistem devreye girmeden önce yapılan dönemler var mı? (örn: 2023-2024 dönemi)
- **Soru:** Bu eski dönemlerin verilerini yeni sisteme girmek istiyor musunuz?
  - Eski dönem planları
  - Eski derslerin gerçekleşen saatleri
  - Eski eğitmen atamaları
- **Cevap:** __________ (Evet/Hayır netleştirin)

### 🎯 Sonraki Adım:
1. **İmplementasyon seçeneği belirle** (A, B veya C)
2. **Kodlamaya başla** (tüm gereksinimler netleşti ✓)

---

## 📊 İstatistikler ve Tahminler

### Veritabanı Değişiklikleri:
- Yeni model sayısı: 6 (TermCoursePlan, MonthlyCoursePlan, DailyLesson, ExamSchedule, CourseInstructor, ScheduleChange)
- Güncellenecek model sayısı: 5 (Course, Class, Instructor, ScheduleEntry, Term)
- Toplam yeni ilişki: 15+

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
- ✅ Algoritma esnek ve manuel müdahale her aşamada mümkün
- ✅ Günlük değişiklikler otomatik yukarı yansır (senkronizasyon)
- ✅ Yedek eğitmen sistemi ders bazlı tanımlanır
- ⚠️ Gerçek zamanlı güncellemeler gerekli mi? (WebSocket?) → Sonradan eklenebilir
- ⚠️ Geçmiş dönem verileri migrate edilecek mi? → Netleştirilecek
- ⚠️ Dış eğitmenlerin müsaitlik takvimi nasıl girilecek? → UI tasarlanacak

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

**Doküman Durumu:** ✅ Güncellendi - Kodlamaya Hazır  
**Son Güncelleme:** 25 Aralık 2025  
**Versiyon:** 1.2  
**Hazırlayan:** GitHub Copilot

**Önemli Notlar:**
- ✅ Esnek saat dilimi sistemi korundu
- ✅ 24 Saat nöbet sistemi entegre edildi
- ✅ Bütünleme ve mazeret sınavları sisteme dahil
- ✅ Lab sistemi netleştirildi (fiziksel taşınma)
- ✅ Eğitmen günlük tüm sınıflara ders verir (sıra önemli değil)
- ✅ Excel dosyaları referans olarak belirtildi
- ✅ Özel etkinlikler sistemi eklendi (YOKLAMA, KONFERANS, MÜDİRİYET)
- ✅ Blok ders yapısı tanımlandı (İtfaiye için kritik)
- ✅ Fiziksel aktivite dersleri ayrımı yapıldı

---

---

## 🗺️ YOL HARİTASI VE GELİŞTİRME PLANI

### 📊 Güncel Durum Özeti

**Tamamlanan:**
- ✅ Excel programlar analiz edildi (Polis 66. Dönem, İtfaiye 17. Dönem)
- ✅ Gerçek operasyonel gereksinimler belirlendi
- ✅ Özel etkinlikler sistemi tasarlandı (YOKLAMA, KONFERANS, MÜDİRİYET)
- ✅ Blok ders yapısı tanımlandı (İtfaiye için kritik)
- ✅ Veritabanı şeması güncellendi (10+ yeni model/alan)
- ✅ Fiziksel aktivite dersleri kategorize edildi

**Eklenen Yeni Özellikler:**
1. **SpecialEvent Modeli**: YOKLAMA, MÜDİRİYET, SOSYAL_SPORTS etkinlikleri
2. **Conference + ExternalSpeaker**: Dış konuşmacı sistemi
3. **Blok Ders Sistemi**: İtfaiye meslek dersleri için kesintisiz zaman blokları
4. **Fiziksel Alan Yönetimi**: Spor salonu, atölye, açık alan rezervasyonu
5. **ETÜD Saati**: Akşam yemeği sonrası, müfredat dışı çalışma zamanı

---

### 🎯 FAZA GÖRE GELİŞTİRME PLANI

#### **FAZ 0: Veritabanı ve Temel Yapı (3-4 Gün)**

**Hedef:** Yeni modelleri Prisma şemasına ekle ve veritabanını hazırla

**Yapılacaklar:**
1. **Prisma Şema Güncellemesi**
   - [ ] `SpecialEvent` modelini ekle (YOKLAMA, MÜDİRİYET, vb.)
   - [ ] `Conference` ve `ExternalSpeaker` modellerini ekle
   - [ ] `DailyLesson` modelini güncelle (özel etkinlik alanları)
   - [ ] `TermSettings` modeline `etudDuration` ekle
   - [ ] İlişkileri kur (Conference → Course, DailyLesson → SpecialEvent)

2. **Migrasyon ve Seed**
   - [ ] `prisma migrate dev` çalıştır
   - [ ] Seed script'e örnek özel etkinlikler ekle
   - [ ] Test verileri oluştur (örnek YOKLAMA, MÜDİRİYET, KONFERANS)

3. **Tip Güvenliği**
   - [ ] Prisma Client'ı yeniden generate et
   - [ ] TypeScript tiplerini kontrol et

**Çıktı:** Güncel veritabanı şeması ve seed verileri

---

#### **FAZ 1: Özel Etkinlikler Yönetimi (4-5 Gün)**

**Hedef:** YOKLAMA, MÜDİRİYET, KONFERANS sistemlerini oluştur

**1.1 SpecialEvent API'leri**
   - [ ] `POST /api/special-events` (yeni etkinlik oluştur)
   - [ ] `GET /api/special-events` (etkinlikleri listele)
   - [ ] `GET /api/special-events/[id]` (detay)
   - [ ] `PUT /api/special-events/[id]` (güncelle)
   - [ ] `DELETE /api/special-events/[id]` (sil)

**1.2 Conference API'leri**
   - [ ] `POST /api/conferences` (konferans oluştur)
   - [ ] `GET /api/conferences` (konferansları listele)
   - [ ] `POST /api/external-speakers` (dış konuşmacı ekle)
   - [ ] `GET /api/external-speakers` (konuşmacıları listele)

**1.3 UI Geliştirme**
   - [ ] `/special-events` sayfası (YOKLAMA/MÜDİRİYET yönetimi)
   - [ ] `/conferences` sayfası (Konferans planlama)
   - [ ] `/external-speakers` sayfası (Konuşmacı yönetimi)
   - [ ] Form validasyonları
   - [ ] Görsel tasarım (eventType'a göre renk kodları)

**Test Senaryoları:**
- YOKLAMA etkinliği oluştur (her Cuma 1. ders)
- MÜDİRİYET etkinliği oluştur (her Cuma 7. ders)
- Konferans ekle (dış konuşmacı ile)
- SOSYAL VE SPORTİF FAALİYETLER tanımla

**Çıktı:** Fonksiyonel özel etkinlik yönetim sistemi

---

#### **FAZ 2: Blok Ders ve Fiziksel Alan Yönetimi (3-4 Gün)**

**Hedef:** İtfaiye blok derslerini ve özel alan rezervasyonunu yönet

**2.1 Blok Ders API'leri**
   - [ ] `POST /api/daily-lessons/block` (blok ders oluştur)
   - [ ] `GET /api/daily-lessons/block` (blok dersleri listele)
   - [ ] Validasyon: Blok kesintisiz olmalı (öğle yemeği arası kontrolü)

**2.2 Fiziksel Alan Yönetimi**
   - [ ] `SpecialArea` modeli ekle (GYM, WORKSHOP, OUTDOOR, LAB)
   - [ ] Rezervasyon sistemi (çakışma kontrolü)
   - [ ] `POST /api/special-areas/reserve` (alan rezerve et)
   - [ ] `GET /api/special-areas/availability` (müsaitlik sorgula)

**2.3 UI Geliştirme**
   - [ ] Haftalık programda blok ders gösterimi
   - [ ] Blok ders oluşturma modal'ı
   - [ ] Fiziksel alan seçim dropdown'u
   - [ ] Çakışma uyarı sistemi

**Test Senaryoları:**
- 4 saat kesintisiz "İTFAİYE MESLEK DERSLERİ" bloku oluştur
- Atölye/Lab çakışması test et
- YANAŞIK DÜZEN için açık alan rezerve et

**Çıktı:** Blok ders ve fiziksel alan rezervasyon sistemi

---

#### **FAZ 3: Günlük Program Entegrasyonu (4-5 Gün)**

**Hedef:** Özel etkinlikleri günlük programa entegre et

**3.1 DailyLesson Genişletme**
   - [ ] `isSpecialEvent` kontrolü ekle
   - [ ] `specialEventId` ilişkisini kur
   - [ ] `conferenceId` ilişkisini kur
   - [ ] Eğitmen atama logiği güncelle (özel etkinlikler için opsiyonel)

**3.2 Günlük Program API Güncellemesi**
   - [ ] `POST /api/daily-lessons` → Özel etkinlik desteği
   - [ ] `GET /api/daily-lessons` → Filtreleme (isSpecialEvent, eventType)
   - [ ] Otomatik eğitmen atama → Özel etkinlikler için skip

**3.3 UI Güncellemeleri**
   - [ ] Günlük programda özel etkinlik gösterimi
   - [ ] Renk kodları (YOKLAMA: kırmızı, KONFERANS: gri, MÜDİRİYET: turuncu)
   - [ ] Detay modal'ında etkinlik bilgileri
   - [ ] "Eğitmen Yok" badge'i (requiresInstructor: false için)

**Test Senaryoları:**
- Cuma günü YOKLAMA ekle (tüm sınıflar)
- Cuma günü MÜDİRİYET ekle (son ders)
- Konferans ekle (6. ve 7. ders, çift blok)
- Karma gün: Normal ders + Özel etkinlik

**Çıktı:** Günlük programda özel etkinlik desteği

---

#### **FAZ 4: Haftalık/Aylık Plan Senkronizasyonu (3-4 Gün)**

**Hedef:** Özel etkinliklerin plan senkronizasyonuna etki etmemesini sağla

**4.1 Senkronizasyon Logiği Güncelleme**
   - [ ] `syncDailyToWeekly()` → Özel etkinlikleri hariç tut
   - [ ] `syncDailyToMonthly()` → `countsTowardCurriculum` kontrolü
   - [ ] Müfredat ilerleme → Sadece normal dersler

**4.2 Raporlama Güncellemesi**
   - [ ] Haftalık rapor → Özel etkinlikleri ayrı göster
   - [ ] Aylık rapor → Ders saati vs Etkinlik saati
   - [ ] Eğitmen iş yükü → Sadece normal dersler

**Test Senaryoları:**
- YOKLAMA yapıldı → Müfredata etki etmedi mi?
- KONFERANS tamamlandı → Eğitmen iş yüküne eklendi mi? (countsTowardCurriculum: true ise)
- Senkronizasyon doğruluğunu kontrol et

**Çıktı:** Doğru senkronizasyon ve raporlama

---

#### **FAZ 5: Raporlama ve Dashboard (3-4 Gün)**

**Hedef:** Yeni özellikleri raporlara ve dashboard'a yansıt

**5.1 Dashboard Güncellemesi**
   - [ ] "Özel Etkinlikler" widget'ı
   - [ ] "Yaklaşan Konferanslar" listesi
   - [ ] "Blok Ders Programı" özeti

**5.2 Raporlar**
   - [ ] Konferans Raporu (tarih, konuşmacı, konu)
   - [ ] Özel Etkinlik Raporu (haftalık/aylık)
   - [ ] Fiziksel Alan Kullanım Raporu (Lab, Spor Salonu, vb.)

**5.3 Export ve Print**
   - [ ] PDF export (özel etkinlikler dahil)
   - [ ] Excel export
   - [ ] Haftalık program print (renk kodlu)

**Test Senaryoları:**
- Dashboard'da özel etkinlikleri görüntüle
- Konferans raporunu export et
- PDF çıktısı al (tüm etkinlikler dahil)

**Çıktı:** Kapsamlı raporlama sistemi

---

### 🚀 TOPLAM TAHMİNİ SÜRE: **20-26 İŞ GÜNÜ** (4-5 Hafta)

---

### 📋 ÖNCELİK SIRASI

**Kritik (Hemen Başla):**
1. ✅ FAZ 0: Veritabanı güncellemesi
2. ✅ FAZ 1: Özel etkinlikler (YOKLAMA, KONFERANS, MÜDİRİYET)
3. ✅ FAZ 3: Günlük program entegrasyonu

**Yüksek Öncelik:**
4. FAZ 2: Blok ders sistemi (İtfaiye için gerekli)
5. FAZ 4: Senkronizasyon düzeltmeleri

**Orta Öncelik:**
6. FAZ 5: Raporlama ve dashboard

---

### 🔄 SÜREÇ VE METOD

**Geliştirme Yaklaşımı:**
- **Agile/Scrum:** Her faz 1 sprint (1 hafta)
- **TDD (Test-Driven Development):** Önce test, sonra kod
- **Code Review:** Her PR en az 1 kişi incelenmeli
- **Dokümantasyon:** Her API endpoint için Swagger/OpenAPI

**Ekip Yapısı (Önerilen):**
- 1 Backend Developer (API + Database)
- 1 Frontend Developer (UI + React)
- 1 QA/Tester (Test senaryoları)

**Toplantılar:**
- **Daily Standup:** Her gün 15 dk (ilerleme + engeller)
- **Sprint Planning:** Her pazartesi (hedef belirleme)
- **Sprint Review:** Her cuma (demo + feedback)

---

### ✅ KABUL KRİTERLERİ

**Her faz tamamlandığında:**
- [ ] Tüm API endpoint'leri çalışıyor
- [ ] UI fonksiyonel ve hatasız
- [ ] Unit testler yazıldı ve geçti
- [ ] E2E testler başarılı
- [ ] Dokümantasyon güncellendi
- [ ] Code review tamamlandı
- [ ] Product Owner onayı alındı

---

### 🎯 SONRAKİ ADIMLAR

**Şimdi Ne Yapmalı:**

1. **Veritabanı Şemasını Güncelle (1-2 saat)**
   - Prisma şemasına yeni modelleri ekle
   - Migration çalıştır
   - Test verileri oluştur

2. **İlk API Endpoint'i Oluştur (1-2 saat)**
   - `POST /api/special-events` (YOKLAMA oluştur)
   - Basit test yap

3. **İlk UI Sayfasını Oluştur (2-3 saat)**
   - `/special-events` sayfası
   - Form ve liste görünümü

4. **İlk Test Senaryosunu Çalıştır**
   - YOKLAMA etkinliği oluştur
   - Günlük programa ekle
   - Çıktıyı kontrol et

---

## 🎯 Sonuç

Bu doküman, ders programı ve otomatik planlama sisteminin tüm gereksinimlerini detaylı şekilde içermektedir. 

**Güncel Durum:**
- ✅ Gerçek operasyonel gereksinimler belirlendi
- ✅ Excel programları referans alındı
- ✅ Özel etkinlikler sistemi tasarlandı
- ✅ Blok ders yapısı tanımlandı
- ✅ Veritabanı şeması genişletildi
- ✅ Yol haritası oluşturuldu

**Kodlamaya Hazır:** 
Tüm teknik detaylar netleşti. FAZ 0'dan başlayarak adım adım ilerlenebilir.

Bu dokümandaki her detay, geliştime sırasında referans alınacaktır. Herhangi bir değişiklik gerekirse bu doküman güncellenecektir.
