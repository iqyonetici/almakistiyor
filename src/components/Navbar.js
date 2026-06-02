import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
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

function initials(ad, soyad) {
  return ((ad?.[0] || '') + (soyad?.[0] || '')).toUpperCase()
}

export default function Navbar({ activeCategory = '', onCategoryChange, onIlanVer }) {
  const { user, cikisYap } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <a href="/" className={styles.logoWrap}>
          <svg width="148" height="36" viewBox="0 0 300 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 8 L36 4 L52 8 L52 30 C52 42 36 50 36 50 C36 50 20 42 20 30 Z" fill="#0D7A6B"/>
            <path d="M27 27 L33 33 L46 20" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <text x="62" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="#0D7A6B" letterSpacing="-0.8">almak</text>
            <text x="163" y="44" fontFamily="Sora,sans-serif" fontWeight="400" fontSize="28" fill="#1A1D23" letterSpacing="-0.5">istiyor</text>
            <text x="277" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="#F5A623">.</text>
          </svg>
        </a>

        <div className={styles.cats}>
          {categories.map(c => (
            <button key={c.slug}
              className={`${styles.cat} ${activeCategory === c.slug ? styles.catActive : ''}`}
              onClick={() => onCategoryChange && onCategoryChange(c.slug)}>
              {c.label}
            </button>
          ))}
        </div>

        <div className={styles.right}>
          {/* + Talep Ver her zaman görünür */}
          <button className={styles.btnTalep} onClick={onIlanVer}>
            + Talep Ver
          </button>

          {user ? (
            /* GİRİŞ YAPILMIŞ — Avatar + İsim + Dropdown */
            <div className={styles.avatarWrap} ref={dropRef}>
              <button className={styles.avatarBtn} onClick={() => setDropOpen(!dropOpen)}>
                <div className={styles.avatar}>{initials(user.ad, user.soyad)}</div>
                <span className={styles.avatarAd}>Merhaba, {user.ad}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{color:'var(--text-3)'}}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {dropOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropUser}>
                    <div className={styles.dropAvatar}>{initials(user.ad, user.soyad)}</div>
                    <div>
                      <div className={styles.dropAd}>{user.ad} {user.soyad}</div>
                      <div className={styles.dropEmail}>{user.email}</div>
                    </div>
                  </div>
                  <div className={styles.dropDivider} />
                  <a href="/panel" className={styles.dropItem}>
                    <span>📋</span> Taleplerimi Gör
                  </a>
                  <a href="/panel?tab=mesajlar" className={styles.dropItem}>
                    <span>💬</span> Mesajlarım
                  </a>
                  <a href="/panel?tab=profil" className={styles.dropItem}>
                    <span>👤</span> Profilim
                  </a>
                  <div className={styles.dropDivider} />
                  <a href="/pro" className={styles.dropItemPro}>
                    <span>🏢</span> Profesyonel Erişim
                  </a>
                  <div className={styles.dropDivider} />
                  <button className={styles.dropCikis} onClick={() => { cikisYap(); setDropOpen(false) }}>
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* GİRİŞ YAPILMAMIŞ */
            <>
              <a href="/giris" className={styles.btnGiris}>Giriş Yap</a>
              <a href="/kayit" className={styles.btnKayit}>Kayıt Ol</a>
            </>
          )}
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
            <button className={styles.btnTalep} style={{width:'100%',justifyContent:'center'}}
              onClick={() => { onIlanVer && onIlanVer(); setMenuOpen(false) }}>
              + Talep Ver
            </button>
            {user ? (
              <>
                <a href="/panel" className="btn-outline" style={{width:'100%',justifyContent:'center'}}>Panelim</a>
                <button onClick={() => { cikisYap(); setMenuOpen(false) }}
                  className="btn-ghost" style={{width:'100%',justifyContent:'center'}}>Çıkış Yap</button>
              </>
            ) : (
              <>
                <a href="/giris" className="btn-ghost" style={{width:'100%',justifyContent:'center'}}>Giriş Yap</a>
                <a href="/kayit" className="btn-outline" style={{width:'100%',justifyContent:'center'}}>Kayıt Ol</a>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
