import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./Navbar.module.css";

export const kategoriler = [
  { label: "Tümü", slug: "", icon: "🔍" },
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

export default function Navbar({ activeCategory, onCategoryChange, onIlanVer }) {
  const router = useRouter();
  const isAnasayfa = router.pathname === "/";

  const [acikMenu, setAcikMenu] = useState(null);
  const [mobilAcik, setMobilAcik] = useState(false);
  const [mobilAltAcik, setMobilAltAcik] = useState(null);
  const timeoutRef = useRef(null);

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

  // Kategori tıklaması — anasayfadaysa filtrele, değilse anasayfaya git
  const handleKatClick = (e, slug) => {
    e.preventDefault();
    setAcikMenu(null);
    setMobilAcik(false);

    if (isAnasayfa && onCategoryChange) {
      onCategoryChange(slug);
      // İlan listesine scroll
      setTimeout(() => {
        const el = document.getElementById("ilan-listesi");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      // Başka sayfadaysa anasayfaya git ve kategoriyi hash ile taşı
      router.push(`/?kategori=${slug}`);
    }
  };

  // Anasayfaya döndükten sonra URL'deki ?kategori= param'ını yakala
  useEffect(() => {
    if (isAnasayfa && router.query.kategori !== undefined && onCategoryChange) {
      onCategoryChange(router.query.kategori);
      router.replace("/", undefined, { shallow: true });
    }
  }, [router.query.kategori]);

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
            <button className={styles.btnIlan} onClick={() => onIlanVer ? onIlanVer() : router.push("/")}>
              + Almak İstiyorum
            </button>
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
            const isAktif = (activeCategory ?? "") === kat.slug;
            const hasDropdown = kat.altkategoriler && kat.altkategoriler.length > 0;

            return (
              <div
                key={kat.slug}
                className={styles.catItem}
                onMouseEnter={() => hasDropdown && handleMouseEnter(kat.slug)}
                onMouseLeave={handleMouseLeave}
              >
                <a
                  href={kat.slug === "" ? "/" : `/?kategori=${kat.slug}`}
                  className={`${styles.catLink} ${isAktif ? styles.catLinkActive : ""}`}
                  onClick={(e) => handleKatClick(e, kat.slug)}
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
                </a>

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
                            href={`/?kategori=${alt.slug}`}
                            className={`${styles.dropdownItem} ${activeCategory === alt.slug ? styles.dropdownItemActive : ""}`}
                            onClick={(e) => handleKatClick(e, alt.slug)}
                          >
                            {alt.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={`/?kategori=${kat.slug}`}
                      className={styles.dropdownTumu}
                      onClick={(e) => handleKatClick(e, kat.slug)}
                    >
                      Tümünü Gör →
                    </a>
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
              const isAktif = (activeCategory ?? "") === kat.slug;
              return (
                <div key={kat.slug} className={styles.mobilKatItem}>
                  <button
                    className={`${styles.mobilKatBtn} ${isAktif ? styles.mobilKatBtnAktif : ""}`}
                    onClick={() => {
                      if (hasDropdown) {
                        setMobilAltAcik(mobilAltAcik === kat.slug ? null : kat.slug);
                      }
                      handleKatClick({ preventDefault: () => {} }, kat.slug);
                    }}
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
                        <button
                          key={alt.slug}
                          className={`${styles.mobilAltKatLink} ${activeCategory === alt.slug ? styles.mobilAltKatLinkAktif : ""}`}
                          onClick={() => {
                            handleKatClick({ preventDefault: () => {} }, alt.slug);
                            setMobilAcik(false);
                          }}
                        >
                          {alt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className={styles.mobilAuthBtnler}>
              <button className={styles.btnIlan} onClick={() => { setMobilAcik(false); onIlanVer?.(); }}>
                + Almak İstiyorum
              </button>
              <Link href="/giris" className={styles.btnGiris} onClick={() => setMobilAcik(false)}>Giriş</Link>
              <Link href="/kayit" className={styles.btnKayit} onClick={() => setMobilAcik(false)}>Üye Ol</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
