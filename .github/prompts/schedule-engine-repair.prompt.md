---
mode: agent
description: Polis Okulu otomasyonunda gunluk / haftalik / aylik ders programi mantigini guvenli sekilde kurmak veya duzeltmek icin kullan.
---

Bu gorev, PoliceSchoolAutomation reposunda ders programi ve mufredat akislarini duzeltmek veya gelistirmek icindir.

## Gorev
Asagidaki istegi yerine getirirken once mevcut repo yapisini incele, sonra minimum riskli cozum uygula:

- donem ayarlari
- donem plani
- aylik plan
- egitmen atamalari
- gunluk / haftalik schedule
- ozel etkinlikler ve konferanslar

## Calisma Sekli
1. Once ilgili dosyalari bul ve oku.
2. Sorunu asagidaki siniflardan hangisine girdigini belirle:
   - veri modeli eksigi
   - API eksigi
   - schedule algoritmasi eksigi
   - validator eksigi
   - UI eksigi
3. Hemen kod yazma. Once kisit listesini cikar.
4. Sert kisitlari ve kabul kriterlerini yaz.
5. Mumkunse once validator veya kontrol mantigini ekle.
6. Sonra uygulama kodunu minimum diff ile degistir.
7. Sonunda hangi senaryolarin kontrol edilmesi gerektigini yaz.

## Sert Kisit Kontrol Listesi
Asagidakileri acikca kontrol etmeden gorevi tamamlanmis sayma:
- Her dersin toplam hedef saati korunuyor mu?
- Aylik planlar bozuluyor mu?
- Ayni sinif ayni slotta iki kez yerlestiriliyor mu?
- Ayni egitmen ayni slotta iki kez yerlestiriliyor mu?
- Working days disinda yerlestirme oluyor mu?
- Public holiday veya exam week ihlali var mi?
- Special event veya conference slotlari cigneniyor mu?
- Egitmen atamasi olmayan ama egitmen gerektiren ders yerlestiriliyor mu?
- Block veya lab/ozel alan gerektiren dersler dogru ele aliniyor mu?

## Cikti Formati
Asagidaki sirayla ilerle:
1. Okudugun ilgili dosyalar
2. Tespit edilen kok neden
3. Sert kisit listesi
4. Onerecegin minimum riskli cozum
5. Yapilan degisiklikler
6. Dogrulama plani

## Onemli Not
Bu repoda schedule problemi sadece UI problemi degildir. Program motoru ve validator birlikte dusunulmelidir. Sadece ekrani duzeltip alttaki mantigi bozuk birakma.
