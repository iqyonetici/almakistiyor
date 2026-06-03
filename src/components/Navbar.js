import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./Navbar.module.css";

export const kategoriler = [
  { label: "Tümü", slug: "", icon: "🔍" },
  { label: "Emlak", slug: "emlak", icon: "🏠", altkategoriler: [
    { label: "Konut", slug: "emlak-konut" },
    { label: "İşyeri & Ofis", slug: "emlak-isyeri" },
    { label: "Arsa & Arazi", slug: "emlak-arsa" },
    { label: "Projeler", slug: "emlak-projeler" },
    { label: "Bina", slug: "bina" },
    { label: "Devre Mülk", slug: "devre-mulk" },
  ]},
  { label: "Vasıta", slug: "vasita", icon: "🚗", altkategoriler: [
    { label: "Otomobil", slug: "otomobil" },
    { label: "Arazi / SUV", slug: "arazi-suv" },
    { label: "Elektrikli", slug: "elektrikli" },
    { label: "Motosiklet", slug: "motosiklet" },
    { label: "Minivan", slug: "minivan" },
    { label: "Ticari", slug: "ticari" },
    { label: "Karavan", slug: "karavan" },
  ]},
  { label: "Alışveriş", slug: "alisveris", icon: "🛍️", altkategoriler: [] },
  { label: "Hizmetler", slug: "hizmetler", icon: "🔨", altkategoriler: [] },
  { label: "Özel Ders", slug: "ozel-ders", icon: "📚", altkategoriler: [] },
  { label: "İş İlanları", slug: "is-ilanlari", icon: "💼", altkategoriler: [] },
  { label: "Yedek Parça", slug: "yedek-parca", icon: "🔧", altkategoriler: [] },
  { label: "İş Makineleri", slug: "is-makineleri", icon: "🏭", altkategoriler: [] },
  { label: "Hayvanlar", slug: "hayvanlar", icon: "🐾", altkategoriler: [] },
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

  // Menü açıkken scroll engelle
  useEffect(() => {
    if (mobilMenuAcik) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobilMenuAcik]);

  return (
    <>
      {/* MASAÜSTÜ NAVBAR */}
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

      {/* MOBİL OVERLAY MENÜ */}
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
                        if (hasDropdown) {
                          setMobilAltAcik(mobilAltAcik === kat.slug ? null : kat.slug);
                        }
                        handleKatClick(null, kat.slug);
                      }}
                    >
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

      {/* MOBİL ALT NAV */}
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
