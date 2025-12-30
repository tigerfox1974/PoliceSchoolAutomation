# 📚 DOKÜMANTASYON İNDEKSİ

> **Amaç:** Tüm .md dosyalarının ne için olduğunu ve hangi durumda kullanılacağını açıklar

---

## 🎯 ANA DOKÜMANTASYON (Her Zaman Bakılmalı)

### 1. `MASTER_DOKUMANTASYON.md` ⭐ EN ÖNEMLİ
**Ne İçin:** Tüm kurallar, modüller ve ilişkiler tek bir yerde
**Ne Zaman Bakılır:**
- Her geliştirme öncesi
- Kural hatırlamak gerektiğinde
- Modül ilişkilerini anlamak için
**İçerik:**
- Modül yapısı
- Haftalık program kuralları
- Günlük program kuralları
- Entegrasyon kuralları
- Veritabanı ilişkileri

---

## 📋 PROJE YÖNETİMİ DOKÜMANTASYONLARI

### 2. `PROJE_OZET.md`
**Ne İçin:** Projenin genel durumu, tamamlanan modüller, eksikler
**Ne Zaman Bakılır:**
- Proje durumunu öğrenmek için
- Hangi modüllerin tamamlandığını görmek için
**İçerik:**
- Tamamlanan modüller
- Eksik modüller
- Proje yapısı
- İstatistikler

### 3. `ONCELIK_SIRASI.md`
**Ne İçin:** Hangi modüllerin öncelikli olduğu, tamamlanma durumları
**Ne Zaman Bakılır:**
- Sıradaki işi belirlemek için
- İlerlemeyi takip etmek için
**İçerik:**
- Öncelik sırası
- Tamamlanma yüzdeleri
- Kalan işler

### 4. `IMPLEMENTASYON_PLANI.md`
**Ne İçin:** Detaylı implementasyon adımları, fazlar
**Ne Zaman Bakılır:**
- Yeni bir faz başlatırken
- Adım adım implementasyon yaparken
**İçerik:**
- FAZ 0, FAZ 1, FAZ 2... detayları
- Her adım için yapılacaklar
- Test senaryoları

---

## 📅 MODÜL SPESİFİK DOKÜMANTASYONLARI

### 5. `HAFTALIK_PROGRAM_KURALLARI.md`
**Ne İçin:** Haftalık program oluşturma kuralları (detaylı)
**Ne Zaman Bakılır:**
- Haftalık program algoritması geliştirirken
- Haftalık program kurallarını hatırlamak için
**İçerik:**
- Bir günde bir ders sadece bir kez
- Eğitmen çakışma kontrolü
- Sabit dersler (Müdüriyet, Sosyal/Sportif)
- Özel ders kuralları (Beden Eğitimi)
- Ders yazılmayacak günler

**Not:** Bu kurallar `MASTER_DOKUMANTASYON.md` içinde de var, ama burada daha detaylı.

### 6. `GUNLUK_PROGRAM_ANALIZ_RAPORU.md`
**Ne İçin:** Günlük program modülünün durum analizi
**Ne Zaman Bakılır:**
- Günlük program modülünü geliştirmeye başlarken
- Günlük program eksiklerini görmek için
**İçerik:**
- Mevcut durum analizi
- Eksik özellikler
- Gerekli adımlar
- Kritik kararlar

### 7. `HAFTALIK_PROGRAM_ANALIZ_RAPORU.md`
**Ne İçin:** Haftalık program modülünün analiz raporu
**Ne Zaman Bakılır:**
- Haftalık program modülünü geliştirmeye başlarken
- Haftalık program gereksinimlerini anlamak için
**İçerik:**
- Görsel analizi
- Algoritma tasarımı
- UI/UX tasarımı
- Veritabanı şeması güncellemeleri

---

## 🔧 GELİŞTİRME DOKÜMANTASYONLARI

### 8. `GELISTIRME_SECENEKLERI.md`
**Ne İçin:** Yapılacak geliştirmeler için seçenekler
**Ne Zaman Bakılır:**
- Yeni özellik eklerken seçenekleri görmek için
- Kullanıcı onayı beklenirken
**İçerik:**
- Beden eğitimi özel kuralı seçenekleri
- Resmi tatiller seçenekleri
- Sınav haftaları seçenekleri

### 9. `DERS_PROGRAMI_GEREKSINIMLER.md`
**Ne İçin:** Ders programı sisteminin tüm gereksinimleri (çok detaylı)
**Ne Zaman Bakılır:**
- Sistem mimarisini anlamak için
- Detaylı gereksinimleri görmek için
- Excel programlarından çıkarılan kuralları görmek için
**İçerik:**
- Genel bakış ve operasyonel kapsam
- Sabit kurallar ve kısıtlamalar
- Ders tanımları
- Eğitmen kuralları
- Özel etkinlikler
- Sınav dönemleri
- Otomatik planlama akışı
- Veritabanı şeması
- API endpoint'leri
- UI gereksinimleri

**Not:** Bu dosya çok uzun (3000+ satır). Sadece detaylı bilgi gerektiğinde bakılmalı.

### 10. `MODULARIZASYON_RAPORU.md`
**Ne İçin:** Modülleştirme deneyimleri, başarılı/başarısız örnekler
**Ne Zaman Bakılır:**
- Yeni modül geliştirirken modülleştirme stratejisi için
**İçerik:**
- Başarılı modülleştirmeler
- Başarısız modülleştirmeler
- Öğrenilenler

---

## 📝 NOT DOKÜMANTASYONLARI

### 11. `PROJE_NOTLARI.md`
**Ne İçin:** Proje geliştirme sırasında tutulan notlar
**Ne Zaman Bakılır:**
- Geçmiş kararları hatırlamak için
- Özel durumları görmek için

### 12. `DERS_YONETIMI_TAKIP.md`
**Ne İçin:** Ders yönetimi modülünün takip dokümantasyonu
**Ne Zaman Bakılır:**
- Ders yönetimi modülü ile ilgili bilgi gerektiğinde

---

## 🎯 KULLANIM ÖNERİLERİ

### Günlük Geliştirme İçin:
1. **`MASTER_DOKUMANTASYON.md`** - Her zaman açık tut
2. **`PROJE_OZET.md`** - Durumu kontrol et
3. **`ONCELIK_SIRASI.md`** - Sıradaki işi belirle

### Yeni Modül Geliştirirken:
1. **`MASTER_DOKUMANTASYON.md`** - Modül yapısını anla
2. **`IMPLEMENTASYON_PLANI.md`** - Adımları takip et
3. **Modül spesifik dokümantasyon** - Detayları öğren

### Kural Hatırlamak İçin:
1. **`MASTER_DOKUMANTASYON.md`** - Hızlı referans
2. **`HAFTALIK_PROGRAM_KURALLARI.md`** - Detaylı kurallar
3. **`DERS_PROGRAMI_GEREKSINIMLER.md`** - Çok detaylı (gerekirse)

---

## ⚠️ ÖNEMLİ NOTLAR

1. **`MASTER_DOKUMANTASYON.md`** her zaman güncel tutulmalı
2. Diğer dokümantasyonlar referans için, ama `MASTER_DOKUMANTASYON.md` ana kaynak
3. Yeni kural eklendiğinde hem `MASTER_DOKUMANTASYON.md` hem ilgili spesifik dokümantasyona eklenmeli
4. Çelişki durumunda `MASTER_DOKUMANTASYON.md` önceliklidir

---

**Son Güncelleme:** 2 Ocak 2026

