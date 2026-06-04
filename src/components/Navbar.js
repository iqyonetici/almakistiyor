import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
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

export default function Navbar({ activeCategory, onCategoryChange, onIlanVer }) {
  const router = useRouter();
  const isAnasayfa = router.pathname === "/";
  const [mobilMenuAcik, setMobilMenuAcik] = useState(false);
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
              <span className={styles.logoIcon}>✓</span>
              <span className={styles.logoText}><strong>almak</strong> istiyor</span>
            </Link>
            <div className={styles.topActions}>
              <button className={styles.btnIlan} onClick={() => onIlanVer ? onIlanVer() : router.push("/")}>
                + Almak İstiyorum
              </button>
              <Link href="/giris" className={styles.btnGiris}>Giriş</Link>
              <Link href="/kayit" className={styles.btnKayit}>Üye Ol</Link>
            </div>
          </div>
        </div>
      </header>

      {mobilMenuAcik && (
        <div className={styles.overlay} onClick={() => setMobilMenuAcik(false)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div className={styles.logo}>
                <span className={styles.logoIcon} style={{background:'#1a5c3a',color:'white'}}>✓</span>
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
              <Link href="/giris" className={styles.drawerGiris} onClick={() => setMobilMenuAcik(false)}>Giriş Yap</Link>
              <Link href="/kayit" className={styles.drawerKayit} onClick={() => setMobilMenuAcik(false)}>Üye Ol</Link>
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
        <Link href="/panel" className={styles.navItem}>
          <span className={styles.navIcon}>👤</span>
          <span className={styles.navLabel}>Profil</span>
        </Link>
      </nav>
    </>
  );
}
