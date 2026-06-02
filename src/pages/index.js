import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import IlanKarti from '../components/IlanKarti'
import IlanForm from '../components/IlanForm'
import Footer from '../components/Footer'
import { sehirler } from '../data/sehirler'
import { ilanListele, ilanOlustur } from '../lib/db'
import styles from './index.module.css'

// Demo ilanlar
const demoIlanlar = [
  { id: 1, kategori: 'emlak', ad: 'Mehmet Arslan', sehir: 'İstanbul', ilce: 'Kadıköy', baslik: 'Kadıköy veya Üsküdar\'da 3+1 kiralık daire arıyorum', fiyatMin: 25000, fiyatMax: 35000, tags: [{label:'120 – 160 m²',variant:'tag-gray'},{label:'3+1',variant:'tag-gray'},{label:'Eşyalı tercih',variant:'tag-amber'},{label:'Asansör',variant:'tag-gray'}], aciklama: 'Asansörlü, otoparklı tercih ederim. Balkon şart. Ocak ayına kadar taşınmam gerekiyor.', tarih: '3 saat önce', goruntuleme: 47 },
  { id: 2, kategori: 'vasita', ad: 'Zeynep Koçak', sehir: 'İstanbul', ilce: 'Beşiktaş', baslik: '2018–2022 model BMW veya Mercedes arıyorum', fiyatMin: 800000, fiyatMax: 1200000, tags: [{label:'0 – 80.000 km',variant:'tag-gray'},{label:'Otomatik vites',variant:'tag-gray'},{label:'Benzin / Hybrid',variant:'tag-gray'}], aciklama: 'BMW 3 Serisi, 5 Serisi veya Mercedes C Serisi olabilir. Kazasız, boyasız tercih ederim.', tarih: '8 saat önce', goruntuleme: 128 },
  { id: 3, kategori: 'ikinci-el', ad: 'Ayşe Yılmaz', sehir: 'İstanbul', ilce: 'Şişli', baslik: 'L boyutunda köşe koltuk takımı arıyorum', fiyatMin: 15000, fiyatMax: 30000, tags: [{label:'Az kullanılmış',variant:'tag-gray'},{label:'Gri / Antrasit',variant:'tag-amber'}], aciklama: 'Taşıma imkânım var, elinizden teslim alabilirim.', tarih: '1 gün önce', goruntuleme: 31 },
  { id: 4, kategori: 'emlak', ad: 'Can Öztürk', sehir: 'İstanbul', ilce: 'Beşiktaş', baslik: 'Beşiktaş veya Şişli\'de satılık daire bakıyorum', fiyatMin: 8000000, fiyatMax: 15000000, tags: [{label:'150 – 250 m²',variant:'tag-gray'},{label:'3+1 / 4+1',variant:'tag-gray'},{label:'Deniz manzarası',variant:'tag-amber'}], aciklama: 'Yüksek katlı, güvenlikli site olmasını istiyorum. Peşin ödeme yapabilirim.', tarih: '2 gün önce', goruntuleme: 214 },
  { id: 5, kategori: 'vasita', ad: 'Burak Demir', sehir: 'Ankara', ilce: 'Çankaya', baslik: 'Ankara\'da Volkswagen Golf veya Passat arıyorum', fiyatMin: 500000, fiyatMax: 750000, tags: [{label:'2019–2023',variant:'tag-gray'},{label:'Dizel / Benzin',variant:'tag-gray'},{label:'Manuel / Otomatik',variant:'tag-gray'}], aciklama: 'DSG vitesli tercih ederim. Bakımlı olması önemli.', tarih: '2 gün önce', goruntuleme: 89 },
  { id: 6, kategori: 'emlak', ad: 'Selin Aktaş', sehir: 'İzmir', ilce: 'Karşıyaka', baslik: 'İzmir Karşıyaka\'da 2+1 satılık daire arıyorum', fiyatMin: 3000000, fiyatMax: 5000000, tags: [{label:'80 – 120 m²',variant:'tag-gray'},{label:'2+1',variant:'tag-gray'},{label:'Site içi',variant:'tag-amber'}], aciklama: 'Denize yakın, ulaşımı kolay bir konum istiyorum.', tarih: '3 gün önce', goruntuleme: 67 },
]

export default function Home() {
  const { user, yuklendi } = useAuth()
  const [formOpen, setFormOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [filterSehir, setFilterSehir] = useState('')
  const [filterIslem, setFilterIslem] = useState('')
  const [filterFiyatMin, setFilterFiyatMin] = useState('')
  const [filterFiyatMax, setFilterFiyatMax] = useState('')
  const [ilanlar, setIlanlar] = useState(demoIlanlar)
  const [dbHata, setDbHata] = useState(false)

  useEffect(() => {
    async function yukle() {
      const { data, error } = await ilanListele({ kategori: activeCategory || undefined, sehir: filterSehir || undefined })
      if (data && data.length > 0) {
        setIlanlar(data.map(d => ({
          id: d.id,
          kategori: d.kategori || 'ikinci-el',
          ad: (d.kullanici_ad || 'Kullanıcı') + ' ' + (d.kullanici_soyad || ''),
          sehir: d.sehir || '', ilce: d.ilce || '',
          baslik: (d.sehir || '') + (d.ilce ? ' ' + d.ilce : '') + ' — ' + (d.kategori || '') + ' arıyorum',
          fiyatMin: d.fiyat_min, fiyatMax: d.fiyat_max,
          tags: [
            d.oda ? {label: d.oda, variant:'tag-gray'} : null,
            d.m2_min && d.m2_max ? {label: d.m2_min + '–' + d.m2_max + ' m²', variant:'tag-gray'} : null,
            d.emlak_tip ? {label: d.emlak_tip, variant:'tag-gray'} : null,
            d.markalar ? {label: d.markalar, variant:'tag-gray'} : null,
            d.yil_min && d.yil_max ? {label: d.yil_min + '–' + d.yil_max, variant:'tag-gray'} : null,
          ].filter(Boolean),
          aciklama: d.aciklama || '',
          tarih: new Date(d.created_at).toLocaleDateString('tr-TR'),
          goruntuleme: d.goruntuleme || 0,
          telefon: d.kullanici_telefon || '',
          email: d.kullanici_email || '',
          created_at: d.created_at,
        })))
      } else if (error) {
        setDbHata(true) // DB bağlı değil, demo verilerle devam
      }
    }
    yukle()
  }, [activeCategory, filterSehir])
  const [sort, setSort] = useState('yeni')
  const [mesajHaklari, setMesajHaklari] = useState({}) // {ilanId: {gonderilenBuKisiye: N}}
  const [kalanGenel, setKalanGenel] = useState(3) // ücretsiz mesaj hakkı
  const [paketModal, setPaketModal] = useState(false)

  const filtered = ilanlar
    .filter(i => !activeCategory || i.kategori === activeCategory)
    .filter(i => !filterSehir || i.sehir === filterSehir)
    .sort((a, b) => {
      if (sort === 'cok-goruntulenen') return (b.goruntuleme||0) - (a.goruntuleme||0)
      const ta = String(a.created_at || a.id || '')
      const tb = String(b.created_at || b.id || '')
      return tb > ta ? 1 : tb < ta ? -1 : 0
    })

  async function handleSubmit(data) {
    // Önce DB'ye kaydet
    const { data: saved, error } = await ilanOlustur(data, user)
    if (error) {
      console.error('İlan kaydedilemedi:', error)
      // DB yoksa lokal state'e ekle (fallback)
    }
  
    const yeni = {
      id: Date.now(),
      kategori: data.kategori,
      ad: data.ad,
      sehir: data.sehir,
      ilce: data.ilce,
      baslik: `${data.sehir}${data.ilce ? ' ' + data.ilce : ''}'de ${data.islemTuru === 'kirala' ? 'kiralık' : 'satılık'} ${data.kategori === 'emlak' ? (data.emlakTip || 'mülk') : data.kategori === 'vasita' ? 'araç' : 'ürün'} arıyorum`,
      fiyatMin: data.fiyatMin ? parseInt(data.fiyatMin.replace(/\D/g,'')) : null,
      fiyatMax: data.fiyatMax ? parseInt(data.fiyatMax.replace(/\D/g,'')) : null,
      tags: [
        data.oda?.length ? { label: data.oda.join(', '), variant: 'tag-gray' } : null,
        data.m2Min && data.m2Max ? { label: `${data.m2Min} – ${data.m2Max} m²`, variant: 'tag-gray' } : null,
        data.markalar?.length ? { label: data.markalar.slice(0,3).join(', '), variant: 'tag-gray' } : null,
        data.yilMin && data.yilMax ? { label: `${data.yilMin} – ${data.yilMax}`, variant: 'tag-gray' } : null,
        data.kmMax ? { label: `Max ${parseInt(data.kmMax).toLocaleString('tr-TR')} km`, variant: 'tag-gray' } : null,
      ].filter(Boolean),
      aciklama: data.aciklama,
      tarih: 'Az önce',
      goruntuleme: 0,
    }
    setIlanlar(prev => [yeni, ...prev])
  }

  return (
    <>
      <Head>
        <title>AlmakIstiyor.com — Ne Arıyorsunuz? Söyleyin, Satıcılar Bulsun</title>
      </Head>

      <Navbar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onIlanVer={() => setFormOpen(true)}
      />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroLeft}>
            <div className={styles.heroBadge}>
              <span className={styles.dot} /> Canlı — bu hafta 1.847 yeni talep
            </div>
            <h1 className={styles.heroH1}>
              Ne arıyorsunuz?<br />
              <em>Söyleyin, satıcılar<br />sizi bulsun.</em>
            </h1>
            <p className={styles.heroSub}>
              Ücretsiz talep verin, spam yok. Telefon numaranız yalnızca izin verdiğiniz satıcıya gösterilir.
            </p>
            <div className={styles.heroStats}>
              {[
                { num: '14.320', label: 'Aktif talep ilanı' },
                { num: '3.800+', label: 'Kayıtlı satıcı' },
                { num: '%94', label: 'Eşleşme oranı' },
              ].map(s => (
                <div key={s.label} className={styles.stat}>
                  <div className={styles.statNum}>{s.num}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.heroCard}>
              <h3>Hızlı talep ver</h3>
              <p>2 dakikada ilanınız yayında — tamamen ücretsiz</p>
              <div className={styles.catGrid3}>
                {[
                  { slug:'emlak', icon:'🏠', label:'Emlak' },
                  { slug:'vasita', icon:'🚗', label:'Vasıta' },
                  { slug:'ikinci-el', icon:'📦', label:'İkinci El' },
                ].map(c => (
                  <button key={c.slug} className={styles.catBtn}
                    onClick={() => setFormOpen(true)}>
                    <span style={{fontSize:22}}>{c.icon}</span>
                    <span style={{fontSize:12,fontWeight:500,color:'var(--text-2)'}}>{c.label}</span>
                  </button>
                ))}
              </div>
              <div className={styles.privNote}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Telefon numaranız satıcılara gizlidir — siz izin verene kadar
              </div>
              <button className="btn-primary" style={{width:'100%',justifyContent:'center',fontSize:15}}
                onClick={() => setFormOpen(true)}>
                Detaylı talep ver →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className={styles.trustBar}>
        <div className={`container ${styles.trustInner}`}>
          {[
            { icon: '🔒', text: 'Telefon numaranız gizli kalır' },
            { icon: '⚡', text: '2 dakikada ilan ver' },
            { icon: '✓', text: 'Alıcıya tamamen ücretsiz' },
            { icon: '🛡️', text: 'Spam yok, sizi koruyoruz' },
          ].map(t => (
            <div key={t.text} className={styles.trustItem}>
              <span>{t.icon}</span> {t.text}
            </div>
          ))}
        </div>
      </div>

      {/* KULLANICI KARŞILAMA BANNER */}
      {user && (
        <div style={{background:'var(--teal-light)',borderBottom:'1px solid var(--teal-mid)',padding:'10px 24px'}}>
          <div style={{maxWidth:1200,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:'var(--teal)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Sora,sans-serif',fontWeight:700,fontSize:12,flexShrink:0}}>
                {(user.ad?.[0]||'')+(user.soyad?.[0]||'')}
              </div>
              <span style={{fontSize:14,color:'var(--teal-dark)',fontWeight:500}}>
                Merhaba, {user.ad}! {user.tur === 'satici' ? (user.firma || 'Profesyonel hesap') : 'Alıcı hesabı'}
              </span>
              {ilanlar.some(i => i.goruntuleme > 0) && (
                <span style={{background:'var(--teal)',color:'white',fontSize:11,fontWeight:600,padding:'2px 9px',borderRadius:20}}>
                  İlanlarınıza bakıldı
                </span>
              )}
            </div>
            <div style={{display:'flex',gap:8}}>
              <a href="/panel" style={{fontSize:13,padding:'6px 14px',borderRadius:8,background:'var(--teal)',color:'white',fontWeight:500,display:'inline-flex',alignItems:'center',gap:5}}>
                📋 İlanlarım
              </a>
              <a href="/panel?tab=mesajlar" style={{fontSize:13,padding:'6px 14px',borderRadius:8,border:'1.5px solid var(--teal)',color:'var(--teal)',fontWeight:500,display:'inline-flex',alignItems:'center',gap:5}}>
                💬 Mesajlarım <span style={{background:'var(--teal)',color:'white',borderRadius:20,padding:'1px 6px',fontSize:11}}>2</span>
              </a>
              {user.tur === 'satici' && (
                <a href="/satici" style={{fontSize:13,padding:'6px 14px',borderRadius:8,border:'1.5px solid var(--teal)',color:'var(--teal)',fontWeight:500}}>
                  Satıcı Paneli →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div className={`container ${styles.main}`}>

        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.ctaCard}>
            <h4>Siz de talep verin!</h4>
            <p>Ne aradığınızı yazın, satıcılar sizi bulsun</p>
            <button className={styles.ctaWhite} onClick={() => setFormOpen(true)}>
              Hemen başla →
            </button>
          </div>

          <div className={styles.filterCard}>
            <div className={styles.filterTitle}>Filtrele</div>

            <div className={styles.filterGroup}>
              <label className="form-label">Şehir</label>
              <select className="form-select" value={filterSehir}
                onChange={e => setFilterSehir(e.target.value)}>
                <option value="">Tüm şehirler</option>
                {sehirler.map(s => (
                  <option key={s.il} value={s.il}>{s.il}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className="form-label">Kategori</label>
              <div className={styles.chips}>
                {[{v:'',l:'Tümü'},{v:'emlak',l:'Emlak'},{v:'vasita',l:'Vasıta'},{v:'ikinci-el',l:'İkinci El'}].map(c => (
                  <button key={c.v}
                    className={`${styles.chip} ${activeCategory === c.v ? styles.chipActive : ''}`}
                    onClick={() => setActiveCategory(c.v)}>
                    {c.l}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className="form-label">İlan tarihi</label>
              <div className={styles.chips}>
                {['Tümü','Bugün','Bu hafta'].map(d => (
                  <button key={d} className={styles.chip}>{d}</button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.sellerCard}>
            <div className={styles.freeBadge}>3 ücretsiz hak</div>
            <h5>Emlakçı veya Galericiler</h5>
            <p>Talep ilanlarına erişin. İlk 3 görüntüleme ücretsiz.</p>
            <a href="/satici" className="btn-ghost" style={{width:'100%',justifyContent:'center',fontSize:13}}>
              Satıcı girişi →
            </a>
          </div>
        </aside>

        {/* LİSTİNGS */}
        <main className={styles.listings}>
          <div className={styles.listHeader}>
            <div className={styles.listCount}>
              <strong>{filtered.length.toLocaleString('tr-TR')}</strong> talep ilanı
            </div>
            <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
              <option value="yeni">En yeni önce</option>
              <option value="cok-goruntulenen">En çok görüntülenen</option>
            </select>
          </div>

          <div className={styles.listGrid}>
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <p>Bu kriterlere uygun ilan bulunamadı.</p>
                <button className="btn-primary" onClick={() => setFormOpen(true)}>
                  İlk ilanı siz verin →
                </button>
              </div>
            ) : (
              filtered.map((ilan, i) => (
                <IlanKarti
                  key={ilan.id}
                  ilan={ilan}
                  user={user}
                  mesajHaklari={{
                    kalanGenel,
                    gonderilenBuKisiye: mesajHaklari[ilan.id]?.gonderilenBuKisiye || 0
                  }}
                  onMesajGonder={({ilan: il, mesaj}) => {
                    setMesajHaklari(p => ({
                      ...p,
                      [il.id]: { gonderilenBuKisiye: (p[il.id]?.gonderilenBuKisiye||0) + 1 }
                    }))
                    setKalanGenel(p => Math.max(0, p-1))
                  }}
                  onTelefonGoster={(il) => setPaketModal(true)}
                />
              ))
            )}
          </div>

          {filtered.length > 0 && (
            <div className={styles.pagination}>
              {['←', '1', '2', '3', '…', '48', '→'].map((p, i) => (
                <button key={i} className={`${styles.pageBtn} ${p === '1' ? styles.pageBtnActive : ''}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />

      {paketModal && (
        <div style={{position:'fixed',inset:0,zIndex:300,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}
          onClick={e => e.target===e.currentTarget && setPaketModal(false)}>
          <div style={{background:'white',borderRadius:16,padding:32,width:400,maxWidth:'100%',boxShadow:'0 12px 40px rgba(0,0,0,0.2)',textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:12}}>🔒</div>
            <h3 style={{fontFamily:'Sora,sans-serif',fontSize:20,fontWeight:700,color:'var(--text)',marginBottom:8}}>Telefon numarası için paket gerekli</h3>
            <p style={{fontSize:14,color:'var(--text-2)',marginBottom:20,lineHeight:1.7}}>
              Alıcının telefon numarasını görmek için <strong>Starter veya üzeri</strong> paket satın almanız gerekiyor.
            </p>
            <a href="/pro" style={{display:'block',padding:'12px 24px',borderRadius:9,background:'var(--teal)',color:'white',fontFamily:'Sora,sans-serif',fontWeight:600,fontSize:15,marginBottom:10}}>
              Paketlere Bak →
            </a>
            <button onClick={() => setPaketModal(false)} style={{background:'none',border:'none',color:'var(--text-3)',fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>
              Şimdilik geç
            </button>
          </div>
        </div>
      )}
      <IlanForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} user={user} />
    </>
  )
}
