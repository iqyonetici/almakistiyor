import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { adminMi } from "../lib/kategoriDB";
import { paketleriGetir } from "../lib/adminDB";
import { kullaniciHaklari, bugunkuIlanSayisi, bugunkuMesajSayisi } from "../lib/limitDB";
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

export default function Navbar({ activeCategory, onCategoryChange, onIlanVer, kategoriAgaci, onArama }) {
  const router = useRouter();
  const { user, cikisYap } = useAuth();
  const isAnasayfa = router.pathname === "/";
  const [mobilMenuAcik, setMobilMenuAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');
  const aramaRef = useRef(null);
  const aramaGonder = useCallback((deger) => {
    setAramaMetni(deger);
    onArama && onArama(deger);
  }, [onArama]);

  const [drawerModu, setDrawerModu] = useState("kategori"); // "kategori" | "profil"
  const [profilAcik, setProfilAcik] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [paketModal, setPaketModal] = useState(false);
  const [paketBilgi, setPaketBilgi] = useState(null);
  const [tumPaketler, setTumPaketler] = useState([]); const [okunmamisMesaj, setOkunmamisMesaj] = useState(0); useEffect(() => { let aktif = true; async function mesajSay() { if (!user?.email) { setOkunmamisMesaj(0); return; } try { const { supabase } = await import('../lib/supabase'); if (!supabase) return; const { data: a } = await supabase.from('konusmalar').select('okunmamis_alici').eq('alici_email', user.email); const { data: s } = await supabase.from('konusmalar').select('okunmamis_satici').eq('satici_email', user.email); const toplam = (a||[]).reduce((t,k)=>t+(k.okunmamis_alici||0),0) + (s||[]).reduce((t,k)=>t+(k.okunmamis_satici||0),0); if (aktif) setOkunmamisMesaj(toplam); } catch (e) {} } mesajSay(); const zamanlayici = setInterval(mesajSay, 60000); return () => { aktif = false; clearInterval(zamanlayici); }; }, [user]);

  useEffect(() => {
    if (user?.email) adminMi(user.email).then(setAdmin);
    else setAdmin(false);
  }, [user]);

  // Paket detay modalını aç — kalan hakları hesapla
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
      // URL güncellemesi artık index.js içindeki handleKatChange tarafından yapılıyor
      // (state + URL tek kaynaktan yönetiliyor, burada ayrıca router.push/replace yapmıyoruz)
      onCategoryChange(slug);
      setTimeout(() => {
        document.getElementById("ilan-listesi")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      router.push(`/?kategori=${slug}`);
    }
  };

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

            {/* Arama + İlan Ver — sadece masaüstü */}
            <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,maxWidth:680,margin:'0 12px'}} className="ak-desktop-only">
              <div style={{flex:1,maxWidth:420,position:'relative'}}>
                <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:'#9ca3af',fontSize:15}}>🔍</span>
                <input
                  ref={aramaRef}
                  type="text"
                  value={aramaMetni}
                  onChange={e => aramaGonder(e.target.value)}
                  placeholder="İlan ara: kategori, şehir veya açıklama..."
                  style={{width:'100%',boxSizing:'border-box',padding:'9px 36px 9px 36px',fontSize:13,border:'1.5px solid #e0e0e0',borderRadius:8,outline:'none',background:'#f9f9f9',color:'#111',transition:'border-color .15s'}}
                  onFocus={e=>e.target.style.borderColor='#0D7A6B'}
                  onBlur={e=>e.target.style.borderColor='#e0e0e0'}
                />
                {aramaMetni && (
                  <button onClick={() => aramaGonder('')}
                    style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#9ca3af',fontSize:16,lineHeight:1,padding:2}}>✕</button>
                )}
              </div>
              <button
                onClick={() => onIlanVer ? onIlanVer() : null}
                style={{whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:6,background:'#F5A623',color:'#7a4d00',border:'none',borderRadius:8,padding:'9px 16px',fontSize:13,fontWeight:700,cursor:'pointer',flexShrink:0}}>
                + Ücretsiz Alım İlanı Ver
              </button>
            </div>
            <style>{`.ak-desktop-only{display:flex}@media(max-width:768px){.ak-desktop-only{display:none!important}}`}</style>

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
                          <button className={styles.profilPaket} onClick={paketDetayAc} style={{cursor:'pointer',border:'none',width:'calc(100% - 24px)'}}>
                            💎 {user.paket.toUpperCase()} üye — detaylar ›
                          </button>
                        ) : (
                          <button className={styles.profilProCta} onClick={paketDetayAc} style={{cursor:'pointer',border:'1px solid #FDE68A',width:'calc(100% - 24px)'}}>⭐ Pro üyeliğe geç</button>
                        )}
                        <div className={styles.profilGrup}>
                          <Link href="/panel" className={styles.profilLink} onClick={() => setProfilAcik(false)}>📋 İlanlarım</Link>
                          <Link href="/panel?tab=mesajlar" className={styles.profilLink} onClick={() => setProfilAcik(false)}>💬 Mesajlarım{okunmamisMesaj > 0 && <span style={{marginLeft:6,background:'#E53E3E',color:'white',borderRadius:10,padding:'1px 7px',fontSize:11,fontWeight:700}}>{okunmamisMesaj}</span>}</Link>
                        </div>
                        <div className={styles.profilGrup}>
                          <Link href="/ayarlar" className={styles.profilLink} onClick={() => setProfilAcik(false)}>⚙️ Hesap Ayarları</Link>
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
          <div className={styles.drawer} onClick={e => e.stopPropagation()}
            style={drawerModu === "profil" ? { position: "fixed", top: 0, right: 0, bottom: 0, left: "auto", width: "min(86vw, 340px)", maxWidth: 340, height: "100%", maxHeight: "100%", margin: 0, borderRadius: "16px 0 0 16px", overflowY: "auto" } : undefined}>
            <div className={styles.drawerHeader}>
              <div className={styles.logo}>
                <img src="/almakistiyor-icon.png" alt="almakistiyor.com" className={styles.logoIconImg} width="36" height="36" />
                <span style={{fontSize:16,fontWeight:600,color:'#1a1d23'}}><strong>almak</strong> istiyor</span>
              </div>
              <button className={styles.drawerKapat} onClick={() => setMobilMenuAcik(false)}>✕</button>
            </div>
            {drawerModu === "kategori" && (
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
                        <span style={{ fontSize: 11, color: "#8a95a3", transform: mobilAltAcik === kat.slug ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform 0.2s" }}>▼</span>
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
                                  <span style={{ fontSize: 10, color: "#8a95a3", transform: mobilAltAcik2 === alt.slug ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform 0.2s", float: "right" }}>▼</span>
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
            )}
            <div className={styles.drawerFooter} style={drawerModu === "profil" ? { marginTop: 0, flex: 1, borderTop: "none" } : undefined}>
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
                  <Link href="/panel?tab=mesajlar" className={styles.drawerProfilLink} onClick={() => setMobilMenuAcik(false)}>💬 Mesajlarım{okunmamisMesaj > 0 && <span style={{marginLeft:6,background:'#E53E3E',color:'white',borderRadius:10,padding:'1px 7px',fontSize:11,fontWeight:700}}>{okunmamisMesaj}</span>}</Link>
                  <Link href="/ayarlar" className={styles.drawerProfilLink} onClick={() => setMobilMenuAcik(false)}>⚙️ Hesap Ayarları</Link>
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
        <button className={styles.navItem} onClick={() => { setDrawerModu("kategori"); setMobilMenuAcik(true); }}>
          <span className={styles.navIcon}>☰</span>
          <span className={styles.navLabel}>Kategoriler</span>
        </button>
        <button className={styles.navItemAdd} onClick={() => onIlanVer ? onIlanVer() : router.push("/")}>
          <span className={styles.addCircle}>+</span>
          <span className={styles.navLabel}>İlan Ver</span>
        </button>
        <Link href="/panel?tab=mesajlar" className={styles.navItem}>
          <span className={styles.navIcon}>💬</span>
          <span className={styles.navLabel}>Mesajlar</span>{okunmamisMesaj > 0 && <span style={{marginLeft:4,background:'#E53E3E',color:'white',borderRadius:9,padding:'0 6px',fontSize:10,fontWeight:700}}>{okunmamisMesaj}</span>}
        </Link>
        {user ? (
          <button className={styles.navItem} onClick={() => { setDrawerModu("profil"); setMobilMenuAcik(true); }}>
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

      {/* PAKET DETAY MODALI */}
      {paketModal && (
        <div className={styles.paketModalArka} onClick={(e) => e.target === e.currentTarget && setPaketModal(false)}>
          <div className={styles.paketModalKutu}>
            <button className={styles.paketModalKapat} onClick={() => setPaketModal(false)}>✕</button>
            {!paketBilgi ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#8a95a3' }}>Yükleniyor...</div>
            ) : (
              <>
                <div className={styles.paketModalBaslik}>
                  {paketBilgi.paket === 'ucretsiz' ? '🆓' : '💎'} {paketBilgi.paket.toUpperCase()} Üyelik
                </div>

                {/* Kalan haklar */}
                <div className={styles.paketModalAltBaslik}>Bugünkü kalan haklarınız</div>
                <div className={styles.haklarGrid}>
                  <div className={styles.hakKart}>
                    <div className={styles.hakSayi}>{paketBilgi.gunlukIlan >= 999 ? '∞' : paketBilgi.kalanIlan}</div>
                    <div className={styles.hakLabel}>İlan hakkı</div>
                    <div className={styles.hakAlt}>{paketBilgi.gunlukIlan >= 999 ? 'Sınırsız' : `Günlük ${paketBilgi.gunlukIlan} hakkın ${paketBilgi.kalanIlan} tanesi kaldı`}</div>
                  </div>
                  <div className={styles.hakKart}>
                    <div className={styles.hakSayi}>{paketBilgi.gunlukMesaj >= 999 ? '∞' : paketBilgi.kalanMesaj}</div>
                    <div className={styles.hakLabel}>Mesaj hakkı</div>
                    <div className={styles.hakAlt}>{paketBilgi.gunlukMesaj >= 999 ? 'Sınırsız' : `Günlük ${paketBilgi.gunlukMesaj} hakkın ${paketBilgi.kalanMesaj} tanesi kaldı`}</div>
                  </div>
                </div>

                {/* Bu paketin özellikleri */}
                <div className={styles.paketModalAltBaslik}>Üyelik özellikleriniz</div>
                <ul className={styles.modalOzellikListe}>
                  <li>✅ Günde {paketBilgi.gunlukIlan >= 999 ? 'sınırsız' : paketBilgi.gunlukIlan} ilan</li>
                  <li>✅ Günde {paketBilgi.gunlukMesaj >= 999 ? 'sınırsız' : paketBilgi.gunlukMesaj} mesaj</li>
                  <li>{paketBilgi.telefonGoster ? '✅ Telefon numarası görüntüleme' : '❌ Telefon görüntüleme (Pro\'da var)'}</li>
                </ul>

                {/* Diğer paketler */}
                <div className={styles.paketModalAltBaslik}>Diğer üyelikler</div>
                <div className={styles.digerPaketler}>
                  {tumPaketler.filter(p => p.kod !== paketBilgi.paket).map(p => (
                    <div key={p.kod} className={styles.digerPaketKart}>
                      <div>
                        <div className={styles.digerPaketAd} style={{color: p.renk || '#0D7A6B'}}>{p.ad}</div>
                        <div className={styles.digerPaketLimit}>
                          {p.gunluk_ilan >= 999 ? '∞' : p.gunluk_ilan} ilan • {p.gunluk_mesaj >= 999 ? '∞' : p.gunluk_mesaj} mesaj / gün
                        </div>
                      </div>
                      <div className={styles.digerPaketFiyat}>
                        {Number(p.fiyat) === 0 ? 'Ücretsiz' : `${Number(p.fiyat).toLocaleString('tr-TR')} ₺/ay`}
                      </div>
                    </div>
                  ))}
                </div>

                <Link href="/pro" className={styles.modalProBtn} onClick={() => setPaketModal(false)}>
                  Tüm paketleri karşılaştır →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
