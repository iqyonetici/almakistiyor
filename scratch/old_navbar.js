import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { adminMi } from "../lib/kategoriDB";
import { paketleriGetir } from "../lib/adminDB";
import { kullaniciHaklari, bugunkuIlanSayisi, bugunkuMesajSayisi } from "../lib/limitDB";
import styles from "./Navbar.module.css";

// DB'deki ger├ğek kategorilerle uyumlu
export const kategoriler = [
  { label: "T├╝m├╝", slug: "", icon: "­şöı" },
  { label: "Emlak", slug: "emlak", icon: "­şÅá", altkategoriler: [
    { label: "Konut", slug: "emlak-konut" },
    { label: "─░┼ş Yeri", slug: "emlak-isyeri" },
    { label: "Arsa", slug: "emlak-arsa" },
    { label: "Bina", slug: "bina" },
  ]},
  { label: "Vas─▒ta", slug: "vasita", icon: "­şÜù", altkategoriler: [
    { label: "Otomobil", slug: "otomobil" },
    { label: "Arazi & SUV", slug: "arazi-suv" },
    { label: "Motosiklet", slug: "motosiklet" },
    { label: "Minivan", slug: "minivan" },
    { label: "Ticari", slug: "ticari" },
  ]},
  { label: "Al─▒┼şveri┼ş", slug: "alisveris", icon: "­şøı´©Å", altkategoriler: [
    { label: "Bilgisayar", slug: "bilgisayar" },
    { label: "Cep Telefonu", slug: "cep-telefonu" },
    { label: "Ev Aletleri", slug: "ev-aletleri" },
    { label: "Ev & Dekorasyon", slug: "ev-dekorasyon" },
    { label: "Hobi", slug: "hobi" },
    { label: "Spor", slug: "spor" },
  ]},
  { label: "─░┼ş Makineleri", slug: "is-makineleri", icon: "­şÅ¡", altkategoriler: [
    { label: "─░┼ş Makineleri", slug: "is-makineleri-alt" },
    { label: "Sanayi", slug: "sanayi-alt" },
    { label: "Tar─▒m", slug: "tarim" },
  ]},
  { label: "Hayvanlar", slug: "hayvanlar", icon: "­şÉ¥", altkategoriler: [
    { label: "Evcil", slug: "evcil" },
    { label: "K├╝├ğ├╝kba┼ş", slug: "kucukbas" },
    { label: "K├╝mes", slug: "kumes" },
  ]},
  { label: "Yedek Par├ğa", slug: "yedek-parca", icon: "­şöğ", altkategoriler: [] },
  { label: "Hizmetler", slug: "hizmetler", icon: "­şö¿", altkategoriler: [] },
  { label: "├ûzel Ders", slug: "ozel-ders", icon: "­şôÜ", altkategoriler: [] },
  { label: "─░┼ş ─░lanlar─▒", slug: "is-ilanlari", icon: "­şÆ╝", altkategoriler: [] },
];

export default function Navbar({ activeCategory, onCategoryChange, onIlanVer, kategoriAgaci }) {
  const router = useRouter();
  const { user, cikisYap } = useAuth();
  const isAnasayfa = router.pathname === "/";
  const [mobilMenuAcik, setMobilMenuAcik] = useState(false);
  const [profilAcik, setProfilAcik] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [paketModal, setPaketModal] = useState(false);
  const [paketBilgi, setPaketBilgi] = useState(null);
  const [tumPaketler, setTumPaketler] = useState([]); const [okunmamisMesaj, setOkunmamisMesaj] = useState(0); useEffect(() => { let aktif = true; async function mesajSay() { if (!user?.email) { setOkunmamisMesaj(0); return; } try { const { supabase } = await import('../lib/supabase'); if (!supabase) return; const { data: a } = await supabase.from('konusmalar').select('okunmamis_alici').eq('alici_email', user.email); const { data: s } = await supabase.from('konusmalar').select('okunmamis_satici').eq('satici_email', user.email); const toplam = (a||[]).reduce((t,k)=>t+(k.okunmamis_alici||0),0) + (s||[]).reduce((t,k)=>t+(k.okunmamis_satici||0),0); if (aktif) setOkunmamisMesaj(toplam); } catch (e) {} } mesajSay(); const zamanlayici = setInterval(mesajSay, 60000); return () => { aktif = false; clearInterval(zamanlayici); }; }, [user]);

  useEffect(() => {
    if (user?.email) adminMi(user.email).then(setAdmin);
    else setAdmin(false);
  }, [user]);

  // Paket detay modal─▒n─▒ a├ğ ÔÇö kalan haklar─▒ hesapla
  async function paketDetayAc() {
    setProfilAcik(false);
    setPaketModal(true);
    const [haklar, ilanKul, mesajKul, paketler] = await Promise.all([
      kullaniciHaklari(user.email),
      bugunkuIlanSayisi(user.email),
      bugunkuMesajSayisi(user.email),
      paketleriGetir(),
    ]);
    setPaketBilgi({
      paket: haklar.paket,
      gunlukIlan: haklar.gunlukIlan,
      gunlukMesaj: haklar.gunlukMesaj,
      kalanIlan: Math.max(0, haklar.gunlukIlan - ilanKul),
      kalanMesaj: Math.max(0, haklar.gunlukMesaj - mesajKul),
      telefonGoster: haklar.telefonGoster,
    });
    setTumPaketler((paketler || []).filter(p => p.aktif !== false));
  }

  async function handleCikis() {
    setProfilAcik(false);
    await cikisYap();
    router.push("/");
  }
  const [mobilAltAcik, setMobilAltAcik] = useState(null);
  const [mobilAltAcik2, setMobilAltAcik2] = useState(null);

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

            {/* Kategori men├╝s├╝ (masa├╝st├╝) */}
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
                    <span className={styles.profilAd}>Merhaba, {user.ad || "Kullan─▒c─▒"}</span>
                    <span className={styles.profilOk}>Ôû¥</span>
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
                          <button className={styles.profilPaket} onClick={paketDetayAc} style={{cursor:'pointer',border:'none',width:'calc(100% - 24px)'}}>
                            ­şÆÄ {user.paket.toUpperCase()} ├╝ye ÔÇö detaylar ÔÇ║
                          </button>
                        ) : (
                          <button className={styles.profilProCta} onClick={paketDetayAc} style={{cursor:'pointer',border:'1px solid #FDE68A',width:'calc(100% - 24px)'}}>Ô¡É Pro ├╝yeli─şe ge├ğ</button>
                        )}
                        <div className={styles.profilGrup}>
                          <Link href="/panel" className={styles.profilLink} onClick={() => setProfilAcik(false)}>­şôï ─░lanlar─▒m</Link>
                          <Link href="/panel?tab=mesajlar" className={styles.profilLink} onClick={() => setProfilAcik(false)}>­şÆ¼ Mesajlar─▒m{okunmamisMesaj > 0 && <span style={{marginLeft:6,background:'#E53E3E',color:'white',borderRadius:10,padding:'1px 7px',fontSize:11,fontWeight:700}}>{okunmamisMesaj}</span>}</Link>
                        </div>
                        <div className={styles.profilGrup}>
                          <Link href="/ayarlar" className={styles.profilLink} onClick={() => setProfilAcik(false)}>ÔÜÖ´©Å Hesap Ayarlar─▒</Link>
                          <Link href="/yardim" className={styles.profilLink} onClick={() => setProfilAcik(false)}>ÔØô Yard─▒m & Destek</Link>
                          {admin && <Link href="/admin" className={styles.profilLink} onClick={() => setProfilAcik(false)}>­şøá´©Å Admin Panel</Link>}
                        </div>
                        <button className={styles.profilCikis} onClick={handleCikis}>­şÜ¬ ├ç─▒k─▒┼ş Yap</button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/giris" className={styles.btnGiris}>Giri┼ş</Link>
                  <Link href="/kayit" className={styles.btnKayit}>├£ye Ol</Link>
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
              <button className={styles.drawerKapat} onClick={() => setMobilMenuAcik(false)}>Ô£ò</button>
            </div>
            <div className={styles.drawerKategoriler}>
              {(kategoriAgaci && kategoriAgaci.length ? kategoriAgaci : kategoriler).map((kat) => {
                const altlar = kat.altKategoriler || kat.altkategoriler || [];
                const hasDropdown = altlar.length > 0;
                const isAktif = (activeCategory ?? "") === kat.slug;
                return (
                  <div key={kat.slug}>
                    <button
                      className={`${styles.drawerKatBtn} ${isAktif ? styles.drawerKatAktif : ""}`}
                      onClick={() => {
                        if (hasDropdown) setMobilAltAcik(mobilAltAcik === kat.slug ? null : kat.slug);
                        else handleKatClick(null, kat.slug);
                      }}>
                      <span>{kat.icon} {kat.label}</span>
                      {hasDropdown && (
                        <span style={{ fontSize: 11, color: "#8a95a3", transform: mobilAltAcik === kat.slug ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform 0.2s" }}>Ôû╝</span>
                      )}
                    </button>
                    {hasDropdown && mobilAltAcik === kat.slug && (
                      <div className={styles.drawerAlt}>
                        {altlar.map(alt => {
                          const altAltlar = alt.altKategoriler || alt.altkategoriler || [];
                          const altHasDropdown = altAltlar.length > 0;
                          return (
                            <div key={alt.slug}>
                              <button
                                className={`${styles.drawerAltBtn} ${activeCategory === alt.slug ? styles.drawerAltAktif : ""}`}
                                onClick={() => {
                                  if (altHasDropdown) setMobilAltAcik2(mobilAltAcik2 === alt.slug ? null : alt.slug);
                                  else handleKatClick(null, alt.slug);
                                }}>
                                <span>{alt.label}</span>
                                {altHasDropdown && (
                                  <span style={{ fontSize: 10, color: "#8a95a3", transform: mobilAltAcik2 === alt.slug ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform 0.2s", float: "right" }}>Ôû╝</span>
                                )}
                              </button>
                              {altHasDropdown && mobilAltAcik2 === alt.slug && (
                                <div className={styles.drawerAlt2}>
                                  {altAltlar.map(alt2 => (
                                    <button key={alt2.slug}
                                      className={`${styles.drawerAltBtn} ${activeCategory === alt2.slug ? styles.drawerAltAktif : ""}`}
                                      style={{ paddingLeft: 24, fontSize: 13 }}
                                      onClick={() => handleKatClick(null, alt2.slug)}>
                                      {alt2.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
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
                  <Link href="/panel" className={styles.drawerProfilLink} onClick={() => setMobilMenuAcik(false)}>­şôï ─░lanlar─▒m</Link>
                  <Link href="/panel?tab=mesajlar" className={styles.drawerProfilLink} onClick={() => setMobilMenuAcik(false)}>­şÆ¼ Mesajlar─▒m{okunmamisMesaj > 0 && <span style={{marginLeft:6,background:'#E53E3E',color:'white',borderRadius:10,padding:'1px 7px',fontSize:11,fontWeight:700}}>{okunmamisMesaj}</span>}</Link>
                  <Link href="/ayarlar" className={styles.drawerProfilLink} onClick={() => setMobilMenuAcik(false)}>ÔÜÖ´©Å Hesap Ayarlar─▒</Link>
                  {admin && <Link href="/admin" className={styles.drawerProfilLink} onClick={() => setMobilMenuAcik(false)}>­şøá´©Å Admin Panel</Link>}
                  <button className={styles.drawerCikis} onClick={() => { setMobilMenuAcik(false); handleCikis(); }}>­şÜ¬ ├ç─▒k─▒┼ş Yap</button>
                </div>
              ) : (
                <>
                  <Link href="/giris" className={styles.drawerGiris} onClick={() => setMobilMenuAcik(false)}>Giri┼ş Yap</Link>
                  <Link href="/kayit" className={styles.drawerKayit} onClick={() => setMobilMenuAcik(false)}>├£ye Ol</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className={styles.bottomNav}>
        <button className={`${styles.navItem} ${isAnasayfa && !activeCategory ? styles.navAktif : ""}`}
          onClick={() => { if (isAnasayfa) { onCategoryChange?.(""); } else { router.push("/"); } }}>
          <span className={styles.navIcon}>­şÅá</span>
          <span className={styles.navLabel}>Ana Sayfa</span>
        </button>
        <button className={styles.navItem} onClick={() => setMobilMenuAcik(true)}>
          <span className={styles.navIcon}>Ôİ░</span>
          <span className={styles.navLabel}>Kategoriler</span>
        </button>
        <button className={styles.navItemAdd} onClick={() => onIlanVer ? onIlanVer() : router.push("/")}>
          <span className={styles.addCircle}>+</span>
          <span className={styles.navLabel}>─░lan Ver</span>
        </button>
        <Link href="/panel?tab=mesajlar" className={styles.navItem}>
          <span className={styles.navIcon}>­şÆ¼</span>
          <span className={styles.navLabel}>Mesajlar</span>{okunmamisMesaj > 0 && <span style={{marginLeft:4,background:'#E53E3E',color:'white',borderRadius:9,padding:'0 6px',fontSize:10,fontWeight:700}}>{okunmamisMesaj}</span>}
        </Link>
        {user ? (
          <button className={styles.navItem} onClick={() => setMobilMenuAcik(true)}>
            <span className={styles.navIcon}>­şæñ</span>
            <span className={styles.navLabel}>Profil</span>
          </button>
        ) : (
          <Link href="/giris" className={styles.navItem}>
            <span className={styles.navIcon}>­şæñ</span>
            <span className={styles.navLabel}>Giri┼ş</span>
          </Link>
        )}
      </nav>

      {/* PAKET DETAY MODALI */}
      {paketModal && (
        <div className={styles.paketModalArka} onClick={(e) => e.target === e.currentTarget && setPaketModal(false)}>
          <div className={styles.paketModalKutu}>
            <button className={styles.paketModalKapat} onClick={() => setPaketModal(false)}>Ô£ò</button>
            {!paketBilgi ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#8a95a3' }}>Y├╝kleniyor...</div>
            ) : (
              <>
                <div className={styles.paketModalBaslik}>
                  {paketBilgi.paket === 'ucretsiz' ? '­şåô' : '­şÆÄ'} {paketBilgi.paket.toUpperCase()} ├£yelik
                </div>

                {/* Kalan haklar */}
                <div className={styles.paketModalAltBaslik}>Bug├╝nk├╝ kalan haklar─▒n─▒z</div>
                <div className={styles.haklarGrid}>
                  <div className={styles.hakKart}>
                    <div className={styles.hakSayi}>{paketBilgi.gunlukIlan >= 999 ? 'ÔêŞ' : paketBilgi.kalanIlan}</div>
                    <div className={styles.hakLabel}>─░lan hakk─▒</div>
                    <div className={styles.hakAlt}>{paketBilgi.gunlukIlan >= 999 ? 'S─▒n─▒rs─▒z' : `G├╝nl├╝k ${paketBilgi.gunlukIlan} hakk─▒n ${paketBilgi.kalanIlan} tanesi kald─▒`}</div>
                  </div>
                  <div className={styles.hakKart}>
                    <div className={styles.hakSayi}>{paketBilgi.gunlukMesaj >= 999 ? 'ÔêŞ' : paketBilgi.kalanMesaj}</div>
                    <div className={styles.hakLabel}>Mesaj hakk─▒</div>
                    <div className={styles.hakAlt}>{paketBilgi.gunlukMesaj >= 999 ? 'S─▒n─▒rs─▒z' : `G├╝nl├╝k ${paketBilgi.gunlukMesaj} hakk─▒n ${paketBilgi.kalanMesaj} tanesi kald─▒`}</div>
                  </div>
                </div>

                {/* Bu paketin ├Âzellikleri */}
                <div className={styles.paketModalAltBaslik}>├£yelik ├Âzellikleriniz</div>
                <ul className={styles.modalOzellikListe}>
                  <li>Ô£à G├╝nde {paketBilgi.gunlukIlan >= 999 ? 's─▒n─▒rs─▒z' : paketBilgi.gunlukIlan} ilan</li>
                  <li>Ô£à G├╝nde {paketBilgi.gunlukMesaj >= 999 ? 's─▒n─▒rs─▒z' : paketBilgi.gunlukMesaj} mesaj</li>
                  <li>{paketBilgi.telefonGoster ? 'Ô£à Telefon numaras─▒ g├Âr├╝nt├╝leme' : 'ÔØî Telefon g├Âr├╝nt├╝leme (Pro\'da var)'}</li>
                </ul>

                {/* Di─şer paketler */}
                <div className={styles.paketModalAltBaslik}>Di─şer ├╝yelikler</div>
                <div className={styles.digerPaketler}>
                  {tumPaketler.filter(p => p.kod !== paketBilgi.paket).map(p => (
                    <div key={p.kod} className={styles.digerPaketKart}>
                      <div>
                        <div className={styles.digerPaketAd} style={{color: p.renk || '#0D7A6B'}}>{p.ad}</div>
                        <div className={styles.digerPaketLimit}>
                          {p.gunluk_ilan >= 999 ? 'ÔêŞ' : p.gunluk_ilan} ilan ÔÇó {p.gunluk_mesaj >= 999 ? 'ÔêŞ' : p.gunluk_mesaj} mesaj / g├╝n
                        </div>
                      </div>
                      <div className={styles.digerPaketFiyat}>
                        {Number(p.fiyat) === 0 ? '├£cretsiz' : `${Number(p.fiyat).toLocaleString('tr-TR')} Ôé║/ay`}
                      </div>
                    </div>
                  ))}
                </div>

                <Link href="/pro" className={styles.modalProBtn} onClick={() => setPaketModal(false)}>
                  T├╝m paketleri kar┼ş─▒la┼şt─▒r ÔåÆ
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
