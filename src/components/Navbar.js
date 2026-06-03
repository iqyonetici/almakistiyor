import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";

const kategoriler = [
  {
    label: "Tümü",
    slug: "tumu",
    icon: "🔍",
    alt: true,
    alt: true,
  },
  {
    label: "Emlak",
    slug: "emlak",
    icon: "🏠",
    alt: true,
    altkategoriler: [
      { label: "Kiralık Daire", slug: "kiralik-daire" },
      { label: "Satılık Daire", slug: "satilik-daire" },
      { label: "Kiralık Villa", slug: "kiralik-villa" },
      { label: "Satılık Villa", slug: "satilik-villa" },
      { label: "İşyeri / Ofis", slug: "isyeri-ofis" },
      { label: "Arsa / Arazi", slug: "arsa-arazi" },
    ],
  },
  {
    label: "Vasıta",
    slug: "vasita",
    icon: "🚗",
    altkategoriler: [
      { label: "Otomobil", slug: "otomobil" },
      { label: "Motosiklet", slug: "motosiklet" },
      { label: "Minivan / Panelvan", slug: "minivan" },
      { label: "Kamyon / Kamyonet", slug: "kamyon" },
      { label: "Tekne / Yat", slug: "tekne" },
      { label: "Karavan", slug: "karavan" },
    ],
  },
  {
    label: "Yedek Parça & Aksesuar",
    slug: "yedek-parca",
    icon: "🔧",
    altkategoriler: [
      { label: "Araç Yedek Parça", slug: "arac-yedek-parca" },
      { label: "Lastik & Jant", slug: "lastik-jant" },
      { label: "Akü & Elektrik", slug: "aku-elektrik" },
      { label: "Aksesuar", slug: "aksesuar" },
    ],
  },
  {
    label: "Alışveriş",
    slug: "alisveris",
    icon: "🛍️",
    altkategoriler: [
      { label: "Elektronik", slug: "elektronik" },
      { label: "Giyim & Moda", slug: "giyim" },
      { label: "Ev & Yaşam", slug: "ev-yasam" },
      { label: "Spor & Outdoor", slug: "spor" },
      { label: "Oyun & Hobi", slug: "oyun-hobi" },
      { label: "Bebek & Çocuk", slug: "bebek-cocuk" },
    ],
  },
  {
    label: "İş Makineleri & Sanayi",
    slug: "is-makineleri",
    icon: "🏭",
    altkategoriler: [
      { label: "İş Makinesi", slug: "is-makinesi" },
      { label: "Sanayi Ekipmanı", slug: "sanayi-ekipmani" },
      { label: "Tarım Makineleri", slug: "tarim" },
      { label: "Jeneratör & Enerji", slug: "jenerator" },
    ],
  },
  {
    label: "Hizmetler",
    slug: "hizmetler",
    icon: "🔨",
    altkategoriler: [
      { label: "Temizlik Hizmetleri", slug: "temizlik" },
      { label: "Nakliyat", slug: "nakliyat" },
      { label: "Tadilat & Tamirat", slug: "tadilat" },
      { label: "Eğitim & Özel Ders", slug: "egitim" },
      { label: "Güzellik & Bakım", slug: "guzellik" },
      { label: "Diğer Hizmetler", slug: "diger-hizmetler" },
    ],
  },
  {
    label: "Özel",
    slug: "ozel",
    icon: "⭐",
    altkategoriler: [
      { label: "Öne Çıkan İlanlar", slug: "one-cikan" },
      { label: "Premium İlanlar", slug: "premium" },
    ],
  },
];

export default function Navbar() {
  const [acikMenu, setAcikMenu] = useState(null);
  const [mobilAcik, setMobilAcik] = useState(false);
  const [mobilAltAcik, setMobilAltAcik] = useState(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = (slug) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAcikMenu(slug);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setAcikMenu(null), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <header className={styles.header}>
      {/* ÜST BAR: Logo + Auth */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>✓</span>
            <span className={styles.logoText}>
              <strong>almak</strong> istiyor
            </span>
          </Link>

          <div className={styles.topActions}>
            <Link href="/ilan-ver" className={styles.btnIlan}>
              + Almak İstiyorum
            </Link>
            <Link href="/giris" className={styles.btnGiris}>
              Giriş
            </Link>
            <Link href="/kayit" className={styles.btnKayit}>
              Üye Ol
            </Link>
            <button
              className={styles.mobilHamburger}
              onClick={() => setMobilAcik(!mobilAcik)}
              aria-label="Menüyü aç"
            >
              <span className={mobilAcik ? styles.hamburgerAcik : ""}></span>
              <span className={mobilAcik ? styles.hamburgerAcik : ""}></span>
              <span className={mobilAcik ? styles.hamburgerAcik : ""}></span>
            </button>
          </div>
        </div>
      </div>

      {/* ALT KATEGORİ BARI */}
      <nav className={styles.categoryBar}>
        <div className={styles.categoryBarInner}>
          {kategoriler.map((kat) => (
            <div
              key={kat.slug}
              className={styles.catItem}
              onMouseEnter={() =>
                kat.altkategoriler && handleMouseEnter(kat.slug)
              }
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href={`/kategori/${kat.slug}`}
                className={`${styles.catLink} ${
                  kat.slug === "tumu" ? styles.catLinkActive : ""
                }`}
              >
                <span className={styles.catIcon}>{kat.icon}</span>
                <span className={styles.catLabel}>{kat.label}</span>
                {kat.altkategoriler && (
                  <svg
                    className={styles.catArrow}
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                  >
                    <path
                      d="M1 1l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </Link>

              {/* Dropdown */}
              {kat.altkategoriler && acikMenu === kat.slug && (
                <div
                  className={styles.dropdown}
                  onMouseEnter={() => handleMouseEnter(kat.slug)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className={styles.dropdownHeader}>
                    <span>{kat.icon}</span> {kat.label}
                  </div>
                  <ul className={styles.dropdownList}>
                    {kat.altkategoriler.map((alt) => (
                      <li key={alt.slug}>
                        <Link
                          href={`/kategori/${kat.slug}/${alt.slug}`}
                          className={styles.dropdownItem}
                        >
                          {alt.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/kategori/${kat.slug}`}
                    className={styles.dropdownTumu}
                  >
                    Tümünü Gör →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* MOBİL MENÜ */}
      {mobilAcik && (
        <div className={styles.mobilMenu}>
          <div className={styles.mobilMenuIcin}>
            {kategoriler.map((kat) => (
              <div key={kat.slug} className={styles.mobilKatItem}>
                <button
                  className={styles.mobilKatBtn}
                  onClick={() =>
                    setMobilAltAcik(
                      mobilAltAcik === kat.slug ? null : kat.slug
                    )
                  }
                >
                  <span>
                    {kat.icon} {kat.label}
                  </span>
                  {kat.altkategoriler && (
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      style={{
                        transform:
                          mobilAltAcik === kat.slug
                            ? "rotate(180deg)"
                            : "none",
                        transition: "transform 0.2s",
                      }}
                    >
                      <path
                        d="M1 1l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
                {kat.altkategoriler && mobilAltAcik === kat.slug && (
                  <div className={styles.mobilAltKat}>
                    {kat.altkategoriler.map((alt) => (
                      <Link
                        key={alt.slug}
                        href={`/kategori/${kat.slug}/${alt.slug}`}
                        className={styles.mobilAltKatLink}
                        onClick={() => setMobilAcik(false)}
                      >
                        {alt.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className={styles.mobilAuthBtnler}>
              <Link
                href="/ilan-ver"
                className={styles.btnIlan}
                onClick={() => setMobilAcik(false)}
              >
                + Almak İstiyorum
              </Link>
              <Link
                href="/giris"
                className={styles.btnGiris}
                onClick={() => setMobilAcik(false)}
              >
                Giriş
              </Link>
              <Link
                href="/kayit"
                className={styles.btnKayit}
                onClick={() => setMobilAcik(false)}
              >
                Üye Ol
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
