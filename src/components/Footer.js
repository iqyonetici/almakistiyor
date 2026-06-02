import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <svg width="150" height="34" viewBox="0 0 300 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 8 L36 4 L52 8 L52 30 C52 42 36 50 36 50 C36 50 20 42 20 30 Z" fill="rgba(255,255,255,0.9)"/>
              <path d="M27 27 L33 33 L46 20" stroke="#0D7A6B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              <text x="62" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="white" letterSpacing="-0.8">almak</text>
              <text x="163" y="44" fontFamily="Sora,sans-serif" fontWeight="400" fontSize="28" fill="rgba(255,255,255,0.8)" letterSpacing="-0.5">istiyor</text>
              <text x="277" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="#F5A623">.</text>
            </svg>
            <p>Alıcıların talep oluşturduğu, emlakçı ve galerilerin müşteri bulduğu Türkiye'nin güvenli platformu.</p>
            <div className={styles.badges}>
              <span className={styles.badge}>🔒 SSL Güvenli</span>
              <span className={styles.badge}>✓ KVKK Uyumlu</span>
            </div>
          </div>
          <div className={styles.col}>
            <h6>Platform</h6>
            <a href="/nasil-calisir">Nasıl çalışır?</a>
            <a href="/">Talep ilanları</a>
            <a href="/ilan-ver">İlan ver</a>
            <a href="/guvenlik">Güvenlik</a>
          </div>
          <div className={styles.col}>
            <h6>Satıcılar için</h6>
            <a href="/satici">Satıcı girişi</a>
            <a href="/paketler">Paketler ve fiyatlar</a>
            <a href="/kurumsal">Kurumsal hesap</a>
            <a href="/api">API erişimi</a>
          </div>
          <div className={styles.col}>
            <h6>Yardım</h6>
            <a href="/yardim">Yardım merkezi</a>
            <a href="/iletisim">İletişim</a>
            <a href="/gizlilik">Gizlilik politikası</a>
            <a href="/kullanim-sartlari">Kullanım şartları</a>
            <a href="/kvkk">KVKK Aydınlatma</a>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>© 2025 AlmakIstiyor.com — Tüm hakları saklıdır</span>
          <span className={styles.motto}>Alıcıyı koru · Satıcıyı kazan</span>
        </div>
      </div>
    </footer>
  )
}
