import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { KATEGORILER } from '../data/kategoriler'
import styles from './Navbar.module.css'

function initials(ad, soyad) {
  return ((ad?.[0]||'')+(soyad?.[0]||'')).toUpperCase()
}

export default function Navbar({ activeCategory='', onCategoryChange, onIlanVer }) {
  const { user, cikisYap, yuklendi } = useAuth()
  const [dropOpen, setDropOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(null) // hangi ana kategori açık
  const dropRef = useRef(null)
  const megaRef = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
      if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleKategori(slug) {
    onCategoryChange && onCategoryChange(slug)
    setMegaOpen(null)
    setTimeout(() => {
      const el = document.getElementById('ilan-listesi')
      if (el) el.scrollIntoView({ behavior:'smooth', block:'start' })
    }, 100)
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* LOGO */}
        <a href="/" className={styles.logo}>
          <svg width="140" height="32" viewBox="0 0 300 72" fill="none">
            <path d="M20 8 L36 4 L52 8 L52 30 C52 42 36 50 36 50 C36 50 20 42 20 30 Z" fill="#0D7A6B"/>
            <path d="M27 27 L33 33 L46 20" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <text x="62" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="#0D7A6B" letterSpacing="-0.8">almak</text>
            <text x="163" y="44" fontFamily="Sora,sans-serif" fontWeight="400" fontSize="28" fill="#1A1D23" letterSpacing="-0.5">istiyor</text>
            <text x="277" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="#F5A623">.</text>
          </svg>
        </a>

        {/* MEGA MENU KATEGORİLER */}
        <div className={styles.cats} ref={megaRef}>
          {/* TÜMÜ */}
          <button
            className={`${styles.cat} ${activeCategory===''?styles.catActive:''}`}
            onClick={() => handleKategori('')}>
            Tümü
          </button>

          {KATEGORILER.map(k => (
            <div key={k.slug} className={styles.catWrap}>
              <button
                className={`${styles.cat} ${activeCategory===k.slug||activeCategory?.startsWith(k.slug+'-')?styles.catActive:''}`}
                onClick={() => {
                  if (k.altKategoriler?.length) {
                    setMegaOpen(megaOpen===k.slug ? null : k.slug)
                  } else {
                    handleKategori(k.slug)
                  }
                }}>
                {k.icon} {k.label}
                {k.altKategoriler?.length > 0 && <span className={styles.chevron}>▾</span>}
              </button>

              {/* DROPDOWN ALT KATEGORİLER */}
              {megaOpen === k.slug && k.altKategoriler && (
                <div className={styles.dropdown}>
                  <div className={styles.dropHeader}>
                    <button className={styles.dropAnaBtn} onClick={() => handleKategori(k.slug)}>
                      {k.icon} Tüm {k.label}
                    </button>
                  </div>
                  <div className={styles.dropGrid}>
                    {k.altKategoriler.map(alt => (
                      <button key={alt.slug} className={styles.dropItem}
                        onClick={() => handleKategori(alt.slug)}
                        style={{
                          background: activeCategory===alt.slug ? alt.renk?.bg||'var(--teal-light)' : 'white',
                          borderColor: activeCategory===alt.slug ? alt.renk?.border||'var(--teal)' : 'transparent',
                        }}>
                        <span className={styles.dropIcon}>{alt.icon}</span>
                        <span className={styles.dropLabel}>{alt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SAĞ TARAF */}
        <div className={styles.right}>
          <button className={styles.btnTalep} onClick={onIlanVer}>
            + Almak İstiyorum
          </button>

          {yuklendi && user ? (
            <div className={styles.avatarWrap} ref={dropRef}>
              <button className={styles.avatarBtn} onClick={() => setDropOpen(!dropOpen)}>
                <div className={styles.avatarCircle}>
                  {initials(user.ad, user.soyad)}
                </div>
                <span className={styles.avatarName}>
                  Merhaba, {user.ad || user.email?.split('@')[0]}
                </span>
                <span className={styles.chevron}>▾</span>
              </button>
              {dropOpen && (
                <div className={styles.userDrop}>
                  <div className={styles.userDropHeader}>
                    <div className={styles.userDropName}>{user.ad} {user.soyad}</div>
                    <div className={styles.userDropEmail}>{user.email}</div>
                  </div>
                  <a href="/panel" className={styles.userDropItem}>📋 İlanlarım</a>
                  <a href="/panel?tab=mesajlar" className={styles.userDropItem}>💬 Mesajlarım</a>
                  <a href="/panel?tab=profil" className={styles.userDropItem}>👤 Profilim</a>
                  {user.tur === 'satici' && <a href="/satici" className={styles.userDropItem}>🏢 Satıcı Paneli</a>}
                  <a href="/pro" className={styles.userDropItem}>⭐ Pro Üyelik</a>
                  <div className={styles.userDropDivider} />
                  <button className={`${styles.userDropItem} ${styles.userDropCikis}`}
                    onClick={() => { cikisYap(); window.location.href='/' }}>
                    ← Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : yuklendi ? (
            <div className={styles.authBtns}>
              <a href="/giris" className={styles.btnGiris}>Giriş</a>
              <a href="/kayit" className={styles.btnKayit}>Üye Ol</a>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  )
}
