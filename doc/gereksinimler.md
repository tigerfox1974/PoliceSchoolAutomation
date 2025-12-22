# KKTC POLİS OKULU EĞİTİM VE OPERASYON YÖNETİM SİSTEMİ
## İŞ GEREKSİNİMLERİ VE FONKSİYONEL RAPOR

**Tarih:** 22 Aralık 2025  
**Hedef:** Programcıya verilebilir iş gereksinimleri dökümanı  
**Not:** Bu rapor teknik detaylar içermez, sadece "ne yapılacak" açıklanır.

---

## 📊 HIZLI ÖZET

**Proje Başlangıcı:** Aralık 2025  
**Mevcut Durum:** Faz 2 Tamamlandı (%40 İlerleme)  
**Aktif Modüller:** 6/12  
**Planlanan Modüller:** 6/12

### Tamamlananlar:
✅ Öğrenci Yönetimi | ✅ Eğitmen Yönetimi | ✅ Dönem Yönetimi  
✅ Koğuş Yönetimi | ✅ Dinamik Alanlar | ✅ Güvenlik

### Sırada:
⏳ Ders Yönetimi | ⏳ Ders Programı | ⏳ Nöbet | ⏳ Yoklama  
⏳ Yemekhane | ⏳ Disiplin | ⏳ Sınav/Not | ⏳ Raporlama

---

## 🎯 MEVCUT DURUM (SİSTEMDE ŞU AN NE VAR?)

### ✅ TAMAMLANMIŞ MODÜLLER (Çalışıyor)

**1. Öğrenci Yönetimi (Student Management)** - %100 Tamamlandı
- Öğrenci ekleme, düzenleme, silme, listeleme
- Excel'den toplu öğrenci içe aktarma
- Excel şablon indirme
- Öğrenci listesi Excel'e aktarma
- Koğuş dağılımı otomasyonu
- Arama ve filtreleme

**2. Eğitmen Yönetimi (Instructor Management)** - %100 Tamamlandı
- Eğitmen ekleme, düzenleme, silme, listeleme
- Kadrolu/Dış Kaynak eğitmen ayrımı
- Dönem atamaları
- Filtreleme ve arama

**3. Dönem Yönetimi (Term Management)** - %100 Tamamlandı
- Dönem ekleme, düzenleme, silme, listeleme
- Dönem kodu otomatik üretimi
- Aktif/Pasif durum yönetimi

**4. Koğuş Yönetimi (Dormitory Management)** - %100 Tamamlandı
- Koğuş ekleme, düzenleme, silme
- Kapasite yönetimi
- Cinsiyet bazlı dağılım
- Otomatik koğuş atama

**5. Dinamik Alan Yönetimi (Dynamic Fields)** - %100 Tamamlandı
- Öğrenci ve eğitmen için özel veri alanları ekleme
- Alan tipi seçimi (Metin, Sayı, Tarih, Evet/Hayır)
- Zorunlu/Opsiyonel işaretleme

**6. Kimlik Doğrulama (Authentication)** - %100 Tamamlandı
- Giriş/Çıkış sistemi
- JWT token bazlı güvenlik
- Rol bazlı yetkilendirme (Admin, Instructor)

### ❌ HENÜZ YAPILMAMIŞ MODÜLLER (Planlanan)

Bu modüller aşağıda detaylı anlatılmıştır ancak henüz geliştirilmemiştir:
- Ders Yönetimi
- Akıllı Ders Programı
- Nöbet Yönetimi
- Yoklama ve İzin Sistemi
- Yemekhane/İaşe Sistemi
- Disiplin ve Ceza Sistemi
- Sınav ve Not Sistemi
- Atış Eğitimi
- Raporlama Sistemi

---

---

## 📋 PROJENİN AMACI

KKTC Polis Okulu için **tüm eğitim ve operasyonel süreçleri yöneten** merkezi bir otomasyon sistemi geliştirmek. Sistem, öğrenci kayıtlarından ders programlamaya, nöbet yönetiminden yemekhane hesaplamalarına kadar tüm süreçleri entegre bir şekilde yönetecek.

### Temel Prensipler:
- ✅ **Esneklik:** Her dönem değişebilen veri alanları (Sabit form dayatması YOK)
- ✅ **Pratiklik:** Excel ile toplu veri girişi (Sütun başlıkları otomatik tanınır)
- ✅ **Entegrasyon:** Modüller birbirine bağlı çalışır (Örn: Disiplin → Nöbet → Yemekhane)
- ✅ **KKTC Uyumu:** Yerel mevzuat ve çalışma düzenine uygun

---

## 👥 KULLANICI ROLLERİ VE YETKİLER

### 1. Yönetici (Admin)
**Yetkiler:**
- Tüm modüllere tam erişim
- Kullanıcı ekleme/silme/düzenleme
- Sistem ayarlarını değiştirme
- Tüm raporları görüntüleme ve export
- Dönem açma/kapatma
- Kritik işlemleri onaylama (İlişik kesme vb.)

### 2. Eğitmen (Instructor)
**Yetkiler:**
- Kendi atandığı dönemleri görüntüleme
- Öğrenci listelerini görüntüleme
- Not girişi yapma (Sadece kendi derslerinde)
- Yoklama alma (Sadece kendi derslerinde)
- Raporları görüntüleme (Kendi sınıfları için)

### 3. Öğrenci İşleri Personeli
**Yetkiler:**
- Öğrenci kayıtları (Ekleme/Düzenleme)
- Excel ile toplu öğrenci aktarımı
- Koğuş ve sınıf dağılımları
- Öğrenci belgelerini yükleme
- İzin kayıtları

---

## 🎯 ANA MODÜLLER VE FONKSİYONLAR

### 1. ÖĞRENCİ YÖNETİMİ

#### 1.1 Öğrenci Kayıt Sistemi

**Temel Bilgiler (Sabit Alanlar):**
- KKTC Kimlik Numarası (Ana anahtar - Zorunlu)
- Ad, Soyad
- Cinsiyet (Erkek/Kadın)
- Doğum Tarihi
- E-Posta, Telefon
- Adres
- Anne Adı, Anne Soyadı, Anne Eğitim Durumu
- Baba Adı, Baba Soyadı, Baba Eğitim Durumu
- Medeni Hal
- Mezun Olduğu Lise, Üniversite, Fakülte, Bölüm

**Organizasyon Bilgileri:**
- Kayıtlı Olduğu Dönem/Kurs
- Sınıf (A Sınıfı, B Sınıfı - eski adıyla Tim)
- Tabur
- Takım
- Koğuş Numarası (Yatakhane)

**Dinamik Alanlar (Her Dönem Değişebilir):**
- Sistem yöneticisi her dönem başında istediği alanları ekleyebilir
- Örnekler: Kan Grubu, Ayakkabı No, Covid Aşısı (Evet/Hayır), Askerlik Sicil No
- Alan tipleri: Metin, Sayı, Tarih, Evet/Hayır
- Her alan "Zorunlu mu?" seçeneği ile işaretlenebilir

#### 1.2 Toplu Öğrenci Ekleme (Excel Import) ✅ ÇALIŞIYOR

**Mevcut Sistem:**
1. Kullanıcı "Excel Şablon İndir" butonuna tıklar
2. Sistem 22 kolonlu Excel şablonu oluşturur (KKTC No, Ad, Soyad, Anne/Baba bilgileri, Lise, Üniversite, vb.)
3. Kullanıcı Excel'i doldurur
4. Sistem Excel'i import eder:
   - Satır bazlı hata yönetimi (Bir hata diğerlerini etkilemez)
   - Aynı KKTC Kimlik ile kayıt varsa günceller (Upsert mantığı)
   - Detaylı hata mesajları (Hangi satır, hangi alan, ne hatası)
5. Özet rapor gösterir: "125 başarılı, 3 hatalı"

**Çalışan Özellikler:**
- ✅ KKTC Kimlik validasyonu (10 haneli sayı)
- ✅ Cinsiyet normalizasyonu (Türkçe karakter desteği)
- ✅ Tarih dönüşümü (Excel serial date)
- ✅ Soft delete desteği (Silinmiş öğrenciler geri getirilir)
- ✅ Duplicate kontrolü

#### 1.3 Öğrenci Listeleme ve Arama

**Liste Özellikleri:**
- Tablo görünümü (KKTC Kimlik, Ad, Soyad, E-Posta, Telefon, Sınıf)
- Hızlı arama: Ad, Soyad, Kimlik No, Telefon ile arama
- Filtreleme: Dönem, Sınıf, Aktif/Pasif durum
- Sayfalama: Sayfa başına 10/25/50/100 öğrenci
- Excel'e aktarma: Tüm liste veya filtrelenmiş liste

**Detay Sayfası:**
- Öğrencinin tüm bilgileri
- Fotoğraf (Yüklenebilir)
- Devamsızlık geçmişi
- Disiplin kayıtları
- Not bilgileri
- Belge yüklemeleri (Sağlık raporu, izin belgesi vb.)

#### 1.4 Koğuş (Yatakhane) Dağılımı ✅ ÇALIŞIYOR

**Mevcut Sistem:**
1. Yönetici "Koğuş Yönetimi" sayfasına girer
2. Koğuşları tanımlar (Numara, İsim, Cinsiyet, Kapasite)
3. "Otomatik Dağıt" özelliği ile öğrenciler koğuşlara atanır:
   - Cinsiyet bazlı dağılım (Erkek koğuşu / Kadın koğuşu)
   - Kapasite kontrolü
   - Eşit doluluk oranı
4. Manuel değişiklik yapılabilir

**Çalışan Özellikler:**
- ✅ Koğuş ekleme, düzenleme, silme
- ✅ Kapasite yönetimi
- ✅ Doluluk takibi (CurrentOccupancy)
- ✅ Cinsiyet bazlı koğuş
- ✅ Yedek koğuş işaretleme

#### 1.5 Sınıf Dağılımı ⏳ PLANLI (Henüz Yapılmadı)

**Hedef:**
- Öğrenciler A Sınıfı, B Sınıfı, C Sınıfı gibi gruplara ayrılır
- Her sınıfın maksimum kapasitesi vardır (Örn: 30 kişi)
- Cinsiyet dengesi korunur

**İşlem:**
- Otomatik dağıtım (Koğuş dağılımına benzer mantık)
- Manuel değişiklik imkanı
- Excel ile toplu atama

---

### 2. EĞİTMEN (INSTRUCTOR) YÖNETİMİ ✅ TAMAMLANDI

#### 2.1 Eğitmen Tipleri

**Mevcut Sistem:**

**Okul Kadrosu (Kadrolu Personel):**
- Rütbe: Komiser, Komiser Yardımcısı, Başçavuş vb.
- Sicil Numarası (Zorunlu)
- Branş: Trafik, Ceza Hukuku, Olay Yeri İnceleme vb.
- **Nöbet tutar** (Gelecekte kullanılacak)
- Ders verir

**Dış Kaynak Eğitmenler (Misafir/Konuk):**
- Kurum: Savcılık, Adli Tıp, Üniversite vb.
- Uzmanlık Alanı
- **Nöbet tutmaz** (Sadece ders verir)

#### 2.2 Eğitmen Bilgileri

**Çalışan Özellikler:**
- ✅ KKTC Kimlik Numarası
- ✅ Ad, Soyad
- ✅ E-Posta, Telefon
- ✅ Eğitmen Tipi: Kadrolu / Dış Kaynak
- ✅ Rütbe (Sadece kadrolu için)
- ✅ Sicil Numarası (Sadece kadrolu için)
- ✅ Kurum (Sadece dış kaynak için)
- ✅ Branş/Uzmanlık Alanı
- ✅ Aktif/Pasif durum
- ✅ Dönem atamaları (Çoklu dönem desteği)

#### 2.3 Dış Eğitmen Kısıtları ⏳ PLANLI

**Hedef:**
Dış kaynak eğitmenler sadece belirli günlerde gelebilir (Örn: Savcı sadece Salı günleri).

**Nasıl Çalışacak:**
1. Eğitmen kaydı oluşturulurken "Müsait Olduğu Günler" seçilir
2. Ders programı oluşturulurken sistem bu kısıtları dikkate alır
3. Eğer dış eğitmen müsait olmadığı bir güne atanmaya çalışılırsa uyarı verir

---

### 3. DÖNEM (TERM/KURS) YÖNETİMİ ✅ TAMAMLANDI

#### 3.1 Dönem Bilgileri

**Çalışan Sistem:**
- ✅ Dönem Adı: "68. Dönem Polis Temel Eğitimi"
- ✅ Dönem Numarası: Manuel giriş (Örn: 68)
- ✅ Dönem Kodu: Otomatik türetilir → `PTE-68`, `ITE-16`
- ✅ Kurs Tipi:
  - Polis Temel Eğitimi (PTE)
  - İleri Eğitim Programı (İYEP)
  - Trafik Eğitimi (TE)
- ✅ Başlangıç/Bitiş Tarihleri
- ✅ Aktif/Pasif durum
- ✅ Soft delete desteği

**Sınav Tarihleri:** ⏳ PLANLI
- Ara Sınav Tarihleri (Liste - Birden fazla olabilir)
- Final Sınavı Tarihi (Tek tarih)

---

### 4. DERS (COURSE) YÖNETİMİ ⏳ PLANLI (Henüz Yapılmadı)

#### 4.1 Ders Tanımlama

**Ders Bilgileri:**
- Ders Kodu: Örn: `TR101`, `CZH201`
- Ders Adı: Örn: "Trafik Mevzuatı", "Ceza Hukuku"
- Toplam Hedef Saat: Örn: 40 saat
- Kredi (Varsa)
- Ders Tipi:
  - Standart Ders (Haftalık düzenli)
  - Konferans (Tek seferlik)
  - Panel (Düzensiz aktivite)
- Hangi Döneme Ait Olduğu

#### 4.2 Ders Atama

**Eğitmene Ders Atama:**
1. Ders seçilir
2. Eğitmen seçilir
3. Atama tarihi kaydedilir
4. Sistem, eğitmenin bu dersi kaç saat vereceğini izler

---

### 5. AKILLI DERS PROGRAMI ⏳ PLANLI (Henüz Yapılmadı)

#### 5.1 KKTC Mesai Şablonu

**Haftalık Ders Saatleri:**
- **Pazartesi:** 5 ders saati
- **Salı:** 5 ders saati
- **Çarşamba:** 5 ders saati
- **Perşembe:** 7 ders saati (ÖZEL GÜN)
- **Cuma:** 5 ders saati

**Ders Saatleri:**
- 09:00 - 10:00
- 10:00 - 11:00
- 11:00 - 12:00
- 12:00 - 13:00 (Öğle Arası)
- 13:00 - 14:00
- 14:00 - 15:00
- 15:00 - 16:00
- 16:00 - 17:00 (Sadece Perşembe)

#### 5.2 Otomatik Ders Atama

**Atama Öncelikleri:**

1. **Dış Eğitmenler Önce:**
   - Dış kaynak eğitmenlerin kısıtlı günleri vardır
   - Sistem önce onların müsait olduğu günleri rezerve eder
   - Örnek: Savcı sadece Salı geliyorsa, Salı günü ona ayrılır

2. **Kadrolu Personel Boşlukları Doldurur:**
   - Dış eğitmenlerin atanmasından sonra kalan boş saatler
   - Okul kadrosundaki eğitmenlere dağıtılır

3. **Çakışma Kontrolü:**
   - Aynı eğitmen aynı anda iki farklı sınıfa ders veremez
   - Aynı sınıf aynı anda iki farklı ders göremez

#### 5.3 KKTC Resmi Tatilleri

**Nasıl Çalışmalı:**
- Sistem KKTC resmi tatillerini bilir (Kurban Bayramı, 23 Nisan vb.)
- Tatil günlerinde ders planlanmaz
- **AMA:** Yönetici isterse tatilde de ders planlar (Override özelliği)
- Uyarı verir: "Bu gün resmi tatil, yine de devam etmek istiyor musunuz?"

#### 5.4 "Boş Ders Yoktur" ve Takas Sistemi

**Senaryo:**
Eğitmen hastalık veya acil durum nedeniyle gelemeyecek.

**Sistem Çözümü:**
1. Boş ders bırakılmaz
2. Sistem otomatik önerir:
   - "Bu saatte aynı dersi verebilecek başka eğitmen: X"
   - "Veya şu dersi bu saate kaydırabiliriz: Y"
3. Yönetici seçim yapar
4. Sistem "Takas" kaydı oluşturur:
   - "Eğitmen A, Eğitmen B'nin yerine Salı 10:00'da ders verdi"
   - "Eğitmen B, Eğitmen A'ya bir ders saati borçlu"
5. Bu bilgi raporlanır

---

### 6. NÖBET YÖNETİMİ ⏳ PLANLI (Henüz Yapılmadı)

#### 6.1 Personel (Amir) Nöbeti

**Kurallar:**
- **Sadece kadrolu personel nöbet tutar**
- Dış eğitmenler nöbet tutmaz
- Nöbetçi personel ertesi gün otomatik "BLOKE" edilir (Ders yükü azaltılır)
- Yönetici isterse blokeyi kaldırabilir

**Nöbet Planlama:**
1. Haftalık veya aylık nöbet çizelgesi oluşturulur
2. Sistem eşit dağılım yapmaya çalışır (Herkese adil)
3. Nöbet ertesi personel renkli işaretlenir (Örn: Sarı → Bloke, Yeşil → Müsait)

**Ders-Nöbet Çakışması:**
- Nöbetçi amire ders yazılabilir **ama sistem UYARI verir**
- "Bu personel nöbetçi, emin misiniz?"

#### 6.2 Öğrenci Nöbeti

**Kurallar:**
- **Ders saatlerinde (09:00 - 17:00) nöbet YAZILMAZ**
- **Tek İstisna:** Öğle yemeği arası (12:00 - 13:00) nöbetçi öğrenci yazılabilir
- Diğer nöbetler ders dışı saatlerde (Akşam, gece, sabah erken)

**Nöbet Çeşitleri:**
- Sabah Nöbeti: 06:00 - 09:00
- Öğle Nöbeti: 12:00 - 13:00
- Akşam Nöbeti: 17:00 - 22:00
- Gece Nöbeti: 22:00 - 06:00

**Disiplin Cezası ile Nöbet:**
- Disiplin kurulu "Hafta sonu nöbeti" cezası verirse
- Sistem otomatik olarak o öğrenciyi hafta sonu nöbet listesine ekler
- Yemekhane sistemi bunu görür ve yemek sayısına ekler (Otomatik entegrasyon)

---

### 7. YOKLAMA VE İZİN YÖNETİMİ ⏳ PLANLI (Henüz Yapılmadı)

#### 7.1 Yoklama Durumları

**Standart Durumlar:**
- Var (Sınıfta)
- Yok (Gelmemiş)
- İzinli (Evci, yıllık izin vb.)
- Raporlu (Sağlık raporu ile)
- Hastane Yatışı

#### 7.2 Koğuş İstirahati (ÖZEL DURUM)

**Ne Demek:**
Öğrenci okul sınırları içinde ama raporlu (Hasta, ama yatakhanede dinleniyor).

**Nasıl İşaretlenir:**
- Yoklama sistemi "Koğuş İstirahati" checkbox'ı gösterir
- İşaretlenirse:
  - Öğrenci derse giremez
  - **AMA YEMEK YER** (Bu önemli!)
  - Yemekhane sistemi bunu görür ve öğrenciyi yemek sayısından DÜŞMEZ

#### 7.3 İzin Yönetimi

**İzin Tipleri:**
- Evci (Hafta sonu izni)
- Yıllık İzin
- Mazeret İzni
- Hastane Yatışı

**İzin Kayıt:**
1. Öğrenci seçilir
2. İzin tipi seçilir
3. Başlangıç - Bitiş tarihi girilir
4. İzin belgesi yüklenir (Opsiyonel)
5. Sistem kaydeder

**Etkileri:**
- İzinli öğrenci yemek sayısından DÜŞER (Yemekhane entegrasyonu)
- İzin gün sayısı izlenir (Yıllık izin limiti kontrolü için)

---

### 8. İAŞE (YEMEKHANE) HAK EDİŞ SİSTEMİ ⏳ PLANLI (Henüz Yapılmadı)

#### 8.1 Otomatik Hesaplama

**Varsayılan Sayı:**
- Tüm aktif öğrenciler
- Öğleci kadrolu personel (Mesai saatinde okulda olan)

**Otomatik Düşenler:**
- Evci olan öğrenciler (İzin sisteminden çekilir)
- Hastane yatışı olan öğrenciler
- Yıllık izinde olan öğrenciler

**Otomatik Ekleniler (Hafta Sonu):**
- Hafta sonu nöbetçi öğrenciler (Nöbet modülünden çekilir)
- Hafta sonu nöbetçi personel (Nöbet modülünden çekilir)
- Disiplin cezası ile hafta sonu nöbet tutan öğrenciler

#### 8.2 Koğuş İstirahati - Özel Mantık

**Kural:**
"Koğuş İstirahati" olan öğrenciler **yemek yer** (Çünkü okulda).

**Sistem Mantığı:**
- Yoklama sisteminde "Koğuş İstirahati" checkbox'ı işaretli
- Yemekhane sistemi bunu görür
- Öğrenci yemek sayısından DÜŞMEZ

#### 8.3 Dış Misafir Yönetimi

**İhtiyaç:**
Bazen dışarıdan konuk/misafir gelir ve yemek yer (Örn: Konferansçı, müfettiş).

**Nasıl Çalışmalı:**
1. Yönetici "Dış Misafir Ekle" butonuna tıklar
2. Tarih seçer
3. Misafir sayısı girer (Örn: 3 kişi)
4. Not yazar (Opsiyonel): "Savcılık ekibi"
5. Sistem o günün yemek sayısına +3 ekler

**Geriye Dönük Düzeltme:**
- Yönetici geçmiş tarihli kayıtları düzeltebilir
- Örn: "Dün 2 misafir eklenmeyi unutmuştuk" → Ekler

#### 8.4 Raporlama

**Rapor Tarihleri:**
- **Ayın 1'i:** 1-15 arası rapor
- **Ayın 15'i:** 16-30 arası rapor

**Rapor İçeriği:**
- Tarih aralığı
- Günlük yemek sayıları (Öğrenci + Personel + Misafir)
- Toplam yemek sayısı
- Hafta sonu nöbetçi eklentileri
- İzinli/Raporlu düşmeler

**Export:**
- Excel formatında indirilebilir
- PDF formatında yazdırılabilir

---

### 9. DİSİPLİN VE CEZA SİSTEMİ ⏳ PLANLI (Henüz Yapılmadı)

#### 9.1 Disiplin Kaydı

**Kayıt Bilgileri:**
- Öğrenci seçimi
- Olay Tarihi
- Suç/İhlal Tipi: Dropdown liste (Yönetmeliğe göre)
  - Örn: "İzinsiz dışarı çıkma", "Uygunsuz davranış"
- Ceza Puanı: Otomatik hesaplanır (Suç tipine göre)
- Ceza Türü:
  - İdari Ceza (Kınama, Uyarı)
  - Puan Cezası (Yıl sonu notunu etkiler)
  - İlave Nöbet Cezası (Hafta sonu)
- Karar Tarihi
- Karar Veren Yetkili

#### 9.2 Ceza Puanı ve Kritik Eşik

**Nasıl Çalışmalı:**
1. Her suç için sistem ceza puanı verir (Örn: -10 puan)
2. Öğrencinin toplam puanı azalır
3. Sistem "İlişik Kesme Eşiğine" yaklaşan öğrenciyi işaretler
4. **Kırmızı Alarm:** "Bu öğrenci kritik seviyede! (25/100 puan kaldı)"
5. Yönetici özel ilgi gösterir

#### 9.3 Süreç Yönetimi

**Adımlar:**
1. **Olay Raporu:** Olay yazılır ve sisteme girilir
2. **Savunma İsteme:** Öğrenciden savunma istenir (Tarih kaydedilir)
3. **Kurul Kararı:** Disiplin kurulu toplanır, karar alır
4. **Sonuç:** Karar sisteme girilir (Ceza puanı, ceza türü)

**Belge Yönetimi:**
- Her aşamada belgeler yüklenebilir (PDF, Word vb.)
- Öğrencinin disiplin dosyasında saklanır

#### 9.4 Otomatik Entegrasyonlar

**Senaryo: İlave Nöbet Cezası**

```
Disiplin Kurulu Kararı: "Öğrenci X, hafta sonu nöbeti"
    ↓
SİSTEM OTOMATIK YAPAR
    ↓
NÖBET YÖNETİMİ MODÜLÜ
(Öğrenci X, hafta sonu nöbet listesine eklenir)
    ↓
YEMEKHANE SİSTEMİ
(Hafta sonu yemek sayısı +1 artar)
```

**Puan Cezası - Not Sistemi Entegrasyonu:**
- Disiplin cezası puan puanı alır
- Yıl sonu disiplin notu düşer
- Mezuniyet sıralaması etkilenir

---

### 10. ÖLÇME ve DEĞERLENDİRME ⏳ PLANLI (Henüz Yapılmadı)

#### 10.1 Sınav Yönetimi

**Sınav Tipleri:**
- Ara Sınav (Birden fazla olabilir)
- Final Sınavı (Tek bir tane)
- Quiz/Kısa Sınav (Opsiyonel)

**Sınav Oluşturma:**
1. Ders seçilir
2. Sınav tipi seçilir
3. Tarih belirlenir
4. Sınav süresi (Dakika)
5. Toplam puan (Örn: 100)

#### 10.2 Not Girişi

**Nasıl Çalışmalı:**
1. Eğitmen kendi dersinin sınav sonuçlarını girer
2. Öğrenci listesi gösterilir
3. Her öğrenci için not girilir (0-100)
4. Toplu not girişi: Excel ile yüklenebilir
5. Not girildiğinde öğrenciye bildirim gider (Opsiyonel)

#### 10.3 Not Hesaplama Sistemi

**Yapı:**
Sistem Excel mantığına benzer esnek yapı kullanır.

**Örnek Ders Yapısı:**
```
ANA DAL: Ceza Hukuku
  ├── Alt Ders 1: Genel Hükümler (Ağırlık: %30)
  │     ├── Ara Sınav 1: 75 puan
  │     └── Final: 85 puan
  ├── Alt Ders 2: Özel Hükümler (Ağırlık: %40)
  │     ├── Ara Sınav 1: 80 puan
  │     ├── Ara Sınav 2: 70 puan
  │     └── Final: 90 puan
  └── Alt Ders 3: Uygulama (Ağırlık: %30)
        └── Final: 88 puan
```

**Hesaplama:**
- Her alt dersin ortalaması hesaplanır
- Ağırlıklara göre ana dal notu hesaplanır
- Genel ortalama (GPA) hesaplanır

**Önemli Not:**
- **Bütünleme sınavı YOKTUR** (KKTC uygulaması)

#### 10.4 Karne/Transkript

**Karne Özellikleri:**
- Öğrenci adı, dönem bilgisi
- Tüm dersler ve notları
- Genel ortalama
- Devamsızlık durumu
- Disiplin durumu (Varsa)
- PDF olarak indirilebilir
- E-posta ile gönderilebilir

---

### 11. ATIŞ EĞİTİMİ VE DIŞ MEKAN ETKİNLİKLERİ ⏳ PLANLI (Henüz Yapılmadı)

#### 11.1 Atış Eğitimi

**Özel Durum:**
- Okulda poligon YOKTUR
- Başka müdürlüğün poligonu kullanılır
- O gün **"Dış Görev"** olarak işaretlenir

**Kaydedilen Bilgiler:**
- Tarih
- Poligon yeri (Hangi müdürlük)
- Mesafe (Örn: 10 metre, 25 metre)
- Silah türü (Tabanca, tüfek vb.)
- Atış sayısı
- Puan
- **Harcanan Mermi Sayısı** (Çok önemli - Envanter takibi için)

**Katılımcı Listesi:**
- Hangi öğrenciler katıldı
- Toplu seçim (Sınıf bazında)

#### 11.2 Dış Görev İşaretleme

**Nasıl Çalışmalı:**
1. Takvimde ilgili gün seçilir
2. "Dış Görev" işaretlenir
3. Görev türü: Atış Eğitimi, Gezi, Uygulama vb.
4. Katılımcılar seçilir
5. O gün için normal ders programı askıya alınır (O sınıf için)

---

### 12. RAPORLAMA SİSTEMİ ⏳ PLANLI (Henüz Yapılmadı)

#### 12.1 İdari Raporlar

**Yemekhane Raporu:**
- Tarih aralığı seçimi
- Günlük detay veya özet
- Export: Excel, PDF

**Nöbet Çizelgeleri:**
- Haftalık veya aylık görünüm
- Personel ve öğrenci nöbet listeleri
- Takas/Değişiklik geçmişi
- Export: Excel, PDF

**Devamsızlık Raporu:**
- Öğrenci bazında veya sınıf bazında
- Tarih aralığı
- Devamsızlık türleri (İzinli, Raporlu, Yok vb.)
- Kritik eşik uyarısı (Örn: %20'den fazla devamsız)

#### 12.2 Akademik Raporlar

**Haftalık Ders Programı:**
- Sınıf bazında program
- Eğitmen bazında program
- PDF veya Excel export

**Öğrenci Karnesi:**
- Her öğrenci için detaylı not raporu
- Devamsızlık ve disiplin durumu
- PDF olarak indirilebilir

**Dönem Sonu Raporu:**
- Tüm dönem özeti
- Öğrenci başarı istatistikleri
- Eğitmen performansı (Kaç saat ders verdi)
- En başarılı öğrenciler

#### 12.3 Performans Raporları

**Eğitmen Performansı:**
- Toplam ders saati
- Hangi dersleri verdi
- Öğrenci geri bildirimleri (Varsa)

**Müfredat Tamamlama:**
- Her ders için hedef saat vs. verilen saat
- Tamamlama yüzdesi
- Geride kalan dersler (Uyarı)

---

## 🔗 MODÜL ENTEGRASYONLARI ⏳ PLANLI (Henüz Yapılmadı)

Sistemin en önemli özelliklerinden biri modüllerin birbirine entegre çalışmasıdır. **Bu entegrasyonlar gelecekte geliştirilecektir.**

### Entegrasyon 1: Disiplin → Nöbet → Yemekhane (PLANLI)

**Akış:**
```
1. Disiplin Kurulu: "Öğrenci X'e hafta sonu nöbeti cezası"
   ↓
2. Sistem otomatik: Nöbet modülüne "Öğrenci X hafta sonu nöbetçi" kaydını ekler
   ↓
3. Yemekhane modülü nöbet listesini görür
   ↓
4. Hafta sonu yemek sayısına Öğrenci X'i otomatik ekler
```

### Entegrasyon 2: Yoklama → Yemekhane

**Akış:**
```
1. Öğrenci İşleri: "Öğrenci Y evci izinde (3 gün)"
   ↓
2. Yoklama modülü: Öğrenci Y "İzinli" olarak işaretlenir
   ↓
3. Yemekhane modülü: O 3 gün boyunca Öğrenci Y'yi yemek sayısından DÜŞER
```

### Entegrasyon 3: Koğuş İstirahati → Yemekhane

**Akış:**
```
1. Yoklama: "Öğrenci Z koğuş istirahati (Raporlu ama okulda)"
   ↓
2. Yemekhane modülü: Öğrenci Z'yi yemek sayısından DÜŞMEZ (Çünkü okulda)
```

### Entegrasyon 4: Ders Programı → Nöbet

**Akış:**
```
1. Nöbet planlama: "Öğrenci A'ya öğle saati nöbet yazılmak isteniyor"
   ↓
2. Sistem kontrol eder: O saatte Öğrenci A'nın dersi var mı?
   ↓
3. Eğer varsa: UYARI verir ("Bu öğrencinin dersi var!")
   ↓
4. Eğer yoksa (öğle arası): İzin verir
```

### Entegrasyon 5: Disiplin → Not Sistemi

**Akış:**
```
1. Disiplin cezası: "Öğrenci B'ye -20 puan cezası"
   ↓
2. Not sistemi: Öğrenci B'nin "Disiplin Notu" düşer
   ↓
3. Genel ortalama etkilenir
   ↓
4. Mezuniyet sıralaması değişir
```

---

## 📱 KULLANICI ARAYÜZÜ GEREKSİNİMLERİ

### ✅ Mevcut Durumda Çalışan Özellikler:

**Genel Prensipler:**
- ✅ Sade ve anlaşılır arayüz
- ✅ Türkçe dil desteği
- ✅ Mobil uyumlu (Responsive)
- ✅ Hızlı arama ve filtreleme
- ✅ Toplu işlem (Excel import/export)
- ✅ Toast bildirimleri (Başarı/Hata mesajları)
- ✅ Loading states (Yükleniyor göstergeleri)
- ✅ Backend bağlantı durumu göstergesi

### Ana Sayfa (Dashboard) ✅ ÇALIŞIYOR

**Üst Kartlar:**
- Toplam Öğrenci Sayısı
- Aktif Dönemler
- Toplam Eğitmen Sayısı
- Toplam Koğuş Sayısı

**Hızlı Erişim Menüsü:**
- ✅ Öğrenciler
- ✅ Eğitmenler
- ✅ Dönemler
- ✅ Koğuş Yönetimi
- ✅ Dinamik Alanlar
- ⏳ Ders Programı (Planlanmış)
- ⏳ Nöbet Yönetimi (Planlanmış)
- ⏳ Yemekhane (Planlanmış)
- ⏳ Raporlar (Planlanmış)

### Liste Sayfaları ✅ ÇALIŞIYOR (Örn: Öğrenci Listesi)

**Çalışan Özellikler:**
- ✅ Tablo görünümü
- ✅ Hızlı arama kutusu (Tüm alanlarda arar)
- ✅ Filtreleme (Dönem, Aktif/Pasif durum)
- ✅ Sıralama (Sütun başlıklarına tıklayarak)
- ✅ Sayfalama (10/25/50/100 kayıt)
- ✅ Export butonu (Excel)
- ✅ İşlem butonları (Düzenle, Sil, Görüntüle)
- ✅ Toplu işlem (Excel import)

### Form Sayfaları ✅ ÇALIŞIYOR (Örn: Yeni Öğrenci Ekle)

**Çalışan Özellikler:**
- ✅ Anlaşılır etiketler
- ✅ Zorunlu alanlar işaretli (*)
- ✅ Validasyon mesajları (Anlık kontrol)
- ✅ Kaydet/İptal butonları
- ✅ Başarı/Hata mesajları (Toast bildirimleri)
- ✅ Modal/Popup formlar

### Modal/Popup Pencereler ✅ ÇALIŞIYOR

**Kullanım Alanları:**
- ✅ Onay istemleri ("Bu kaydı silmek istediğinize emin misiniz?")
- ✅ Hızlı düzenleme formları
- ✅ Excel import süreci

---

## 🔐 GÜVENLİK GEREKSİNİMLERİ

### ✅ Mevcut Durumda Çalışan:

**Kimlik Doğrulama:**
- ✅ E-posta ve şifre ile giriş
- ✅ JWT token bazlı oturum yönetimi
- ✅ Token doğrulama
- ✅ Protected routes (Korumalı sayfalar)

**Yetkilendirme:**
- ✅ Rol bazlı erişim kontrolü (Admin, Instructor)
- ✅ Her endpoint için yetki kontrolü
- ✅ Frontend'de rol bazlı menü görünürlüğü

**Veri Güvenliği:**
- ✅ Soft Delete (Veriler tamamen silinmez, "IsDeleted" olarak işaretlenir)
- ✅ Audit fields (CreatedAt, UpdatedAt, CreatedBy)
- ✅ UTC timezone desteği (Zaman kaydı tutarlılığı)

### ⏳ Gelecekte Eklenecek:

- ⏳ Şifre sıfırlama (Forgot Password)
- ⏳ İki faktörlü doğrulama (2FA)
- ⏳ Şifre karmaşıklık kuralları
- ⏳ Oturum süresi kontrolü
- ⏳ İşlem logları (Detaylı audit trail)
- ⏳ Backup/restore sistemi

---

## 📊 RAPORLAMA VE ANALİTİK

### Temel Metrikler:
- Toplam öğrenci sayısı (Aktif/Pasif)
- Dönem bazında öğrenci dağılımı
- Eğitmen sayısı (Kadrolu/Dış Kaynak)
- Ders saati istatistikleri
- Devamsızlık oranları
- Disiplin ceza sayıları

### Grafikler:
- Öğrenci sayısı trend grafiği (Aylık)
- Devamsızlık grafiği (Sınıf bazında)
- Eğitmen ders yükü grafiği

### Export:
- Tüm raporlar Excel ve PDF formatında indirilebilir
- E-posta ile gönderme özelliği

---

## 🚀 PERFORMANS GEREKSİNİMLERİ

- Sayfa yükleme süresi: Maksimum 2 saniye
- Liste sayfalarında sayfalama (Binlerce kayıt varsa)
- Excel import: Büyük dosyalar (1000+ satır) işlenebilmeli
- Arama sonuçları anında gösterilmeli (Canlı arama)

---

## 📱 KULLANICI DENEYİMİ

### Kullanım Kolaylığı:
- "3 tık kuralı" → İstenen bilgiye maksimum 3 tıkla ulaşılmalı
- Sezgisel navigasyon
- Breadcrumb (Nerede olduğunu göster)
- Geri dönüş butonları

### Bildirimler:
- Başarılı işlem: Yeşil bildirim
- Hata: Kırmızı bildirim
- Uyarı: Sarı bildirim
- Otomatik kapanan bildirimler (3-5 saniye)

### Yardım ve Dokümantasyon:
- Her sayfada "Yardım" butonu
- Kılavuz/Rehber (PDF olarak indirilebilir)
- Video eğitimler (Opsiyonel)
- Sık Sorulan Sorular (SSS) sayfası

---

## 🎯 PROJE BAŞARI KRİTERLERİ

### ✅ ŞUAN BAŞARILMIŞ HEDEFLER (Faz 1-2)

1. ✅ **Öğrenci bilgileri tek sistemde** → Excel karmaşasına son
2. ✅ **Excel ile toplu veri girişi** → Hızlı öğrenci kaydı
3. ✅ **Koğuş dağılımı otomasyonu** → Adil ve hızlı yerleştirme
4. ✅ **Eğitmen yönetimi** → Kadrolu/Dış kaynak ayrımı
5. ✅ **Dönem yönetimi** → Otomatik dönem kodu üretimi
6. ✅ **Dinamik alanlar** → Her dönem değişen ihtiyaçlara uyum
7. ✅ **Güvenli giriş sistemi** → Rol bazlı yetkilendirme
8. ✅ **Kolay kullanım** → Teknik bilgi gerektirmez

### ⏳ HEDEFLENEN BAŞARILAR (Gelecek Fazlar)

9. ⏳ **Otomatik ders programı** → Manuel ders yerleştirme işi ortadan kalkar
10. ⏳ **Entegre nöbet-yemekhane sistemi** → Manuel hesaplama hataları ortadan kalkar
11. ⏳ **Raporlar otomatik** → Ayın 1'i ve 15'i raporları tek tıkla hazır
12. ⏳ **Disiplin takibi** → Kritik durumlar kaçmaz
13. ⏳ **Dış eğitmen yönetimi** → Müsaitlik durumlarına göre otomatik planlama

---

## 📞 DESTEK ve DOKÜMANTASYON

### Dokümantasyon:
- Kullanıcı kılavuzu (PDF)
- Video eğitimler
- Ekran görüntülü adım adım rehberler

### Destek:
- IT ekibi iletişim bilgileri
- Hata bildirimi formu
- Öneri/İstek formu

---

## 🎨 SON NOTLAR

Bu sistem, KKTC Polis Okulu'nun günlük operasyonlarını tamamen dijitalleştirecek ve otomatikleştirecek kapsamlı bir çözümdür. 

**Temel Felsefe:**
- ❌ Karmaşık değil, **basit**
- ❌ Teknik değil, **kullanıcı dostu**
- ❌ Sabit değil, **esnek**
- ❌ İzole değil, **entegre**

**Geliştirme Sırası Önerisi:**

**✅ TAMAMLANDI (Faz 1-2):**
1. ✅ Öğrenci Yönetimi (Temel CRUD + Excel Import)
2. ✅ Eğitmen Yönetimi (Kadrolu/Dış Kaynak ayrımı)
3. ✅ Dönem Yönetimi
4. ✅ Koğuş Yönetimi
5. ✅ Dinamik Alan Sistemi
6. ✅ Kimlik Doğrulama ve Yetkilendirme

**⏳ SIRADA (Faz 3-4):**
7. ⏳ Ders Yönetimi (Courses CRUD)
8. ⏳ Ders Programı (KKTC mesai şablonu + Otomatik atama)
9. ⏳ Nöbet Yönetimi
10. ⏳ Yoklama ve İzin

**🔮 GELECEK (Faz 5+):**
11. 🔮 Yemekhane Sistemi (Entegrasyonlar)
12. 🔮 Disiplin Sistemi
13. 🔮 Sınav ve Not Sistemi
14. 🔮 Atış Eğitimi
15. 🔮 Raporlama ve Analitik

**Başarılar dilerim! 🎯**
