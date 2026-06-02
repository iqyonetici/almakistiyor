# AlmakIstiyor.com

> Alıcıların talep oluşturduğu, emlakçı ve galerilerin müşteri bulduğu güvenli platform.

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcıda http://localhost:3000 açın.

---

## GitHub'a Yükleme

### 1. GitHub'da yeni repo oluşturun
- github.com → **New repository**
- Repo adı: `almakistiyor`
- Public veya Private (tercihinize göre)
- **"Add a README"** kutusunu işaretlemeyin
- **Create repository** tıklayın

### 2. Yerel klasörde terminal açın ve:

```bash
cd almakistiyor
git init
git add .
git commit -m "ilk commit - almakistiyor.com"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/almakistiyor.git
git push -u origin main
```

> `KULLANICI_ADINIZ` kısmını kendi GitHub kullanıcı adınızla değiştirin.

---

## Vercel'e Deploy Etme

### Yöntem 1 — Vercel Arayüzü (Önerilen)
1. **vercel.com** → Sign in (GitHub ile giriş yapın)
2. **Add New → Project** tıklayın
3. GitHub reponuzu bulun: `almakistiyor` → **Import**
4. Ayarlar otomatik algılanacak (Next.js)
5. **Deploy** tıklayın → 2 dakikada canlıya alınır

### Yöntem 2 — Vercel CLI
```bash
npm install -g vercel
vercel
```

### Domain Bağlama (almakistiyor.com)
1. Vercel dashboard → projeniz → **Settings → Domains**
2. `almakistiyor.com` yazın → **Add**
3. Domain sağlayıcınızda DNS ayarları:
   - A kaydı: `76.76.21.21`
   - CNAME: `www → cname.vercel-dns.com`

---

## Proje Yapısı

```
almakistiyor/
├── public/
│   └── logo.svg              # Site logosu
├── src/
│   ├── components/
│   │   ├── Navbar.js         # Üst menü
│   │   ├── Navbar.module.css
│   │   ├── IlanKarti.js      # Talep ilanı kartı
│   │   ├── IlanKarti.module.css
│   │   ├── IlanForm.js       # 5 adımlı ilan formu
│   │   ├── IlanForm.module.css
│   │   ├── Footer.js         # Alt bilgi
│   │   └── Footer.module.css
│   ├── data/
│   │   └── sehirler.js       # 81 il + tüm ilçeler
│   ├── pages/
│   │   ├── _app.js
│   │   ├── _document.js
│   │   ├── index.js          # Ana sayfa
│   │   └── index.module.css
│   └── styles/
│       └── globals.css       # Global stiller
├── next.config.js
└── package.json
```

---

## Sonraki Adımlar

### Backend (Veritabanı)
- **Supabase** (ücretsiz PostgreSQL) önerilir
  - `npm install @supabase/supabase-js`
  - İlanlar, kullanıcılar, satıcı paketleri tabloları

### Kimlik Doğrulama
- **NextAuth.js** veya **Supabase Auth**
- SMS ile OTP doğrulama (Twilio veya Netgsm)

### Ödeme Sistemi
- **İyzico** (Türkiye için en uygun)
  - Satıcı paket ödemeleri için

### SMS Bildirimi
- **Netgsm** veya **İletimerkezi**
  - Alıcıya "ilanına X satıcı baktı" bildirimi

---

## Ortam Değişkenleri (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://almakistiyor.com
```

---

## Lisans
© 2025 AlmakIstiyor.com — Tüm hakları saklıdır.
