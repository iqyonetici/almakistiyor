// DB'deki GERÇEK alt_kategori değerleriyle birebir uyumlu
// (Supabase ilanlar tablosundan doğrulandı)
export const KATEGORILER = [
  {
    label: "Emlak", slug: "emlak", icon: "🏠",
    altKategoriler: [
      { label: "Konut", slug: "emlak-konut", icon: "🏠" },
      { label: "İş Yeri", slug: "emlak-isyeri", icon: "🏢" },
      { label: "Arsa", slug: "emlak-arsa", icon: "🌿" },
      { label: "Bina", slug: "bina", icon: "🏛️" },
    ]
  },
  {
    label: "Vasıta", slug: "vasita", icon: "🚗",
    altKategoriler: [
      { label: "Otomobil", slug: "otomobil", icon: "🚗" },
      { label: "Arazi & SUV", slug: "arazi-suv", icon: "🚙" },
      { label: "Motosiklet", slug: "motosiklet", icon: "🏍️" },
      { label: "Minivan & Panelvan", slug: "minivan", icon: "🚐" },
      { label: "Ticari Araç", slug: "ticari", icon: "🛻" },
    ]
  },
  {
    label: "Alışveriş", slug: "alisveris", icon: "🛍️",
    altKategoriler: [
      { label: "Bilgisayar", slug: "bilgisayar", icon: "💻" },
      { label: "Cep Telefonu", slug: "cep-telefonu", icon: "📱" },
      { label: "Ev Aletleri", slug: "ev-aletleri", icon: "🔌" },
      { label: "Ev & Dekorasyon", slug: "ev-dekorasyon", icon: "🛋️" },
      { label: "Hobi", slug: "hobi", icon: "🎨" },
      { label: "Spor", slug: "spor", icon: "⚽" },
    ]
  },
  {
    label: "İş Makineleri & Sanayi", slug: "is-makineleri", icon: "🏭",
    altKategoriler: [
      { label: "İş Makineleri", slug: "is-makineleri-alt", icon: "🚜" },
      { label: "Sanayi Ekipmanları", slug: "sanayi-alt", icon: "⚙️" },
      { label: "Tarım", slug: "tarim", icon: "🌾" },
    ]
  },
  {
    label: "Hayvanlar", slug: "hayvanlar", icon: "🐾",
    altKategoriler: [
      { label: "Evcil Hayvan", slug: "evcil", icon: "🐈" },
      { label: "Küçükbaş", slug: "kucukbas", icon: "🐑" },
      { label: "Kümes Hayvanları", slug: "kumes", icon: "🐓" },
    ]
  },
  {
    label: "Yedek Parça & Aksesuar", slug: "yedek-parca", icon: "🔧",
    altKategoriler: []
  },
  {
    label: "Hizmetler", slug: "hizmetler", icon: "🔨",
    altKategoriler: []
  },
  {
    label: "Özel Ders", slug: "ozel-ders", icon: "📚",
    altKategoriler: []
  },
  {
    label: "İş İlanları", slug: "is-ilanlari", icon: "💼",
    altKategoriler: []
  },
]
