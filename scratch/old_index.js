function lokEk(k){if(!k)return 'da';const un=['a','e',String.fromCharCode(305),'i','o',String.fromCharCode(246),'u',String.fromCharCode(252)];const ka=['a',String.fromCharCode(305),'o','u'];const sr=[String.fromCharCode(231),'f','h','k','p','s',String.fromCharCode(351),'t'];let u='';for(let i=k.length-1;i>=0;i--){const h=k[i].toLowerCase();if(un.includes(h)){u=h;break}}const sn=k.slice(-1).toLowerCase();return(ka.includes(u)?(sr.includes(sn)?'ta':'da'):(sr.includes(sn)?'te':'de'))}

function lokasyonEki(k) {
  if (!k) return 'da'
  const unlu = ['a','e','\u0131','i','o','\u00f6','u','\u00fc']
  const kalin = ['a','\u0131','o','u']
  const sert = ['\u00e7','f','h','k','p','s','\u015f','t']
  let u = ''
  for (let i = k.length-1; i >= 0; i--) { const h=k[i].toLowerCase(); if(unlu.includes(h)){u=h;break} }
  const son = k.slice(-1).toLowerCase()
  return (kalin.includes(u) ? (sert.includes(son)?'ta':'da') : (sert.includes(son)?'te':'de'))
}
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
import { ilanHakkiVarMi, mesajHakkiVarMi, kullaniciHaklari, bugunkuMesajSayisi } from '../lib/limitDB'
import { supabase } from '../lib/supabase'
import styles from './index.module.css'

const demoIlanlar = [
  { id: 1, kategori: 'emlak', ad: 'Mehmet Arslan', sehir: '─░stanbul', ilce: 'Kad─▒k├Ây', baslik: "Kad─▒k├Ây'de 3+1 kiral─▒k daire ar─▒yorum", fiyatMin: 25000, fiyatMax: 35000, tags: [{label:'3+1',variant:'tag-gray'},{label:'E┼şyal─▒',variant:'tag-amber'}], aciklama: 'Asans├Ârl├╝, otopark─▒ tercih ederim.', tarih: '3 saat ├Ânce', goruntuleme: 47 },
  { id: 2, kategori: 'vasita', ad: 'Zeynep Ko├ğak', sehir: '─░stanbul', ilce: 'Be┼şikta┼ş', baslik: 'BMW veya Mercedes ar─▒yorum', fiyatMin: 800000, fiyatMax: 1200000, tags: [{label:'Otomatik',variant:'tag-gray'}], aciklama: 'Kazas─▒z tercih ederim.', tarih: '8 saat ├Ânce', goruntuleme: 128 },
  { id: 3, kategori: 'alisveris', ad: 'Ay┼şe Y─▒lmaz', sehir: '─░stanbul', ilce: '┼Şi┼şli', baslik: 'K├Â┼şe koltuk tak─▒m─▒ ar─▒yorum', fiyatMin: 15000, fiyatMax: 30000, tags: [], aciklama: 'Ta┼ş─▒ma imk├ón─▒m var.', tarih: '1 g├╝n ├Ânce', goruntuleme: 31 },
]

const KELIMELER = ['ev', 'araba', '├Âzel ders', 'yazl─▒k', 'motosiklet', 'daire', 'arsa', 'iPhone', 'villa', 'koltuk']

export default function Home() {
  const { user } = useAuth(); const [anaOkunmamis, setAnaOkunmamis] = useState(0); const [heroYazi, setHeroYazi] = useState(''); useEffect(() => { const kel = ['Araba','Ev','Telefon','├ûzel ders','Hasta bak─▒c─▒','Boya badana','Trakt├Âr','Yavru k├Âpek','Laptop','Daire']; let ki = 0, h = 0, sil = false, t; function adim() { const k = kel[ki]; if (!sil) { h++; setHeroYazi(k.slice(0, h)); if (h === k.length) { sil = true; t = setTimeout(adim, 1400); return; } } else { h--; setHeroYazi(k.slice(0, h)); if (h === 0) { sil = false; ki = (ki + 1) % kel.length; } } t = setTimeout(adim, sil ? 45 : 95); } adim(); return () => clearTimeout(t); }, []); useEffect(() => { let aktif = true; async function say() { if (!user?.email) { setAnaOkunmamis(0); return; } try { const { supabase } = await import('../lib/supabase'); if (!supabase) return; const { data: a } = await supabase.from('konusmalar').select('okunmamis_alici').eq('alici_email', user.email); const { data: s } = await supabase.from('konusmalar').select('okunmamis_satici').eq('satici_email', user.email); const t = (a||[]).reduce((x,k)=>x+(k.okunmamis_alici||0),0) + (s||[]).reduce((x,k)=>x+(k.okunmamis_satici||0),0); if (aktif) setAnaOkunmamis(t); } catch (e) {} } say(); const z = setInterval(say, 60000); return () => { aktif = false; clearInterval(z); }; }, [user]);
  const [formOpen, setFormOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [aktifFiltre, setAktifFiltre] = useState(null)
  const [katSeviye, setKatSeviye] = useState(1)
  const [yenile, setYenile] = useState(0)
  const [filterSehir, setFilterSehir] = useState('')
  const [filterIlce, setFilterIlce] = useState('')
  const [filterTarih, setFilterTarih] = useState('')
  const [ilanlar, setIlanlar] = useState(demoIlanlar)
  const [sort, setSort] = useState('yeni')
  const [mesajHaklari, setMesajHaklari] = useState({})
  const [kalanGenel, setKalanGenel] = useState(0)
  const [telefonYetkisi, setTelefonYetkisi] = useState(false)
  const [paketModal, setPaketModal] = useState(false)
  const [limitUyari, setLimitUyari] = useState(null)
  const [misafirIlanSayisi, setMisafirIlanSayisi] = useState(0)

  // ─░lan formunu a├ğmadan ├Ânce hak kontrol├╝
  async function formAc() {
    // Misafir (├╝ye de─şil): localStorage'da ka├ğ ilan verdi─şini say
    if (!user?.email) {
      const verilen = Number(localStorage.getItem('misafir_ilan') || 0)
      if (verilen >= 1) {
        setLimitUyari({
          tip: 'misafir',
          mesaj: 'Misafir olarak 1 ilan verebilirsiniz. Daha fazla ilan i├ğin ├╝cretsiz ├╝ye olun (mail onay─▒ ile g├╝nde 3 ilan).'
        })
        return
      }
      setFormOpen(true)
      return
    }
    // ├£ye: DB'den hak kontrol├╝
    const sonuc = await ilanHakkiVarMi(user)
    if (!sonuc.izin) {
      setLimitUyari({ tip: sonuc.sebep, mesaj: sonuc.mesaj, paket: sonuc.paket })
      return
    }
    setFormOpen(true)
  }
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

  // Kullan─▒c─▒ giri┼ş yap─▒nca mesaj hakk─▒n─▒ y├╝kle (user de─şi┼şince tekrar ├ğal─▒┼ş─▒r)
  useEffect(() => {
    if (!user?.email) { setKalanGenel(0); setTelefonYetkisi(false); return }
    let iptal = false
    ;(async () => {
      const h = await kullaniciHaklari(user.email)
      const kullanilan = await bugunkuMesajSayisi(user.email)
      if (!iptal) {
        setKalanGenel(Math.max(0, h.gunlukMesaj - kullanilan))
        setTelefonYetkisi(h.telefonGoster)
      }
    })()
    return () => { iptal = true }
  }, [user])

  // ─░lanlar─▒ y├╝kle ÔÇö hem effect hem ilan olu┼şturma sonras─▒ ├ğa─şr─▒l─▒r
  const yukle = useCallback(async () => {
    const anaKategoriler = ['emlak','vasita','alisveris','is-makineleri','hizmetler','ozel-ders','is-ilanlari','hayvanlar','yedek-parca']
    const isAltKat = activeCategory && !anaKategoriler.includes(activeCategory)

    // Vas─▒tada marka filtresi (markalar kolonunda DB'de aran─▒r)
    const vasitaMarkaArama = (katSeviye >= 3) && (aktifFiltre?.tip === 'marka' || aktifFiltre?.deger)
    const markaFiltre = vasitaMarkaArama ? (aktifFiltre?.deger || null) : undefined

    // ana kategoriyi bul ÔÇö alt kategoride katYol[0] olmal─▒ ama bilemiyoruz, hepsi gelsin
    // DB'ye sadece ana kategori gonderilir, alt seviye JS'te filtrelenir
    const { data } = await ilanListele({
      kategori: isAltKat ? undefined : (activeCategory || undefined),
      emlakTip: aktifFiltre?.tip === 'emlak_tip' ? aktifFiltre.deger : undefined,
      marka: markaFiltre || undefined,
      sehir: filterSehir || undefined,
      ilce: filterIlce || undefined,
      kullaniciEmail: user?.email || undefined,
    })

    // JS taraf─▒ filtre: alt kategori se├ğildiyse ilan─▒n kategori_yol/alt_kategori/alt_kategori2 alanlar─▒nda ara
    let veri = data || []
    if (isAltKat && activeCategory) {
      veri = veri.filter(d => {
        if (d.alt_kategori === activeCategory) return true
        if (d.alt_kategori2 === activeCategory) return true
        if (d.kategori && d.kategori_yol && Array.isArray(d.kategori_yol)) {
          return d.kategori_yol.some(k => k && k.slug === activeCategory)
        }
        return false
      })
    }
    if (veri && veri.length > 0) {
      setIlanlar(veri.map(d => ({
        id: d.id, kategori: d.kategori || 'alisveris', altKategori: d.alt_kategori || '',
        ad: (d.kullanici_ad || 'Kullan─▒c─▒') + ' ' + (d.kullanici_soyad || ''),
        sehir: d.sehir || '', ilce: d.ilce || '',
        baslik: (() => {
          // ├çoklu konum varsa ilk ┼şehri, yoksa tek ┼şehri al
          const ilkKonum = (d.konumlar && d.konumlar.length > 0) ? d.konumlar[0] : null
          const bsehir = ilkKonum ? ilkKonum.sehir : d.sehir
          const bilce = ilkKonum ? ilkKonum.ilce : d.ilce
          // YEN─░: kategori_yol varsa en alt se├ğilen kategoriyi ba┼şl─▒─şa koy
          if (d.kategori_yol && d.kategori_yol.length > 0) {
            const enAlt = d.kategori_yol[d.kategori_yol.length - 1]?.label || ''
            const yer = bilce || bsehir || ''
            if (enAlt) return `${yer ? yer + "'" + lokEk(yer) + " " : ''}${enAlt} ar─▒yorum`
          }
          const s = [bsehir, bilce].filter(Boolean).join(' ')
          if (d.kategori === 'emlak') { const yer = bilce || bsehir || ''; return `${yer ? yer + "'" + lokEk(yer) + " " : ''}${d.emlak_tip || 'Emlak'} ar─▒yorum` }
          if (d.kategori === 'vasita') return `${d.markalar || 'Ara├ğ'} ar─▒yorum`
          return (s ? s + ' ÔÇö ' : '') + (d.aciklama?.slice(0, 50) || d.kategori + ' ar─▒yorum')
        })(),
        fiyatMin: d.fiyat_min, fiyatMax: d.fiyat_max,
        tags: [
          d.oda ? { label: d.oda, variant: 'tag-gray' } : null,
          d.m2_min && d.m2_max ? { label: d.m2_min + 'ÔÇô' + d.m2_max + ' m┬▓', variant: 'tag-gray' } : null,
          d.emlak_tip ? { label: d.emlak_tip, variant: 'tag-gray' } : null,
          d.markalar && d.kategori === 'vasita' ? { label: d.markalar, variant: 'tag-gray' } : null,
          d.yil_min && d.yil_max ? { label: d.yil_min + 'ÔÇô' + d.yil_max, variant: 'tag-gray' } : null,
          d.km_max ? { label: 'Max ' + Number(d.km_max).toLocaleString('tr-TR') + ' km', variant: 'tag-gray' } : null,
        ].filter(Boolean),
        kategoriYol: d.kategori_yol || [],
        konumlar: d.konumlar || [],
        aciklama: d.aciklama || '', tarih: new Date(d.created_at).toLocaleDateString('tr-TR'),
        goruntuleme: d.goruntuleme || 0, telefon: d.kullanici_telefon || '',
        email: d.kullanici_email || '', iletisimTercihi: d.iletisim_tercihi || 'mesaj',
        created_at: d.created_at, emlak_tip: d.emlak_tip, kullanici_pro: d.kullanici_pro,
        onayDurumu: d.onay_durumu || 'onaylandi', durum: d.durum || 'aktif',
      })))
    } else {
      setIlanlar([])
    }
  }, [activeCategory, aktifFiltre, filterSehir, filterIlce, user, katSeviye, yenile])

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
    yukle()
  }, [yukle])

  const filtered = ilanlar
    .filter(i => !filterSehir || i.sehir === filterSehir)
    .filter(i => !filterIlce || !i.ilce || i.ilce === filterIlce)
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

  const handleKatChange = useCallback((slug, filtre = null, seviye = 1) => {
    setActiveCategory(slug)
    setAktifFiltre(filtre)
    setKatSeviye(seviye)
  }, [])

  async function handleSubmit(data) {
    const sonuc = await ilanOlustur(data, user)
    // Misafir ilan sayac─▒n─▒ art─▒r
    if (!user?.email) {
      const v = Number(localStorage.getItem('misafir_ilan') || 0) + 1
      localStorage.setItem('misafir_ilan', String(v))
    }
    // Filtreleri temizle ki yeni ilan (kategori/marka filtresine tak─▒lmadan) g├Âr├╝ns├╝n.
    // Filtreler de─şi┼şince yukle effect ile otomatik tetiklenir ve yeni ilan gelir.
    setActiveCategory('')
    setAktifFiltre(null)
    setKatSeviye(1)
    setFilterSehir('')
    setFilterIlce('')
    setFilterTarih('')
    setYenile(y => y + 1)
  }

  return (
    <>
      <Head>
        <title>AlmakIstiyor.com ÔÇö Ne Ar─▒yorsunuz? S├Âyleyin, Sat─▒c─▒lar Bulsun</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <Navbar activeCategory={activeCategory} onCategoryChange={handleKatChange} onIlanVer={formAc} kategoriAgaci={kategoriAgaci} />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroH1}>
            <span className={styles.heroUst}>NE ALMAK ─░ST─░YORSUN?</span><span className={styles.heroSatir}><span className={styles.heroKelime}>{heroYazi}</span><span className={styles.heroImlec}>|</span> <strong>almak</strong><span className={styles.heroIstiyor}>istiyor</span></span>
          </h1>
          <p className={styles.heroSub}>
            Ne almak istedi─şinizi yaz─▒n; ev, araba, telefon ne olursa. Sat─▒c─▒lar size ├Âzel teklif g├Ândersin.
          </p>
          <button className={styles.heroArama} onClick={formAc}>
            <span className={styles.heroAramaSol}>
              <strong>Almak</strong><span className={styles.heroAramaPlaceholder}>istiyor</span>
            </span>
            <span className={styles.heroAramaBtn}>+ Talep Olu┼ştur</span>
          </button>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{stats.ilanSayisi > 0 ? stats.ilanSayisi.toLocaleString('tr-TR') : '2.854'}</span>
              <span className={styles.statLabel}>aktif talep</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>{stats.kullaniciSayisi > 0 ? stats.kullaniciSayisi.toLocaleString('tr-TR') : '1.426'}</span>
              <span className={styles.statLabel}>kullan─▒c─▒</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>%94</span>
              <span className={styles.statLabel}>e┼şle┼şme</span>
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
            { icon: '­şôó', text: '─░lan─▒ siz verin, sat─▒c─▒lar size gelsin' },
            { icon: '­şöı', text: 'Aramakla vakit kaybetmeyin' },
            { icon: '­şÆ░', text: 'Sat─▒c─▒lar yar─▒┼şs─▒n, en iyi fiyat─▒ siz se├ğin' },
            { icon: '­şôÁ', text: 'Numaran─▒z gizli kal─▒r' },
          ].map(t => (
            <div key={t.text} className={styles.trustItem}><span>{t.icon}</span> {t.text}</div>
          ))}
        </div>
      </div>

      {user && (
        <div className={styles.welcomeBar}>
          <div className={styles.welcomeInner}>
            <span className={styles.welcomeText}>Merhaba, {user.ad}!</span>
            <div className={styles.welcomeBtns}>
              <a href="/panel" className={styles.welcomeBtnPrimary}>­şôï ─░lanlar─▒m</a>
              <a href="/panel?tab=mesajlar" className={styles.welcomeBtnSecondary}>­şÆ¼ Mesajlar─▒m{anaOkunmamis > 0 && <span style={{marginLeft:5,background:'#E53E3E',color:'white',borderRadius:9,padding:'1px 7px',fontSize:11,fontWeight:700}}>{anaOkunmamis}</span>}</a>
            </div>
          </div>
        </div>
      )}

      <div className={`container ${styles.main}`}>
        <aside className={styles.sidebar}>
          <div className={styles.ctaCard}>
            <h4>Talep ver, sat─▒c─▒lar seni bulsun</h4>
            <p className={styles.ctaCardAlt}>├£cretsiz ilan olu┼ştur, teklifler gelsin.</p>
            <button className={styles.ctaWhite} onClick={formAc}>+ ─░lan Olu┼ştur</button>
          </div>

          <div className={styles.filterCard}>
            <div className={styles.filterTitle}>­şöı Filtrele</div>

            <div className={styles.filterGroup}>
              <label className="form-label">­şôı ┼Şehir</label>
              <select className="form-select" value={filterSehir}
                onChange={e => { setFilterSehir(e.target.value); setFilterIlce('') }}>
                <option value="">T├╝m ┼şehirler</option>
                {sehirler.map(s => <option key={s.il} value={s.il}>{s.il}</option>)}
              </select>
            </div>
            {filterSehir && (
              <div className={styles.filterGroup}>
                <label className="form-label">­şôÄ ─░l├ğe</label>
                <select className="form-select" value={filterIlce} onChange={e => setFilterIlce(e.target.value)}>
                  <option value="">T├╝m il├ğeler</option>
                  {(sehirler.find(s => s.il === filterSehir)?.ilceler || []).map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            )}

            <div className={styles.filterGroup}>
              <label className="form-label">­şôà Tarih</label>
              <div className={styles.chips}>
                {[{ v: '', l: 'T├╝m├╝' }, { v: 'bugun', l: 'Bug├╝n' }, { v: 'hafta', l: 'Bu hafta' }].map(d => (
                  <button key={d.v} className={`${styles.chip} ${filterTarih === d.v ? styles.chipActive : ''}`}
                    onClick={() => setFilterTarih(d.v)}>{d.l}</button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className="form-label">­şùé´©Å Kategori</label>
              {(activeCategory || aktifFiltre) && (
                <button className={styles.filtreTemizle} onClick={() => handleKatChange('', null)}>
                  Ô£ò Filtreyi temizle
                </button>
              )}
              <div className={styles.kategoriDogal}>
                <SidebarKategoriler KATEGORILER={kategoriAgaci} activeCategory={activeCategory} onKatChange={handleKatChange} />
              </div>
            </div>
          </div>
        </aside>

        <main className={styles.listings} id="ilan-listesi">
          {/* Mobil ┼şehir filtresi (masa├╝st├╝nde sidebar'da var) */}
          <div className={styles.mobilFiltre}>
            <select className={styles.mobilFiltreSelect} value={filterSehir}
              onChange={e => { setFilterSehir(e.target.value); setFilterIlce('') }}>
              <option value="">­şôı T├╝m ┼şehirler</option>
              {sehirler.map(s => <option key={s.il} value={s.il}>{s.il}</option>)}
            </select>
          </div>
          <div className={styles.listHeader}>
            <div className={styles.listCount}><strong>{filtered.length.toLocaleString('tr-TR')}</strong> talep ilan─▒</div>
            <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
              <option value="yeni">En yeni</option>
              <option value="cok-goruntulenen">En ├ğok g├Âr├╝nt├╝lenen</option>
            </select>
          </div>
          <div className={styles.listGrid}>
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <p>Bu kriterlere uygun ilan bulunamad─▒.</p>
                <button className="btn-primary" onClick={formAc}>─░lk ilan─▒ siz verin ÔåÆ</button>
              </div>
            ) : (
              filtered.map(ilan => (
                <IlanKarti key={ilan.id} ilan={ilan} user={user} proUye={!!ilan.kullanici_pro}
                  mesajHaklari={{ kalanGenel, gonderilenBuKisiye: mesajHaklari[ilan.id]?.gonderilenBuKisiye || 0 }}
                  onMesajGonder={async ({ ilan: il, mesaj }) => {
                    // Mesaj g├Ândermeden ├Ânce paket limit kontrol├╝
                    const kontrol = await mesajHakkiVarMi(user)
                    if (!kontrol.izin) {
                      setLimitUyari({ tip: kontrol.sebep === 'limit' ? 'mesaj-limit' : kontrol.sebep, mesaj: kontrol.mesaj, paket: kontrol.paket })
                      return false
                    }
                    const { konusmaBaslatVeyaGetir: kBVG, konusmaMesajGonder: kMG } = await import('../lib/db')
                    const { data: konusma } = await kBVG({ ilanId: il.id, ilanBaslik: il.baslik, ilanKategori: il.kategori, aliciEmail: il.kullanici_email || il.email || '', aliciAd: il.kullanici_ad || il.ad || '', saticiEmail: user?.email || 'anonim', saticiAd: user ? `${user.ad || ''} ${user.soyad || ''}`.trim() : 'Anonim', saticiIfirma: user?.firma || null })
                    if (konusma) await kMG({ konusmaId: konusma.id, gonderenEmail: user?.email || 'anonim', gonderenAd: user ? `${user.ad || ''} ${user.soyad || ''}`.trim() : 'Anonim', metin: mesaj, gonderenAliciMi: false })
                    // Al─▒c─▒ya bildirim maili (hata olsa engellemez)
                    
                    setMesajHaklari(p => ({ ...p, [il.id]: { gonderilenBuKisiye: (p[il.id]?.gonderilenBuKisiye || 0) + 1 } }))
                    setKalanGenel(p => Math.max(0, p - 1))
                    return true
                  }}
                  onTelefonGoster={() => setPaketModal(true)}
                />
              ))
            )}
          </div>
          {filtered.length > 0 && (
            <div className={styles.pagination}>
              {['ÔåÉ', '1', '2', '3', '...', 'ÔåÆ'].map((p, i) => (
                <button key={i} className={`${styles.pageBtn} ${p === '1' ? styles.pageBtnActive : ''}`}>{p}</button>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />

      {limitUyari && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => e.target === e.currentTarget && setLimitUyari(null)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, width: 380, maxWidth: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>{limitUyari.tip === 'misafir' ? '­şôğ' : 'ÔÅ│'}</div>
            <h3 style={{ fontFamily: 'Sora,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              {limitUyari.tip === 'misafir' ? '├£ye Olun' : limitUyari.tip === 'engelli' ? 'Hesap Ask─▒da' : limitUyari.tip === 'mesaj-limit' ? 'Mesaj Hakk─▒n─▒z Doldu' : 'G├╝nl├╝k Limit Doldu'}
            </h3>
            <p style={{ fontSize: 14, color: '#4a5568', marginBottom: 18, lineHeight: 1.6 }}>{limitUyari.mesaj}</p>
            {limitUyari.tip === 'misafir' ? (
              <>
                <a href="/kayit" style={{ display: 'block', padding: '12px', borderRadius: 9, background: '#0D7A6B', color: 'white', fontWeight: 600, fontSize: 15, marginBottom: 8, textDecoration: 'none' }}>├£cretsiz ├£ye Ol ÔåÆ</a>
                <a href="/giris" style={{ display: 'block', padding: '10px', borderRadius: 9, border: '1.5px solid #e2e8f0', color: '#4a5568', fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>Zaten ├╝yeyim, Giri┼ş yap</a>
              </>
            ) : limitUyari.paket === 'ucretsiz' && (limitUyari.tip === 'limit' || limitUyari.tip === 'mesaj-limit') ? (
              <a href="/pro" style={{ display: 'block', padding: '12px', borderRadius: 9, background: '#0D7A6B', color: 'white', fontWeight: 600, fontSize: 15, marginBottom: 8, textDecoration: 'none' }}>­şÆÄ Pro ├£yeli─şe Ge├ğ ÔåÆ</a>
            ) : null}
            <button onClick={() => setLimitUyari(null)} style={{ background: 'none', border: 'none', color: '#8a95a3', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>Kapat</button>
          </div>
        </div>
      )}

      {paketModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => e.target === e.currentTarget && setPaketModal(false)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, width: 360, maxWidth: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>­şöÆ</div>
            <h3 style={{ fontFamily: 'Sora,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Telefon i├ğin paket gerekli</h3>
            <p style={{ fontSize: 14, color: '#4a5568', marginBottom: 18, lineHeight: 1.6 }}>Al─▒c─▒n─▒n numaras─▒n─▒ g├Ârmek i├ğin Starter paketi gerekiyor.</p>
            <a href="/pro" style={{ display: 'block', padding: '12px', borderRadius: 9, background: '#0D7A6B', color: 'white', fontWeight: 600, fontSize: 15, marginBottom: 10 }}>Paketlere Bak ÔåÆ</a>
            <button onClick={() => setPaketModal(false)} style={{ background: 'none', border: 'none', color: '#8a95a3', fontSize: 13, cursor: 'pointer' }}>┼Şimdilik ge├ğ</button>
          </div>
        </div>
      )}

      <IlanForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} user={user} kategoriAgaci={kategoriAgaci} />
    </>
  )
}
