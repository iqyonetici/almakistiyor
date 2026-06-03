import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./Navbar.module.css";

// Slug'lar Supabase'deki kategori + alt_kategori kolonlarıyla birebir eşleşiyor
export const kategoriler = [
  { label: "Tümü", slug: "tumu", icon: "🔍" },
  {
    label: "Emlak", slug: "emlak", icon: "🏠",
    altkategoriler: [
      { label: "Konut", slug: "emlak-konut" },
      { label: "İşyeri & Ofis", slug: "emlak-isyeri" },
      { label: "Arsa & Arazi", slug: "emlak-arsa" },
      { label: "Projeler", slug: "emlak-projeler" },
      { label: "Bina", slug: "bina" },
      { label: "Devre Mülk", slug: "devre-mulk" },
      { label: "Turistik", slug: "emlak-turistik" },
    ],
  },
  {
    label: "Vasıta", slug: "vasita", icon: "🚗",
    altkategoriler: [
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
    ],
  },
  {
    label: "Yedek Parça", slug: "yedek-parca", icon: "🔧",
    altkategoriler: [],
  },
  {
    label: "Alışveriş", slug: "alisveris", icon: "🛍️",
    altkategoriler: [],
  },
  {
    label: "İş Makineleri", slug: "is-makineleri", icon: "🏭",
    altkategoriler: [],
  },
  {
    label: "Hizmetler", slug: "hizmetler", icon: "🔨",
    altkategoriler: [],
  },
  {
    label: "Özel Ders", slug: "ozel-ders", icon: "📚",
    altkategoriler: [],
  },
  {
    label: "İş İlanları", slug: "is-ilanlari", icon: "💼",
    altkategoriler: [],
  },
  {
    label: "Hayvanlar", slug: "hayvanlar", icon: "🐾",
    altkategoriler: [],
  },
];

export default function Navbar() {
  const router = useRouter();
  const [acikMenu, setAcikMenu] = useState(null);
  const [mobilAcik, setMobilAcik] = useState(false);
  const [mobilAltAcik, setMobilAltAcik] = useState(null);
  const timeoutRef = useRef(null);

  const aktifSlug = router.query.slug || null;

  const handleMouseEnter = (slug) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAcikMenu(slug);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setAcikMenu(null), 180);
  };
  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  // Dropdown alt kategoriye tıklayınca → ilgili sayfaya git + o bölüme scroll
  const handleAltKatClick = (e, anaSlug, altSlug) => {
    e.preventDefault();
    setAcikMenu(null);
    setMobilAcik(false);

    const hedefUrl = `/kategori/${anaSlug}`;
    const scrollToSection = () => {
      setTimeout(() => {
        const el = document.getElementById(altSlug);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 115;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }, 150);
    };

    if (router.asPath.startsWith(hedefUrl)) {
      scrollToSection();
    } else {
      router.push(hedefUrl).then(scrollToSection);
    }
  };

  return (
    <header className={styles.header}>

      {/* ÜST BAR */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>✓</span>
            <span className={styles.logoText}><strong>almak</strong> istiyor</span>
          </Link>
          <div className={styles.topActions}>
            <Link href="/ilan-ver" className={styles.btnIlan}>+ Almak İstiyorum</Link>
            <Link href="/giris" className={styles.btnGiris}>Giriş</Link>
            <Link href="/kayit" className={styles.btnKayit}>Üye Ol</Link>
            <button
              className={styles.mobilHamburger}
              onClick={() => setMobilAcik(!mobilAcik)}
              aria-label="Menü"
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </div>

      {/* KATEGORİ BARI */}
      <nav className={styles.categoryBar}>
        <div className={styles.categoryBarInner}>
          {kategoriler.map((kat) => {
            const isAktif =
              aktifSlug === kat.slug || (!aktifSlug && kat.slug === "tumu");
            const hasDropdown = kat.altkategoriler && kat.altkategoriler.length > 0;

            return (
              <div
                key={kat.slug}
                className={styles.catItem}
                onMouseEnter={() => hasDropdown && handleMouseEnter(kat.slug)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={kat.slug === "tumu" ? "/" : `/kategori/${kat.slug}`}
                  className={`${styles.catLink} ${isAktif ? styles.catLinkActive : ""}`}
                >
                  <span className={styles.catIcon}>{kat.icon}</span>
                  <span className={styles.catLabel}>{kat.label}</span>
                  {hasDropdown && (
                    <svg
                      className={`${styles.catArrow} ${acikMenu === kat.slug ? styles.catArrowOpen : ""}`}
                      width="10" height="6" viewBox="0 0 10 6"
                    >
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                    </svg>
                  )}
                </Link>

                {/* DROPDOWN */}
                {hasDropdown && acikMenu === kat.slug && (
                  <div
                    className={styles.dropdown}
                    onMouseEnter={() => handleMouseEnter(kat.slug)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className={styles.dropdownHeader}>{kat.icon} {kat.label}</div>
                    <ul className={styles.dropdownList}>
                      {kat.altkategoriler.map((alt) => (
                        <li key={alt.slug}>
                          <a
                            href={`/kategori/${kat.slug}#${alt.slug}`}
                            className={styles.dropdownItem}
                            onClick={(e) => handleAltKatClick(e, kat.slug, alt.slug)}
                          >
                            {alt.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/kategori/${kat.slug}`}
                      className={styles.dropdownTumu}
                      onClick={() => setAcikMenu(null)}
                    >
                      Tümünü Gör →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* MOBİL MENÜ */}
      {mobilAcik && (
        <div className={styles.mobilMenu}>
          <div className={styles.mobilMenuIcin}>
            {kategoriler.map((kat) => {
              const hasDropdown = kat.altkategoriler && kat.altkategoriler.length > 0;
              return (
                <div key={kat.slug} className={styles.mobilKatItem}>
                  <button
                    className={styles.mobilKatBtn}
                    onClick={() =>
                      hasDropdown
                        ? setMobilAltAcik(mobilAltAcik === kat.slug ? null : kat.slug)
                        : router.push(kat.slug === "tumu" ? "/" : `/kategori/${kat.slug}`)
                    }
                  >
                    <span>{kat.icon} {kat.label}</span>
                    {hasDropdown && (
                      <svg width="10" height="6" viewBox="0 0 10 6"
                        style={{ transform: mobilAltAcik === kat.slug ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                      >
                        <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>

                  {hasDropdown && mobilAltAcik === kat.slug && (
                    <div className={styles.mobilAltKat}>
                      {kat.altkategoriler.map((alt) => (
                        <a
                          key={alt.slug}
                          href={`/kategori/${kat.slug}#${alt.slug}`}
                          className={styles.mobilAltKatLink}
                          onClick={(e) => handleAltKatClick(e, kat.slug, alt.slug)}
                        >
                          {alt.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className={styles.mobilAuthBtnler}>
              <Link href="/ilan-ver" className={styles.btnIlan} onClick={() => setMobilAcik(false)}>
                + Almak İstiyorum
              </Link>
              <Link href="/giris" className={styles.btnGiris} onClick={() => setMobilAcik(false)}>
                Giriş
              </Link>
              <Link href="/kayit" className={styles.btnKayit} onClick={() => setMobilAcik(false)}>
                Üye Ol
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
