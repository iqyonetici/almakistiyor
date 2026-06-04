// Sahibinden.com kategori yapısıyla tam uyumlu
export const KATEGORILER = [
  {
    label: "Emlak", slug: "emlak", icon: "🏠",
    altKategoriler: [
      {
        label: "Konut", slug: "emlak-konut", icon: "🏠",
        altKategoriler: [
          { label: "Daire", slug: "emlak-konut-daire", icon: "" },
          { label: "Müstakil Ev", slug: "emlak-konut-mustakil", icon: "" },
          { label: "Villa", slug: "emlak-konut-villa", icon: "" },
          { label: "Çiftlik Evi", slug: "emlak-konut-ciftlik", icon: "" },
          { label: "Yalı", slug: "emlak-konut-yali", icon: "" },
          { label: "Köy Evi", slug: "emlak-konut-koy", icon: "" },
          { label: "Yazlık", slug: "emlak-konut-yazlik", icon: "" },
          { label: "Residence", slug: "emlak-konut-residence", icon: "" },
          { label: "Prefabrik Ev", slug: "emlak-konut-prefabrik", icon: "" },
        ]
      },
      {
        label: "İş Yeri", slug: "emlak-isyeri", icon: "🏢",
        altKategoriler: [
          { label: "Dükkan & Mağaza", slug: "emlak-isyeri-dukkan", icon: "" },
          { label: "Büro & Ofis", slug: "emlak-isyeri-ofis", icon: "" },
          { label: "Fabrika & Sanayi Tesis", slug: "emlak-isyeri-fabrika", icon: "" },
          { label: "Depo & Antrepo", slug: "emlak-isyeri-depo", icon: "" },
          { label: "Atölye", slug: "emlak-isyeri-atolye", icon: "" },
          { label: "Akaryakıt İstasyonu", slug: "emlak-isyeri-akaryakit", icon: "" },
          { label: "Apart Daire", slug: "emlak-isyeri-apart", icon: "" },
          { label: "Otel & Pansiyon", slug: "emlak-isyeri-otel", icon: "" },
          { label: "Plaza & Rezidans", slug: "emlak-isyeri-plaza", icon: "" },
        ]
      },
      {
        label: "Arsa", slug: "emlak-arsa", icon: "🌿",
        altKategoriler: [
          { label: "Konut Arsası", slug: "emlak-arsa-konut", icon: "" },
          { label: "Ticari Arsa", slug: "emlak-arsa-ticari", icon: "" },
          { label: "Tarla", slug: "emlak-arsa-tarla", icon: "" },
          { label: "Bağ & Bahçe", slug: "emlak-arsa-bag", icon: "" },
          { label: "Zeytinlik", slug: "emlak-arsa-zeytinlik", icon: "" },
          { label: "Sanayi Arsası", slug: "emlak-arsa-sanayi", icon: "" },
          { label: "Turistik Alan", slug: "emlak-arsa-turistik", icon: "" },
        ]
      },
      {
        label: "Bina", slug: "emlak-bina", icon: "🏛️",
        altKategoriler: [
          { label: "Apartman", slug: "emlak-bina-apartman", icon: "" },
          { label: "İş Hanı", slug: "emlak-bina-ishan", icon: "" },
          { label: "Müstakil Bina", slug: "emlak-bina-mustakil", icon: "" },
        ]
      },
      {
        label: "Devremülk & Tatil", slug: "emlak-devremulk", icon: "🏖️",
        altKategoriler: [
          { label: "Devremülk", slug: "emlak-devremulk-devremulk", icon: "" },
          { label: "Devre Tatil", slug: "emlak-devremulk-devretatil", icon: "" },
        ]
      },
      {
        label: "Turistik Tesis", slug: "emlak-turistik", icon: "🏨",
        altKategoriler: [
          { label: "Otel", slug: "emlak-turistik-otel", icon: "" },
          { label: "Motel", slug: "emlak-turistik-motel", icon: "" },
          { label: "Pansiyon", slug: "emlak-turistik-pansiyon", icon: "" },
          { label: "Tatil Köyü", slug: "emlak-turistik-tatilkoyu", icon: "" },
          { label: "Kamping", slug: "emlak-turistik-kamping", icon: "" },
        ]
      },
    ]
  },
  {
    label: "Vasıta", slug: "vasita", icon: "🚗",
    altKategoriler: [
      {
        label: "Otomobil", slug: "vasita-otomobil", icon: "🚗",
        altKategoriler: [
          { label: "Otomobil", slug: "otomobil", icon: "" },
        ]
      },
      {
        label: "Arazi & SUV & Pickup", slug: "vasita-arazi", icon: "🚙",
        altKategoriler: [
          { label: "Arazi & SUV", slug: "arazi-suv", icon: "" },
          { label: "Pickup", slug: "vasita-pickup", icon: "" },
        ]
      },
      {
        label: "Motosiklet", slug: "vasita-motosiklet", icon: "🏍️",
        altKategoriler: [
          { label: "Motosiklet", slug: "motosiklet", icon: "" },
          { label: "Scooter & Moped", slug: "vasita-scooter", icon: "" },
          { label: "ATV & Üç Teker", slug: "atv-utv", icon: "" },
          { label: "Elektrikli Bisiklet", slug: "vasita-elektrikli-bisiklet", icon: "" },
        ]
      },
      {
        label: "Minibüs & Minivan", slug: "vasita-minibus", icon: "🚐",
        altKategoriler: [
          { label: "Minibüs", slug: "vasita-minibus-minibus", icon: "" },
          { label: "Minivan & Panelvan", slug: "minivan", icon: "" },
        ]
      },
      {
        label: "Kamyonet", slug: "vasita-kamyonet", icon: "🛻",
        altKategoriler: [
          { label: "Kamyonet", slug: "ticari", icon: "" },
          { label: "Kamyon", slug: "vasita-kamyon", icon: "" },
        ]
      },
      {
        label: "Otobüs & Midibüs", slug: "vasita-otobus", icon: "🚌",
        altKategoriler: [
          { label: "Otobüs", slug: "vasita-otobus-otobus", icon: "" },
          { label: "Midibüs", slug: "vasita-midibus", icon: "" },
        ]
      },
      {
        label: "Elektrikli Araç", slug: "vasita-elektrikli", icon: "⚡",
        altKategoriler: [
          { label: "Elektrikli Otomobil", slug: "elektrikli", icon: "" },
        ]
      },
      {
        label: "Karavan & Çekme Karavan", slug: "vasita-karavan", icon: "🚌",
        altKategoriler: [
          { label: "Karavan", slug: "karavan", icon: "" },
          { label: "Çekme Karavan", slug: "vasita-cekme-karavan", icon: "" },
        ]
      },
      {
        label: "Deniz Taşıtları", slug: "vasita-deniz", icon: "⛵",
        altKategoriler: [
          { label: "Tekne", slug: "deniz", icon: "" },
          { label: "Yat", slug: "vasita-yat", icon: "" },
          { label: "Bot", slug: "vasita-bot", icon: "" },
          { label: "Kotra", slug: "vasita-kotra", icon: "" },
          { label: "Su Scooter", slug: "vasita-su-scooter", icon: "" },
        ]
      },
      {
        label: "Klasik Araçlar", slug: "vasita-klasik", icon: "🏎️",
        altKategoriler: [
          { label: "Klasik Otomobil", slug: "klasik", icon: "" },
        ]
      },
      {
        label: "Kiralık Araç", slug: "vasita-kiralik", icon: "🔑",
        altKategoriler: [
          { label: "Günlük Kiralık", slug: "vasita-kiralik-gunluk", icon: "" },
          { label: "Aylık Kiralık", slug: "vasita-kiralik-aylik", icon: "" },
        ]
      },
    ]
  },
  {
    label: "Yedek Parça & Aksesuar", slug: "yedek-parca", icon: "🔧",
    altKategoriler: [
      {
        label: "Otomobil Yedek Parça", slug: "yp-otomobil", icon: "🔩",
        altKategoriler: [
          { label: "Motor & Şanzıman", slug: "yp-motor", icon: "" },
          { label: "Fren Sistemi", slug: "yp-fren", icon: "" },
          { label: "Süspansiyon & Direksiyon", slug: "yp-suspansiyon", icon: "" },
          { label: "Elektrik & Elektronik", slug: "yp-elektrik", icon: "" },
          { label: "Kaporta & Karoseri", slug: "yp-kaporta", icon: "" },
          { label: "İç Aksam", slug: "yp-ic-aksam", icon: "" },
        ]
      },
      {
        label: "Lastik & Jant", slug: "yp-lastik", icon: "⭕",
        altKategoriler: [
          { label: "Yazlık Lastik", slug: "yp-yazlik-lastik", icon: "" },
          { label: "Kışlık Lastik", slug: "yp-kislik-lastik", icon: "" },
          { label: "4 Mevsim Lastik", slug: "yp-4mevsim-lastik", icon: "" },
          { label: "Çelik Jant", slug: "yp-celik-jant", icon: "" },
          { label: "Alüminyum Jant", slug: "yp-aluminyum-jant", icon: "" },
        ]
      },
      {
        label: "Aksesuar & Tuning", slug: "yp-aksesuar", icon: "✨",
        altKategoriler: [
          { label: "Ses & Görüntü", slug: "yp-ses-goruntu", icon: "" },
          { label: "Navigasyon", slug: "yp-navigasyon", icon: "" },
          { label: "Dış Aksesuar", slug: "yp-dis-aksesuar", icon: "" },
          { label: "İç Aksesuar", slug: "yp-ic-aksesuar", icon: "" },
          { label: "Güvenlik", slug: "yp-guvenlik", icon: "" },
        ]
      },
      {
        label: "Motosiklet Parça", slug: "yp-motosiklet", icon: "🏍️",
        altKategoriler: [
          { label: "Motor Parçaları", slug: "yp-motor-parca", icon: "" },
          { label: "Kaporta & Fairing", slug: "yp-fairing", icon: "" },
          { label: "Egzoz", slug: "yp-egzoz", icon: "" },
        ]
      },
      {
        label: "Akü & Elektrik", slug: "yp-aku", icon: "🔋",
        altKategoriler: [
          { label: "Akü", slug: "yp-aku-aku", icon: "" },
          { label: "Marş Motoru", slug: "yp-mars", icon: "" },
          { label: "Alternator", slug: "yp-alternator", icon: "" },
        ]
      },
    ]
  },
  {
    label: "Alışveriş", slug: "alisveris", icon: "🛍️",
    altKategoriler: [
      {
        label: "Elektronik", slug: "alisveris-elektronik", icon: "📱",
        altKategoriler: [
          { label: "Cep Telefonu", slug: "alisveris-cep-telefonu", icon: "" },
          { label: "Bilgisayar & Laptop", slug: "alisveris-bilgisayar", icon: "" },
          { label: "Tablet", slug: "alisveris-tablet", icon: "" },
          { label: "TV & Monitör", slug: "alisveris-tv", icon: "" },
          { label: "Beyaz Eşya", slug: "alisveris-beyaz-esya", icon: "" },
          { label: "Küçük Ev Aletleri", slug: "alisveris-kea", icon: "" },
          { label: "Fotoğraf & Kamera", slug: "alisveris-fotograf", icon: "" },
          { label: "Oyun & Konsol", slug: "alisveris-oyun-konsol", icon: "" },
          { label: "Ses Sistemi", slug: "alisveris-ses", icon: "" },
        ]
      },
      {
        label: "Giyim & Moda", slug: "alisveris-giyim", icon: "👗",
        altKategoriler: [
          { label: "Kadın Giyim", slug: "alisveris-kadin-giyim", icon: "" },
          { label: "Erkek Giyim", slug: "alisveris-erkek-giyim", icon: "" },
          { label: "Çocuk Giyim", slug: "alisveris-cocuk-giyim", icon: "" },
          { label: "Ayakkabı", slug: "alisveris-ayakkabi", icon: "" },
          { label: "Çanta & Aksesuar", slug: "alisveris-canta", icon: "" },
          { label: "Saat & Takı", slug: "alisveris-saat-taki", icon: "" },
        ]
      },
      {
        label: "Ev & Yaşam", slug: "alisveris-ev", icon: "🏡",
        altKategoriler: [
          { label: "Mobilya", slug: "alisveris-mobilya", icon: "" },
          { label: "Dekorasyon", slug: "alisveris-dekorasyon", icon: "" },
          { label: "Mutfak Eşyası", slug: "alisveris-mutfak", icon: "" },
          { label: "Tekstil & Halı", slug: "alisveris-tekstil", icon: "" },
          { label: "Bahçe & Balkon", slug: "alisveris-bahce", icon: "" },
          { label: "Aydınlatma", slug: "alisveris-aydinlatma", icon: "" },
        ]
      },
      {
        label: "Spor & Outdoor", slug: "alisveris-spor", icon: "⚽",
        altKategoriler: [
          { label: "Spor Ekipmanı", slug: "alisveris-spor-ekipman", icon: "" },
          { label: "Bisiklet", slug: "alisveris-bisiklet", icon: "" },
          { label: "Kamp & Dağcılık", slug: "alisveris-kamp", icon: "" },
          { label: "Su Sporları", slug: "alisveris-su-sporlari", icon: "" },
          { label: "Fitness & Gym", slug: "alisveris-fitness", icon: "" },
        ]
      },
      {
        label: "Bebek & Çocuk", slug: "alisveris-bebek", icon: "👶",
        altKategoriler: [
          { label: "Bebek Arabası", slug: "alisveris-bebek-arabasi", icon: "" },
          { label: "Bebek & Çocuk Giyim", slug: "alisveris-bebek-giyim", icon: "" },
          { label: "Oyuncak", slug: "alisveris-oyuncak", icon: "" },
          { label: "Bebek Mobilya", slug: "alisveris-bebek-mobilya", icon: "" },
        ]
      },
      {
        label: "Kitap, Film & Müzik", slug: "alisveris-kitap", icon: "📚",
        altKategoriler: [
          { label: "Kitap", slug: "alisveris-kitap-kitap", icon: "" },
          { label: "Film & Dizi", slug: "alisveris-film", icon: "" },
          { label: "Müzik & CD", slug: "alisveris-muzik", icon: "" },
          { label: "Müzik Aletleri", slug: "alisveris-muzik-aleti", icon: "" },
        ]
      },
      {
        label: "Koleksiyon & Antika", slug: "alisveris-koleksiyon", icon: "🏺",
        altKategoriler: [
          { label: "Antika", slug: "alisveris-antika", icon: "" },
          { label: "Pul & Para Koleksiyonu", slug: "alisveris-pul-para", icon: "" },
          { label: "Tablo & Sanat", slug: "alisveris-tablo", icon: "" },
        ]
      },
    ]
  },
  {
    label: "İş Makineleri & Sanayi", slug: "is-makineleri", icon: "🏭",
    altKategoriler: [
      {
        label: "İş Makineleri", slug: "ism-is-makineleri", icon: "🚜",
        altKategoriler: [
          { label: "Ekskavatör", slug: "ism-ekskavatör", icon: "" },
          { label: "Yükleyici", slug: "ism-yukleyici", icon: "" },
          { label: "Dozer", slug: "ism-dozer", icon: "" },
          { label: "Forklift", slug: "ism-forklift", icon: "" },
          { label: "Vinç", slug: "ism-vinc", icon: "" },
          { label: "Greyder", slug: "ism-greyder", icon: "" },
          { label: "Asfalt Makineleri", slug: "ism-asfalt", icon: "" },
          { label: "Beton Mikseri", slug: "ism-beton", icon: "" },
        ]
      },
      {
        label: "Tarım Makineleri", slug: "ism-tarim", icon: "🚜",
        altKategoriler: [
          { label: "Traktör", slug: "ism-traktor", icon: "" },
          { label: "Biçer Döver", slug: "ism-bicer-dover", icon: "" },
          { label: "Pulluk & Diskaro", slug: "ism-pulluk", icon: "" },
          { label: "Sulama Sistemleri", slug: "ism-sulama", icon: "" },
          { label: "Sera & Bahçe", slug: "ism-sera", icon: "" },
        ]
      },
      {
        label: "Sanayi Ekipmanları", slug: "ism-sanayi", icon: "⚙️",
        altKategoriler: [
          { label: "Kompresör", slug: "ism-kompresör", icon: "" },
          { label: "Jeneratör", slug: "ism-jenerator", icon: "" },
          { label: "Kaynak Makinesi", slug: "ism-kaynak", icon: "" },
          { label: "Takım Tezgahları", slug: "ism-takim-tezgah", icon: "" },
          { label: "Pompa", slug: "ism-pompa", icon: "" },
          { label: "Paketleme & Etiketleme", slug: "ism-paketleme", icon: "" },
        ]
      },
      {
        label: "Tekstil Makineleri", slug: "ism-tekstil", icon: "🧵",
        altKategoriler: [
          { label: "Dikiş & Nakış", slug: "ism-dikis", icon: "" },
          { label: "Örme Makinesi", slug: "ism-orme", icon: "" },
          { label: "Baskı Makinesi", slug: "ism-baski", icon: "" },
        ]
      },
    ]
  },
  {
    label: "Ustalar & Hizmetler", slug: "hizmetler", icon: "🔨",
    altKategoriler: [
      {
        label: "Ev Hizmetleri", slug: "hiz-ev", icon: "🏠",
        altKategoriler: [
          { label: "Temizlik", slug: "hiz-temizlik", icon: "" },
          { label: "Tadilat & Dekorasyon", slug: "hiz-tadilat", icon: "" },
          { label: "Boyacı", slug: "hiz-boyaci", icon: "" },
          { label: "Elektrikçi", slug: "hiz-elektrikci", icon: "" },
          { label: "Tesisatçı", slug: "hiz-tesisatci", icon: "" },
          { label: "Marangoz & Mobilya", slug: "hiz-marangoz", icon: "" },
          { label: "Çilingir", slug: "hiz-cilingir", icon: "" },
        ]
      },
      {
        label: "Nakliyat & Taşımacılık", slug: "hiz-nakliyat", icon: "🚚",
        altKategoriler: [
          { label: "Ev Taşıma", slug: "hiz-ev-tasima", icon: "" },
          { label: "Ofis Taşıma", slug: "hiz-ofis-tasima", icon: "" },
          { label: "Kargo & Kurye", slug: "hiz-kargo", icon: "" },
          { label: "Uluslararası Nakliyat", slug: "hiz-uluslararasi", icon: "" },
        ]
      },
      {
        label: "Güzellik & Bakım", slug: "hiz-guzellik", icon: "💅",
        altKategoriler: [
          { label: "Kuaför", slug: "hiz-kuafor", icon: "" },
          { label: "Manikür & Pedikür", slug: "hiz-manikur", icon: "" },
          { label: "Masaj & Spa", slug: "hiz-masaj", icon: "" },
          { label: "Diyetisyen & Sağlık", slug: "hiz-diyet", icon: "" },
        ]
      },
      {
        label: "Etkinlik & Organizasyon", slug: "hiz-etkinlik", icon: "🎉",
        altKategoriler: [
          { label: "Düğün & Organizasyon", slug: "hiz-dugun", icon: "" },
          { label: "Fotoğrafçı", slug: "hiz-fotografci", icon: "" },
          { label: "DJ & Müzisyen", slug: "hiz-dj", icon: "" },
          { label: "Catering", slug: "hiz-catering", icon: "" },
        ]
      },
      {
        label: "Dijital Hizmetler", slug: "hiz-dijital", icon: "💻",
        altKategoriler: [
          { label: "Web Tasarım", slug: "hiz-web", icon: "" },
          { label: "Grafik Tasarım", slug: "hiz-grafik", icon: "" },
          { label: "Sosyal Medya", slug: "hiz-sosyal-medya", icon: "" },
          { label: "Yazılım & Uygulama", slug: "hiz-yazilim", icon: "" },
        ]
      },
    ]
  },
  {
    label: "Özel Ders", slug: "ozel-ders", icon: "📚",
    altKategoriler: [
      {
        label: "Akademik Dersler", slug: "od-akademik", icon: "🎓",
        altKategoriler: [
          { label: "Matematik", slug: "od-matematik", icon: "" },
          { label: "Fizik", slug: "od-fizik", icon: "" },
          { label: "Kimya", slug: "od-kimya", icon: "" },
          { label: "Biyoloji", slug: "od-biyoloji", icon: "" },
          { label: "Türkçe & Edebiyat", slug: "od-turkce", icon: "" },
          { label: "Tarih & Coğrafya", slug: "od-tarih", icon: "" },
        ]
      },
      {
        label: "Yabancı Dil", slug: "od-yabanci-dil", icon: "🌍",
        altKategoriler: [
          { label: "İngilizce", slug: "od-ingilizce", icon: "" },
          { label: "Almanca", slug: "od-almanca", icon: "" },
          { label: "Fransızca", slug: "od-fransizca", icon: "" },
          { label: "İspanyolca", slug: "od-ispanyolca", icon: "" },
          { label: "Arapça", slug: "od-arapca", icon: "" },
          { label: "Rusça", slug: "od-rusca", icon: "" },
        ]
      },
      {
        label: "Müzik Dersleri", slug: "od-muzik", icon: "🎵",
        altKategoriler: [
          { label: "Gitar", slug: "od-gitar", icon: "" },
          { label: "Piyano", slug: "od-piyano", icon: "" },
          { label: "Keman", slug: "od-keman", icon: "" },
          { label: "Bağlama", slug: "od-baglama", icon: "" },
          { label: "Vokal & Şan", slug: "od-vokal", icon: "" },
        ]
      },
      {
        label: "Spor & Dans", slug: "od-spor", icon: "🏃",
        altKategoriler: [
          { label: "Yüzme", slug: "od-yuzme", icon: "" },
          { label: "Dans", slug: "od-dans", icon: "" },
          { label: "Yoga & Pilates", slug: "od-yoga", icon: "" },
          { label: "Tenis", slug: "od-tenis", icon: "" },
          { label: "Futbol", slug: "od-futbol", icon: "" },
        ]
      },
      {
        label: "Bilgisayar & Teknoloji", slug: "od-bilgisayar", icon: "💻",
        altKategoriler: [
          { label: "Programlama", slug: "od-programlama", icon: "" },
          { label: "Grafik Tasarım", slug: "od-grafik", icon: "" },
          { label: "Office & Excel", slug: "od-office", icon: "" },
        ]
      },
      {
        label: "Sınav Hazırlık", slug: "od-sinav", icon: "📝",
        altKategoriler: [
          { label: "YKS / LYS", slug: "od-yks", icon: "" },
          { label: "KPSS", slug: "od-kpss", icon: "" },
          { label: "DGS & ALES", slug: "od-dgs", icon: "" },
          { label: "IELTS & TOEFL", slug: "od-ielts", icon: "" },
        ]
      },
    ]
  },
  {
    label: "İş İlanları", slug: "is-ilanlari", icon: "💼",
    altKategoriler: [
      {
        label: "Tam Zamanlı", slug: "is-tam-zamanli", icon: "🕐",
        altKategoriler: [
          { label: "Muhasebe & Finans", slug: "is-muhasebe", icon: "" },
          { label: "Satış & Pazarlama", slug: "is-satis", icon: "" },
          { label: "Mühendislik", slug: "is-muhendislik", icon: "" },
          { label: "Bilişim & Yazılım", slug: "is-bilisim", icon: "" },
          { label: "Sağlık", slug: "is-saglik", icon: "" },
          { label: "Eğitim", slug: "is-egitim", icon: "" },
          { label: "İnsan Kaynakları", slug: "is-ik", icon: "" },
          { label: "Hukuk", slug: "is-hukuk", icon: "" },
        ]
      },
      {
        label: "Yarı Zamanlı", slug: "is-yari-zamanli", icon: "⏰",
        altKategoriler: [
          { label: "Öğrenci Aranıyor", slug: "is-ogrenci", icon: "" },
          { label: "Hafta Sonu", slug: "is-hafta-sonu", icon: "" },
          { label: "Akşam / Gece", slug: "is-aksam", icon: "" },
        ]
      },
      {
        label: "Uzaktan Çalışma", slug: "is-uzaktan", icon: "🏠",
        altKategoriler: [
          { label: "Freelance", slug: "is-freelance", icon: "" },
          { label: "Remote Full Time", slug: "is-remote", icon: "" },
          { label: "Proje Bazlı", slug: "is-proje", icon: "" },
        ]
      },
      {
        label: "Staj & Deneyim", slug: "is-staj", icon: "🎓",
        altKategoriler: [
          { label: "Zorunlu Staj", slug: "is-zorunlu-staj", icon: "" },
          { label: "Gönüllü Staj", slug: "is-gonullu-staj", icon: "" },
        ]
      },
    ]
  },
  {
    label: "Hayvanlar", slug: "hayvanlar", icon: "🐾",
    altKategoriler: [
      {
        label: "Köpek", slug: "hayvan-kopek", icon: "🐕",
        altKategoriler: [
          { label: "Golden Retriever", slug: "hayvan-golden", icon: "" },
          { label: "Alman Kurdu", slug: "hayvan-alman-kurdu", icon: "" },
          { label: "Labrador", slug: "hayvan-labrador", icon: "" },
          { label: "Bulldog", slug: "hayvan-bulldog", icon: "" },
          { label: "Poodle", slug: "hayvan-poodle", icon: "" },
          { label: "Diğer Köpek", slug: "hayvan-diger-kopek", icon: "" },
        ]
      },
      {
        label: "Kedi", slug: "hayvan-kedi", icon: "🐈",
        altKategoriler: [
          { label: "British Shorthair", slug: "hayvan-british", icon: "" },
          { label: "Scottish Fold", slug: "hayvan-scottish", icon: "" },
          { label: "Van Kedisi", slug: "hayvan-van", icon: "" },
          { label: "Ankara Kedisi", slug: "hayvan-ankara-kedi", icon: "" },
          { label: "Siyam", slug: "hayvan-siyam", icon: "" },
          { label: "Diğer Kedi", slug: "hayvan-diger-kedi", icon: "" },
        ]
      },
      {
        label: "Kuş", slug: "hayvan-kus", icon: "🦜",
        altKategoriler: [
          { label: "Muhabbet Kuşu", slug: "hayvan-muhabbet", icon: "" },
          { label: "Papağan", slug: "hayvan-papagan", icon: "" },
          { label: "Kanarya", slug: "hayvan-kanarya", icon: "" },
          { label: "Sultan Papağanı", slug: "hayvan-sultan", icon: "" },
          { label: "Diğer Kuş", slug: "hayvan-diger-kus", icon: "" },
        ]
      },
      {
        label: "Balık & Akvaryum", slug: "hayvan-balik", icon: "🐠",
        altKategoriler: [
          { label: "Tatlı Su Balığı", slug: "hayvan-tatli-su", icon: "" },
          { label: "Deniz Balığı", slug: "hayvan-deniz-baligi", icon: "" },
          { label: "Akvaryum Malzemeleri", slug: "hayvan-akvaryum", icon: "" },
        ]
      },
      {
        label: "Hayvan Malzemeleri", slug: "hayvan-malzeme", icon: "🦴",
        altKategoriler: [
          { label: "Mama & Yem", slug: "hayvan-mama", icon: "" },
          { label: "Kafes & Barınak", slug: "hayvan-kafes", icon: "" },
          { label: "Oyuncak & Aksesuar", slug: "hayvan-oyuncak", icon: "" },
          { label: "Veteriner & Sağlık", slug: "hayvan-saglik", icon: "" },
        ]
      },
    ]
  },
]
