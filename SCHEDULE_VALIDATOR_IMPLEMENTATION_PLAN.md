# Schedule Validator Implementation Plan

Bu dokuman, PoliceSchoolAutomation projesinde gunluk / haftalik / aylik ders programi icin uygulanacak validator mimarisini ve guvenli gecis planini tanimlar.

## 1. Kesinlesen Operasyon Kurallari

### 1.1 Zaman Yapisi
- Bir gunun akademik planlama yapisi: **5 sabah dersi + ogle arasi + 2 ogleden sonra dersi**.
- ETUD, akademik planlama ve mufredat validator'ina dahil degildir.
- ETUD sadece gunluk gorunumde bilgilendirme amacli gosterilir.
- Bos ders saati kabul edilmez. 7 gercek ders slotunun tamami ders, etkinlik, konferans veya baska planli icerikle dolu olmalidir.

### 1.2 Ogretmen ve Sinif Akisi
- Bir egitmen ayni anda sadece **tek bir sinifta** olabilir.
- Egitmen, gun icinde sinif sinif dolasabilir.
- Ayni ders ayni gun farkli saatlerde farkli siniflara verilebilir.
- Ayni ders ayni sinifta blok (2-3 saat) olarak da planlanabilir.
- Ders sirasi sabit olmak zorunda degildir; sinif rotasi dinamik olabilir.

### 1.3 Bilgisayar Sinifi
- Bilgisayar sinifi, kalici bir ogrenci sinifi degil; ortak fiziksel kaynaktir.
- Bilgisayar dersi olan sinif o saatte bilgisayar sinifina gider ve ders sonrasi kendi sinifina geri doner.
- Ayni anda sadece **bir sinif** bilgisayar sinifini kullanabilir.
- Bu kisit, ayni anda aktif polis ve itfaiye donemleri arasinda da korunmalidir.

### 1.4 Ozel Etkinlikler
- Ozel etkinlikler term bazinda **konfigure edilebilir**.
- Intibak 1 hafta, 2 hafta veya hic olmayabilir.
- Muduriyet, sosyal-sportif, yoklama vb. term bazli acilip kapanabilir.
- Program uretim sirasinda once sabit/ozel etkinlikler yerlesir, sonra dersler yerlestirilir.

### 1.5 Ders Saat Takibi
- Konu bazli takip yoktur.
- Esas olan, **her sinifta her ders icin kac saat verildigi ve kac saat kaldigi** bilgisinin tutulmasidir.
- Blok derslerde sinif bazinda gercek verilen saat kadar azalma olur.
- Ornek: A sinifinda Ceza Yasasi 2 saat verildiyse, A sinifinin Ceza Yasasi kalan saati 2 azalir.

### 1.6 Genel Ozet + Sinif Bazli Detay
- Sistem hem genel ozet, hem sinif bazli detay gosterebilir.
- Ancak resmi dogruluk ve validator ana kaynagi **sinif bazli saat takibi** olmalidir.
- Aylik plan genel ders bazli tutulabilir; sinif bazli ilerleme ayrica takip edilir.

### 1.7 Bos Saat Durumunda Fallback
- Sistem bos ders birakamaz.
- Sistem oneride bulunabilir:
  - o ana kadar en az ilerlemis dersler
  - o gun ve o saatte uygun egitmenler
  - uygun ozel etkinlik secenekleri
- Nihai karar yoneticiye aittir.

## 2. Validator Katmanlari

### 2.1 Structural Validator
Amac: veri ve slot yapisini dogrulamak.

Kontroller:
- Oglen arasi slotuna ders yazilmamis olmali.
- Bir sinif ayni tarih + slotta birden fazla kayda sahip olmamali.
- Bir egitmen ayni tarih + slotta birden fazla kayda sahip olmamali.
- Ayni fiziksel kaynak (ozellikle bilgisayar sinifi) ayni tarih + slotta birden fazla sinifa atanmis olmamali.
- ETUD akademik slot hesabina karistirilmamali.

### 2.2 Calendar Validator
Amac: takvim ve donem kisitlarini dogrulamak.

Kontroller:
- Dersler yalnizca term tarih araliginda olmali.
- Dersler yalnizca workingDays icinde olmali.
- PublicHoliday gunlerinde normal ders olmamali.
- Exam week icinde normal ders olmamali.
- Term bazli kapatilan ozel etkinlik zorunluluklari dayatilmamali.

### 2.3 Fill Validator
Amac: bos ders saati birakilmadigini garanti etmek.

Kontroller:
- Her sinif icin her gecerli akademik gunde 7 slot dolu olmali.
- Bos kalan slot varsa bu hard error olmali.
- Ozel etkinlik veya konferans da olsa slot dolu kabul edilir.

### 2.4 Workload Validator
Amac: egitmenin fiziksel is yukunu dogrulamak.

Kontroller:
- Egitmen ayni anda tek sinifta olmali.
- Egitmenin bir gunde verdigi toplam ders saati, o gun girdigi sinif-saat sayisina esit olmali.
- Blok ders varsa is yuku blok suresi kadar artar.
- Yedek egitmen atamasi varsa, gercek veren egitmen is yukune yansir.

### 2.5 Class Progress Validator
Amac: resmi ilerleme kaynagini dogrulamak.

Kontroller:
- Her sinif + ders kombinasyonu icin gercek verilen saatler hesaplanabilmeli.
- Ayni sinifa 1 saat verildiyse +1, 2 saat blok verildiyse +2 sayilmali.
- Giremedigi siniflarda azalma olmamali.
- Kalan saatler negatif olmamali.

### 2.6 Monthly Alignment Validator
Amac: genel aylik plan ile sahadaki ilerleme arasindaki farki izlemek.

Kontroller:
- MonthlyCoursePlan genel hedefi referans olarak korunur.
- Sinif bazli gerceklesme, genel aylik hedefle birebir ayni olmak zorunda degildir.
- Sapma warning olarak raporlanir; sessizce gizlenmez.
- Gerekiyorsa yonetici override/yeniden planlama ister.

### 2.7 Suggestion Validator
Amac: bos saat olusma riskinde sistem onerilerini uretmek.

Oneri onceligi:
1. Yetkili ve musait yedek egitmen
2. Yetkili ve musait ana/alternatif egitmen
3. O ana kadar en az ilerlemis dersler
4. Uygun ozel etkinlik / konferans secenekleri
5. Manuel yonetici karari

## 3. Hard Error / Warning Ayrimi

### 3.1 Hard Error
- Bos akademik slot kalmasi
- Oglen arasi slotuna ders yazilmasi
- Ayni sinifin ayni slotta iki kaydi olmasi
- Ayni egitmenin ayni slotta iki kaydi olmasi
- Bilgisayar sinifinin ayni anda birden fazla sinifa atanmasi
- Working day disinda ders
- Exam week veya resmi tatilde normal ders
- Yetkisiz egitmenin derse atanmasi
- Sinif bazli kalan saatin negatif hale gelmesi

### 3.2 Warning
- Aylik plan ile fiili sinif bazli ilerleme arasinda sapma
- Belli derslerin digerlerine gore asiri yogun haftaya sahip olmasi
- Onerilen dagitimdan sapma
- Bazı siniflarin digerlerine gore geriden gelmesi
- Yonetici override nedeniyle tavsiye edilen plandan sapma

## 4. Mevcut Sistemde Tespit Edilen Ana Uyumsuzluklar

### 4.1 Weekly Generator Uyumsuzlugu
`src/app/api/terms/[id]/weekly-schedule/route.ts` su anda buyuk oranda bir slota bir ders secip tum siniflara yazma mantigina yakin davranmaktadir.

Gercek operasyon modeline gore bu yanlistir.
Dogru model su olmalidir:
- sinif-slot bazli yerlesim
- egitmen rotasi
- ortak kaynak rezervasyonu
- sinif bazli ilerleme takibi

### 4.2 TimeSlot Uyumsuzlugu
Varsayilan TimeSlot tanimi 5 ders + 1 break + 1 ders gorunumu vermektedir.
Gercek kural 5 ders + ogle arasi + 2 ders oldugu icin varsayilan slot modeli gozden gecirilmelidir.

### 4.3 Sinif Bazli Ilerleme Eksigi
Mevcut veri modeli dersin genel planini takip ediyor; sinif bazli resmi ilerlemeyi dogrudan takip etmekte yetersiz kaliyor.

## 5. Onerilen Veri Modeli Etkisi

### 5.1 Hemen Gerekmeyen Ama Kuvvetle Onerilen Yeni Katman
Sinif bazli resmi ilerleme icin yeni bir model veya esitdeger bir hesaplama tabakasi gerekir.

Onerilen model:
- `ClassCourseProgress` veya benzeri bir yapi

Ornek alanlar:
- id
- termId
- classId
- courseId
- plannedHours
- actualHours
- remainingHours
- createdAt
- updatedAt

Not: Bu hemen schema'ya eklenmek zorunda degildir; once validator hesaplamali okuma katmani olarak da baslanabilir. Ama uzun vadede kalici veri modeli gerekir.

## 6. Degisecek Ana Dosyalar

### 6.1 Validator ve Algoritma Katmani
- `src/app/api/terms/[id]/weekly-schedule/route.ts`
- `src/app/api/terms/[id]/weekly-schedule/algorithms/scheduleValidators.ts`
- `src/app/api/terms/[id]/weekly-schedule/algorithms/slotFiller.ts`
- `src/app/api/terms/[id]/weekly-schedule/algorithms/counterControl.ts`
- `src/app/api/terms/[id]/weekly-schedule/algorithms/specialEvents.ts`

### 6.2 Veri Modeli / Hesaplama Katmani
- `prisma/schema.prisma` (eger sinif bazli ilerleme modeli eklenecekse)
- yeni helper/selector dosyalari (`src/lib/**` altinda)

### 6.3 UI ve Raporlama Katmani
- haftalik program ekrani
- gunluk program ekrani
- ilerleme / raporlama ekranlari
- yonetici override ve anlik yeniden planlama akislarina ait sayfalar

## 7. Guvenli Uygulama Sirasi

### Faz 1 - Salt Validator Okuma Katmani
Kod davranisini hemen bozma.
Once sadece kontrol ekle:
1. TimeSlot yapisini dogrulayan validator
2. Bos slot kontrolu
3. Egitmen cakisma kontrolu
4. Sinif cakisma kontrolu
5. Bilgisayar sinifi cakisma kontrolu
6. Hard error ve warning raporu ureten test yardimcilari

### Faz 2 - TimeSlot ve Ogle Arasi Duzeltmesi
1. Varsayilan time slot tanimini gercek 5+2 modele gore duzelt
2. Ogle arasini kullanilabilir ders slotu gibi ele alan logic'i kaldir
3. ETUD'u schedule validator disinda tut

### Faz 3 - Sinif-Slot Tabanli Generator Donusumu
1. Tum siniflara ayni dersi ayni anda basma mantigini kaldir
2. Yerine sinif-slot bazli planlama getir
3. Egitmen rotasi mantigi ekle
4. Bilgisayar sinifi ortak kaynak rezervasyonu ekle

### Faz 4 - Sinif Bazli Ilerleme Hesabi
1. Once hesaplamali (derived) validator yaz
2. Dogrulandiysa kalici model ekle
3. Sinif bazli kalan saatleri UI ve raporlara yansit

### Faz 5 - Yonetici Oneri ve Override Akisi
1. Bos kalacak slotta otomatik oneriler
2. En az ilerlemis dersler listesi
3. Yedek egitmen / alternatif ders onerileri
4. Nihai manuel override kaydi

## 8. Ilk Duzeltilecek 3 Kritik Bug

1. **TimeSlot yapisi ve ogle arasi kullanimi**
   - Oglen arasi ders slotu gibi ele alinmamali.

2. **Weekly generator'in tum siniflara ayni anda ayni ders yazmasi**
   - Gercek operasyon mantigina aykiri.

3. **Sinif bazli resmi ilerleme eksikligi**
   - Su an sadece genel planlama yeterli degil.

## 9. Basari Kriteri
Bir degisiklik ancak su kosullar saglanirsa basarili kabul edilir:
- Bos akademik slot kalmiyor
- Oglen arasi korunuyor
- Egitmen ayni anda iki yerde degil
- Bilgisayar sinifi ayni anda tek sinifta
- Sinif bazli kalan saatler dogru hesaplanabiliyor
- Aylik hedef sapmalari warning olarak gorunuyor
- Yonetici override mekanizmasi kayit altina aliniyor

## 10. Stratejik Sonuc
Bu proje icin ders programi problemi klasik ders cizelgeleme degil; **sinif-slot + egitmen rota + ortak kaynak + sinif bazli ilerleme** problemidir.

Bu nedenle yalnizca instruction dosyalari yeterli degildir. Dogru cozum:
- repo-genel talimatlar
- schedule ozel talimatlar
- validator kurallari
- sinif bazli hesaplama katmani
- kontrollu generator donusumu

birlikte uygulanmalidir.
