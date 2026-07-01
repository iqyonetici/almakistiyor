// Türkiye'nin 81 ili — URL slug'ı (SEO-dostu, Türkçe karaktersiz, küçük harf)
// ↔ DB'deki gerçek isim (ilanlar_pro.sehir kolonuyla BİREBİR aynı yazım).
//
// NEDEN ELLE LİSTE: Türkçe'nin büyük/küçük harf dönüşümü JS'in standart
// toLowerCase()/toUpperCase() ile güvenilir çalışmıyor (örn. "İstanbul"
// .toLowerCase() => "i̇stanbul", noktası farklı bir Unicode karakteri — DB
// karşılaştırmasında sessizce eşleşmeyi bozar). Bu yüzden slug → isim
// eşlemesi otomatik üretilmiyor, sabit/elle tanımlı.
//
// DB'de şu an sadece "İstanbul" ve "Ankara" var (doğrulandı), ama il listesi
// Türkiye'de sabit olduğu için 81'i de tanımlamak doğru — yeni şehirlerde
// ilan girildiğinde otomatik çalışsın diye.

export const SEHIRLER = [
  { slug: 'adana', isim: 'Adana' },
  { slug: 'adiyaman', isim: 'Adıyaman' },
  { slug: 'afyonkarahisar', isim: 'Afyonkarahisar' },
  { slug: 'agri', isim: 'Ağrı' },
  { slug: 'amasya', isim: 'Amasya' },
  { slug: 'ankara', isim: 'Ankara' },
  { slug: 'antalya', isim: 'Antalya' },
  { slug: 'artvin', isim: 'Artvin' },
  { slug: 'aydin', isim: 'Aydın' },
  { slug: 'balikesir', isim: 'Balıkesir' },
  { slug: 'bilecik', isim: 'Bilecik' },
  { slug: 'bingol', isim: 'Bingöl' },
  { slug: 'bitlis', isim: 'Bitlis' },
  { slug: 'bolu', isim: 'Bolu' },
  { slug: 'burdur', isim: 'Burdur' },
  { slug: 'bursa', isim: 'Bursa' },
  { slug: 'canakkale', isim: 'Çanakkale' },
  { slug: 'cankiri', isim: 'Çankırı' },
  { slug: 'corum', isim: 'Çorum' },
  { slug: 'denizli', isim: 'Denizli' },
  { slug: 'diyarbakir', isim: 'Diyarbakır' },
  { slug: 'edirne', isim: 'Edirne' },
  { slug: 'elazig', isim: 'Elazığ' },
  { slug: 'erzincan', isim: 'Erzincan' },
  { slug: 'erzurum', isim: 'Erzurum' },
  { slug: 'eskisehir', isim: 'Eskişehir' },
  { slug: 'gaziantep', isim: 'Gaziantep' },
  { slug: 'giresun', isim: 'Giresun' },
  { slug: 'gumushane', isim: 'Gümüşhane' },
  { slug: 'hakkari', isim: 'Hakkari' },
  { slug: 'hatay', isim: 'Hatay' },
  { slug: 'isparta', isim: 'Isparta' },
  { slug: 'mersin', isim: 'Mersin' },
  { slug: 'istanbul', isim: 'İstanbul' },
  { slug: 'izmir', isim: 'İzmir' },
  { slug: 'kars', isim: 'Kars' },
  { slug: 'kastamonu', isim: 'Kastamonu' },
  { slug: 'kayseri', isim: 'Kayseri' },
  { slug: 'kirklareli', isim: 'Kırklareli' },
  { slug: 'kirsehir', isim: 'Kırşehir' },
  { slug: 'kocaeli', isim: 'Kocaeli' },
  { slug: 'konya', isim: 'Konya' },
  { slug: 'kutahya', isim: 'Kütahya' },
  { slug: 'malatya', isim: 'Malatya' },
  { slug: 'manisa', isim: 'Manisa' },
  { slug: 'kahramanmaras', isim: 'Kahramanmaraş' },
  { slug: 'mardin', isim: 'Mardin' },
  { slug: 'mugla', isim: 'Muğla' },
  { slug: 'mus', isim: 'Muş' },
  { slug: 'nevsehir', isim: 'Nevşehir' },
  { slug: 'nigde', isim: 'Niğde' },
  { slug: 'ordu', isim: 'Ordu' },
  { slug: 'rize', isim: 'Rize' },
  { slug: 'sakarya', isim: 'Sakarya' },
  { slug: 'samsun', isim: 'Samsun' },
  { slug: 'siirt', isim: 'Siirt' },
  { slug: 'sinop', isim: 'Sinop' },
  { slug: 'sivas', isim: 'Sivas' },
  { slug: 'tekirdag', isim: 'Tekirdağ' },
  { slug: 'tokat', isim: 'Tokat' },
  { slug: 'trabzon', isim: 'Trabzon' },
  { slug: 'tunceli', isim: 'Tunceli' },
  { slug: 'sanliurfa', isim: 'Şanlıurfa' },
  { slug: 'usak', isim: 'Uşak' },
  { slug: 'van', isim: 'Van' },
  { slug: 'yozgat', isim: 'Yozgat' },
  { slug: 'zonguldak', isim: 'Zonguldak' },
  { slug: 'aksaray', isim: 'Aksaray' },
  { slug: 'bayburt', isim: 'Bayburt' },
  { slug: 'karaman', isim: 'Karaman' },
  { slug: 'kirikkale', isim: 'Kırıkkale' },
  { slug: 'batman', isim: 'Batman' },
  { slug: 'sirnak', isim: 'Şırnak' },
  { slug: 'bartin', isim: 'Bartın' },
  { slug: 'ardahan', isim: 'Ardahan' },
  { slug: 'igdir', isim: 'Iğdır' },
  { slug: 'yalova', isim: 'Yalova' },
  { slug: 'karabuk', isim: 'Karabük' },
  { slug: 'kilis', isim: 'Kilis' },
  { slug: 'osmaniye', isim: 'Osmaniye' },
  { slug: 'duzce', isim: 'Düzce' },
]

// URL slug'ından ("istanbul") DB'deki gerçek ismi ("İstanbul") bulur.
// Bulamazsa null döner (çağıran taraf notFound: true dönmeli).
export function sehirSlugtanIsimBul(slug) {
  const kayit = SEHIRLER.find((s) => s.slug === slug)
  return kayit ? kayit.isim : null
}

// DB'deki isimden ("İstanbul") URL slug'ını ("istanbul") bulur.
// İç linkleme için kullanılır (ilan.sehir -> /kategori/X/istanbul linki).
export function sehirIsimdenSlugBul(isim) {
  const kayit = SEHIRLER.find((s) => s.isim === isim)
  return kayit ? kayit.slug : null
}
