import styles from './IlanKarti.module.css'

const catColors = {
  emlak: { bg: '#EBF4FF', color: '#1A4A8A', label: 'Emlak' },
  vasita: { bg: '#FFF5EB', color: '#7A3C00', label: 'Vasıta' },
  'ikinci-el': { bg: '#F0FBF6', color: '#1A5C35', label: 'İkinci El' },
  mobilya: { bg: '#F5F0FB', color: '#4A1A8A', label: 'Mobilya' },
  elektronik: { bg: '#EBF4FF', color: '#1A4A8A', label: 'Elektronik' },
  'is-makinasi': { bg: '#FFF5EB', color: '#7A3C00', label: 'İş Makinası' },
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function maskedName(name) {
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0]
  return parts[0] + ' ' + parts[parts.length - 1][0] + '.'
}

const avatarColors = [
  { bg: '#E6F5F2', color: '#0D7A6B' },
  { bg: '#EBF4FF', color: '#1A4A8A' },
  { bg: '#FFF5EB', color: '#7A3C00' },
  { bg: '#F0FBF6', color: '#1A5C35' },
  { bg: '#FEF3DC', color: '#7A4F01' },
]

export default function IlanKarti({ ilan, onIletisim, locked = false }) {
  const cat = catColors[ilan.kategori] || catColors['ikinci-el']
  const idx = ilan.id % avatarColors.length
  const avatarStyle = avatarColors[idx]

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.left}>
          <div className={styles.avatar} style={{ background: avatarStyle.bg, color: avatarStyle.color }}>
            {initials(ilan.ad)}
          </div>
          <div>
            <div className={styles.name}>
              {maskedName(ilan.ad)}
              <span className={styles.lockBadge}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Tel gizli
              </span>
            </div>
            <div className={styles.location}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {ilan.sehir}{ilan.ilce ? ` — ${ilan.ilce}` : ''}
            </div>
          </div>
        </div>
        <div className={styles.metaRight}>
          <div className={styles.date}>{ilan.tarih}</div>
          <span className={styles.catBadge} style={{ background: cat.bg, color: cat.color }}>
            {cat.label}
          </span>
        </div>
      </div>

      <div className={styles.title}>{ilan.baslik}</div>

      <div className={styles.tags}>
        {ilan.fiyatMin && ilan.fiyatMax && (
          <span className="tag tag-price">
            ₺{Number(ilan.fiyatMin).toLocaleString('tr-TR')} – ₺{Number(ilan.fiyatMax).toLocaleString('tr-TR')}
          </span>
        )}
        {ilan.tags?.map((t, i) => (
          <span key={i} className={`tag ${t.variant || 'tag-gray'}`}>{t.label}</span>
        ))}
      </div>

      {ilan.aciklama && (
        <p className={styles.desc}>{ilan.aciklama}</p>
      )}

      <div className={styles.footer}>
        <div className={styles.views}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          {ilan.goruntuleme || 0} satıcı baktı
        </div>
        {locked ? (
          <button className={styles.btnLocked} onClick={() => onIletisim && onIletisim(ilan)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Pakete geç — iletişimi gör
          </button>
        ) : (
          <button className={styles.btnContact} onClick={() => onIletisim && onIletisim(ilan)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.49 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            İletişim bilgisini gör
          </button>
        )}
      </div>
    </div>
  )
}
