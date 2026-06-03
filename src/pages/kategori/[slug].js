import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import styles from "./[slug].module.css";

// Gerçek Supabase kategori/alt_kategori değerleriyle eşleştirilmiş menü
const kategoriHaritasi = {
  emlak: {
    label: "Emlak", icon: "🏠",
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
  vasita: {
    label: "Vasıta", icon: "🚗",
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
  "yedek-parca": {
    label: "Yedek Parça & Aksesuar", icon: "🔧",
    altkategoriler: [],
  },
  alisveris: {
    label: "Alışveriş", icon: "🛍️",
    altkategoriler: [],
  },
  "is-makineleri": {
    label: "İş Makineleri & Sanayi", icon: "🏭",
    altkategoriler: [],
  },
  hizmetler: {
    label: "Hizmetler", icon: "🔨",
    altkategoriler: [],
  },
  "ozel-ders": {
    label: "Özel Ders", icon: "📚",
    altkategoriler: [],
  },
  "is-ilanlari": {
    label: "İş İlanları", icon: "💼",
    altkategoriler: [],
  },
  hayvanlar: {
    label: "Hayvanlar", icon: "🐾",
    altkategoriler: [],
  },
};

export default function KategoriSayfasi({ ilanlar, kategoriSlug }) {
  const router = useRouter();
  const kategori = kategoriHaritasi[kategoriSlug];

  // URL'de hash varsa o bölüme scroll et
  useEffect(() => {
    if (router.asPath.includes("#")) {
      const hash = router.asPath.split("#")[1];
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 115;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }, 200);
    }
  }, [router.asPath]);

  if (!kategori) {
    return (
      <div className={styles.notFound}>
        <h1>Kategori bulunamadı</h1>
        <Link href="/">Ana Sayfaya Dön</Link>
      </div>
    );
  }

  // İlanları alt_kategori kolonuna göre grupla
  const gruplar = {};
  if (kategori.altkategoriler.length > 0) {
    kategori.altkategoriler.forEach((alt) => {
      gruplar[alt.slug] = {
        ...alt,
        ilanlar: ilanlar.filter((i) => i.alt_kategori === alt.slug),
      };
    });
  }

  return (
    <>
      <Head>
        <title>{kategori.icon} {kategori.label} İlanları | Almak İstiyor</title>
        <meta name="description" content={`${kategori.label} kategorisindeki ${ilanlar.length} ilan`} />
      </Head>

      <main className={styles.main}>
        {/* Sayfa başlığı */}
        <div className={styles.baslik}>
          <h1 className={styles.baslikH1}>
            <span className={styles.baslikIcon}>{kategori.icon}</span>
            {kategori.label}
          </h1>
          <p className={styles.baslikAlt}>{ilanlar.length} ilan listeleniyor</p>
        </div>

        {/* Alt kategori hızlı nav — sadece alt kategorisi olanlarda */}
        {kategori.altkategoriler.length > 0 && (
          <div className={styles.hizliNav}>
            {kategori.altkategoriler.map((alt) => (
              <a
                key={alt.slug}
                href={`#${alt.slug}`}
                className={styles.hizliNavItem}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(alt.slug);
                  if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY - 115;
                    window.scrollTo({ top, behavior: "smooth" });
                  }
                }}
              >
                {alt.label}
                <span className={styles.hizliNavSayi}>
                  {gruplar[alt.slug]?.ilanlar?.length || 0}
                </span>
              </a>
            ))}
          </div>
        )}

        {/* İlan grupları */}
        {kategori.altkategoriler.length > 0 ? (
          <div className={styles.gruplar}>
            {kategori.altkategoriler.map((alt) => {
              const grup = gruplar[alt.slug];
              return (
                <section key={alt.slug} id={alt.slug} className={styles.grup}>
                  <div className={styles.grupBaslik}>
                    <h2 className={styles.grupH2}>{alt.label}</h2>
                    <span className={styles.grupSayi}>{grup.ilanlar.length} ilan</span>
                  </div>

                  {grup.ilanlar.length > 0 ? (
                    <div className={styles.ilanGrid}>
                      {grup.ilanlar.map((ilan) => (
                        <IlanKart key={ilan.id} ilan={ilan} />
                      ))}
                    </div>
                  ) : (
                    <div className={styles.bosGrup}>
                      <p>Bu alt kategoride henüz ilan yok.</p>
                      <Link href="/ilan-ver" className={styles.ilanVerBtn}>
                        İlk İlanı Sen Ver →
                      </Link>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          // Alt kategorisi olmayan kategoriler — düz grid
          <>
            {ilanlar.length > 0 ? (
              <div className={styles.ilanGrid}>
                {ilanlar.map((ilan) => (
                  <IlanKart key={ilan.id} ilan={ilan} />
                ))}
              </div>
            ) : (
              <div className={styles.bosKategori}>
                <div className={styles.bosIkon}>{kategori.icon}</div>
                <h2>Henüz ilan yok</h2>
                <p>Bu kategoride henüz ilan bulunmuyor.</p>
                <Link href="/ilan-ver" className={styles.ilanVerBtnBuyuk}>
                  + Almak İstiyorum
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

// ─── İlan Kartı ───────────────────────────────────────────────
function IlanKart({ ilan }) {
  const fiyatMetni = () => {
    if (ilan.fiyat_min && ilan.fiyat_max)
      return `${Number(ilan.fiyat_min).toLocaleString("tr-TR")} – ${Number(ilan.fiyat_max).toLocaleString("tr-TR")} ₺`;
    if (ilan.fiyat_min)
      return `${Number(ilan.fiyat_min).toLocaleString("tr-TR")} ₺ +`;
    if (ilan.fiyat_max)
      return `Max ${Number(ilan.fiyat_max).toLocaleString("tr-TR")} ₺`;
    return null;
  };

  return (
    <Link href={`/ilan/${ilan.id}`} className={styles.ilanKart}>
      {ilan.islem_turu && (
        <span className={`${styles.ilanBadge} ${ilan.islem_turu === "kirala" ? styles.badgeKirala : styles.badgeSatin}`}>
          {ilan.islem_turu === "kirala" ? "Kiralık" : "Satılık"}
        </span>
      )}

      <div className={styles.ilanBaslik}>
        {ilan.kullanici_ad
          ? `${ilan.kullanici_ad} ${ilan.kullanici_soyad || ""}`.trim()
          : "İlan"}
      </div>

      {ilan.aciklama && (
        <p className={styles.ilanAciklama}>
          {ilan.aciklama.length > 90
            ? ilan.aciklama.slice(0, 90) + "…"
            : ilan.aciklama}
        </p>
      )}

      <div className={styles.ilanDetaylar}>
        {ilan.sehir && (
          <span className={styles.ilanDetay}>📍 {ilan.sehir}{ilan.ilce ? ` / ${ilan.ilce}` : ""}</span>
        )}
        {fiyatMetni() && (
          <span className={styles.ilanFiyat}>{fiyatMetni()}</span>
        )}
      </div>

      <div className={styles.ilanAlt}>
        {ilan.created_at && (
          <span className={styles.ilanTarih}>
            {new Date(ilan.created_at).toLocaleDateString("tr-TR")}
          </span>
        )}
        {ilan.goruntuleme > 0 && (
          <span className={styles.ilanGoruntulenme}>👁 {ilan.goruntuleme}</span>
        )}
      </div>
    </Link>
  );
}

// ─── Veri Çekme ───────────────────────────────────────────────
export async function getServerSideProps(context) {
  const { slug } = context.params;

  // Geçerli kategori mi?
  if (!kategoriHaritasi[slug]) {
    return { props: { ilanlar: [], kategoriSlug: slug } };
  }

  const { data, error } = await supabase
    .from("ilanlar")
    .select("id, created_at, kullanici_ad, kullanici_soyad, kategori, alt_kategori, islem_turu, sehir, ilce, fiyat_min, fiyat_max, aciklama, durum, goruntuleme")
    .eq("kategori", slug)
    .eq("durum", "aktif")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Supabase hata:", error.message);
    return { props: { ilanlar: [], kategoriSlug: slug } };
  }

  return {
    props: {
      ilanlar: data || [],
      kategoriSlug: slug,
    },
  };
}
