---
applyTo: "src/app/terms/**/*.ts,src/app/terms/**/*.tsx,src/app/api/**/*.ts,src/app/api/**/*.tsx,src/lib/**/*.ts,src/lib/**/*.tsx,prisma/schema.prisma"
---

# Ders Programi ve Mufredat Icin Ozel Talimatlar

Bu dosya, gunluk / haftalik / aylik program ve mufredat akislarinda Copilot'un uymasi gereken sert kurallari tanimlar.

## Temel Ilke
Ders programi uretimi bir UI yerlestirme isi degil, bir **kisit problemi**dir. Bu alanda sezgisel, tahmini veya sadece guzel gorunen cozumler kabul edilmez.

## Kaynak Gercekler
Planlama yaparken asagidaki kaynaklari esas al:
- `TermSettings`
- `TermCoursePlan`
- `MonthlyCoursePlan`
- `DailyLesson`
- `TimeSlot`
- `CourseInstructor`
- `InstructorAvailability`
- `SpecialEvent`
- `Conference`
- `PublicHoliday`
- `examWeeks`
- `workingDays`
- `Course.requiresLab`
- `DailyLesson.requiresSpecialArea`, `specialAreaType`, `isBlockSchedule`, `blockDuration`

## Sert Kurallar
1. `TermCoursePlan.totalPlannedHours` resmi hedeftir. Program uretimi bu hedefleri sessizce degistiremez.
2. Eger aylik plan kullaniliyorsa, ilgili ay icindeki haftalik/gunluk yerlesim aylik hedefleri ihlal etmemelidir; ihlal gerekiyorsa acik override mekanizmasi olmadan yapma.
3. Ayni sinif ayni gun/slot/tarihte birden fazla derse yazilamaz.
4. Ayni egitmen ayni gun/slot/tarihte birden fazla derse yazilamaz.
5. `workingDays` disinda ders yerlestirme yapma.
6. `PublicHoliday` ve `examWeeks` icinde normal ders yerlestirme yapma.
7. `SpecialEvent` ve `Conference` ile bloke olan slotlari normal ders gibi kullanma.
8. Egitmeni atanmamis dersi, egitmen zorunlu ise yerlestirme.
9. Dis egitmenler icin `InstructorAvailability` kontrolu olmadan atama yapma.
10. `requiresLab` veya ozel alan gereksinimi olan dersleri uygun alan kurali olmadan genel slot gibi ele alma.
11. Blok ders mantigi varsa, parcalayarak veya slot sayisini bozarak yerlestirme yapma.
12. Program olustururken ders saatlerini sadece esit bolme mantigiyla dagitma; once kisitlari sagla, sonra dagitim yap.

## Program Uretmeden Once Yapilacaklar
Kod uretmeden once zihinsel veya yazili olarak sunlari cikar:
- Girdiler neler?
- Sert kisitlar neler?
- Yumusak tercihler neler?
- Kaynak dogruluk sirasi nedir?
- Cozum sonrasi hangi validator kontrol edecek?

## Uygulama Stratejisi
- Once validator veya kabul kriteri mantigini dusun.
- Sonra generator / yerlestirme kodunu yaz.
- Gerekirse sorunu ikiye bol:
  1. hedef saat ve dagitim dogrulama
  2. slot yerlestirme ve cakisma kontrolu
- Rastgele veya nondeterministic algoritma kullanma.
- Sessiz fallback yerine acik hata veya acik uyari uret.

## Eksik Kural Varsa
Schema veya mevcut kod gerekli kurali tasimiyorsa:
- kurali kafandan uydurma
- eksik veriyi not et
- gerekirse yeni alan / config / validator ihtiyacini belirt
- ama mevcut data yoksa "cozuldu" deme

## Aylik Planla Iliski
Aylik plan mantigi, dogrudan haftalik/gunluk programa geciste referans katmanidir. Aylik toplamlari bozan haftalik program mantigi yazma. Aylik plan guncellenecekse etkisini acikca belirt.

## Egitmen Atamalariyla Iliski
`instructor-assignments` ekrani sadece UI degildir; schedule motoru icin veri kaynagidir. Egitmen atamalarini yok sayan program kodu yazma.

## Guncelleme Sirasinda Dikkat
Asagidaki alanlardan birine dokunuyorsan zincir etkisini degerlendir:
- `TermSettings`
- `TermCoursePlan.totalPlannedHours`
- `MonthlyCoursePlan.plannedHours`
- `MonthlyCoursePlan.actualHours`
- `DailyLesson`
- `CourseInstructor`
- `SpecialEvent`
- `Conference`

## Asla Yapma
- Toplam dersi tutturmadan sadece tablo doldurma.
- Aylik hedefi bozup bunu gizleme.
- Cakismalari sonradan fark edilir diye gormezden gelme.
- Program motorunu validator olmadan tamamlanmis sayma.

## Tamamlandi Demeden Once Kanitla
En az su sorulara cevap verebilmelisin:
- Her dersin hedef saati korundu mu?
- Ayni egitmen iki yere yazildi mi?
- Ayni sinif iki yere yazildi mi?
- Tatil / sinav haftasi / ozel etkinlik ihlali var mi?
- Aylik toplamlar korundu mu?
- Block veya ozel alan gerektiren dersler bozuldu mu?
