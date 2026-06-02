import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import IlanForm from '../components/IlanForm'
import Footer from '../components/Footer'
import styles from './panel.module.css'

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
  const { user, cikisYap } = useAuth()
  const router = useRouter()
  const [aktifTab, setAktifTab] = useState('talepler')
  const [formOpen, setFormOpen] = useState(false)
  const [talepler, setTalepler] = useState(DEMO_TALEPLER)
  const [mesajlar, setMesajlar] = useState(DEMO_MESAJLAR)
  const [profil, setProfil] = useState({})
  const [seciliMesaj, setSeciliMesaj] = useState(null)
  const [yanitMetni, setYanitMetni] = useState('')
  const [yanitGonderildi, setYanitGonderildi] = useState(false)
  const [filtreIlan, setFiltreIlan] = useState('hepsi')

  const okunmamisSayi = mesajlar.filter(m => !m.okundu).length

  useEffect(() => {
    if (!user) { router.push('/giris'); return }
    setProfil({ ad: user.ad, soyad: user.soyad, email: user.email, telefon: user.telefon || '', sehir: user.sehir || '', iletisimTercihi: 'ikisi' })
    if (router.query.tab) setAktifTab(router.query.tab)
  }, [user, router.query.tab])

  if (!user) return null

  function ilanSil(id) { setTalepler(p => p.filter(i => i.id !== id)) }
  function ilanToggle(id) { setTalepler(p => p.map(i => i.id === id ? {...i, durum: i.durum==='aktif'?'pasif':'aktif'} : i)) }

  function mesajAc(m) {
    setSeciliMesaj(m)
    setYanitMetni('')
    setYanitGonderildi(false)
    setMesajlar(p => p.map(x => x.id === m.id ? {...x, okundu: true} : x))
  }

  function yanitGonder() {
    if (!yanitMetni.trim()) return
    const yeniYanit = { metin: yanitMetni, tarih: 'Az önce', benden: true }
    setMesajlar(p => p.map(x => x.id === seciliMesaj.id
      ? {...x, yanıtlar: [...(x.yanıtlar||[]), yeniYanit]}
      : x
    ))
    setSeciliMesaj(p => ({...p, yanıtlar: [...(p.yanıtlar||[]), yeniYanit]}))
    setYanitMetni('')
    setYanitGonderildi(true)
    setTimeout(() => setYanitGonderildi(false), 2000)
  }

  const filtrelenmis = filtreIlan === 'hepsi'
    ? mesajlar
    : mesajlar.filter(m => m.ilanId === parseInt(filtreIlan))

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
                onClick={() => { setAktifTab(m.id); setSeciliMesaj(null) }}>
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
                  <div className={styles.ilanAlt}>
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

          {/* MESAJLARIM */}
          {aktifTab === 'mesajlar' && !seciliMesaj && (
            <div>
              <div className={styles.pageHeader}>
                <div>
                  <h1 className={styles.pageTitle}>Mesajlarım</h1>
                  <p className={styles.pageSub}>Satıcılardan gelen mesajlar — tıklayın okuyun, yanıtlayın</p>
                </div>
                {okunmamisSayi > 0 && <span className={styles.okunmamisBadge}>{okunmamisSayi} okunmamış</span>}
              </div>

              {/* İlan filtresi */}
              <div className={styles.filtreRow}>
                <button className={`${styles.filtreBtn} ${filtreIlan==='hepsi'?styles.filtreSel:''}`}
                  onClick={() => setFiltreIlan('hepsi')}>Tümü ({mesajlar.length})</button>
                {talepler.map(t => {
                  const sayi = mesajlar.filter(m => m.ilanId === t.id).length
                  return (
                    <button key={t.id}
                      className={`${styles.filtreBtn} ${filtreIlan===String(t.id)?styles.filtreSel:''}`}
                      onClick={() => setFiltreIlan(String(t.id))}>
                      {t.kategori} ({sayi})
                    </button>
                  )
                })}
              </div>

              {filtrelenmis.length === 0 ? (
                <div className={styles.bosKart}>
                  <div className={styles.bosIcon}>💬</div>
                  <h3>Bu ilan için mesaj yok</h3>
                </div>
              ) : (
                <div className={styles.mesajListesi}>
                  {filtrelenmis.map(m => (
                    <div key={m.id}
                      className={`${styles.mesajKarti} ${!m.okundu?styles.mesajYeni:''}`}
                      onClick={() => mesajAc(m)}>
                      <div className={styles.mesajUst}>
                        <div className={styles.mesajAvatar} style={{background: m.okundu ? 'var(--teal-light)' : 'var(--teal)', color: m.okundu ? 'var(--teal)' : 'white'}}>
                          {m.gonderen[0]}
                        </div>
                        <div className={styles.mesajInfo}>
                          <div className={styles.mesajGonderen}>
                            {m.gonderen}
                            <span className={styles.mesajFirma}>{m.firma}</span>
                            {!m.okundu && <span className={styles.yeniBadge}>Yeni</span>}
                            {m.yanıtlar?.length > 0 && <span className={styles.yanıtBadge}>✓ Yanıtlandı</span>}
                          </div>
                          <div className={styles.mesajIlan}>📋 {m.ilan}</div>
                        </div>
                        <div className={styles.mesajTarih}>{m.tarih}</div>
                      </div>
                      <p className={styles.mesajOnizleme}>{m.mesaj.slice(0,120)}{m.mesaj.length>120?'…':''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MESAJ DETAY + YANIT */}
          {aktifTab === 'mesajlar' && seciliMesaj && (
            <div>
              <div className={styles.pageHeader}>
                <button className={styles.geriBtn} onClick={() => setSeciliMesaj(null)}>
                  ← Tüm mesajlar
                </button>
              </div>

              <div className={styles.mesajDetayKart}>
                {/* Gönderen */}
                <div className={styles.detayGonderen}>
                  <div className={styles.mesajAvatar} style={{width:44,height:44,fontSize:17,background:'var(--teal)',color:'white'}}>
                    {seciliMesaj.gonderen[0]}
                  </div>
                  <div>
                    <div style={{fontWeight:600,fontSize:15,color:'var(--text)'}}>{seciliMesaj.gonderen}</div>
                    <div style={{fontSize:12,color:'var(--text-3)'}}>{seciliMesaj.firma} · {seciliMesaj.tarih}</div>
                  </div>
                </div>
                <div className={styles.detayIlanTag}>📋 {seciliMesaj.ilan}</div>

                {/* Konuşma akışı */}
                <div className={styles.konusma}>
                  {/* Gelen mesaj */}
                  <div className={styles.mesajBalon}>
                    <div className={styles.balonSatici}>{seciliMesaj.mesaj}</div>
                    <div className={styles.balonMeta}>{seciliMesaj.gonderen} · {seciliMesaj.tarih}</div>
                  </div>

                  {/* Yanıtlar */}
                  {seciliMesaj.yanıtlar?.map((y, i) => (
                    <div key={i} className={y.benden ? styles.mesajBalonBen : styles.mesajBalon}>
                      <div className={y.benden ? styles.balonBen : styles.balonSatici}>{y.metin}</div>
                      <div className={styles.balonMeta} style={{textAlign: y.benden ? 'right' : 'left'}}>
                        {y.benden ? 'Siz' : seciliMesaj.gonderen} · {y.tarih}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Yanıt kutusu */}
                <div className={styles.yanitKutu}>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder={`${seciliMesaj.gonderen} adlı satıcıya yanıt yazın...`}
                    style={{resize:'vertical', lineHeight:1.6}}
                    value={yanitMetni}
                    onChange={e => setYanitMetni(e.target.value)}
                  />
                  {yanitGonderildi && (
                    <div className={styles.basariliMesaj}>✅ Yanıtınız gönderildi!</div>
                  )}
                  <div style={{display:'flex', gap:10, marginTop:10}}>
                    <button className="btn-ghost" onClick={() => setSeciliMesaj(null)}>← Geri</button>
                    <button className="btn-primary"
                      style={{flex:1, justifyContent:'center'}}
                      disabled={!yanitMetni.trim()}
                      onClick={yanitGonder}>
                      Yanıt Gönder →
                    </button>
                  </div>
                </div>
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
