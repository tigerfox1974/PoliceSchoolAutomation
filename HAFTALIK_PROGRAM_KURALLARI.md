# HAFTALIK DERS PROGRAMI OLUŞTURMA KURALLARI

## 📋 Genel Amaç

Haftalık program oluşturulurken amaç: **O hafta hangi dersi kaç kere yazabiliriz ki o dersin toplam ders saatine düzenli bir şekilde ulaşalım.**

## 🎯 Temel Kurallar

### 1. Bir Günde Bir Ders Sadece Bir Kez
- **Kural:** Aynı günde aynı ders birden fazla saatte yazılmaz
- **Amaç:** Haftalık görünümde her ders günde sadece bir kez görünür
- **Örnek:** Salı günü "CEZA HUKUKU" sadece bir kez yazılır, 1. ve 2. ders saatlerinde aynı ders yazılmaz

### 2. Eğitmen Ataması (Haftalık Program)
- **ÖNEMLİ:** Haftalık programda eğitmen çakışma kontrolü **ÖNEMLİ DEĞİL**
- Haftalık program genel bir programdır, sadece dönemin planlaması yapılırken ışık tutar
- Eğitmen isimleri haftalık programda görünmese de olur
- **Eğitmen kontrolü günlük programda çok önemlidir** (nöbet, müsaitlik, yedek atama)
- Haftalık programda eğitmen ataması yapılabilir ama çakışma kontrolü yapılmaz

### 3. Ders Dağılım Algoritması
- **Hesaplama:** Dönem boyunca toplam planlanan saat kadar günlere yazılır
- **Haftalık Hesaplama:** Haftalık saat sayısı = (Aylık plan / 4 hafta)
- **Dağılım:** Haftalık saat sayısı kadar güne dağıtılır
  - Örnek: 3 saat = 3 güne dağıtılır (Pazartesi, Çarşamba, Cuma gibi)
- **Gün Seçimi:** Çalışma günleri karıştırılır (eğitmene arka arkaya ders yazılmaması için)

### 4. Lab Çakışma Kontrolü
- **Açıklama:** Okulda sadece 1 tane Bilgisayar Laboratuvarı var
- Lab gerektiren dersler (örn: Bilgisayar Kullanımı, EBYS) aynı saatte çakışamaz
- **Örnek:** Pazartesi 09:00'da Sınıf A Lab'da Bilgisayar dersi varsa, Sınıf B aynı saatte Lab'da başka bir ders yapamaz
- **Kontrol:** Veritabanında `specificDate + timeSlotId + requiresLab: true` kombinasyonu kontrol edilir
- Lab gerektiren ders yazılırken, o saatte başka lab dersi var mı kontrol edilir

## 🎨 Görsel Kurallar

### 5. Renk Kodlama
- **Kural:** Her ders için unique ve tutarlı renk (hash fonksiyonu ile)
- **Amaç:** Haftalık programda derslerin kolayca ayırt edilmesi
- **Teknik:** `courseId` bazlı hash fonksiyonu ile renk atanır
- **Renk Paleti:** Geniş renk paleti kullanılır (50+ renk)
- **Koyu Renkler:** Koyu renkli zeminler için yazı rengi beyaz yapılır (daha belirgin ayrım)
- **Örnek:** Ceza Yasası → Koyu kırmızı zemin + beyaz yazı

### 6. Sayaç Gösterimi
- **Format:** `(current_occurrence / total_planned_hours)`
- **Örnek:** `CEZA HUKUKU (10/40)` → 40 saatlik dersin 10. saati
- **Hesaplama:** Dönem başından itibaren kaçıncı ders olduğu hesaplanır

## 📅 Sabit Dersler (Öncelikli - Her Hafta)

### 7. Çarşamba 6-7. Ders: Sosyal ve Sportif Faaliyetler
- **Gün:** Çarşamba
- **Saatler:** 6. ve 7. ders (çift saat)
- **Sıklık:** Her hafta
- **Eğitmen:** Gerekmez (`requiresInstructor: false`)
- **Öncelik:** Normal derslerden önce rezerve edilir
- **DİNAMİK:** Günlük programda iptal edilebilir veya değiştirilebilir

### 8. Cuma 7. Ders: Haftalık Müdüriyet Toplantısı
- **Gün:** Cuma
- **Saat:** 7. ders
- **Sıklık:** Her hafta (genelde)
- **Eğitmen:** Gerekmez (`requiresInstructor: false`)
- **Öncelik:** Normal derslerden önce rezerve edilir
- **DİNAMİK:** Günlük programda iptal edilebilir (örn: Müdür okulda değilse)
- **Örnek:** 6. hafta Cuma günü müdüriyet saati müdürün okulda olmamasından dolayı yapılamayabilir

### 9. İlk Hafta: İntibak Eğitimi
- **Kapsam:** Tüm hafta (Pazartesi-Pazar, tüm saatler)
- **Sıklık:** Sadece ilk hafta
- **Öncelik:** Normal dersler yazılmaz, tüm hafta "İntibak Eğitimi" olarak işaretlenir

### 10. Cuma 1. Ders: Yoklama
- **Gün:** Cuma
- **Saat:** 1. ders
- **Sıklık:** Her hafta değil, belirli haftalarda
- **DİNAMİK:** Günlük programda yapılıp yapılmayacağına karar verilir
- Haftalık programda rezerve edilir ama günlük programda esnek

## 🏃 Özel Ders Kuralları

### 11. Beden Eğitimi Dersi
- **Öncelikli Rezervasyon:** Perşembe 6-7. ders saatleri
- **Kural:** Beden eğitimi dersinin toplam ders saati kadar her hafta bu saatler rezerve edilir
- **ÖNEMLİ:** Bu saatler dolu olma gibi bir durum söz konusu olmayacak
- Diğer dersler bu saatleri dolu bilerek dağıtılır
- Beden eğitimi önce yazılır, sonra diğer dersler dağıtılır

## 🚫 Ders Yazılmayacak Günler

### 12. Sınav Haftaları
- **Kural:** Sınav haftalarında normal ders yazılmaz
- **Sınav Tipleri:**
  - **4 Aylık Dönem:** 1 Ara Sınav + 1 Final
  - **6 Aylık Dönem:** 2 Ara Sınav + 1 Final
- **Tarih Aralığı:** Başlangıç-bitiş tarihi ile belirlenir
- **Örnek:** 11-15 Kasım 2024 → Bu tarihler arası hiç ders yazılmaz
- **Not:** Sınav haftası bir haftanın içinde başlayıp diğer haftaya kadar devam edebilir

### 13. Resmi Tatiller (KKTC)
- **Kural:** Resmi tatil günlerinde ders yazılmaz
- **Yönetim:** Kullanıcı arayüzü ile tüm resmi tatilleri belirler ve işler
- Tek gün veya aralık (başlangıç-bitiş tarihi)
- Sistem haftalık ve günlük ders programını planlarken hangi günlerin tatil olduğunu kontrol eder
- Tatil günlerinde dersler dağıtılmaz
- **Örnek Tatiller:**
  - 23 Nisan Ulusal Egemenlik ve Çocuk Bayramı
  - 19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı
  - 30 Ağustos Zafer Bayramı
  - 29 Ekim Cumhuriyet Bayramı
  - Ramazan Bayramı (3 gün)
  - Kurban Bayramı (4 gün)
  - Yarıyıl Tatili (aralık - başlangıç-bitiş tarihi ile)

### 14. Hafta Sonu
- **Kural:** Cumartesi ve Pazar günleri ders yazılmaz
- **Görünüm:** Hafta sonu günlerinde "HAFTA SONU TATİLİ" gösterilir

## 🔄 Algoritma Sırası

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

## 📊 Veri Yapısı

### Haftalık Program Görünümü
- **Bir günde bir ders sadece bir kez görünür**
- **Sınıf bilgisi gösterilmez** (sadece günlük programda gösterilir)
- **Ders adı + sayaç + eğitmen adı** gösterilir (eğitmen adı opsiyonel)
- **ÖNEMLİ:** Haftalık programda yazılan 1 ders saati = O gün o dersin 6 sınıfta sırayla işleneceği anlamına gelir
- **Örnek:** `CEZA HUKUKU VE UYGULAMALARI (10/40) Fadil METİN`

### Günlük Program Görünümü
- **Sınıf bilgisi gösterilir**
- **Her sınıf için ayrı satır**
- **Detaylı ders bilgisi**

## ⚠️ Önemli Notlar

1. **Haftalık program = Genel görünüm** (hangi ders hangi gün)
2. **Günlük program = Detaylı görünüm** (hangi ders hangi sınıfa, hangi saatte)
3. **Bir ders haftalık programda bir günde bir kez görünür, ama günlük programda o gün 6 sınıfa da yazılabilir**
4. **Eğitmen bir günde farklı saatlerde farklı dersler verebilir**
5. **Eğitmen aynı saatte sadece bir ders verebilir**

## 🔧 Teknik Detaylar

### Veritabanı Kontrolleri
- `DailyLesson` tablosunda aynı `courseId` + `specificDate` kombinasyonu kontrol edilir (TÜM HAFTALAR İÇİN)
- `DailyLesson` tablosunda lab dersleri için aynı `specificDate` + `timeSlotId` + `requiresLab: true` kontrol edilir
- **NOT:** Eğitmen çakışma kontrolü haftalık programda yapılmaz (günlük programda önemli)

### Performans
- Her ders için veritabanı sorguları optimize edilir
- Gün bazlı cache kullanılabilir (gelecekte)

