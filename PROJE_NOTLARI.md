# KKTC Polis Okulu Eğitim ve Operasyon Yönetim Sistemi

## 📋 Proje Bilgileri

- **Proje Adı:** Police School Automation
- **Teknolojiler:** Next.js 14, TypeScript, PostgreSQL, Prisma ORM
- **Çalışma Modu:** Kapalı Devre (Local)

---

## 🔐 Veritabanı Bilgileri

| Parametre | Değer |
|-----------|-------|
| Host | localhost |
| Port | 5432 |
| Veritabanı | polis_okulu_db |
| Kullanıcı | postgres |
| Şifre | postgres123 |

**Bağlantı URL'i:**
```
postgresql://postgres:postgres123@localhost:5432/polis_okulu_db?schema=public
```

---

## 📊 Veritabanı Şeması (42 Tablo)

### Modüller:

| Modül | Tablolar |
|-------|----------|
| **Kullanıcı/Auth** | users |
| **Dönem** | terms |
| **Öğrenci** | students, student_documents, classes |
| **Koğuş** | dormitories |
| **Eğitmen** | instructors, instructor_terms, instructor_availabilities |
| **Ders** | courses, course_instructors |
| **Ders Programı** | time_slots, schedule_entries, schedule_swaps, public_holidays |
| **Nöbet** | officer_duties, student_duties |
| **Yoklama/İzin** | attendances, leaves |
| **Yemekhane** | daily_meal_counts, meal_guests, meal_exclusions |
| **Disiplin** | violation_types, disciplinary_records, disciplinary_documents, student_discipline_scores |
| **Sınav/Not** | exams, exam_results, student_course_grades, student_gpas |
| **Atış/Dış Görev** | external_activities, shooting_records |
| **Dinamik Alanlar** | dynamic_fields, dynamic_field_values |
| **Sistem** | system_settings, audit_logs |

---

## 🔗 Kritik Entegrasyonlar (Dokümandan)

1. **Disiplin → Nöbet → Yemekhane:**
   - Ceza nöbeti alan öğrenci hafta sonu kalır
   - Yemekhane sayısına eklenir

2. **Yoklama → Yemekhane:**
   - İzinli öğrenci yemekten düşer
   - Koğuş istirahati olan yemek yer (düşmez)

3. **Ders Programı → Nöbet:**
   - Ders saatleriyle nöbet çakışma kontrolü

4. **Disiplin → Not Sistemi:**
   - Disiplin puanı mezuniyet sıralamasını etkiler

---

## 🛠️ Yararlı Komutlar

```bash
# Prisma Studio'yu aç (Veritabanı yönetimi)
npx prisma studio

# Şema değişikliklerini veritabanına uygula
npx prisma db push

# Prisma Client'ı yeniden oluştur
npx prisma generate

# Geliştirme sunucusunu başlat
npm run dev
```

---

## 📁 Proje Yapısı (Oluşturulacak)

```
PoliceSchoolAutomation/
├── prisma/
│   └── schema.prisma      ✅ Tamamlandı
├── src/
│   ├── app/               (Next.js App Router)
│   ├── components/        (React Bileşenleri)
│   ├── lib/               (Yardımcı fonksiyonlar)
│   └── types/             (TypeScript tipleri)
├── .env                   ✅ Tamamlandı
└── package.json           ✅ Tamamlandı
```

---

## 🏗️ KRİTİK MİMARİ KURAL (Boss Onaylı)

### 🎯 TEKİL ÇATI MİMARİSİ (DÖNEM ODAKLI)

**Ana Prensip:** *"Her şey Dönem'e (Term) aittir ve onun içinde tanımlanır."*

**ADIM 1: MUTLAK KÖK (DÖNEM OLUŞTURMA)**
- İlk önce "Kurs/Dönem" oluşturulur (Örn: "68. Polis Temel Eğitimi")
- ⚠️ **Bu dönem oluşturulmadan sistemde hiçbir işlem yapılamaz**

**ADIM 2: DÖNEMİN İÇ MİMARİSİ VE NÜFUSU**
1. **Dönem Yapısı Kurulur:**
   - Dönem için sınıflar oluşturulur (Örn: A, B, C Şubeleri)
   - Dönem için koğuş kontenjanları ayrılır
   
2. **İçerik Yerleştirilir:**
   - Öğrenciler → Dönem + Sınıf + Koğuş
   - Eğitmenler → Dönem

**Teknik Kurallar:**
- ❌ "Genel Sınıf Ekle" ekranı OLMAMALI
- ✅ "Döneme Sınıf Ekle" ekranı olmalı
- ✅ `Class` tablosu mutlaka `termId` içermeli
- ✅ Unique constraint: (`termId` + `name`)
- ✅ 68. Dönem A Şubesi ≠ 69. Dönem A Şubesi

---

## ⚠️ Önemli İş Kuralları (KKTC)

1. **Bütünleme sınavı YOKTUR** (KKTC kuralı)
2. **Dış kaynak eğitmenler nöbet tutmaz**
3. **Koğuş istirahati olan öğrenci yemekten düşmez**
4. **Disiplin puanı 25 ve altına düşerse kritik uyarı**

---

## 📅 Oluşturulma Tarihi
22 Aralık 2025

## 🔄 Son Güncelleme
22 Aralık 2025 - Dönem Odaklı Mimari Kararı
