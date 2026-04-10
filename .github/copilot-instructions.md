# PoliceSchoolAutomation - Repo Genel Copilot Talimatlari

Bu repo, KKTC Polis Okulu icin gelistirilen egitim ve operasyon yonetim sistemidir. Bu proje prototip degil; mevcut veri modeli ve moduller korunarak ilerlenmelidir.

## Proje Omurgasi
- Framework: Next.js 14 App Router
- Dil: TypeScript (strict)
- UI: React 18
- ORM: Prisma
- Veritabani: PostgreSQL
- Ana klasorler: `src/app`, `src/features`, `src/shared`, `src/lib`, `prisma`

## Mimari Gercekler
- `prisma/schema.prisma` bu projenin temel is kurali kaynagidir. Alanlari, iliskileri, enum adlarini ve anlamsal rollerini keyfi degistirme.
- `src/app/api/**` altindaki route'lar mevcut ekranlarin veri omurgasidir. Response shape degisikligi yapma; ancak acik istem varsa ve tum etkiler yonetiliyorsa degistir.
- `src/app/terms/**` altindaki sayfalar donem, plan, ayarlar ve atama akislarinin ana UI katmanidir.
- `src/features/**` ve `src/shared/**` icindeki mevcut component/hook ayristirma mantigini koru.
- `src/lib/**` alanini is mantigi, seed verileri ve tekrar kullanilan yardimcilar icin kullan.

## Kritik Is Kavramlari
- `TermSettings`: donem takvimi ve ders saatleri ayarlarinin kaynagidir.
- `TermCoursePlan.totalPlannedHours`: donem bazli resmi hedef saattir. Program uretiminde ana kaynak kabul et.
- `MonthlyCoursePlan`: aylik dagitim ve takip katmanidir.
- `DailyLesson`: gunluk/haftalik ders programinin kayit katmanidir.
- `CourseInstructor` ve `InstructorAvailability`: egitmen atama ve musaitlik kaynagidir.
- `SpecialEvent`, `Conference`, `PublicHoliday`, `examWeeks`, `workingDays`: planlama sirasinda slot kilitleyebilen alanlardir.

## Zorunlu Calisma Kurallari
1. Kod yazmadan once ilgili akisin tum bagli dosyalarini incele.
2. Buyuk refactor yapma. Minimum riskli, sinirli diff tercih et.
3. Calisan ekranlari gereksiz yeniden adlandirma, tasima veya bolme yapma.
4. Schema veya API degisikligi gerekiyorsa once etkiledigi ekranlari, route'lari ve veri akislarini dusun.
5. Kullanici acik istemedikce route ismi, enum degeri, veritabani alan ismi ve URL yapisi degistirme.
6. Veri modeli ile kod arasinda anlamsal uyum bozma. Ornegin `programScope`, `courseType`, `DayOfWeek`, `SpecialEventType` gibi mevcut kavramlari koru.
7. Turkiye Turkcesi / Kibris Turkcesi UI metinlerini mevcut repo stiliyle tutarli surdur. Var olan dil tonunu bozma.
8. "Cozuldu" veya "tamamlandi" demeden once ilgili akis icin en az bir dogrulama plani ver.

## Degisiklik Yapmadan Once Kontrol Et
- Bu degisiklik veri modelini etkiliyor mu?
- Bu degisiklik mevcut UI ekranlarini etkiliyor mu?
- Bu degisiklik API response shape etkiliyor mu?
- Bu degisiklik donem plani / aylik plan / gunluk plan tutarliligini etkiliyor mu?
- Bu degisiklik egitmen atamalari veya yoklama gibi bagli modulleri etkiliyor mu?

## Kod Uretim Stili
- Kucuk ve okunabilir fonksiyonlar yaz.
- Is kurali agir kodda acik isimler kullan; kisaltma ve kapali mantiktan kacin.
- Yeni logic ekliyorsan, once mevcut isimlendirme ve klasor yapisina uy.
- UI degisikliginde mevcut component desenini bozmadan ilerle.
- Server tarafinda sessiz varsayimlarla veri duzeltme yapma. Kritik alanlarda acik validasyon kullan.

## Planlama ve Takvimle Ilgili Ozel Kural
Bu repoda ders programi ve mufredat mantigi normal CRUD isi degildir. Bu alan bir kisit ve dogrulama problemidir. Programlama, aylik dagitim, gunluk/haftalik yerlesim ve egitmen atama ile ilgili her gorevde `.github/instructions/schedule-planning.instructions.md` dosyasina da uy.

## Dogrulama Beklentisi
Ilgili degisiklik turune gore uygun komutlari dusun:
- `npm run build`
- `npm run lint`
- `npm run db:generate`
- ilgili API ve UI akislarina manuel senaryo kontrolu

## Asla Yapma
- Sadece gorunuste duzgun diye is kurali bozan kod yazma.
- Program ve mufredat alaninda toplam saatleri tahmini/yuvarlama ile sessizce bozma.
- Ayni sorunu duzelttigini soylerken validator veya kabul kriteri olmadan sonucu kesin diye sunma.
- Kullanici acik istemedikce veritabani temizligi, toplu silme veya veri resetleme yapma.

## Tercih Edilen Calisma Sirası
1. Mevcut akis ve bagli dosyalari oku.
2. Sorunu veri modeli / API / UI / algoritma / validator olarak siniflandir.
3. En kucuk guvenli cozum alanini sec.
4. Gerekirse once validator veya kabul kriteri ekle.
5. Sonra uygulama kodunu degistir.
6. Son olarak etkileri ozetle ve nasil kontrol edilecegini yaz.
