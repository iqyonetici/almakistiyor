// DB ile birebir uyumlu — 3 seviye
// 3. seviye "filtre" alanı: hangi kolonla eşleşeceğini belirtir
//   - tip: 'emlak_tip'  → emlak_tip kolonuyla filtrele
//   - tip: 'marka'      → markalar kolonuyla filtrele (LIKE)
//   - tip yoksa         → alt_kategori ile filtrele
export const KATEGORILER = [
  {
    label: "Emlak", slug: "emlak", icon: "🏠",
    altKategoriler: [
      {
        label: "Konut", slug: "emlak-konut", icon: "🏠",
        altKategoriler: [
          { label: "Daire", slug: "daire", filtre: { tip: 'emlak_tip', deger: 'Daire' } },
          { label: "Villa", slug: "villa", filtre: { tip: 'emlak_tip', deger: 'Villa' } },
          { label: "Müstakil Ev", slug: "mustakil", filtre: { tip: 'emlak_tip', deger: 'Müstakil Ev' } },
          { label: "Residence", slug: "residence", filtre: { tip: 'emlak_tip', deger: 'Residence' } },
        ]
      },
      {
        label: "İş Yeri", slug: "emlak-isyeri", icon: "🏢",
        altKategoriler: [
          { label: "Dükkan", slug: "dukkan", filtre: { tip: 'emlak_tip', deger: 'Dükkan' } },
          { label: "İşyeri", slug: "isyeri", filtre: { tip: 'emlak_tip', deger: 'İşyeri' } },
          { label: "Ofis", slug: "ofis", filtre: { tip: 'emlak_tip', deger: 'Ofis' } },
          { label: "Depo", slug: "depo", filtre: { tip: 'emlak_tip', deger: 'Depo' } },
        ]
      },
      {
        label: "Arsa", slug: "emlak-arsa", icon: "🌿",
        altKategoriler: [
          { label: "İmarlı", slug: "imarli", filtre: { tip: 'emlak_tip', deger: 'İmarlı' } },
          { label: "Tarla", slug: "tarla", filtre: { tip: 'emlak_tip', deger: 'Tarla' } },
          { label: "Bağ & Bahçe", slug: "bag-bahce", filtre: { tip: 'emlak_tip', deger: 'Bağ & Bahçe' } },
        ]
      },
      { label: "Bina", slug: "bina", icon: "🏛️" },
    ]
  },
  {
    label: "Vasıta", slug: "vasita", icon: "🚗",
    altKategoriler: [
      {
        label: "Otomobil", slug: "otomobil", icon: "🚗",
        altKategoriler: [
          { label: "Audi", slug: "audi", filtre: { tip: 'marka', deger: 'Audi' } },
          { label: "BMW", slug: "bmw", filtre: { tip: 'marka', deger: 'BMW' } },
          { label: "Fiat", slug: "fiat", filtre: { tip: 'marka', deger: 'Fiat' } },
          { label: "Ford", slug: "ford", filtre: { tip: 'marka', deger: 'Ford' } },
          { label: "Honda", slug: "honda", filtre: { tip: 'marka', deger: 'Honda' } },
          { label: "Hyundai", slug: "hyundai", filtre: { tip: 'marka', deger: 'Hyundai' } },
          { label: "Kia", slug: "kia", filtre: { tip: 'marka', deger: 'Kia' } },
          { label: "Mercedes", slug: "mercedes", filtre: { tip: 'marka', deger: 'Mercedes' } },
          { label: "Renault", slug: "renault", filtre: { tip: 'marka', deger: 'Renault' } },
          { label: "Toyota", slug: "toyota", filtre: { tip: 'marka', deger: 'Toyota' } },
          { label: "Volkswagen", slug: "vw", filtre: { tip: 'marka', deger: 'Volkswagen' } },
        ]
      },
      {
        label: "Arazi & SUV", slug: "arazi-suv", icon: "🚙",
        altKategoriler: [
          { label: "BMW X5", slug: "bmw-x5", filtre: { tip: 'marka', deger: 'BMW X5' } },
          { label: "Ford Explorer", slug: "ford-explorer", filtre: { tip: 'marka', deger: 'Ford Explorer' } },
          { label: "Hyundai Tucson", slug: "hyundai-tucson", filtre: { tip: 'marka', deger: 'Hyundai Tucson' } },
        ]
      },
      {
        label: "Motosiklet", slug: "motosiklet", icon: "🏍️",
        altKategoriler: [
          { label: "Kawasaki", slug: "kawasaki", filtre: { tip: 'marka', deger: 'Kawasaki' } },
        ]
      },
      {
        label: "Ticari", slug: "ticari", icon: "🛻",
        altKategoriler: [
          { label: "Ford Transit", slug: "ford-transit", filtre: { tip: 'marka', deger: 'Ford Transit' } },
          { label: "Ford Tourneo", slug: "ford-tourneo", filtre: { tip: 'marka', deger: 'Ford Tourneo' } },
        ]
      },
      { label: "Minivan & Panelvan", slug: "minivan", icon: "🚐" },
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
      { label: "Sanayi", slug: "sanayi-alt", icon: "⚙️" },
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
  { label: "Yedek Parça & Aksesuar", slug: "yedek-parca", icon: "🔧", altKategoriler: [] },
  { label: "Hizmetler", slug: "hizmetler", icon: "🔨", altKategoriler: [] },
  { label: "Özel Ders", slug: "ozel-ders", icon: "📚", altKategoriler: [] },
  { label: "İş İlanları", slug: "is-ilanlari", icon: "💼", altKategoriler: [] },
]
