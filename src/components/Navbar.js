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
    { label: "Turistik", slug: "emlak-turistik" },
  ]},
  { label: "Vasıta", slug: "vasita", icon: "🚗", altkategoriler: [
    { label: "Otomobil", slug: "otomobil" },
    { label: "Arazi / SUV", slug: "arazi-suv" },
    { label: "Elektrikli", slug: "elektrikli" },
    { label: "Motosiklet", slug: "motosiklet" },
    { label: "Minivan", slug: "minivan" },
    { label: "Ticari", slug: "ticari" },
    { label: "Deniz Taşıtı", slug: "deniz" },
    { label: "Karavan", slug: "karavan" },
    { label: "Klasik", slug: "klasik" },
    { label: "ATV / UTV", slug: "atv-utv" },
  ]},
  { label: "Yedek Parça", slug: "yedek-parca", icon: "🔧", altkategoriler: [] },
  { label: "Alışveriş", slug: "alisveris", icon: "🛍️", altkategoriler: [] },
  { label: "İş Makineleri", slug: "is-makineleri", icon: "🏭", altkategoriler: [] },
  { label: "Hizmetler", slug: "hizmetler", icon: "🔨", altkategoriler: [] },
  { label: "Özel Ders", slug: "ozel-ders", icon: "📚", altkategoriler: [] },
  { label: "İş İlanları", slug: "is-ilanlari", icon: "💼", altkategoriler: [] },
  { label: "Hayvanlar", slug: "hayvanlar", icon: "🐾", altkategoriler: [] },
];

export default function Navbar({ activeCategory, onCategoryChange, onIlanVer }) {
  const router = useRouter();
  const isAnasayfa = router.pathname === "/";
  const [mobilAcik, setMobilAcik] = useState(false);
  const [mobilAltAcik, setMobilAltAcik] = useState(null);

  const handleKatClick = (e, slug) => {
    e.preventDefault();
    setMobilAcik(false);
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

  return (
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
            <button className={styles.mobilHamburger} onClick={() => setMobilAcik(!mobilAcik)} aria-label="Menü">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </div>

      {mobilAcik && (
        <div className={styles.mobilMenu}>
          <div className={styles.mobilMenuIcin}>
            {kategoriler.map((kat) => {
              const hasDropdown = kat.altkategoriler?.length > 0;
              return (
                <div key={kat.slug} className={styles.mobilKatItem}>
                  <button
                    className={`${styles.mobilKatBtn} ${(activeCategory ?? "") === kat.slug ? styles.mobilKatBtnAktif : ""}`}
                    onClick={() => {
                      if (hasDropdown) setMobilAltAcik(mobilAltAcik === kat.slug ? null : kat.slug);
                      handleKatClick({ preventDefault: () => {} }, kat.slug);
                    }}
                  >
                    <span>{kat.icon} {kat.label}</span>
                    {hasDropdown && (
                      <svg width="10" height="6" viewBox="0 0 10 6"
                        style={{ transform: mobilAltAcik === kat.slug ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                        <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                  {hasDropdown && mobilAltAcik === kat.slug && (
                    <div className={styles.mobilAltKat}>
                      {kat.altkategoriler.map(alt => (
                        <button key={alt.slug}
                          className={`${styles.mobilAltKatLink} ${activeCategory === alt.slug ? styles.mobilAltKatLinkAktif : ""}`}
                          onClick={() => handleKatClick({ preventDefault: () => {} }, alt.slug)}>
                          {alt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div className={styles.mobilAuthBtnler}>
              <button className={styles.btnIlan} onClick={() => { setMobilAcik(false); onIlanVer?.(); }}>+ Almak İstiyorum</button>
              <Link href="/giris" className={styles.btnGiris} onClick={() => setMobilAcik(false)}>Giriş</Link>
              <Link href="/kayit" className={styles.btnKayit} onClick={() => setMobilAcik(false)}>Üye Ol</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
