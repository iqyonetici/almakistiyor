import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import Head from 'next/head'
import Navbar, { kategoriler as navKategoriler } from '../components/Navbar'
import IlanKarti from '../components/IlanKarti'
import IlanForm from '../components/IlanForm'
import Footer from '../components/Footer'
import SidebarKategoriler from '../components/SidebarKategoriler'
import { sehirler } from '../data/sehirler'
import { kategorileriGetir } from '../lib/kategoriDB'
import { ilanListele, ilanOlustur } from '../lib/db'
import { supabase } from '../lib/supabase'
import styles from './index.module.css'

const demoIlanlar = [
  { id: 1, kategori: 'emlak', ad: 'Mehmet Arslan', sehir: 'İstanbul', ilce: 'Kadıköy', baslik: "Kadıköy'de 3+1 kiralık daire arıyorum", fiyatMin: 25000, fiyatMax: 35000, tags: [{label:'3+1',variant:'tag-gray'},{label:'Eşyalı',variant:'tag-amber'}], aciklama: 'Asansörlü, otoparkı tercih ederim.', tarih: '3 saat önce', goruntuleme: 47 },
  { id: 2, kategori: 'vasita', ad: 'Zeynep Koçak', sehir: 'İstanbul', ilce: 'Beşiktaş', baslik: 'BMW veya Mercedes arıyorum', fiyatMin: 800000, fiyatMax: 1200000, tags: [{label:'Otomatik',variant:'tag-gray'}], aciklama: 'Kazasız tercih ederim.', tarih: '8 saat önce', goruntuleme: 128 },
  { id: 3, kategori: 'alisveris', ad: 'Ayşe Yılmaz', sehir: 'İstanbul', ilce: 'Şişli', baslik: 'Köşe koltuk takımı arıyorum', fiyatMin: 15000, fiyatMax: 30000, tags: [], aciklama: 'Taşıma imkânım var.', tarih: '1 gün önce', goruntuleme: 31 },
]

const KELIMELER = ['ev', 'araba', 'özel ders', 'yazlık', 'motosiklet', 'daire', 'arsa', 'iPhone', 'villa', 'koltuk']

export default function Home() {
  const { user } = useAuth()
  const [formOpen, setFormOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [aktifFiltre, setAktifFiltre] = useState(null)
  const [filterSehir, setFilterSehir] = useState('')
  const [filterIlce, setFilterIlce] = useState('')
  const [filterTarih, setFilterTarih] = useState('')
  const [ilanlar, setIlanlar] = useState(demoIlanlar)
  const [sort, setSort] = useState('yeni')
  const [mesajHaklari, setMesajHaklari] = useState({})
  const [kalanGenel, setKalanGenel] = useState(3)
  const [paketModal, setPaketModal] = useState(false)
  const [stats, setStats] = useState({ ilanSayisi: 0, kullaniciSayisi: 0 })
  const [kategoriAgaci, setKategoriAgaci] = useState([])
  const [kelimeIndex, setKelimeIndex] = useState(0)
  const [kelimeFade, setKelimeFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setKelimeFade(false)
      setTimeout(() => { setKelimeIndex(i => (i + 1) % KELIMELER.length); setKelimeFade(true) }, 300)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function loadStats() {
      if (supabase) {
        const { count: ilanCount } = await supabase.from('ilanlar').select('*', { count: 'exact', head: true }).eq('durum', 'aktif')
        const { count: kullaniciCount } = await supabase.from('kullanicilar').select('*', { count: 'exact', head: true })
        setStats({ ilanSayisi: ilanCount || 0, kullaniciSayisi: kullaniciCount || 0 })
      }
    }
    loadStats()
    kategorileriGetir().then(setKategoriAgaci)

    async function yukle() {
      const anaKategoriler = ['emlak','vasita','alisveris','is-makineleri','hizmetler','ozel-ders','is-ilanlari','hayvanlar','yedek-parca']
      const isAltKat = activeCategory && !anaKategoriler.includes(activeCategory)
      const { data } = await ilanListele({
        kategori: isAltKat ? undefined : (activeCategory || undefined),
        altKategori: (isAltKat && !aktifFiltre) ? activeCategory : undefined,
        emlakTip: aktifFiltre?.tip === 'emlak_tip' ? aktifFiltre.deger : undefined,
        marka: aktifFiltre?.tip === 'marka' ? aktifFiltre.deger : undefined,
        sehir: filterSehir || undefined,
        ilce: filterIlce || undefined,
      })
      if (data && data.length > 0) {
        setIlanlar(data.map(d => ({
          id: d.id, kategori: d.kategori || 'alisveris', altKategori: d.alt_kategori || '',
          ad: (d.kullanici_ad || 'Kullanıcı') + ' ' + (d.kullanici_soyad || ''),
          sehir: d.sehir || '', ilce: d.ilce || '',
          baslik: (() => {
            const s = [d.sehir, d.ilce].filter(Boolean).join(' ')
            if (d.kategori === 'emlak') return `${s ? s + "'da " : ''}${d.emlak_tip || 'Emlak'} arıyorum`
            if (d.kategori === 'vasita') return `${d.markalar || 'Araç'} arıyorum`
            return (s ? s + ' — ' : '') + (d.aciklama?.slice(0, 50) || d.kategori + ' arıyorum')
          })(),
          fiyatMin: d.fiyat_min, fiyatMax: d.fiyat_max,
          tags: [
            d.oda ? { label: d.oda, variant: 'tag-gray' } : null,
            d.m2_min && d.m2_max ? { label: d.m2_min + '–' + d.m2_max + ' m²', variant: 'tag-gray' } : null,
            d.emlak_tip ? { label: d.emlak_tip, variant: 'tag-gray' } : null,
            d.markalar && d.kategori === 'vasita' ? { label: d.markalar, variant: 'tag-gray' } : null,
            d.yil_min && d.yil_max ? { label: d.yil_min + '–' + d.yil_max, variant: 'tag-gray' } : null,
            d.km_max ? { label: 'Max ' + Number(d.km_max).toLocaleString('tr-TR') + ' km', variant: 'tag-gray' } : null,
          ].filter(Boolean),
          aciklama: d.aciklama || '', tarih: new Date(d.created_at).toLocaleDateString('tr-TR'),
          goruntuleme: d.goruntuleme || 0, telefon: d.kullanici_telefon || '',
          email: d.kullanici_email || '', iletisimTercihi: d.iletisim_tercihi || 'mesaj',
          created_at: d.created_at, emlak_tip: d.emlak_tip,
        })))
      } else {
        setIlanlar([])
      }
    }
    yukle()
  }, [activeCategory, aktifFiltre, filterSehir, filterIlce])

  const filtered = ilanlar
    .filter(i => !filterSehir || i.sehir === filterSehir)
    .filter(i => !filterIlce || i.ilce === filterIlce)
    .filter(i => {
      if (!filterTarih) return true
      const t = new Date(i.created_at || Date.now()), now = new Date()
      if (filterTarih === 'bugun') return t.toDateString() === now.toDateString()
      if (filterTarih === 'hafta') return t >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return true
    })
    .sort((a, b) => {
      if (sort === 'cok-goruntulenen') return (b.goruntuleme || 0) - (a.goruntuleme || 0)
      return String(b.created_at || b.id || '') > String(a.created_at || a.id || '') ? 1 : -1
    })

  const handleKatChange = useCallback((slug, filtre = null) => {
    setActiveCategory(slug)
    setAktifFiltre(filtre)
    setTimeout(() => document.getElementById('ilan-listesi')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }, [])

  async function handleSubmit(data) {
    await ilanOlustur(data, user)
    setIlanlar(prev => [{
      id: Date.now(), kategori: data.kategori, ad: data.ad, sehir: data.sehir, ilce: data.ilce,
      baslik: `${data.sehir}'de arıyorum`, fiyatMin: null, fiyatMax: null, tags: [],
      aciklama: data.aciklama, tarih: 'Az önce', goruntuleme: 0,
    }, ...prev])
  }

  return (
    <>
      <Head>
        <title>AlmakIstiyor.com — Ne Arıyorsunuz? Söyleyin, Satıcılar Bulsun</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <Navbar activeCategory={activeCategory} onCategoryChange={handleKatChange} onIlanVer={() => setFormOpen(true)} />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLogo}>
            <span className={styles.heroLogoIkon}>✓</span>
            <span className={styles.heroLogoText}>
              <strong>almak</strong>istiyor<span className={styles.heroLogoCom}>.com</span>
            </span>
          </div>
          <h1 className={styles.heroH1}>
            Aramayı bırakın, <span className={styles.heroVurgu}>satıcılar sizi bulsun</span>
          </h1>
          <p className={styles.heroSub}>
            Ne almak istediğinizi yazın; ev, araba, telefon ne olursa. Satıcılar size özel teklif göndersin.
          </p>
          <button className={styles.heroArama} onClick={() => setFormOpen(true)}>
            <span className={styles.heroAramaSol}>
              <strong>Almak</strong><span className={styles.heroAramaPlaceholder}>istiyorum...</span>
            </span>
            <span className={styles.heroAramaBtn}>+ Talep Oluştur</span>
          </button>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{stats.ilanSayisi > 0 ? stats.ilanSayisi.toLocaleString('tr-TR') : '2.854'}</span>
              <span className={styles.statLabel}>aktif talep</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>{stats.kullaniciSayisi > 0 ? stats.kullaniciSayisi.toLocaleString('tr-TR') : '1.426'}</span>
              <span className={styles.statLabel}>kullanıcı</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>%94</span>
              <span className={styles.statLabel}>eşleşme</span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.mobileFilterBar}>
        {navKategoriler.slice(0, 8).map(kat => (
          <button key={kat.slug}
            className={`${styles.mobileChip} ${activeCategory === kat.slug ? styles.mobileChipAktif : ''}`}
            onClick={() => handleKatChange(kat.slug)}>
            {kat.icon} {kat.label}
          </button>
        ))}
      </div>

      <div className={styles.trustBar}>
        <div className={`container ${styles.trustInner}`}>
          {[
            { icon: '🔒', text: 'Telefon numaranız gizli kalır' },
            { icon: '⚡', text: '2 dakikada ilan ver' },
            { icon: '✓', text: 'Alıcıya tamamen ücretsiz' },
            { icon: '🛡️', text: 'Spam yok' },
          ].map(t => (
            <div key={t.text} className={styles.trustItem}><span>{t.icon}</span> {t.text}</div>
          ))}
        </div>
      </div>

      {user && (
        <div style={{ background: '#E6F5F2', borderBottom: '1px solid #B2DDD7', padding: '8px 16px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#085549', fontWeight: 500 }}>Merhaba, {user.ad}!</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href="/panel" style={{ fontSize: 12, padding: '5px 12px', borderRadius: 7, background: '#0D7A6B', color: 'white', fontWeight: 500 }}>📋 İlanlarım</a>
              <a href="/panel?tab=mesajlar" style={{ fontSize: 12, padding: '5px 12px', borderRadius: 7, border: '1.5px solid #0D7A6B', color: '#0D7A6B', fontWeight: 500 }}>💬 Mesajlarım</a>
            </div>
          </div>
        </div>
      )}

      <div className={`container ${styles.main}`}>
        <aside className={styles.sidebar}>
          <div className={styles.ctaCard}>
            <h4>Talep ver, satıcılar seni bulsun</h4>
            <button className={styles.ctaWhite} onClick={() => setFormOpen(true)}>Hemen başla →</button>
          </div>

          <div className={styles.filterCard}>
            <div className={styles.filterTitle}>🔍 Filtrele</div>
            <div className={styles.filterGroup}>
              <label className="form-label">📍 Şehir</label>
              <select className="form-select" value={filterSehir}
                onChange={e => { setFilterSehir(e.target.value); setFilterIlce('') }}>
                <option value="">Tüm şehirler</option>
                {sehirler.map(s => <option key={s.il} value={s.il}>{s.il}</option>)}
              </select>
            </div>
            {filterSehir && (
              <div className={styles.filterGroup}>
                <label className="form-label">📎 İlçe</label>
                <select className="form-select" value={filterIlce} onChange={e => setFilterIlce(e.target.value)}>
                  <option value="">Tüm ilçeler</option>
                  {(sehirler.find(s => s.il === filterSehir)?.ilceler || []).map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            )}
            <div className={styles.filterGroup}>
              <label className="form-label">🗂️ Kategori</label>
              <SidebarKategoriler KATEGORILER={kategoriAgaci} activeCategory={activeCategory} onKatChange={handleKatChange} />
            </div>
            <div className={styles.filterGroup}>
              <label className="form-label">📅 Tarih</label>
              <div className={styles.chips}>
                {[{ v: '', l: 'Tümü' }, { v: 'bugun', l: 'Bugün' }, { v: 'hafta', l: 'Bu hafta' }].map(d => (
                  <button key={d.v} className={`${styles.chip} ${filterTarih === d.v ? styles.chipActive : ''}`}
                    onClick={() => setFilterTarih(d.v)}>{d.l}</button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.sellerCard}>
            <div className={styles.freeBadge}>3 ücretsiz hak</div>
            <h5>Emlakçı veya Galericiler</h5>
            <p>Talep ilanlarına erişin.</p>
            <a href="/satici" className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>Satıcı girişi →</a>
          </div>
        </aside>

        <main className={styles.listings} id="ilan-listesi">
          <div className={styles.listHeader}>
            <div className={styles.listCount}><strong>{filtered.length.toLocaleString('tr-TR')}</strong> talep ilanı</div>
            <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
              <option value="yeni">En yeni</option>
              <option value="cok-goruntulenen">En çok görüntülenen</option>
            </select>
          </div>
          <div className={styles.listGrid}>
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <p>Bu kriterlere uygun ilan bulunamadı.</p>
                <button className="btn-primary" onClick={() => setFormOpen(true)}>İlk ilanı siz verin →</button>
              </div>
            ) : (
              filtered.map(ilan => (
                <IlanKarti key={ilan.id} ilan={ilan} user={user}
                  mesajHaklari={{ kalanGenel, gonderilenBuKisiye: mesajHaklari[ilan.id]?.gonderilenBuKisiye || 0 }}
                  onMesajGonder={async ({ ilan: il, mesaj }) => {
                    const { konusmaBaslatVeyaGetir: kBVG, konusmaMesajGonder: kMG } = await import('../lib/db')
                    const { data: konusma } = await kBVG({ ilanId: il.id, ilanBaslik: il.baslik, ilanKategori: il.kategori, aliciEmail: il.email || '', aliciAd: il.ad || '', saticiEmail: user?.email || 'anonim', saticiAd: user ? `${user.ad || ''} ${user.soyad || ''}`.trim() : 'Anonim', saticiIfirma: user?.firma || null })
                    if (konusma) await kMG({ konusmaId: konusma.id, gonderenEmail: user?.email || 'anonim', gonderenAd: user ? `${user.ad || ''} ${user.soyad || ''}`.trim() : 'Anonim', metin: mesaj, gonderenAliciMi: false })
                    setMesajHaklari(p => ({ ...p, [il.id]: { gonderilenBuKisiye: (p[il.id]?.gonderilenBuKisiye || 0) + 1 } }))
                    setKalanGenel(p => Math.max(0, p - 1))
                  }}
                  onTelefonGoster={() => setPaketModal(true)}
                />
              ))
            )}
          </div>
          {filtered.length > 0 && (
            <div className={styles.pagination}>
              {['←', '1', '2', '3', '...', '→'].map((p, i) => (
                <button key={i} className={`${styles.pageBtn} ${p === '1' ? styles.pageBtnActive : ''}`}>{p}</button>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />

      {paketModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => e.target === e.currentTarget && setPaketModal(false)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, width: 360, maxWidth: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🔒</div>
            <h3 style={{ fontFamily: 'Sora,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Telefon için paket gerekli</h3>
            <p style={{ fontSize: 14, color: '#4a5568', marginBottom: 18, lineHeight: 1.6 }}>Alıcının numarasını görmek için Starter paketi gerekiyor.</p>
            <a href="/pro" style={{ display: 'block', padding: '12px', borderRadius: 9, background: '#0D7A6B', color: 'white', fontWeight: 600, fontSize: 15, marginBottom: 10 }}>Paketlere Bak →</a>
            <button onClick={() => setPaketModal(false)} style={{ background: 'none', border: 'none', color: '#8a95a3', fontSize: 13, cursor: 'pointer' }}>Şimdilik geç</button>
          </div>
        </div>
      )}

      <IlanForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} user={user} />
    </>
  )
}
