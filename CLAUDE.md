# AlmakIstiyor — Tam Proje Handoff

> **almakistiyor.com** — Türkiye'nin alıcı odaklı ters ilan platformu.
> Alıcılar talep girer, satıcılar bulur. Satım ilanı YOKTUR.

---

## 1. PLATFORM KARŞILAŞTIRMASI

| Özellik | Web (Masaüstü) | Web (Mobil) | APK (Android) |
|---|---|---|---|
| Teknoloji | Next.js 15 Pages Router | Aynı kod, responsive CSS | Flutter (tek `main.dart`) |
| Deploy | Vercel CLI | Vercel CLI | APK build → elle yükleme |
| Supabase bağlantısı | Supabase JS client | Supabase JS client | Direkt REST API (http paketi) |
| Navbar | Logo + Arama + İlan Ver butonu | Logo + İlan Ver (arama gizli) | Kendi AppBar |
| Hero | NE ALMAK İSTİYORSUN + daktilo + ok akış (yatay, tek satır) | NE ALMAK İSTİYORSUN + daktilo 2 satır + ok akış (2×2 grid → tek satır) | NE ALMAK İSTİYORSUN + daktilo 2 satır + ok akış (CustomPainter ok şekli) |
| Arama | Navbar'da daima görünür | Hero altında, belirgin kenarlık | Hero içinde, yarı saydam kutu |
| İlan Ver butonu | Navbar'da turuncu | Hero altında büyük sarı buton | Hero içinde büyük sarı buton |
| Admin panel | 7 sekme (Dashboard, Onaylar, İlanlar, Kullanıcılar, Paketler, Destek, + diğerleri) | Aynı | 6 sekme (Dashboard, Onaylar, İlanlar, Kullanıcılar, Paketler, Destek) |
| Bottom nav | Yok | Ana Sayfa / Kategoriler / İlan Ver / Mesajlar / Profil | Ana Sayfa / Kategoriler / İlan Ver / Mesajlar / Profil |
| Görüntüleme sayacı | `[id].js` açılışında `goruntuleme_arttir` RPC | Aynı | `_goruntulemeArttir()` → önce RPC, fallback REST PATCH |
| Sıralama seçenekleri | En yeni / En eski / En çok görüntülenen / En az görüntülenen / En düşük bütçe / En yüksek bütçe | Aynı | En yeni / En eski / En ucuz / En pahalı / En çok görüntülenen |
| Daktilo kelimeler | İstanbul'da kiralık ev · İkinci el araba · Kelepir arsa · iPhone 17 Pro Max · Satılık daire · LGS için özel öğretmen · İkinci el beyaz eşya · Temizlik hizmeti | Aynı | Aynı (çift tırnak ile, tek tırnak yasak) |

---

## 2. DOSYA YAPISI

### Web Sitesi
```
C:\Users\ccane\OneDrive\Desktop\almakistiyor\
├── src\
│   ├── pages\
│   │   ├── index.js              ← Ana sayfa (hero, ilan listesi, filtreler)
│   │   ├── kayit.js              ← Üye ol sayfası
│   │   ├── giris.js              ← Giriş sayfası
│   │   ├── panel.js              ← Kullanıcı paneli
│   │   ├── admin.js              ← Admin paneli (7 sekme)
│   │   ├── ilan\
│   │   │   └── [id].js           ← İlan detay sayfası (görüntüleme++)
│   │   ├── kategori\
│   │   │   └── [slug].js         ← Kategori sayfası
│   │   └── api\
│   │       ├── ilan-suresi-kontrol.js
│   │       └── ilan-uzat.js
│   ├── components\
│   │   ├── Navbar.js             ← Navbar (logo + arama + ilan ver)
│   │   ├── IlanForm.js           ← İlan ver formu (6 adım, hem oluşturma hem düzenleme)
│   │   └── ...
│   └── lib\
│       └── supabase.js           ← Supabase client
├── public\
│   └── almakistiyor-icon.png     ← Logo
└── .env.local                    ← Supabase key (GIT'E COMMIT ETME)
```

### APK (Flutter)
```
D:\almakistiyor2\
├── lib\
│   ├── main.dart                 ← TEK DOSYA (~7300 satır)
│   └── sehirler.dart             ← 81 il/ilçe listesi
├── android\
│   └── app\
│       └── build.gradle.kts      ← NDK: 27.0.12077973
├── assets\
│   └── icon.png                  ← Uygulama ikonu
└── pubspec.yaml                  ← Paketler: http, intl, url_launcher
```

---

## 3. YEDEK SİSTEMİ

### Yedek Konumları
```
D:\onemli_yedek\
├── 2026-06-27_21-40\            ← Son tam yedek
│   ├── uygulama\                ← lib/, android/, assets/, pubspec
│   ├── website\                 ← src/, public/, content/, .env.local
│   └── database\
│       ├── schema.sql           ← Tüm tablo yapıları + RPC fonksiyonları
│       └── *.json               ← Tüm tablo verileri
└── apk\
    └── almakistiyor.apk         ← Son release APK (her build üzerine yazar)
```

### Yedek Alma (PowerShell)
```powershell
& D:\yedek_al.ps1
```
> **Not:** `& D:\yedek_al.ps1` şeklinde çalıştır, direkt `D:\yedek_al.ps1` çalışmaz.

### Yedek Script (`D:\yedek_al.ps1`)
```powershell
$tarih = Get-Date -Format "yyyy-MM-dd_HH-mm"
$hedef = "D:\onemli_yedek\$tarih"
New-Item -ItemType Directory -Path "$hedef\uygulama","$hedef\website","$hedef\database" -Force
Copy-Item "D:\almakistiyor2\lib" "$hedef\uygulama\lib" -Recurse -Force
Copy-Item "D:\almakistiyor2\android" "$hedef\uygulama\android" -Recurse -Force
Copy-Item "D:\almakistiyor2\assets" "$hedef\uygulama\assets" -Recurse -Force
Copy-Item "D:\almakistiyor2\pubspec.yaml","D:\almakistiyor2\pubspec.lock" "$hedef\uygulama\" -Force
$kaynak = "C:\Users\ccane\OneDrive\Desktop\almakistiyor"
foreach ($k in @("src","public","content","scratch",".vscode",".vercel")) {
    if (Test-Path "$kaynak\$k") { Copy-Item "$kaynak\$k" "$hedef\website\$k" -Recurse -Force }
}
Get-ChildItem $kaynak -File | Copy-Item -Destination "$hedef\website\" -Force
Write-Host "Yedeklendi: $hedef"
```

---

## 4. DEPLOY & BUILD

### Web Deploy
```powershell
cd C:\Users\ccane\OneDrive\Desktop\almakistiyor
vercel          # preview (test)
vercel --prod   # production (almakistiyor.com)
```
> `git push` kullanma — her zaman `vercel` CLI ile deploy et.

### APK Build
```powershell
# 1) Yedek al
& D:\yedek_al.ps1

# 2) main.dart'ı kopyala (Downloads'tan)
Copy-Item (Get-ChildItem "$env:USERPROFILE\Downloads\main*.dart" | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName "D:\almakistiyor2\lib\main.dart" -Force

# 3) Build
cd D:\almakistiyor2
flutter build apk --release

# 4) APK'yı yedek klasörüne kopyala
Copy-Item "D:\almakistiyor2\build\app\outputs\flutter-apk\app-release.apk" "D:\onemli_yedek\apk\almakistiyor.apk" -Force
```

### APK Test (Cihazda Çalıştır)
```powershell
cd D:\almakistiyor2
flutter run -d R5CX13AGY0V   # Samsung Galaxy S23 Ultra
```

### Köşeli Parantezli Dosya Kopyalama (PowerShell)
```powershell
# [id].js gibi dosyalar için -LiteralPath kullan
Copy-Item -Path "$env:USERPROFILE\Downloads\ilan_id.js" -Destination "C:\Users\ccane\OneDrive\Desktop\almakistiyor\src\pages\ilan\[id].js" -Force
```

---

## 5. TEKNİK KURALLAR

### Genel
- **Localhost test YOK** — web için her zaman Vercel preview
- **CSS değişikliği yapma** — açıkça istenmedikçe
- **Yedek al → değiştir → deploy** sırası

### Web (Next.js)
- Dosya düzenlemesi: Python ile CRLF korunarak (`newline=''`)
- JSX doğrulama: `esbuild` ile (`node -e "esbuild.transformSync(..., {loader:'jsx'})"`)
- BOM yok, CRLF satır sonu
- Türkçe karakter string içinde serbesttir

### APK (Flutter/Dart)
- Paketler: SADECE `http: ^1.2.0`, `intl: ^0.19.0`, `url_launcher`, `dart:io`, `flutter/services`
- `supabase_flutter` paketi **YOK** — tüm istekler direkt REST API
- **Türkçe karakter identifier'da YASAK** — `_imlec` değil `_imleç`
- **UTF-8 BOM** (`\xef\xbb\xbf`) dosya başında korunmalı
- **NDK versiyonu:** `27.0.12077973` (build.gradle.kts'de)
- Tek tırnak içinde kesme işareti YASAK: `'İstanbul'da'` → çift tırnak `"İstanbul'da"` kullan
- Her teslimde Python ile parantez dengesi kontrol et
- PowerShell: komutları **ayrı satırda** yaz, `;` ile birleştirme

---

## 6. VERİTABANI (Supabase)

```
URL: https://weytlawfdgzxuypycuzz.supabase.co
Admin: caner.demiral@gmail.com
```

### Önemli Tablolar
| Tablo | Açıklama |
|---|---|
| `ilanlar` | Tüm ilanlar (`onay_durumu`, `durum`, `goruntuleme`, `bekleyen_degisiklik`) |
| `kullanicilar` | Profiller (`paket`, `sehir`, `engelli`, `silindi`) |
| `paketler` | `gunluk_mesaj`, `gunluk_telefon`, `telefon_goster`, `gunluk_ilan` |
| `kategoriler` | 7391 kayıt, `parent_id` ile ağaç yapısı |
| `konusmalar` | Mesajlaşma konuşmaları |
| `konusma_mesajlari` | Mesajlar (`okundu` flag) |
| `adminler` | Admin listesi |
| `destek_talepleri` | Yardım talepleri |
| `sikayetler` | İlan şikayetleri |

### Kritik RPC Fonksiyonu
```sql
-- Görüntüleme sayacı (SECURITY DEFINER — RLS'yi bypass eder)
CREATE OR REPLACE FUNCTION goruntuleme_arttir(ilan_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE ilanlar SET goruntuleme = COALESCE(goruntuleme, 0) + 1 WHERE id = ilan_id;
END;
$$;
```

---

## 7. MİMARİ — APK

### Oturum Sistemi
- `Oturum` singleton + ChangeNotifier
- `accessToken`, `kullanici` (Map), `isAdmin` (bool)
- Kalıcı oturum: `Directory.systemTemp/almakistiyor_session.json`
- Admin kontrolü: `adminler` tablosundan (fallback: email)
- SuperAdmin: `caner.demiral@gmail.com` → AppBar'da **SUPER** rozeti

### Ana Sayfalar (APK)
| Sayfa | Sınıf |
|---|---|
| Ana Sayfa | `_AnaSayfaState` + `_HeroAlani` |
| İlan Ver | `IlanVerSayfasi` (6 adım) |
| İlan Detay | `IlanDetaySayfasi` |
| İlanlarım | `IlanlarimSayfasi` |
| Mesajlarım | `MesajlarimSayfasi` |
| Admin Panel | `AdminPanelSayfasi` (6 sekme) |
| Pro Üyelik | `ProUyelikSayfasi` |
| Yardım | `YardimSayfasi` |
| Hesap Ayarları | `HesapAyarlariSayfasi` |
| Şifre Sıfırlama | `SifreSifirlamaSayfasi` |

### Admin Panel Sekmeleri (APK)
1. **Dashboard** — 6 istatistik kartı (aktif ilan, bekleyen, toplam, kullanıcı, bugün ilan, bugün üye)
2. **Onaylar** — Yeni ilanlar + düzenleme onayları (`bekleyen_degisiklik`)
3. **İlanlar** — Arama + durdur/yayınla/sil
4. **Kullanıcılar** — Paket değiştir, engelle, admin yap, detay modal
5. **Paketler** — Fiyat ve hak düzenleme
6. **Destek** — Yanıtla, durum değiştir

---

## 8. MİMARİ — WEB

### Önemli Bileşenler
| Dosya | Görev |
|---|---|
| `index.js` | Ana sayfa, hero, filtreler, ilan listesi, sıralama |
| `Navbar.js` | Logo + arama (masaüstü) + İlan Ver butonu + profil |
| `IlanForm.js` | İlan ver formu (6 adım) + düzenleme modu (`duzenlenecekIlan` prop) |
| `[id].js` | İlan detay + görüntüleme sayacı |
| `admin.js` | Admin paneli (7 sekme) |
| `kayit.js` | Kayıt formu (shake validasyon) |

### Hero Yapısı (Web Masaüstü)
```
NE ALMAK İSTİYORSUN?  (turuncu, 28px, bold)
[daktilo yazısı]| almakistiyor.com  (tek satır)
[Ne istediğini yaz] → [İlanın yayına girer] → [Satıcılar seni bulur] → [En iyisini seç]
                    (ok şekli, yatay tek satır)
```

### Hero Yapısı (Web Mobil ≤768px)
```
NE ALMAK İSTİYORSUN?  (turuncu, küçük caps)
[daktilo yazısı]|     (sarı, ayrı satır)
almakistiyor.com      (beyaz + turuncu .com)
[Ne istediğini yaz] [İlanın yayına girer]   ← ok şekli, tek satır
[Satıcılar seni bulur] [En iyisini seç]
[+ Ücretsiz Alım İlanı Ver]  (büyük sarı buton)
[İlan ara: kategori, şehir...]
```

### Validasyon (Shake Animasyonu)
- `kayit.js` ve `IlanForm.js`'te zorunlu alanlar boş bırakılırsa ilk hatalı alana kaydırıp **titretiyor**
- CSS: `@keyframes akSallan` + `.ak-sallan` class
- Web: `scrollIntoView` + class ekle/kaldır
- APK: `_TitresenAlan` widget + `HapticFeedback.mediumImpact()`

---

## 9. SIFIRDAN BAŞLAMA (Yeni Oturum İçin Kontrol Listesi)

```
□ Son yedeği kontrol et: D:\onemli_yedek\
□ APK için main.dart'ı oku (7300 satır, tek dosya)
□ Web için değiştirilecek dosyayı lokale çek
□ Python ile CRLF koruyarak düzenle
□ esbuild ile JSX doğrula (web) / parantez kontrolü (APK)
□ Web: vercel (preview) → test → vercel --prod
□ APK: yedek al → main.dart kopyala → flutter build apk → apk'yı yedekle
```

---

## 10. BİLİNEN KISITLAMALAR

| Kısıtlama | Açıklama |
|---|---|
| APK tek dosya | `main.dart` ~7300 satır — token maliyeti yüksek |
| Localhost yok | Web her zaman Vercel preview'da test edilmeli |
| PowerShell `&&` yasak | Komutları ayrı satırda yaz |
| Türkçe identifier | Dart'ta identifier'da Türkçe karakter derleme hatası verir |
| Tek tırnak içi kesme | `'İstanbul'da'` → `"İstanbul'da"` kullan |
| RLS + görüntüleme | `goruntuleme_arttir` RPC `SECURITY DEFINER` olmalı, yoksa RLS engeller |
| Köşeli parantez | PowerShell'de `[id].js` için `-LiteralPath` kullan |
