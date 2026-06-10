import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import IlanForm from '../components/IlanForm'
import Footer from '../components/Footer'
import styles from './panel.module.css'
import { kullanicIlanlari, konusmalariGetir, konusmaMesajlariGetir, konusmaMesajGonder, konusmaOkunduIsaretle } from '../lib/db'

// Demo ilanlar — alici1@demo.com hesabına ait
const DEMO_TALEPLER = [
  {
    id: 1,
    baslik: 'Kadıköy veya Üsküdar\'da 3+1 kiralık daire arıyorum',
    kategori: 'Emlak', tarih: '3 gün önce', durum: 'aktif',
    goruntuleme: 47, mesajSayisi: 3,
    detay: 'Bütçe: ₺25.000 – ₺35.000 | 120–160 m² | Eşyalı tercih | Asansör, Otopark',
  },
  {
    id: 2,
    baslik: '2018–2022 model BMW veya Mercedes arıyorum',
    kategori: 'Vasıta', tarih: '7 gün önce', durum: 'aktif',
    goruntuleme: 89, mesajSayisi: 2,
    detay: 'Bütçe: ₺800.000 – ₺1.200.000 | 0–80.000 km | Otomatik | Benzin/Hybrid',
  },
  {
    id: 3,
    baslik: 'Beşiktaş\'ta 4+1 satılık daire',
    kategori: 'Emlak', tarih: '10 gün önce', durum: 'pasif',
    goruntuleme: 214, mesajSayisi: 1,
    detay: 'Bütçe: ₺8M – ₺15M | 150–250 m² | Yüksek kat | Deniz manzarası',
  },
]

// Demo mesajlar — ilan bazlı, satıcılardan geliyor
const DEMO_MESAJLAR = [
  {
    id: 1, ilanId: 1,
    gonderen: 'Emre Yıldız', firma: 'Yıldız Emlak & Danışmanlık',
    ilan: 'Kadıköy veya Üsküdar\'da 3+1 kiralık daire arıyorum',
    mesaj: 'Merhaba Mehmet Bey, Kadıköy Moda\'da tam aradığınız özelliklerde 140 m², 3+1, asansörlü ve otoparklı eşyalı bir dairemiz mevcut. Aylık kira 28.500₺. Uygun olur mu, görüşelim mi?',
    tarih: '2 saat önce', okundu: false,
    yanıtlar: [],
  },
  {
    id: 2, ilanId: 1,
    gonderen: 'Selin Aktaş', firma: 'Metropol Gayrimenkul',
    ilan: 'Kadıköy veya Üsküdar\'da 3+1 kiralık daire arıyorum',
    mesaj: 'İyi günler, Üsküdar Bağlarbaşı\'nda 125 m², 3+1, balkonlu ve eşyalı bir dairemiz var. Kira 26.000₺. Site içinde, 7/24 güvenlik mevcut. Görmek ister misiniz?',
    tarih: '1 gün önce', okundu: false,
    yanıtlar: [],
  },
  {
    id: 3, ilanId: 1,
    gonderen: 'Burak Demir', firma: 'Demir Oto Galerisi',
    ilan: 'Kadıköy veya Üsküdar\'da 3+1 kiralık daire arıyorum',
    mesaj: 'Selam, Kadıköy\'de yeni açılan projede güzel daireler var. 32.000₺\'den başlayan fiyatlarla. Biraz bütçeniz esnetilebilir mi, konuşalım.',
    tarih: '2 gün önce', okundu: true,
    yanıtlar: [],
  },
  {
    id: 4, ilanId: 2,
    gonderen: 'Burak Demir', firma: 'Demir Oto Galerisi',
    ilan: '2018–2022 model BMW veya Mercedes arıyorum',
    mesaj: 'Merhaba, galerimizde 2020 model BMW 320i M Sport paketi mevcut. 42.000 km, tek sahipli, boyasız kazasız. Fiyatımız 1.180.000₺. Hafta sonu test sürüşüne gelebilirsiniz.',
    tarih: '3 gün önce', okundu: true,
    yanıtlar: [{ metin: 'Merhaba Burak Bey, ilgileniyorum. Pazar günü saat 14:00 uygun mu?', tarih: '3 gün önce', benden: true }],
  },
  {
    id: 5, ilanId: 2,
    gonderen: 'Emre Yıldız', firma: 'Yıldız Emlak & Danışmanlık',
    ilan: '2018–2022 model BMW veya Mercedes arıyorum',
    mesaj: 'Merhaba, müşterimizde 2021 Mercedes C200 AMG Line var, 38.000 km, otomatik, gece mavisi. 1.150.000₺. İlgilenir misiniz?',
    tarih: '5 gün önce', okundu: true,
    yanıtlar: [],
  },
  {
    id: 6, ilanId: 3,
    gonderen: 'Selin Aktaş', firma: 'Metropol Gayrimenkul',
    ilan: 'Beşiktaş\'ta 4+1 satılık daire',
    mesaj: 'Beşiktaş Sinanpaşa\'da 12. katta, Boğaz manzaralı, 4+1, 210 m² dairemiz var. Tadilatlı, eşyasız. 13.500.000₺. Uygun mu?',
    tarih: '8 gün önce', okundu: true,
    yanıtlar: [],
  },
]

export default function Panel() {
  const { user, cikisYap, yuklendi } = useAuth()
  const router = useRouter()
  const [aktifTab, setAktifTab] = useState('talepler')
  const [formOpen, setFormOpen] = useState(false)
  const [talepler, setTalepler] = useState(DEMO_TALEPLER)
  const [konusmalar, setKonusmalar] = useState([]) // Gerçek konuşmalar
  const [seciliKonusma, setSeciliKonusma] = useState(null)
  const [konusmaMesajlar, setKonusmaMesajlar] = useState([]) // Seçili konuşmanın mesajları
  const [yanitMetni, setYanitMetni] = useState('')
  const [yanitGonderiliyor, setYanitGonderiliyor] = useState(false)
  const [profil, setProfil] = useState({})

  const okunmamisSayi = konusmalar.reduce((t, k) => {
    const rolAlici = k.alici_email === user?.email
    return t + (rolAlici ? (k.okunmamis_alici||0) : (k.okunmamis_satici||0))
  }, 0)

  useEffect(() => {
    if (!yuklendi) return
    if (!user) { router.push('/giris'); return }
    setProfil({ ad: user.ad, soyad: user.soyad, email: user.email, telefon: user.telefon || '', sehir: user.sehir || '', iletisimTercihi: 'ikisi' })
    if (router.query.tab) setAktifTab(router.query.tab)
    if (user.email) {
      // İlanları yükle
      kullanicIlanlari(user.email).then(({ data }) => {
        if (data && data.length > 0) setTalepler(data.map(d => ({
          id: d.id,
          baslik: (d.sehir||'') + (d.ilce?' '+d.ilce:'') + ' — ' + (d.kategori||'') + ' arıyorum',
          kategori: d.kategori ? d.kategori.charAt(0).toUpperCase() + d.kategori.slice(1) : 'Diğer',
          tarih: new Date(d.created_at).toLocaleDateString('tr-TR'),
          durum: d.durum, goruntuleme: d.goruntuleme || 0, bitisTarihi: d.bitis_tarihi, suresiDoldu: d.bitis_tarihi ? new Date(d.bitis_tarihi) < new Date() : false,
          mesajSayisi: 0,
          detay: [d.fiyat_min&&d.fiyat_max ? '₺'+Number(d.fiyat_min).toLocaleString('tr-TR')+' – ₺'+Number(d.fiyat_max).toLocaleString('tr-TR') : null, d.m2_min&&d.m2_max ? d.m2_min+'–'+d.m2_max+' m²' : null, d.oda, d.emlak_tip].filter(Boolean).join(' | ')
        })))
      })
      // Konuşmaları yükle
      konusmalariGetir(user.email).then(({ data }) => {
        if (data) setKonusmalar(data)
      })
    }
  }, [yuklendi, user, router.query.tab])

  if (!yuklendi) return <div style={{minHeight:'100vh',background:'var(--bg)'}} />
  if (!user) return <div style={{minHeight:'100vh',background:'var(--bg)'}} />

  function ilanSil(id) { setTalepler(p => p.filter(i => i.id !== id)) }
  async function ilanToggle(id) { const ilan = talepler.find(i => i.id === id); if (!ilan) return; const islem = ilan.durum === 'aktif' ? 'pasif' : 'aktif'; const r = await fetch('/api/ilan-uzat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ilanId: id, email: user.email, islem }) }).then(x => x.json()).catch(() => null); if (r && r.basarili) { setTalepler(p => p.map(i => i.id === id ? { ...i, durum: r.durum, bitisTarihi: r.bitisTarihi || i.bitisTarihi, suresiDoldu: r.durum === 'aktif' ? false : i.suresiDoldu } : i)) } else { alert((r && r.hata) || 'İşlem başarısız, tekrar deneyin') } }

  async function konusmaAc(k) {
    setSeciliKonusma(k)
    setYanitMetni('')
    // Mesajları yükle
    const { data } = await konusmaMesajlariGetir(k.id)
    setKonusmaMesajlar(data || [])
    // Okundu işaretle
    const rolAlici = k.alici_email === user.email
    await konusmaOkunduIsaretle(k.id, user.email, rolAlici)
    setKonusmalar(p => p.map(x => x.id === k.id
      ? {...x, okunmamis_alici: rolAlici ? 0 : x.okunmamis_alici, okunmamis_satici: !rolAlici ? 0 : x.okunmamis_satici}
      : x
    ))
  }

  async function mesajGonderKonusma() {
    if (!yanitMetni.trim() || !seciliKonusma || yanitGonderiliyor) return
    setYanitGonderiliyor(true)
    const rolAlici = seciliKonusma.alici_email === user.email
    const { data } = await konusmaMesajGonder({
      konusmaId: seciliKonusma.id,
      gonderenEmail: user.email,
      gonderenAd: `${user.ad||''} ${user.soyad||''}`.trim(),
      metin: yanitMetni,
      gonderenAliciMi: rolAlici,
    })
    if (data) {
      setKonusmaMesajlar(p => [...p, data])
      setKonusmalar(p => p.map(x => x.id === seciliKonusma.id
        ? {...x, son_mesaj: yanitMetni.slice(0,100), guncellendi_at: new Date().toISOString()}
        : x
      ))
    }
    setYanitMetni('')
    setYanitGonderiliyor(false)
  }

  // Konuşmaları ilan bazlı grupla
  const konusmaGruplari = konusmalar.reduce((acc, k) => {
    const key = k.ilan_id || 'genel'
    if (!acc[key]) acc[key] = { ilanBaslik: k.ilan_baslik || 'Genel', ilanKategori: k.ilan_kategori, konusmalar: [] }
    acc[key].konusmalar.push(k)
    return acc
  }, {})

  return (
    <>
      <Head><title>Panelim — AlmakIstiyor.com</title></Head>
      <Navbar onIlanVer={() => setFormOpen(true)} />

      <div className={styles.wrap}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{(user.ad?.[0]||'')+(user.soyad?.[0]||'')}</div>
            <div style={{minWidth:0}}>
              <div className={styles.userName}>{user.ad} {user.soyad}</div>
              <div className={styles.userEmail}>{user.email}</div>
            </div>
          </div>

          <nav className={styles.nav}>
            {[
              { id:'talepler', icon:'📋', label:'Talep İlanlarım', badge: talepler.length },
              { id:'mesajlar', icon:'💬', label:'Mesajlarım', badge: okunmamisSayi||null },
              { id:'profil', icon:'👤', label:'Profilim' },
            ].map(m => (
              <button key={m.id}
                className={`${styles.navItem} ${aktifTab===m.id ? styles.navActive : ''}`}
                onClick={() => { setAktifTab(m.id); setSeciliKonusma(null) }}>
                <span className={styles.navIcon}>{m.icon}</span>
                <span>{m.label}</span>
                {m.badge ? <span className={styles.badge}>{m.badge}</span> : null}
              </button>
            ))}
          </nav>

          <div className={styles.proKart}>
            <div className={styles.proIcon}>🏢</div>
            <div className={styles.proText}>Emlakçı veya galericiyseniz alıcı ilanlarına erişin</div>
            <a href="/pro" className={styles.proBtn}>Profesyonel Erişim →</a>
          </div>

          <button className={styles.cikisBtn} onClick={() => { cikisYap(); router.push('/') }}>← Çıkış Yap</button>
        </aside>

        {/* MAIN */}
        <main className={styles.main}>

          {/* TALEPLERİM */}
          {aktifTab === 'talepler' && (
            <div>
              <div className={styles.pageHeader}>
                <div>
                  <h1 className={styles.pageTitle}>Talep İlanlarım</h1>
                  <p className={styles.pageSub}>Yayınladığınız talepler</p>
                </div>
                <button className="btn-primary" onClick={() => setFormOpen(true)}>+ Yeni Talep</button>
              </div>
              {talepler.length === 0 ? (
                <div className={styles.bosKart}>
                  <div className={styles.bosIcon}>📋</div>
                  <h3>Henüz talep ilanınız yok</h3>
                  <p>Ne aradığınızı yazın, satıcılar sizi bulsun.</p>
                  <button className="btn-primary" onClick={() => setFormOpen(true)}>İlk talebinizi verin →</button>
                </div>
              ) : talepler.map(ilan => (
                <div key={ilan.id} className={styles.ilanKarti}>
                  <div className={styles.ilanUst}>
                    <div style={{flex:1}}>
                      <span className={styles.ilanKat}>{ilan.kategori}</span>
                      <h3 className={styles.ilanBaslik}>{ilan.baslik}</h3>
                      <p className={styles.ilanDetay}>{ilan.detay}</p>
                      <div className={styles.ilanMeta}>
                        <span>📅 {ilan.tarih}</span>
                        <span>👁️ {ilan.goruntuleme} satıcı baktı</span>
                        <span>💬 {ilan.mesajSayisi} mesaj</span>
                      </div>
                    </div>
                    <span className={`${styles.durumBadge} ${ilan.durum==='aktif'?styles.durumAktif:styles.durumPasif}`}>{ilan.durum}</span>
                  </div>
                  {ilan.suresiDoldu && ilan.durum !== 'aktif' && <div style={{background:'#FEF2F2',border:'1px solid #FECACA',color:'#B91C1C',borderRadius:8,padding:'10px 14px',fontSize:13,margin:'10px 0',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}><span>⚠️ 30 günlük ilan süreniz doldu. İsterseniz ücretsiz 30 gün daha aktif edebilirsiniz.</span><button onClick={() => ilanToggle(ilan.id)} style={{background:'#0D7A6B',color:'white',border:'none',borderRadius:7,padding:'8px 14px',fontSize:12.5,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>🔄 30 Gün Daha Yayınla</button></div>}<div className={styles.ilanAlt}>
                    <button className={styles.ilanBtn} onClick={() => { setAktifTab('mesajlar'); setFiltreIlan(String(ilan.id)) }}>
                      💬 Mesajları Gör ({ilan.mesajSayisi})
                    </button>
                    <button className={styles.ilanBtn} onClick={() => ilanToggle(ilan.id)}>
                      {ilan.durum==='aktif'?'⏸ Pasife Al':'▶ Aktife Al'}
                    </button>
                    <button className={`${styles.ilanBtn} ${styles.ilanSilBtn}`} onClick={() => ilanSil(ilan.id)}>🗑 Sil</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MESAJLARIM — Konuşma bazlı */}
          {aktifTab === 'mesajlar' && !seciliKonusma && (
            <div>
              <div className={styles.pageHeader}>
                <div>
                  <h1 className={styles.pageTitle}>Mesajlarım</h1>
                  <p className={styles.pageSub}>İlan bazlı özel konuşmalar</p>
                </div>
                {okunmamisSayi > 0 && <span className={styles.okunmamisBadge}>{okunmamisSayi} okunmamış</span>}
              </div>

              {konusmalar.length === 0 ? (
                <div className={styles.bosKart}>
                  <div className={styles.bosIcon}>💬</div>
                  <h3>Henüz mesajınız yok</h3>
                  <p>Talep ilanı verdiğinizde satıcılar size mesaj gönderebilir.</p>
                </div>
              ) : (
                <div>
                  {/* Konuşmaları ilan bazlı grupla — ilan başlığı en üstte */}
                  {Object.entries(konusmaGruplari).map(([ilanId, grup]) => (
                    <div key={ilanId} className={styles.konusmaGrup}>
                      <div className={styles.konusmaGrupBaslik}>
                        <span className={styles.ilanKat}>{grup.ilanKategori || 'Genel'}</span>
                        <span className={styles.konusmaGrupIlan}>📋 {grup.ilanBaslik || 'Talep ilanı'}</span>
                      </div>
                      {grup.konusmalar.map(k => {
                        const rolAlici = k.alici_email === user.email
                        const karsiTarafAd = rolAlici ? (k.satici_ad||'Satıcı') : (k.alici_ad||'Alıcı')
                        const karsiTarafFirma = rolAlici ? (k.satici_firma||'') : ''
                        const okunmamis = rolAlici ? (k.okunmamis_alici||0) : (k.okunmamis_satici||0)
                        return (
                          <div key={k.id}
                            className={`${styles.konusmaKarti} ${okunmamis > 0 ? styles.konusmaYeni : ''}`}
                            onClick={() => konusmaAc(k)}>
                            <div className={styles.mesajUst}>
                              <div className={styles.mesajAvatar}
                                style={{background: okunmamis > 0 ? 'var(--teal)' : 'var(--teal-light)', color: okunmamis > 0 ? 'white' : 'var(--teal)'}}>
                                {(karsiTarafAd[0]||'?').toUpperCase()}
                              </div>
                              <div className={styles.mesajInfo}>
                                <div className={styles.mesajGonderen}>
                                  {karsiTarafAd}
                                  {karsiTarafFirma && <span className={styles.mesajFirma}>{karsiTarafFirma}</span>}
                                  {okunmamis > 0 && <span className={styles.yeniBadge}>{okunmamis} yeni</span>}
                                </div>
                                {k.son_mesaj && <p className={styles.mesajOnizleme}>{k.son_mesaj.slice(0,80)}{k.son_mesaj.length>80?'…':''}</p>}
                              </div>
                              <div className={styles.mesajTarih}>
                                {new Date(k.guncellendi_at||k.created_at).toLocaleDateString('tr-TR')}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* KONUŞMA DETAYI */}
          {aktifTab === 'mesajlar' && seciliKonusma && (
            <div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 130px)'}}>
              {/* Başlık */}
              <div className={styles.pageHeader} style={{flexShrink:0}}>
                <button className={styles.geriBtn} onClick={() => setSeciliKonusma(null)}>
                  ← Tüm mesajlar
                </button>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:15,color:'var(--text)'}}>
                    {seciliKonusma.alici_email === user.email
                      ? (seciliKonusma.satici_ad||'Satıcı')
                      : (seciliKonusma.alici_ad||'Alıcı')}
                    {seciliKonusma.satici_firma && <span style={{fontSize:12,color:'var(--text-3)',marginLeft:8}}>{seciliKonusma.satici_firma}</span>}
                  </div>
                  <div className={styles.detayIlanTag} style={{marginBottom:0}}>
                    📋 {seciliKonusma.ilan_baslik || 'Talep ilanı'}
                  </div>
                </div>
              </div>

              {/* Mesaj balonları */}
              <div className={styles.konusma} style={{flex:1,maxHeight:'none'}}>
                {konusmaMesajlar.length === 0 && (
                  <div style={{textAlign:'center',color:'var(--text-3)',fontSize:13,padding:'24px 0'}}>
                    Henüz mesaj yok — ilk mesajı siz gönderin
                  </div>
                )}
                {konusmaMesajlar.map(m => {
                  const benden = m.gonderen_email === user.email
                  return (
                    <div key={m.id} className={benden ? styles.mesajBalonBen : styles.mesajBalon}>
                      <div className={benden ? styles.balonBen : styles.balonSatici}>{m.metin}</div>
                      <div className={styles.balonMeta} style={{textAlign:benden?'right':'left'}}>
                        {benden ? 'Siz' : (m.gonderen_ad||'Karşı taraf')} · {new Date(m.created_at).toLocaleString('tr-TR',{hour:'2-digit',minute:'2-digit',day:'numeric',month:'short'})}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Mesaj gönder */}
              <div className={styles.yanitKutu} style={{flexShrink:0}}>
                <div style={{display:'flex',gap:10,alignItems:'flex-end'}}>
                  <textarea className="form-input" rows={3}
                    placeholder="Mesajınızı yazın..."
                    style={{resize:'none',lineHeight:1.6,flex:1}}
                    value={yanitMetni}
                    onChange={e => setYanitMetni(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); mesajGonderKonusma() }}}
                  />
                  <button className="btn-primary"
                    style={{padding:'12px 20px',flexShrink:0}}
                    disabled={!yanitMetni.trim() || yanitGonderiliyor}
                    onClick={mesajGonderKonusma}>
                    {yanitGonderiliyor ? '...' : 'Gönder →'}
                  </button>
                </div>
                <p style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>Enter ile gönder, Shift+Enter yeni satır</p>
              </div>
            </div>
          )}

          {/* PROFİLİM */}
          {aktifTab === 'profil' && (
            <div>
              <div className={styles.pageHeader}>
                <div><h1 className={styles.pageTitle}>Profilim</h1><p className={styles.pageSub}>Bilgilerinizi güncelleyin</p></div>
              </div>
              <div className={styles.profilForm}>
                <div className={styles.profilGrid}>
                  <div><label className="form-label">Ad</label><input className="form-input" value={profil.ad||''} onChange={e => setProfil(p=>({...p,ad:e.target.value}))} /></div>
                  <div><label className="form-label">Soyad</label><input className="form-input" value={profil.soyad||''} onChange={e => setProfil(p=>({...p,soyad:e.target.value}))} /></div>
                  <div><label className="form-label">E-posta</label><input className="form-input" value={profil.email||''} disabled style={{opacity:.6}} /></div>
                  <div><label className="form-label">Telefon</label><input className="form-input" value={profil.telefon||''} onChange={e => setProfil(p=>({...p,telefon:e.target.value}))} /></div>
                  <div style={{gridColumn:'1/-1'}}>
                    <label className="form-label">İletişim Tercihi</label>
                    <div className={styles.iletisimSecenekler}>
                      {[{v:'mesaj',l:'💬 Sadece Mesaj',a:'Telefon gizli'},{v:'telefon',l:'📞 Sadece Telefon',a:'Telefon görünür'},{v:'ikisi',l:'✉️ Her İkisi',a:'Mesaj + telefon'}].map(o => (
                        <button key={o.v} className={`${styles.iletisimOpt} ${profil.iletisimTercihi===o.v?styles.iletisimOptSel:''}`}
                          onClick={() => setProfil(p=>({...p,iletisimTercihi:o.v}))}>
                          <span style={{fontWeight:500}}>{o.l}</span>
                          <span style={{fontSize:11,color:'var(--text-3)'}}>{o.a}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.profilAlt}>
                  <button className="btn-primary" style={{padding:'10px 28px'}}>Kaydet</button>
                  <div className={styles.sifreDegistir}>
                    <h4>Şifre Değiştir</h4>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginTop:10}}>
                      <div><label className="form-label">Mevcut</label><input className="form-input" type="password" placeholder="••••••" /></div>
                      <div><label className="form-label">Yeni</label><input className="form-input" type="password" placeholder="••••••" /></div>
                      <div><label className="form-label">Tekrar</label><input className="form-input" type="password" placeholder="••••••" /></div>
                    </div>
                    <button className="btn-ghost" style={{marginTop:10,padding:'8px 20px'}}>Güncelle</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
      <IlanForm open={formOpen} onClose={() => setFormOpen(false)} user={user}
        onSubmit={d => {
          const yeni = { id: Date.now(), baslik: `${d.sehir}${d.ilce?' '+d.ilce:''} — ${d.kategori}`, kategori: d.kategori, tarih: 'Az önce', durum: 'aktif', goruntuleme: 0, mesajSayisi: 0, detay: '' }
          setTalepler(p => [yeni, ...p])
        }}
      />
    </>
  )
}
