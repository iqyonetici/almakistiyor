import { useState } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import IlanForm from '../components/IlanForm'
import IlanKarti from '../components/IlanKarti'
import styles from './satici.module.css'

// Demo ilanlar (gerçekte veritabanından gelecek)
const demoIlanlar = [
  { id: 1, kategori: 'emlak', ad: 'Mehmet Arslan', sehir: 'İstanbul', ilce: 'Kadıköy', baslik: 'Kadıköy veya Üsküdar\'da 3+1 kiralık daire arıyorum', fiyatMin: 25000, fiyatMax: 35000, tags: [{label:'120–160 m²',variant:'tag-gray'},{label:'3+1',variant:'tag-gray'},{label:'Eşyalı tercih',variant:'tag-amber'}], aciklama: 'Asansörlü, otoparklı tercih ederim. Balkon şart.', tarih: '3 saat önce', goruntuleme: 47, telefon: '0532 111 22 33' },
  { id: 2, kategori: 'vasita', ad: 'Zeynep Koçak', sehir: 'İstanbul', ilce: 'Beşiktaş', baslik: '2018–2022 model BMW veya Mercedes arıyorum', fiyatMin: 800000, fiyatMax: 1200000, tags: [{label:'0–80.000 km',variant:'tag-gray'},{label:'Otomatik',variant:'tag-gray'}], aciklama: 'Kazasız boyasız tercih ederim.', tarih: '8 saat önce', goruntuleme: 128, telefon: '0541 333 44 55' },
  { id: 3, kategori: 'emlak', ad: 'Can Öztürk', sehir: 'İstanbul', ilce: 'Beşiktaş', baslik: 'Beşiktaş\'ta satılık daire arıyorum', fiyatMin: 8000000, fiyatMax: 15000000, tags: [{label:'150–250 m²',variant:'tag-gray'},{label:'4+1',variant:'tag-gray'}], aciklama: 'Peşin ödeme yapabilirim.', tarih: '2 gün önce', goruntuleme: 214, telefon: '0555 666 77 88' },
  { id: 4, kategori: 'emlak', ad: 'Selin Aktaş', sehir: 'İzmir', ilce: 'Karşıyaka', baslik: 'İzmir Karşıyaka\'da 2+1 satılık daire', fiyatMin: 3000000, fiyatMax: 5000000, tags: [{label:'80–120 m²',variant:'tag-gray'},{label:'2+1',variant:'tag-gray'}], aciklama: 'Denize yakın istiyorum.', tarih: '3 gün önce', goruntuleme: 67, telefon: '0532 999 00 11' },
]

const paketler = [
  { id: 'starter', ad: 'Starter', fiyat: '₺499', sure: '/ay', renk: '#E6F5F2', acikRenk: '#0D7A6B', ozellikler: ['10 ilan iletişim bilgisi', 'Telefon + e-posta görme', 'Anlık e-posta bildirimi', '—', '—'] },
  { id: 'pro', ad: 'Pro', fiyat: '₺1.299', sure: '/ay', renk: '#0D7A6B', acikRenk: 'white', ozellikler: ['Sınırsız ilan erişimi', 'Telefon + e-posta görme', 'Anlık SMS bildirimi', 'Öne çıkan profil sayfası', 'Öncelik sıralaması'], popular: true },
  { id: 'kurumsal', ad: 'Kurumsal', fiyat: '₺3.499', sure: '/ay', renk: '#1A1D23', acikRenk: 'white', ozellikler: ['Sınırsız ilan erişimi', 'Tüm iletişim bilgileri', 'API erişimi', 'Marka profil sayfası', 'Özel hesap yöneticisi'] },
]

export default function Satici() {
  const [girisYapildi, setGirisYapildi] = useState(false)
  const [aktifTab, setAktifTab] = useState('ilanlar')
  const [formOpen, setFormOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [gorulenIlanlar, setGorulenIlanlar] = useState([1]) // id 1 ücretsiz görülmüş
  const [seciliPaket, setSeciliPaket] = useState('starter')
  const [bildirim, setBildirim] = useState('')

  // Ücretsiz hak: 3 ilan
  const uccretsiHak = 3
  const kullanilanHak = gorulenIlanlar.length

  function iletisimGor(ilan) {
    if (gorulenIlanlar.includes(ilan.id)) return
    if (kullanilanHak >= uccretsiHak) {
      setBildirim('Ücretsiz hakkınız doldu! Devam etmek için paket satın alın.')
      setTimeout(() => setBildirim(''), 4000)
      return
    }
    setGorulenIlanlar(prev => [...prev, ilan.id])
  }

  function handleGiris(e) {
    e.preventDefault()
    if (email && sifre) setGirisYapildi(true)
  }

  if (!girisYapildi) {
    return (
      <>
        <Head><title>Satıcı Girişi — AlmakIstiyor.com</title></Head>
        <Navbar onIlanVer={() => setFormOpen(true)} />
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
            <h2 className={styles.loginTitle}>Satıcı Girişi</h2>
            <p className={styles.loginSub}>Emlakçı veya galericiyseniz alıcı taleplerine buradan erişin</p>

            <div className={styles.freeBanner}>
              <span className={styles.freeIcon}>🎁</span>
              <div>
                <strong>3 ücretsiz hak!</strong>
                <p>Kayıt olmadan 3 ilanın iletişim bilgisini ücretsiz görün.</p>
              </div>
            </div>

            <form onSubmit={handleGiris} className={styles.loginForm}>
              <div className={styles.fGroup}>
                <label className="form-label">E-posta</label>
                <input className="form-input" type="email" placeholder="firma@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className={styles.fGroup}>
                <label className="form-label">Şifre</label>
                <input className="form-input" type="password" placeholder="••••••••"
                  value={sifre} onChange={e => setSifre(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'13px'}}>
                Giriş Yap
              </button>
            </form>

            <p className={styles.loginAlt}>
              Henüz hesabınız yok mu? <a href="/kayit">Ücretsiz kaydolun</a>
            </p>
          </div>

          {/* Paketler */}
          <div className={styles.paketlerWrap}>
            <h3 className={styles.paketlerBaslik}>Paketler</h3>
            <div className={styles.paketGrid}>
              {paketler.map(p => (
                <div key={p.id} className={styles.paketKart}
                  style={{ background: p.renk, border: p.popular ? '2px solid #0D7A6B' : '1px solid var(--border)' }}>
                  {p.popular && <div className={styles.popularBadge}>En Popüler</div>}
                  <div className={styles.paketAd} style={{color: p.acikRenk === 'white' ? 'rgba(255,255,255,0.7)' : 'var(--text-3)'}}>{p.ad}</div>
                  <div className={styles.paketFiyat} style={{color: p.acikRenk === 'white' ? 'white' : 'var(--text)'}}>
                    {p.fiyat}<span style={{fontSize:13,fontWeight:400}}>{p.sure}</span>
                  </div>
                  <ul className={styles.paketList}>
                    {p.ozellikler.map((o,i) => (
                      <li key={i} style={{color: p.acikRenk === 'white' ? 'rgba(255,255,255,0.8)' : 'var(--text-2)', opacity: o === '—' ? 0.3 : 1}}>
                        {o !== '—' ? '✓ ' : '✗ '}{o}
                      </li>
                    ))}
                  </ul>
                  <button className={styles.paketBtn}
                    style={{background: p.acikRenk === 'white' ? 'white' : '#0D7A6B', color: p.acikRenk === 'white' ? '#0D7A6B' : 'white'}}
                    onClick={() => setGirisYapildi(true)}>
                    Başla
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
        <IlanForm open={formOpen} onClose={() => setFormOpen(false)} />
      </>
    )
  }

  // GİRİŞ YAPILDI — SATICI PANELİ
  return (
    <>
      <Head><title>Satıcı Paneli — AlmakIstiyor.com</title></Head>
      <Navbar onIlanVer={() => setFormOpen(true)} />

      {bildirim && (
        <div className={styles.bildirimBar}>
          ⚠️ {bildirim}
          <button onClick={() => setBildirim('')} style={{background:'none',border:'none',color:'white',marginLeft:12,fontSize:16,cursor:'pointer'}}>✕</button>
        </div>
      )}

      <div className={styles.panelWrap}>
        {/* SOL SIDEBAR */}
        <aside className={styles.panelSidebar}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>IQ</div>
            <div>
              <div className={styles.userName}>IQ TEKNO</div>
              <div className={styles.userEmail}>iqyonetici@gmail.com</div>
            </div>
          </div>

          <div className={styles.hakKart}>
            <div className={styles.hakBaslik}>Ücretsiz Hak</div>
            <div className={styles.hakBar}>
              <div className={styles.hakDolu} style={{width: `${(kullanilanHak/uccretsiHak)*100}%`}} />
            </div>
            <div className={styles.hakText}>{kullanilanHak} / {uccretsiHak} kullanıldı</div>
            {kullanilanHak >= uccretsiHak && (
              <button className={styles.hakBtn} onClick={() => setAktifTab('paket')}>
                Paket Al →
              </button>
            )}
          </div>

          <nav className={styles.panelNav}>
            {[
              { id: 'ilanlar', icon: '📋', label: 'Talep İlanları' },
              { id: 'paket', icon: '💳', label: 'Paket & Ödeme' },
              { id: 'bildirimler', icon: '🔔', label: 'Bildirim Ayarları' },
              { id: 'profil', icon: '👤', label: 'Firma Profili' },
            ].map(m => (
              <button key={m.id}
                className={`${styles.navItem} ${aktifTab === m.id ? styles.navActive : ''}`}
                onClick={() => setAktifTab(m.id)}>
                <span>{m.icon}</span> {m.label}
              </button>
            ))}
          </nav>

          <button className={styles.cikisBtn} onClick={() => setGirisYapildi(false)}>
            ← Çıkış Yap
          </button>
        </aside>

        {/* ANA İÇERİK */}
        <main className={styles.panelMain}>

          {/* TALEP İLANLARI */}
          {aktifTab === 'ilanlar' && (
            <div>
              <div className={styles.pageHeader}>
                <div>
                  <h1 className={styles.pageTitle}>Talep İlanları</h1>
                  <p className={styles.pageSub}>Alıcıların aktif talepleri — iletişim bilgisini görmek için tıklayın</p>
                </div>
                <div className={styles.headerFiltre}>
                  <select className="form-select" style={{width:'auto',padding:'8px 14px'}}>
                    <option>Tüm kategoriler</option>
                    <option>Emlak</option>
                    <option>Vasıta</option>
                    <option>İkinci El</option>
                  </select>
                  <select className="form-select" style={{width:'auto',padding:'8px 14px'}}>
                    <option>Tüm şehirler</option>
                    <option>İstanbul</option>
                    <option>Ankara</option>
                    <option>İzmir</option>
                  </select>
                </div>
              </div>

              <div className={styles.ilanGrid}>
                {demoIlanlar.map((ilan, i) => {
                  const goruldu = gorulenIlanlar.includes(ilan.id)
                  const kilitli = !goruldu && kullanilanHak >= uccretsiHak
                  return (
                    <div key={ilan.id} className={styles.ilanWrap}>
                      <IlanKarti ilan={ilan} locked={kilitli} onIletisim={iletisimGor} />
                      {goruldu && (
                        <div className={styles.acikBilgi}>
                          <div className={styles.acikItem}>
                            <span className={styles.acikLabel}>📞 Telefon</span>
                            <span className={styles.acikDeger}>{ilan.telefon}</span>
                          </div>
                          <div className={styles.acikItem}>
                            <span className={styles.acikLabel}>👤 Ad Soyad</span>
                            <span className={styles.acikDeger}>{ilan.ad}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* PAKET & ÖDEME */}
          {aktifTab === 'paket' && (
            <div>
              <div className={styles.pageHeader}>
                <div>
                  <h1 className={styles.pageTitle}>Paket & Ödeme</h1>
                  <p className={styles.pageSub}>Daha fazla alıcıya ulaşmak için paket seçin</p>
                </div>
              </div>
              <div className={styles.paketGrid2}>
                {paketler.map(p => (
                  <div key={p.id}
                    className={`${styles.paketKart2} ${seciliPaket === p.id ? styles.paketSec : ''}`}
                    onClick={() => setSeciliPaket(p.id)}>
                    {p.popular && <div className={styles.popularBadge2}>En Popüler</div>}
                    <div className={styles.paketAd2}>{p.ad}</div>
                    <div className={styles.paketFiyat2}>{p.fiyat}<span>/ay</span></div>
                    <ul className={styles.paketList2}>
                      {p.ozellikler.map((o,i) => (
                        <li key={i} style={{opacity: o === '—' ? 0.35 : 1}}>
                          <span style={{color: o !== '—' ? '#0D7A6B' : '#ccc'}}>{o !== '—' ? '✓' : '✗'}</span> {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className={styles.odemeBox}>
                <h3>Ödeme Bilgileri</h3>
                <p style={{fontSize:13,color:'var(--text-3)',marginBottom:16}}>Seçili paket: <strong>{paketler.find(p=>p.id===seciliPaket)?.ad}</strong> — {paketler.find(p=>p.id===seciliPaket)?.fiyat}/ay</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                  <div><label className="form-label">Kart Üzerindeki Ad</label><input className="form-input" placeholder="AD SOYAD" /></div>
                  <div><label className="form-label">Kart Numarası</label><input className="form-input" placeholder="0000 0000 0000 0000" /></div>
                  <div><label className="form-label">Son Kullanma</label><input className="form-input" placeholder="AA/YY" /></div>
                  <div><label className="form-label">CVV</label><input className="form-input" placeholder="000" /></div>
                </div>
                <button className="btn-primary" style={{width:'100%',justifyContent:'center',padding:13}}>
                  Ödemeyi Tamamla →
                </button>
                <p style={{fontSize:11,color:'var(--text-3)',textAlign:'center',marginTop:8}}>🔒 256-bit SSL ile güvenli ödeme</p>
              </div>
            </div>
          )}

          {/* BİLDİRİM AYARLARI */}
          {aktifTab === 'bildirimler' && (
            <div>
              <div className={styles.pageHeader}>
                <div>
                  <h1 className={styles.pageTitle}>Bildirim Ayarları</h1>
                  <p className={styles.pageSub}>Kriterlerinize uyan yeni talep girilince anında haberdar olun</p>
                </div>
              </div>
              <div className={styles.ayarBox}>
                <h3 className={styles.ayarBaslik}>📍 Konum Filtresi</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
                  <div><label className="form-label">Şehir</label>
                    <select className="form-select"><option>İstanbul</option><option>Ankara</option><option>İzmir</option></select></div>
                  <div><label className="form-label">Kategori</label>
                    <select className="form-select"><option>Tümü</option><option>Emlak</option><option>Vasıta</option></select></div>
                </div>
                <h3 className={styles.ayarBaslik}>💰 Fiyat Aralığı</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
                  <div><label className="form-label">Minimum</label><input className="form-input" placeholder="₺500.000" /></div>
                  <div><label className="form-label">Maksimum</label><input className="form-input" placeholder="₺5.000.000" /></div>
                </div>
                <h3 className={styles.ayarBaslik}>🔔 Bildirim Kanalı</h3>
                <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:20}}>
                  {[
                    {label:'E-posta bildirimi (ücretsiz)', desc:'Günlük özet e-posta', checked:true},
                    {label:'SMS bildirimi (Pro paket)', desc:'Anlık SMS — yeni talep anında', checked:false},
                    {label:'Anlık push bildirimi (Pro paket)', desc:'Tarayıcı bildirimi', checked:false},
                  ].map((b,i) => (
                    <label key={i} className={styles.toggleRow}>
                      <div>
                        <div style={{fontSize:14,fontWeight:500,color:'var(--text)'}}>{b.label}</div>
                        <div style={{fontSize:12,color:'var(--text-3)'}}>{b.desc}</div>
                      </div>
                      <div className={`${styles.toggle} ${b.checked ? styles.toggleOn : ''}`} />
                    </label>
                  ))}
                </div>
                <button className="btn-primary" style={{padding:'10px 24px'}}>Ayarları Kaydet</button>
              </div>
            </div>
          )}

          {/* FİRMA PROFİLİ */}
          {aktifTab === 'profil' && (
            <div>
              <div className={styles.pageHeader}>
                <div>
                  <h1 className={styles.pageTitle}>Firma Profili</h1>
                  <p className={styles.pageSub}>Alıcıların sizi tanıması için profil bilgilerinizi doldurun</p>
                </div>
              </div>
              <div className={styles.ayarBox}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
                  <div><label className="form-label">Firma Adı</label><input className="form-input" defaultValue="IQ TEKNO" /></div>
                  <div><label className="form-label">Firma Türü</label>
                    <select className="form-select"><option>Emlak Ofisi</option><option>Oto Galerisi</option><option>Bireysel</option></select></div>
                  <div><label className="form-label">Telefon</label><input className="form-input" placeholder="0212 000 00 00" /></div>
                  <div><label className="form-label">Web Sitesi</label><input className="form-input" placeholder="www.firmaniz.com" /></div>
                  <div style={{gridColumn:'1/-1'}}><label className="form-label">Adres</label><input className="form-input" placeholder="Mahalle, ilçe, şehir" /></div>
                  <div style={{gridColumn:'1/-1'}}><label className="form-label">Firma Hakkında</label>
                    <textarea className="form-input" rows="3" placeholder="Firmanızı kısaca tanıtın..." style={{resize:'vertical'}} /></div>
                </div>
                <button className="btn-primary" style={{padding:'10px 24px'}}>Profili Kaydet</button>
              </div>
            </div>
          )}

        </main>
      </div>

      <Footer />
      <IlanForm open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  )
}
