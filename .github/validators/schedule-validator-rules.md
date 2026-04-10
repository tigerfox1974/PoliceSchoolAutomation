# Schedule Validator - Kabul Kriterleri

Bu dosya, PoliceSchoolAutomation icinde gunluk / haftalik / aylik ders programi uretimi veya guncellemesi yapildiginda saglanmasi gereken kabul kriterlerini tanimlar.

## Amac
Copilot veya baska bir AI tarafindan uretilen schedule mantiginin sadece gorunuste degil, is kurali seviyesinde de dogru oldugunu kontrol etmek.

---

## 1. Donem ve Takvim Kurallari
- Dersler sadece `Term.startDate` ile `Term.endDate` arasinda olmalidir.
- Dersler sadece `TermSettings.workingDays` icinde yer almalidir.
- `PublicHoliday` gunlerinde normal ders yerlesmemelidir.
- `examWeeks` icinde normal ders yerlesmemelidir.
- Donem disi aylar veya haftalar icin aktif plan olusturulmamalidir.

## 2. Saat ve Slot Kurallari
- Her schedule kaydi gecerli bir `TimeSlot` ile eslesmelidir.
- Ayni sinif, ayni slotta birden fazla derse sahip olamaz.
- Ayni egitmen, ayni slotta birden fazla derse sahip olamaz.
- `DailyLesson` kayitlari mevcut unique mantigi ile celismemelidir.
- Iptal edilmis dersler aktif ders gibi saat hesabina yazilmamalidir; bu davranis net degilse acik kural eklenmelidir.

## 3. Mufredat ve Saat Koruma Kurallari
- Her `Course` icin schedule'a yerlestirilen toplam saat, ilgili `TermCoursePlan.totalPlannedHours` ile tutarli olmalidir.
- Aylik dagitim kullaniliyorsa, ilgili ay icindeki toplam yerlestirme `MonthlyCoursePlan.plannedHours` ile tutarli olmalidir.
- `MonthlyCoursePlan.actualHours`, gercekten tamamlanan veya islenen saatleri temsil etmeli; schedule tarafinda sessizce sifirlanmamali veya tahmini guncellenmemelidir.
- Program motoru toplam saati koruyamiyorsa bunu gizlemek yerine hata/uyari uretmelidir.

## 4. Egitmen Kurallari
- Egitmen zorunlu derslerde `instructorId` bos birakilmamalidir.
- Egitmen atamasi yapilmamis ders otomatik olarak musait ilk kisiye verilmemelidir; acik kural veya atama olmadan yerlestirme yapma.
- Dis egitmenler icin `InstructorAvailability` disinda schedule olusturulmamalidir.
- `CourseInstructor` kayitlari yok sayilarak schedule uretimi yapilmamalidir.

## 5. Ozel Etkinlik ve Konferans Kurallari
- `SpecialEvent` ve `Conference` tanimli slotlar normal derslerle cakismamalidir.
- `countsTowardCurriculum` false ise bu kayitlar ilgili dersin hedef saatini dusurmemeli veya tamamlanmis saat gibi yazilmamalidir.
- `countsTowardCurriculum` true ise bunun toplam saat etkisi acik ve izlenebilir olmali; gizli yan etki olmamalidir.

## 6. Ozel Ders Tipi Kurallari
- `requiresLab` olan dersler laboratuvar gereksinimi yok sayilarak genel ders gibi yerlestirilmemelidir.
- `requiresSpecialArea` olan dersler icin uygun alan kisiti dusunulmelidir.
- `isBlockSchedule` ve `blockDuration` bulunan dersler parcalanmis sekilde yerlestirilmemelidir.
- `CONFERENCE` veya `PANEL` tipindeki dersler standart haftalik tekrar mantigina zorla sokulmamalidir.

## 7. Veri Butunlugu Kurallari
- `TermCoursePlan.totalPlannedHours` degisirse, bagli `MonthlyCoursePlan` ve schedule etkisi analiz edilmelidir.
- `MonthlyCoursePlan.plannedHours` degisirse, bagli haftalik/gunluk yerlesim etkisi analiz edilmelidir.
- `TermSettings` degisirse (workingDays, lessonDuration, lunchBreak, slot mantigi), schedule katmani yeniden dogrulanmalidir.
- `SpecialEvent`, `Conference`, `CourseInstructor`, `InstructorAvailability` degisirse schedule tekrar kontrol edilmelidir.

## 8. Minimum Test Senaryolari
Her schedule degisikliginde en az su senaryolar dusunulmelidir:
1. Polis donemi icin standart derslerle plan uretimi
2. Itfaiye donemi icin standart derslerle plan uretimi
3. Ozel etkinlik bulunan haftada schedule kontrolu
4. Egitmen musaitligi kisitli durumda schedule kontrolu
5. Aylik hedef ile haftalik dagitimin tutarlilik kontrolu
6. Ayni egitmenin iki derse cakisma kontrolu
7. Ayni sinifin iki derse cakisma kontrolu
8. Tatil veya exam week haftasinda yerlestirme kontrolu

## 9. Bir Degisiklik Basarili Sayilmadan Once Sorulacak Sorular
- Toplam ders saati tam korundu mu?
- Aylik toplamlarda tasma veya eksilme var mi?
- Cakisma var mi?
- Egitmen atamasi olmayan zorunlu ders var mi?
- Ozel etkinlikler dogru korunuyor mu?
- Program sadece tabloyu dolduruyor mu, yoksa is kurallarini da sagliyor mu?

## 10. Son Karar Kurali
Bu validator kurallarindan biri bile saglanmiyorsa, schedule degisikligi "tamamlandi" kabul edilmemelidir.
