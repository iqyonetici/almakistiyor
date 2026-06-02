import { useState } from 'react'
import styles from './Navbar.module.css'

const categories = [
  { label: 'Tümü', slug: '' },
  { label: '🏠 Emlak', slug: 'emlak' },
  { label: '🚗 Vasıta', slug: 'vasita' },
  { label: '📦 İkinci El', slug: 'ikinci-el' },
  { label: '🛋️ Mobilya', slug: 'mobilya' },
  { label: '📱 Elektronik', slug: 'elektronik' },
  { label: '🔧 İş Makinası', slug: 'is-makinasi' },
]

export default function Navbar({ activeCategory = '', onCategoryChange, onIlanVer }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <a href="/" className={styles.logo}>
          <svg width="160" height="38" viewBox="0 0 300 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 8 L36 4 L52 8 L52 30 C52 42 36 50 36 50 C36 50 20 42 20 30 Z" fill="#0D7A6B"/>
            <path d="M27 27 L33 33 L46 20" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <text x="62" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="#0D7A6B" letterSpacing="-0.8">almak</text>
            <text x="163" y="44" fontFamily="Sora,sans-serif" fontWeight="400" fontSize="28" fill="#1A1D23" letterSpacing="-0.5">istiyor</text>
            <text x="277" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="#F5A623">.</text>
          </svg>
        </a>

        <div className={styles.cats}>
          {categories.map(c => (
            <button
              key={c.slug}
              className={`${styles.cat} ${activeCategory === c.slug ? styles.catActive : ''}`}
              onClick={() => onCategoryChange && onCategoryChange(c.slug)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className={styles.right}>
          <a href="/satici" className="btn-outline" style={{fontSize:'13px', padding:'7px 14px'}}>
            Satıcı Girişi
          </a>
          <button className="btn-primary" style={{fontSize:'13px', padding:'8px 16px'}} onClick={onIlanVer}>
            + İlan Ver
          </button>
        </div>

        <button className={styles.burger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menü">
          <span/><span/><span/>
        </button>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {categories.map(c => (
            <button key={c.slug} className={styles.mobileCat}
              onClick={() => { onCategoryChange && onCategoryChange(c.slug); setMenuOpen(false) }}>
              {c.label}
            </button>
          ))}
          <div className={styles.mobileBtns}>
            <a href="/satici" className="btn-ghost" style={{width:'100%', justifyContent:'center'}}>Satıcı Girişi</a>
            <button className="btn-primary" style={{width:'100%', justifyContent:'center'}} onClick={() => { onIlanVer && onIlanVer(); setMenuOpen(false) }}>
              + İlan Ver
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
