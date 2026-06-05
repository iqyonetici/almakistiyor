import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { adminMi } from "../lib/kategoriDB";
import styles from "./Navbar.module.css";

// DB'deki gerçek kategorilerle uyumlu
export const kategoriler = [
  { label: "Tümü", slug: "", icon: "🔍" },
  { label: "Emlak", slug: "emlak", icon: "🏠", altkategoriler: [
    { label: "Konut", slug: "emlak-konut" },
    { label: "İş Yeri", slug: "emlak-isyeri" },
    { label: "Arsa", slug: "emlak-arsa" },
    { label: "Bina", slug: "bina" },
  ]},
  { label: "Vasıta", slug: "vasita", icon: "🚗", altkategoriler: [
    { label: "Otomobil", slug: "otomobil" },
    { label: "Arazi & SUV", slug: "arazi-suv" },
    { label: "Motosiklet", slug: "motosiklet" },
    { label: "Minivan", slug: "minivan" },
    { label: "Ticari", slug: "ticari" },
  ]},
  { label: "Alışveriş", slug: "alisveris", icon: "🛍️", altkategoriler: [
    { label: "Bilgisayar", slug: "bilgisayar" },
    { label: "Cep Telefonu", slug: "cep-telefonu" },
    { label: "Ev Aletleri", slug: "ev-aletleri" },
    { label: "Ev & Dekorasyon", slug: "ev-dekorasyon" },
    { label: "Hobi", slug: "hobi" },
    { label: "Spor", slug: "spor" },
  ]},
  { label: "İş Makineleri", slug: "is-makineleri", icon: "🏭", altkategoriler: [
    { label: "İş Makineleri", slug: "is-makineleri-alt" },
    { label: "Sanayi", slug: "sanayi-alt" },
    { label: "Tarım", slug: "tarim" },
  ]},
  { label: "Hayvanlar", slug: "hayvanlar", icon: "🐾", altkategoriler: [
    { label: "Evcil", slug: "evcil" },
    { label: "Küçükbaş", slug: "kucukbas" },
    { label: "Kümes", slug: "kumes" },
  ]},
  { label: "Yedek Parça", slug: "yedek-parca", icon: "🔧", altkategoriler: [] },
  { label: "Hizmetler", slug: "hizmetler", icon: "🔨", altkategoriler: [] },
  { label: "Özel Ders", slug: "ozel-ders", icon: "📚", altkategoriler: [] },
  { label: "İş İlanları", slug: "is-ilanlari", icon: "💼", altkategoriler: [] },
];

export default function Navbar({ activeCategory, onCategoryChange, onIlanVer, kategoriAgaci }) {
  const router = useRouter();
  const { user, cikisYap } = useAuth();
  const isAnasayfa = router.pathname === "/";
  const [mobilMenuAcik, setMobilMenuAcik] = useState(false);
  const [profilAcik, setProfilAcik] = useState(false);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    if (user?.email) adminMi(user.email).then(setAdmin);
    else setAdmin(false);
  }, [user]);

  async function handleCikis() {
    setProfilAcik(false);
    await cikisYap();
    router.push("/");
  }
  const [mobilAltAcik, setMobilAltAcik] = useState(null);

  const handleKatClick = (e, slug) => {
    if (e && e.preventDefault) e.preventDefault();
    setMobilMenuAcik(false);
    if (isAnasayfa && onCategoryChange) {
      onCategoryChange(slug);
      setTimeout(() => {
        document.getElementById("ilan-listesi")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      router.push(`/?kategori=${slug}`);
    }
  };

  useEffect(() => {
    if (isAnasayfa && router.query.kategori !== undefined && onCategoryChange) {
      onCategoryChange(router.query.kategori);
      router.replace("/", undefined, { shallow: true });
    }
  }, [router.query.kategori]);

  useEffect(() => {
    document.body.style.overflow = mobilMenuAcik ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobilMenuAcik]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.topBar}>
          <div className={styles.topBarInner}>
            <Link href="/" className={styles.logo}>
              <img src="/almakistiyor-icon.png" alt="almakistiyor.com" className={styles.logoIconImg} width="40" height="40" />
              <span className={styles.logoText}><strong>almak</strong>istiyor<span style={{color:'#F5A623'}}>.com</span></span>
            </Link>

            {/* Kategori menüsü (masaüstü) */}
            <nav className={styles.katNav}>
              {(kategoriAgaci && kategoriAgaci.length ? kategoriAgaci : kategoriler).slice(0, 6).map(k => (
                <a key={k.slug} href={`/?kategori=${k.slug}`}
                  className={`${styles.katNavItem} ${activeCategory === k.slug ? styles.katNavAktif : ''}`}
                  onClick={(e) => handleKatClick(e, k.slug)}>
                  {k.icon && <span className={styles.katNavIcon}>{k.icon}</span>}
                  {k.label}
                </a>
              ))}
            </nav>

            <div className={styles.topActions}>
              {user ? (
                <div className={styles.profilWrap}>
                  <button className={styles.profilBtn} onClick={() => setProfilAcik(a => !a)}>
                    <span className={styles.profilAvatar}>{(user.ad?.[0] || user.email?.[0] || "K").toUpperCase()}</span>
                    <span className={styles.profilAd}>Merhaba, {user.ad || "Kullanıcı"}</span>
                    <span className={styles.profilOk}>▾</span>
                  </button>
                  {profilAcik && (
                    <>
                      <div className={styles.profilArka} onClick={() => setProfilAcik(false)} />
                      <div className={styles.profilMenu}>
                        <div className={styles.profilBaslik}>
                          <span className={styles.profilBaslikAvatar}>{(user.ad?.[0] || user.email?.[0] || "K").toUpperCase()}</span>
                          <div>
                            <div className={styles.profilBaslikAd}>{user.ad} {user.soyad || ""}</div>
                            <div className={styles.profilBaslikMail}>{user.email}</div>
                          </div>
                        </div>
                        {user.paket && user.paket !== 'ucretsiz' ? (
                          <div className={styles.profilPaket}>💎 {user.paket.toUpperCase()} üye</div>
                        ) : (
                          <Link href="/pro" className={styles.profilProCta} onClick={() => setProfilAcik(false)}>⭐ Pro üyeliğe geç</Link>
                        )}
                        <div className={styles.profilGrup}>
                          <Link href="/panel" className={styles.profilLink} onClick={() => setProfilAcik(false)}>📋 İlanlarım</Link>
                          <Link href="/panel?tab=mesajlar" className={styles.profilLink} onClick={() => setProfilAcik(false)}>💬 Mesajlarım</Link>
                          <Link href="/panel?tab=favoriler" className={styles.profilLink} onClick={() => setProfilAcik(false)}>❤️ Favorilerim</Link>
                          <Link href="/panel?tab=teklifler" className={styles.profilLink} onClick={() => setProfilAcik(false)}>📨 Aldığım Teklifler</Link>
                        </div>
                        <div className={styles.profilGrup}>
                          <Link href="/panel?tab=ayarlar" className={styles.profilLink} onClick={() => setProfilAcik(false)}>⚙️ Hesap Ayarları</Link>
                          <Link href="/yardim" className={styles.profilLink} onClick={() => setProfilAcik(false)}>❓ Yardım & Destek</Link>
                          {admin && <Link href="/admin" className={styles.profilLink} onClick={() => setProfilAcik(false)}>🛠️ Admin Panel</Link>}
                        </div>
                        <button className={styles.profilCikis} onClick={handleCikis}>🚪 Çıkış Yap</button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/giris" className={styles.btnGiris}>Giriş</Link>
                  <Link href="/kayit" className={styles.btnKayit}>Üye Ol</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {mobilMenuAcik && (
        <div className={styles.overlay} onClick={() => setMobilMenuAcik(false)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div className={styles.logo}>
                <img src="/almakistiyor-icon.png" alt="almakistiyor.com" className={styles.logoIconImg} width="36" height="36" />
                <span style={{fontSize:16,fontWeight:600,color:'#1a1d23'}}><strong>almak</strong> istiyor</span>
              </div>
              <button className={styles.drawerKapat} onClick={() => setMobilMenuAcik(false)}>✕</button>
            </div>
            <div className={styles.drawerKategoriler}>
              {kategoriler.map((kat) => {
                const hasDropdown = kat.altkategoriler?.length > 0;
                const isAktif = (activeCategory ?? "") === kat.slug;
                return (
                  <div key={kat.slug}>
                    <button
                      className={`${styles.drawerKatBtn} ${isAktif ? styles.drawerKatAktif : ""}`}
                      onClick={() => {
                        if (hasDropdown) setMobilAltAcik(mobilAltAcik === kat.slug ? null : kat.slug);
                        handleKatClick(null, kat.slug);
                      }}>
                      <span>{kat.icon} {kat.label}</span>
                      {hasDropdown && (
                        <span style={{ fontSize: 11, color: "#8a95a3", transform: mobilAltAcik === kat.slug ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform 0.2s" }}>▼</span>
                      )}
                    </button>
                    {hasDropdown && mobilAltAcik === kat.slug && (
                      <div className={styles.drawerAlt}>
                        {kat.altkategoriler.map(alt => (
                          <button key={alt.slug}
                            className={`${styles.drawerAltBtn} ${activeCategory === alt.slug ? styles.drawerAltAktif : ""}`}
                            onClick={() => handleKatClick(null, alt.slug)}>
                            {alt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className={styles.drawerFooter}>
              {user ? (
                <div className={styles.drawerProfil}>
                  <div className={styles.drawerProfilUst}>
                    <span className={styles.drawerProfilAvatar}>{(user.ad?.[0] || "K").toUpperCase()}</span>
                    <div>
                      <div className={styles.drawerProfilAd}>{user.ad} {user.soyad || ""}</div>
                      <div className={styles.drawerProfilMail}>{user.email}</div>
                    </div>
                  </div>
                  <Link href="/panel" className={styles.drawerProfilLink} onClick={() => setMobilMenuAcik(false)}>📋 İlanlarım</Link>
                  <Link href="/panel?tab=mesajlar" className={styles.drawerProfilLink} onClick={() => setMobilMenuAcik(false)}>💬 Mesajlarım</Link>
                  <Link href="/panel?tab=favoriler" className={styles.drawerProfilLink} onClick={() => setMobilMenuAcik(false)}>❤️ Favorilerim</Link>
                  <Link href="/panel?tab=ayarlar" className={styles.drawerProfilLink} onClick={() => setMobilMenuAcik(false)}>⚙️ Hesap Ayarları</Link>
                  {admin && <Link href="/admin" className={styles.drawerProfilLink} onClick={() => setMobilMenuAcik(false)}>🛠️ Admin Panel</Link>}
                  <button className={styles.drawerCikis} onClick={() => { setMobilMenuAcik(false); handleCikis(); }}>🚪 Çıkış Yap</button>
                </div>
              ) : (
                <>
                  <Link href="/giris" className={styles.drawerGiris} onClick={() => setMobilMenuAcik(false)}>Giriş Yap</Link>
                  <Link href="/kayit" className={styles.drawerKayit} onClick={() => setMobilMenuAcik(false)}>Üye Ol</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className={styles.bottomNav}>
        <button className={`${styles.navItem} ${isAnasayfa && !activeCategory ? styles.navAktif : ""}`}
          onClick={() => { if (isAnasayfa) { onCategoryChange?.(""); } else { router.push("/"); } }}>
          <span className={styles.navIcon}>🏠</span>
          <span className={styles.navLabel}>Ana Sayfa</span>
        </button>
        <button className={styles.navItem} onClick={() => setMobilMenuAcik(true)}>
          <span className={styles.navIcon}>☰</span>
          <span className={styles.navLabel}>Kategoriler</span>
        </button>
        <button className={styles.navItemAdd} onClick={() => onIlanVer ? onIlanVer() : router.push("/")}>
          <span className={styles.addCircle}>+</span>
          <span className={styles.navLabel}>İlan Ver</span>
        </button>
        <Link href="/panel?tab=mesajlar" className={styles.navItem}>
          <span className={styles.navIcon}>💬</span>
          <span className={styles.navLabel}>Mesajlar</span>
        </Link>
        {user ? (
          <button className={styles.navItem} onClick={() => setMobilMenuAcik(true)}>
            <span className={styles.navIcon}>👤</span>
            <span className={styles.navLabel}>Profil</span>
          </button>
        ) : (
          <Link href="/giris" className={styles.navItem}>
            <span className={styles.navIcon}>👤</span>
            <span className={styles.navLabel}>Giriş</span>
          </Link>
        )}
      </nav>
    </>
  );
}
