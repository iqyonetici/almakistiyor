// Plain data export - no computed values, no side effects
export const KATEGORILER = [
  {
    slug: 'emlak', label: 'Emlak', icon: '🏠',
    renk: { bg:'#EFF6FF', border:'#BFDBFE', badge:'#1D4ED8', badgeBg:'#DBEAFE' },
    altKategoriler: [
      { slug:'emlak-konut',    label:'Konut',           icon:'🏠', renk:{ bg:'#F0F7FF', border:'#C5DCF8', badge:'#2563EB', badgeBg:'#DBEAFE' } },
      { slug:'emlak-isyeri',   label:'İş Yeri',         icon:'🏢', renk:{ bg:'#FDF4FF', border:'#E9D5FF', badge:'#7C3AED', badgeBg:'#EDE9FE' } },
      { slug:'emlak-arsa',     label:'Arsa',            icon:'🌍', renk:{ bg:'#FFFBEB', border:'#FCD34D', badge:'#D97706', badgeBg:'#FEF3C7' } },
      { slug:'emlak-projeler', label:'Konut Projeleri', icon:'🏗️', renk:{ bg:'#F0FDF4', border:'#86EFAC', badge:'#16A34A', badgeBg:'#DCFCE7' } },
      { slug:'bina',           label:'Bina',            icon:'🏛️', renk:{ bg:'#FFF1F2', border:'#FECDD3', badge:'#E11D48', badgeBg:'#FFE4E6' } },
      { slug:'devre-mulk',     label:'Devre Mülk',      icon:'🏖️', renk:{ bg:'#F0FDFA', border:'#99F6E4', badge:'#0D9488', badgeBg:'#CCFBF1' } },
      { slug:'emlak-turistik', label:'Turistik Tesis',  icon:'🏨', renk:{ bg:'#FEF9C3', border:'#FDE047', badge:'#CA8A04', badgeBg:'#FEF08A' } },
    ]
  },
  {
    slug: 'vasita', label: 'Vasıta', icon: '🚗',
    renk: { bg:'#FFF7ED', border:'#FED7AA', badge:'#EA580C', badgeBg:'#FFEDD5' },
    altKategoriler: [
      { slug:'otomobil',      label:'Otomobil',            icon:'🚗', renk:{ bg:'#FFF7ED', border:'#FED7AA', badge:'#EA580C', badgeBg:'#FFEDD5' } },
      { slug:'arazi-suv',     label:'Arazi, SUV & Pickup', icon:'🚙', renk:{ bg:'#FEF2F2', border:'#FECACA', badge:'#DC2626', badgeBg:'#FFE4E6' } },
      { slug:'elektrikli',    label:'Elektrikli Araçlar',  icon:'⚡', renk:{ bg:'#ECFDF5', border:'#6EE7B7', badge:'#059669', badgeBg:'#D1FAE5' } },
      { slug:'motosiklet',    label:'Motosiklet',          icon:'🏍️', renk:{ bg:'#FFF7ED', border:'#FDBA74', badge:'#C2410C', badgeBg:'#FFEDD5' } },
      { slug:'minivan',       label:'Minivan & Panelvan',  icon:'🚐', renk:{ bg:'#FFFBEB', border:'#FDE68A', badge:'#D97706', badgeBg:'#FEF3C7' } },
      { slug:'ticari',        label:'Ticari Araçlar',      icon:'🚚', renk:{ bg:'#F8FAFC', border:'#CBD5E1', badge:'#475569', badgeBg:'#E2E8F0' } },
      { slug:'deniz',         label:'Deniz Araçları',      icon:'⛵', renk:{ bg:'#EFF6FF', border:'#BAE6FD', badge:'#0369A1', badgeBg:'#E0F2FE' } },
      { slug:'karavan',       label:'Karavan',             icon:'🚌', renk:{ bg:'#F0FDF4', border:'#BBF7D0', badge:'#15803D', badgeBg:'#DCFCE7' } },
      { slug:'klasik',        label:'Klasik Araçlar',      icon:'🏎️', renk:{ bg:'#FDF4FF', border:'#E9D5FF', badge:'#9333EA', badgeBg:'#F3E8FF' } },
      { slug:'atv-utv',       label:'ATV & UTV',           icon:'🏕️', renk:{ bg:'#FEFCE8', border:'#FEF08A', badge:'#CA8A04', badgeBg:'#FEF9C3' } },
    ]
  },
  {
    slug: 'yedek-parca', label: 'Yedek Parça & Aksesuar', icon: '🔧',
    renk: { bg:'#F8FAFC', border:'#CBD5E1', badge:'#475569', badgeBg:'#E2E8F0' },
    altKategoriler: [
      { slug:'otomotiv-ekipman',   label:'Otomotiv Ekipmanları',      icon:'⚙️' },
      { slug:'motorsiklet-ekipman',label:'Motosiklet Ekipmanları',     icon:'🏍️' },
      { slug:'deniz-ekipman',      label:'Deniz Aracı Ekipmanları',   icon:'⛵' },
    ]
  },
  {
    slug: 'alisveris', label: 'Alışveriş', icon: '🛍️',
    renk: { bg:'#FDF4FF', border:'#E9D5FF', badge:'#9333EA', badgeBg:'#F3E8FF' },
    altKategoriler: [
      { slug:'bilgisayar',   label:'Bilgisayar',                icon:'💻', renk:{ bg:'#EFF6FF', border:'#BFDBFE', badge:'#1D4ED8', badgeBg:'#DBEAFE' } },
      { slug:'cep-telefonu', label:'Cep Telefonu & Aksesuar',   icon:'📱', renk:{ bg:'#F0FDF4', border:'#BBF7D0', badge:'#15803D', badgeBg:'#DCFCE7' } },
      { slug:'fotograf',     label:'Fotoğraf & Kamera',         icon:'📷', renk:{ bg:'#FFF7ED', border:'#FED7AA', badge:'#EA580C', badgeBg:'#FFEDD5' } },
      { slug:'ev-dekorasyon',label:'Ev Dekorasyon',             icon:'🛋️', renk:{ bg:'#FDF4FF', border:'#E9D5FF', badge:'#9333EA', badgeBg:'#F3E8FF' } },
      { slug:'ev-elektronigi',label:'Ev Elektroniği',           icon:'📺', renk:{ bg:'#EFF6FF', border:'#BFDBFE', badge:'#3B82F6', badgeBg:'#DBEAFE' } },
      { slug:'ev-aletleri',  label:'Elektrikli Ev Aletleri',    icon:'🔌', renk:{ bg:'#ECFDF5', border:'#6EE7B7', badge:'#059669', badgeBg:'#D1FAE5' } },
      { slug:'giyim',        label:'Giyim & Aksesuar',          icon:'👗', renk:{ bg:'#FFF1F2', border:'#FECDD3', badge:'#E11D48', badgeBg:'#FFE4E6' } },
      { slug:'saat',         label:'Saat',                      icon:'⌚' },
      { slug:'anne-bebek',   label:'Anne & Bebek',              icon:'👶', renk:{ bg:'#FFF1F2', border:'#FECDD3', badge:'#DB2777', badgeBg:'#FCE7F3' } },
      { slug:'hobi',         label:'Hobi & Oyuncak',            icon:'🎮', renk:{ bg:'#FFFBEB', border:'#FDE68A', badge:'#D97706', badgeBg:'#FEF3C7' } },
      { slug:'kitap',        label:'Kitap, Dergi & Film',       icon:'📚', renk:{ bg:'#FEFCE8', border:'#FEF08A', badge:'#854D0E', badgeBg:'#FEF9C3' } },
      { slug:'muzik',        label:'Müzik',                     icon:'🎵', renk:{ bg:'#FDF4FF', border:'#E9D5FF', badge:'#7C3AED', badgeBg:'#EDE9FE' } },
      { slug:'spor',         label:'Spor',                      icon:'⚽', renk:{ bg:'#ECFDF5', border:'#6EE7B7', badge:'#16A34A', badgeBg:'#DCFCE7' } },
      { slug:'taki',         label:'Takı & Mücevher',           icon:'💍', renk:{ bg:'#FFF1F2', border:'#FECDD3', badge:'#BE185D', badgeBg:'#FCE7F3' } },
      { slug:'antika',       label:'Antika & Koleksiyon',       icon:'🏺', renk:{ bg:'#FFFBEB', border:'#FCD34D', badge:'#92400E', badgeBg:'#FEF3C7' } },
      { slug:'bahce',        label:'Bahçe & Yapı Market',       icon:'🌱', renk:{ bg:'#F0FDF4', border:'#86EFAC', badge:'#15803D', badgeBg:'#DCFCE7' } },
      { slug:'ofis',         label:'Ofis & Kırtasiye',          icon:'📎' },
    ]
  },
  {
    slug: 'is-makineleri', label: 'İş Makineleri & Sanayi', icon: '🏭',
    renk: { bg:'#F8FAFC', border:'#94A3B8', badge:'#334155', badgeBg:'#E2E8F0' },
    altKategoriler: [
      { slug:'is-makineleri-alt', label:'İş Makineleri',       icon:'🚜', renk:{ bg:'#FFFBEB', border:'#FCD34D', badge:'#92400E', badgeBg:'#FEF3C7' } },
      { slug:'tarim',             label:'Tarım Makineleri',     icon:'🌾', renk:{ bg:'#F0FDF4', border:'#86EFAC', badge:'#15803D', badgeBg:'#DCFCE7' } },
      { slug:'sanayi-alt',        label:'Sanayi',               icon:'⚙️' },
      { slug:'elektrik-enerji',   label:'Elektrik & Enerji',    icon:'⚡', renk:{ bg:'#ECFDF5', border:'#6EE7B7', badge:'#059669', badgeBg:'#D1FAE5' } },
    ]
  },
  {
    slug: 'hizmetler', label: 'Hizmetler', icon: '🔨',
    renk: { bg:'#EFF6FF', border:'#BFDBFE', badge:'#1D4ED8', badgeBg:'#DBEAFE' },
    altKategoriler: [
      { slug:'ev-tadilat',  label:'Ev Tadilat & Dekorasyon', icon:'🏠' },
      { slug:'nakliye',     label:'Nakliye',                  icon:'🚚' },
      { slug:'arac-servis', label:'Araç Servis & Bakım',      icon:'🔧' },
      { slug:'tamirat',     label:'Tamirat & Teknik Servis',  icon:'🛠️' },
      { slug:'dugun',       label:'Düğün & Etkinlik',         icon:'🎊' },
    ]
  },
  {
    slug: 'ozel-ders', label: 'Özel Ders', icon: '📚',
    renk: { bg:'#FDF4FF', border:'#E9D5FF', badge:'#7C3AED', badgeBg:'#EDE9FE' },
    altKategoriler: [
      { slug:'lise-universite', label:'Lise & Üniversite', icon:'🎓' },
      { slug:'ilkokul',         label:'İlkokul & Ortaokul', icon:'✏️' },
      { slug:'yabanci-dil',     label:'Yabancı Dil',        icon:'🌍' },
      { slug:'muzik-ders',      label:'Müzik & Enstrüman',  icon:'🎵' },
      { slug:'spor-ders',       label:'Spor',               icon:'⚽' },
      { slug:'sanat-ders',      label:'Sanat & Dans',       icon:'🎨' },
    ]
  },
  {
    slug: 'is-ilanlari', label: 'İş İlanları', icon: '💼',
    renk: { bg:'#ECFDF5', border:'#6EE7B7', badge:'#059669', badgeBg:'#D1FAE5' },
    altKategoriler: [
      { slug:'restoran-is',   label:'Restoran & Konaklama', icon:'🍽️' },
      { slug:'lojistik-is',   label:'Lojistik & Taşıma',    icon:'🚚' },
      { slug:'satis-is',      label:'Satış',                icon:'💰' },
      { slug:'insaat-is',     label:'İnşaat & Yapı',        icon:'🏗️' },
      { slug:'it-is',         label:'IT & Yazılım',         icon:'💻' },
      { slug:'saglik-is',     label:'Sağlık',               icon:'🏥' },
      { slug:'diger-is',      label:'Diğer',                icon:'📋' },
    ]
  },
  {
    slug: 'hayvanlar', label: 'Hayvanlar Alemi', icon: '🐾',
    renk: { bg:'#FFF7ED', border:'#FED7AA', badge:'#EA580C', badgeBg:'#FFEDD5' },
    altKategoriler: [
      { slug:'evcil',          label:'Evcil Hayvanlar',     icon:'🐕' },
      { slug:'kumes',          label:'Kümes Hayvanları',    icon:'🐔' },
      { slug:'kucukbas',       label:'Küçükbaş Hayvanlar', icon:'🐑' },
      { slug:'buyukbas',       label:'Büyükbaş Hayvanlar', icon:'🐄' },
      { slug:'akvaryum',       label:'Akvaryum Balıkları', icon:'🐠' },
      { slug:'hayvan-aksesuar',label:'Aksesuar & Ekipman', icon:'🦴' },
    ]
  },
]

// Helper functions - pure, no side effects
export function getKategoriRenk(slug) {
  const varsayilan = { bg:'#F8FAFC', border:'#CBD5E1', badge:'#475569', badgeBg:'#E2E8F0' }
  for (const k of KATEGORILER) {
    if (k.slug === slug) return k.renk || varsayilan
    const alt = k.altKategoriler && k.altKategoriler.find(a => a.slug === slug)
    if (alt) return alt.renk || k.renk || varsayilan
  }
  return varsayilan
}

export function getAltKategori(slug) {
  for (const k of KATEGORILER) {
    const alt = k.altKategoriler && k.altKategoriler.find(a => a.slug === slug)
    if (alt) return Object.assign({}, alt, { anaKategori: k.slug, anaLabel: k.label })
  }
  return null
}

export function getAnaKategori(slug) {
  return KATEGORILER.find(k => k.slug === slug) || null
}

export function tumAltKategoriler() {
  var sonuc = []
  for (var i = 0; i < KATEGORILER.length; i++) {
    var alts = KATEGORILER[i].altKategoriler
    if (alts) for (var j = 0; j < alts.length; j++) sonuc.push(alts[j])
  }
  return sonuc
}
