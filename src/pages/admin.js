import { useState } from 'react'
import Head from 'next/head'
import styles from './admin.module.css'

// Demo veriler
const demoIlanlar = [
  { id: 1, ad: 'Mehmet Arslan', tel: '0532 111 22 33', kategori: 'Emlak', sehir: 'İstanbul', baslik: 'Kadıköy 3+1 kiralık daire', tarih: '2 saat önce', durum: 'aktif' },
  { id: 2, ad: 'Zeynep Koçak', tel: '0541 333 44 55', kategori: 'Vasıta', sehir: 'İstanbul', baslik: 'BMW veya Mercedes', tarih: '8 saat önce', durum: 'aktif' },
  { id: 3, ad: 'Can Öztürk', tel: '0555 666 77 88', kategori: 'Emlak', sehir: 'İstanbul', baslik: 'Beşiktaş satılık daire', tarih: '2 gün önce', durum: 'aktif' },
  { id: 4, ad: 'Selin Aktaş', tel: '0532 999 00 11', kategori: 'Emlak', sehir: 'İzmir', baslik: 'Karşıyaka 2+1', tarih: '3 gün önce', durum: 'pasif' },
  { id: 5, ad: 'Burak Demir', tel: '0543 222 33 44', kategori: 'Vasıta', sehir: 'Ankara', baslik: 'VW Golf arıyorum', tarih: '4 gün önce', durum: 'aktif' },
]

const demoSaticilar = [
  { id: 1, firma: 'IQ TEKNO Emlak', email: 'iqyonetici@gmail.com', paket: 'Pro', goruntuleme: 14, odeme: '₺1.299', tarih: '15 gün önce', durum: 'aktif' },
  { id: 2, firma: 'Yıldız Gayrimenkul', email: 'yildiz@emlak.com', paket: 'Starter', goruntuleme: 7, odeme: '₺499', tarih: '22 gün önce', durum: 'aktif' },
  { id: 3, firma: 'Oto Güven Galeri', email: 'info@otogüven.com', paket: 'Ücretsiz', goruntuleme: 3, odeme: '—', tarih: '1 ay önce', durum: 'aktif' },
  { id: 4, firma: 'Metropol Emlak', email: 'metropol@email.com', paket: 'Kurumsal', goruntuleme: 89, odeme: '₺3.499', tarih: '5 gün önce', durum: 'aktif' },
]

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@almakistiyor.com'
const ADMIN_SIFRE = process.env.NEXT_PUBLIC_ADMIN_PASS || 'admin123'

export default function Admin() {
  const [giris, setGiris] = useState(false)
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [hata, setHata] = useState('')
  const [aktifTab, setAktifTab] = useState('ozet')
  const [ilanlar, setIlanlar] = useState(demoIlanlar)
  const [saticilar, setSaticilar] = useState(demoSaticilar)

  function handleGiris(e) {
    e.preventDefault()
    if (email === ADMIN_EMAIL && sifre === ADMIN_SIFRE) {
      setGiris(true); setHata('')
    } else {
      setHata('E-posta veya şifre hatalı.')
    }
  }

  function ilanSil(id) {
    setIlanlar(prev => prev.filter(i => i.id !== id))
  }
  function ilanDurumDegistir(id) {
    setIlanlar(prev => prev.map(i => i.id === id ? {...i, durum: i.durum === 'aktif' ? 'pasif' : 'aktif'} : i))
  }

  const toplamIlan = ilanlar.length
  const aktifIlan = ilanlar.filter(i => i.durum === 'aktif').length
  const toplamSatici = saticilar.length
  const toplamGelir = saticilar.reduce((sum, s) => {
    const fiyat = parseInt(s.odeme.replace(/[^0-9]/g,'')) || 0
    return sum + fiyat
  }, 0)

  if (!giris) {
    return (
      <>
        <Head><title>Admin Girişi — AlmakIstiyor.com</title></Head>
        <div className={styles.loginWrap}>
          <div className={styles.loginBox}>
            <div className={styles.loginLogo}>
              <svg width="140" height="34" viewBox="0 0 300 72" fill="none">
                <path d="M20 8 L36 4 L52 8 L52 30 C52 42 36 50 36 50 C36 50 20 42 20 30 Z" fill="#0D7A6B"/>
                <path d="M27 27 L33 33 L46 20" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                <text x="62" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="#0D7A6B">almak</text>
                <text x="163" y="44" fontFamily="Sora,sans-serif" fontWeight="400" fontSize="28" fill="#1A1D23">istiyor</text>
                <text x="277" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="#F5A623">.</text>
              </svg>
            </div>
            <div className={styles.adminBadge}>🔐 Admin Paneli</div>
            <h2 className={styles.loginTitle}>Yönetici Girişi</h2>
            <form onSubmit={handleGiris} className={styles.loginForm}>
              <div>
                <label className="form-label">E-posta</label>
                <input className="form-input" type="email" placeholder="admin@almakistiyor.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Şifre</label>
                <input className="form-input" type="password" placeholder="••••••••"
                  value={sifre} onChange={e => setSifre(e.target.value)} required />
              </div>
              {hata && <div className={styles.hataBox}>{hata}</div>}
              <button type="submit" className="btn-primary" style={{width:'100%',justifyContent:'center',padding:13}}>
                Giriş Yap
              </button>
            </form>
            <p style={{fontSize:12,color:'var(--text-3)',textAlign:'center',marginTop:14}}>
              Demo: admin@almakistiyor.com / admin123
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head><title>Admin Paneli — AlmakIstiyor.com</title></Head>
      <div className={styles.wrap}>

        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLogo}>
            <svg width="110" height="26" viewBox="0 0 300 72" fill="none">
              <path d="M20 8 L36 4 L52 8 L52 30 C52 42 36 50 36 50 C36 50 20 42 20 30 Z" fill="rgba(255,255,255,0.9)"/>
              <path d="M27 27 L33 33 L46 20" stroke="#0D7A6B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              <text x="62" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="white">almak</text>
              <text x="163" y="44" fontFamily="Sora,sans-serif" fontWeight="400" fontSize="28" fill="rgba(255,255,255,0.7)">istiyor</text>
              <text x="277" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="#F5A623">.</text>
            </svg>
            <span className={styles.adminTag}>Admin</span>
          </div>

          <nav className={styles.nav}>
            {[
              { id: 'ozet', icon: '📊', label: 'Özet' },
              { id: 'ilanlar', icon: '📋', label: 'Talep İlanları' },
              { id: 'saticilar', icon: '🏢', label: 'Satıcılar' },
              { id: 'odemeler', icon: '💳', label: 'Ödemeler' },
              { id: 'ayarlar', icon: '⚙️', label: 'Site Ayarları' },
            ].map(m => (
              <button key={m.id}
                className={`${styles.navItem} ${aktifTab === m.id ? styles.navActive : ''}`}
                onClick={() => setAktifTab(m.id)}>
                <span>{m.icon}</span>{m.label}
              </button>
            ))}
          </nav>

          <div className={styles.sidebarBottom}>
            <a href="/" className={styles.siteLink}>← Siteye Dön</a>
            <button className={styles.cikisBtn} onClick={() => setGiris(false)}>Çıkış Yap</button>
          </div>
        </aside>

        {/* ANA ALAN */}
        <main className={styles.main}>

          {/* ÖZET */}
          {aktifTab === 'ozet' && (
            <div>
              <h1 className={styles.pageTitle}>Genel Özet</h1>
              <div className={styles.statGrid}>
                {[
                  { icon: '📋', label: 'Toplam İlan', val: toplamIlan, sub: `${aktifIlan} aktif`, renk: '#E6F5F2', irenk: '#0D7A6B' },
                  { icon: '🏢', label: 'Kayıtlı Satıcı', val: toplamSatici, sub: '3 bu hafta', renk: '#EBF4FF', irenk: '#1A4A8A' },
                  { icon: '💰', label: 'Aylık Gelir', val: `₺${toplamGelir.toLocaleString('tr-TR')}`, sub: 'Bu ay', renk: '#EBF8F0', irenk: '#1A5C35' },
                  { icon: '👁️', label: 'Toplam Görüntülenme', val: '14.320', sub: 'Bu ay', renk: '#FEF3DC', irenk: '#7A4F01' },
                ].map(s => (
                  <div key={s.label} className={styles.statKart} style={{background: s.renk}}>
                    <div className={styles.statIcon} style={{color: s.irenk}}>{s.icon}</div>
                    <div className={styles.statVal} style={{color: s.irenk}}>{s.val}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                    <div className={styles.statSub}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className={styles.ozet2Kol}>
                <div className={styles.ozetBox}>
                  <h3 className={styles.ozetBaslik}>Son Talep İlanları</h3>
                  <table className={styles.tablo}>
                    <thead><tr><th>Ad</th><th>Kategori</th><th>Şehir</th><th>Durum</th></tr></thead>
                    <tbody>
                      {ilanlar.slice(0,5).map(i => (
                        <tr key={i.id}>
                          <td>{i.ad}</td>
                          <td><span className={styles.katBadge}>{i.kategori}</span></td>
                          <td>{i.sehir}</td>
                          <td><span className={`${styles.durumBadge} ${i.durum === 'aktif' ? styles.durumAktif : styles.durumPasif}`}>{i.durum}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className={styles.ozetBox}>
                  <h3 className={styles.ozetBaslik}>Son Satıcılar</h3>
                  <table className={styles.tablo}>
                    <thead><tr><th>Firma</th><th>Paket</th><th>Gelir</th></tr></thead>
                    <tbody>
                      {saticilar.map(s => (
                        <tr key={s.id}>
                          <td style={{fontSize:13}}>{s.firma}</td>
                          <td><span className={styles.paketBadge}>{s.paket}</span></td>
                          <td style={{fontWeight:600,color:'#1A5C35'}}>{s.odeme}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TALEP İLANLARI */}
          {aktifTab === 'ilanlar' && (
            <div>
              <div className={styles.tabHeader}>
                <h1 className={styles.pageTitle}>Talep İlanları</h1>
                <span className={styles.sayac}>{ilanlar.length} ilan</span>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.tablo}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Ad Soyad</th>
                      <th>Telefon</th>
                      <th>Başlık</th>
                      <th>Kategori</th>
                      <th>Şehir</th>
                      <th>Tarih</th>
                      <th>Durum</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ilanlar.map(i => (
                      <tr key={i.id}>
                        <td style={{color:'var(--text-3)',fontSize:12}}>{i.id}</td>
                        <td style={{fontWeight:500}}>{i.ad}</td>
                        <td style={{fontSize:13,color:'var(--teal)',fontWeight:500}}>{i.tel}</td>
                        <td style={{fontSize:13,maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{i.baslik}</td>
                        <td><span className={styles.katBadge}>{i.kategori}</span></td>
                        <td style={{fontSize:13}}>{i.sehir}</td>
                        <td style={{fontSize:12,color:'var(--text-3)'}}>{i.tarih}</td>
                        <td>
                          <span className={`${styles.durumBadge} ${i.durum === 'aktif' ? styles.durumAktif : styles.durumPasif}`}>
                            {i.durum}
                          </span>
                        </td>
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            <button className={styles.islemBtn} onClick={() => ilanDurumDegistir(i.id)}
                              title={i.durum === 'aktif' ? 'Pasife Al' : 'Aktife Al'}>
                              {i.durum === 'aktif' ? '⏸' : '▶'}
                            </button>
                            <button className={`${styles.islemBtn} ${styles.silBtn}`} onClick={() => ilanSil(i.id)} title="Sil">🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SATICILAR */}
          {aktifTab === 'saticilar' && (
            <div>
              <div className={styles.tabHeader}>
                <h1 className={styles.pageTitle}>Satıcılar</h1>
                <span className={styles.sayac}>{saticilar.length} satıcı</span>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.tablo}>
                  <thead>
                    <tr>
                      <th>Firma</th>
                      <th>E-posta</th>
                      <th>Paket</th>
                      <th>Görüntüleme</th>
                      <th>Aylık Ödeme</th>
                      <th>Kayıt</th>
                      <th>Durum</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saticilar.map(s => (
                      <tr key={s.id}>
                        <td style={{fontWeight:500}}>{s.firma}</td>
                        <td style={{fontSize:13,color:'var(--text-3)'}}>{s.email}</td>
                        <td><span className={styles.paketBadge}>{s.paket}</span></td>
                        <td style={{fontSize:13,textAlign:'center'}}>{s.goruntuleme}</td>
                        <td style={{fontWeight:600,color:'#1A5C35'}}>{s.odeme}</td>
                        <td style={{fontSize:12,color:'var(--text-3)'}}>{s.tarih}</td>
                        <td><span className={`${styles.durumBadge} ${styles.durumAktif}`}>{s.durum}</span></td>
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            <button className={styles.islemBtn} title="Düzenle">✏️</button>
                            <button className={`${styles.islemBtn} ${styles.silBtn}`}
                              onClick={() => setSaticilar(prev => prev.filter(x => x.id !== s.id))} title="Sil">🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ÖDEMELER */}
          {aktifTab === 'odemeler' && (
            <div>
              <h1 className={styles.pageTitle}>Ödemeler</h1>
              <div className={styles.statGrid} style={{gridTemplateColumns:'repeat(3,1fr)'}}>
                {[
                  { label: 'Bu Ay Gelir', val: `₺${toplamGelir.toLocaleString('tr-TR')}`, renk: '#EBF8F0', irenk: '#1A5C35', icon: '💰' },
                  { label: 'Aktif Abonelik', val: saticilar.filter(s=>s.paket!=='Ücretsiz').length, renk: '#E6F5F2', irenk: '#0D7A6B', icon: '✓' },
                  { label: 'Ücretsiz Kullanıcı', val: saticilar.filter(s=>s.paket==='Ücretsiz').length, renk: '#FEF3DC', irenk: '#7A4F01', icon: '👥' },
                ].map(s => (
                  <div key={s.label} className={styles.statKart} style={{background:s.renk}}>
                    <div className={styles.statIcon} style={{color:s.irenk}}>{s.icon}</div>
                    <div className={styles.statVal} style={{color:s.irenk}}>{s.val}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className={styles.tableWrap} style={{marginTop:24}}>
                <table className={styles.tablo}>
                  <thead><tr><th>Firma</th><th>Paket</th><th>Tutar</th><th>Tarih</th><th>Durum</th></tr></thead>
                  <tbody>
                    {saticilar.filter(s=>s.paket!=='Ücretsiz').map(s => (
                      <tr key={s.id}>
                        <td style={{fontWeight:500}}>{s.firma}</td>
                        <td><span className={styles.paketBadge}>{s.paket}</span></td>
                        <td style={{fontWeight:600,color:'#1A5C35'}}>{s.odeme}</td>
                        <td style={{fontSize:12,color:'var(--text-3)'}}>{s.tarih}</td>
                        <td><span className={`${styles.durumBadge} ${styles.durumAktif}`}>Ödendi</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AYARLAR */}
          {aktifTab === 'ayarlar' && (
            <div>
              <h1 className={styles.pageTitle}>Site Ayarları</h1>
              <div className={styles.ayarGrid}>
                {[
                  { baslik: '🆓 Ücretsiz Hak Sayısı', aciklama: 'Satıcıya verilen ücretsiz ilan görüntüleme hakkı', deger: '3' },
                  { baslik: '📩 Bildirim E-postası', aciklama: 'Sistem bildirimlerinin gönderileceği adres', deger: 'admin@almakistiyor.com' },
                  { baslik: '⏰ İlan Geçerlilik Süresi', aciklama: 'İlanların otomatik pasife alınma süresi (gün)', deger: '30' },
                  { baslik: '📱 SMS Servis Sağlayıcı', aciklama: 'Kullanılacak SMS API', deger: 'Netgsm' },
                ].map((a,i) => (
                  <div key={i} className={styles.ayarSatir}>
                    <div>
                      <div className={styles.ayarBaslik}>{a.baslik}</div>
                      <div className={styles.ayarAcik}>{a.aciklama}</div>
                    </div>
                    <input className="form-input" defaultValue={a.deger} style={{width:200}} />
                  </div>
                ))}
                <button className="btn-primary" style={{padding:'10px 28px',marginTop:8}}>Kaydet</button>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  )
}
