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
  { id: 1, kategori: 'emlak', ad: 'Mehmet Arslan', sehir: '\u0130stanbul', ilce: 'Kad\u0131k\u00f6y', baslik: "Kad\u0131k\u00f6y'de 3+1 kiral\u0131k daire ar\u0131yorum", fiyatMin: 25000, fiyatMax: 35000, tags: [{label:'3+1',variant:'tag-gray'},{label:'E\u015fyals\u0131z',variant:'tag-amber'}], aciklama: 'Asans\u00f6rl\u00fc, otopark\u0131 tercih ederim.', tarih: '3 saat \u00f6nce', goruntuleme: 47 },
  { id: 2, kategori: 'vasita', ad: 'Zeynep Ko\u00e7ak', sehir: '\u0130stanbul', ilce: 'Be\u015fikta\u015f', baslik: 'BMW veya Mercedes ar\u0131yorum', fiyatMin: 800000, fiyatMax: 1200000, tags: [{label:'Otomatik',variant:'tag-gray'}], aciklama: 'Kazas\u0131z tercih ederim.', tarih: '8 saat \u00f6nce', goruntuleme: 128 },
  { id: 3, kategori: 'alisveris', ad: 'Ay\u015fe Y\u0131lmaz', sehir: '\u0130stanbul', ilce: '\u015ei\u015fli', baslik: 'K\u00f6\u015fe koltuk tak\u0131m\u0131 ar\u0131yorum', fiyatMin: 15000, fiyatMax: 30000, tags: [], aciklama: 'Ta\u015f\u0131ma imk\u00e2n\u0131m var.', tarih: '1 g\u00fcn \u00f6nce', goruntuleme: 31 },
]

const KELIMELER = ['ev', 'araba', '\u00f6zel ders', 'yazl\u0131k', 'motosiklet', 'daire', 'arsa', 'iPhone', 'villa', 'koltuk']

function ilanDonustur(d) {
  function lokEkLocal(k) {
    if (!k) return 'da'
    const un = ['a','e','\u0131','i','o','\u00f6','u','\u00fc']
    const ka = ['a','\u0131','o','u']
    const sr = ['\u00e7','f','h','k','p','s','\u015f','t']
    let u = ''
    for (let i = k.length-1; i >= 0; i--) { const h = k[i].toLowerCase(); if (un.includes(h)) { u = h; break } }
    const sn = k.slice(-1).toLowerCase()
    return (ka.includes(u) ? (sr.includes(sn) ? 'ta' : 'da') : (sr.includes(sn) ? 'te' : 'de'))
  }
  return {
    id: d.id, kategori: d.kategori || 'alisveris', altKategori: d.alt_kategori || '',
    ad: (d.kullanici_ad || 'Kullan\u0131c\u0131') + ' ' + (d.kullanici_soyad || ''),
    sehir: d.sehir || '', ilce: d.ilce || '',
    baslik: (() => {
      const ilkKonum = (d.konumlar && d.konumlar.length > 0) ? d.konumlar[0] : null
      const bsehir = ilkKonum ? ilkKonum.sehir : d.sehir
      const bilce = ilkKonum ? ilkKonum.ilce : d.ilce
      if (d.kategori_yol && d.kategori_yol.length > 0) {
        const enAlt = d.kategori_yol[d.kategori_yol.length - 1]?.label || ''
        const yer = bilce || bsehir || ''
        if (enAlt) return `${yer ? yer + "'" + lokEkLocal(yer) + " " : ''}${enAlt} ar\u0131yorum`
      }
      if (d.kategori === 'emlak') { const yer = bilce || bsehir || ''; return `${yer ? yer + "'" + lokEkLocal(yer) + " " : ''}${d.emlak_tip || 'Emlak'} ar\u0131yorum` }
      if (d.kategori === 'vasita') return `${d.markalar || 'Ara\u00e7'} ar\u0131yorum`
      const s = [bsehir, bilce].filter(Boolean).join(' ')
      return (s ? s + ' \u2013 ' : '') + (d.aciklama?.slice(0, 50) || d.kategori + ' ar\u0131yorum')
    })(),
    fiyatMin: d.fiyat_min, fiyatMax: d.fiyat_max,
    tags: [
      d.oda ? { label: d.oda, variant: 'tag-gray' } : null,
      d.m2_min && d.m2_max ? { label: d.m2_min + '\u2013' + d.m2_max + ' m\u00b2', variant: 'tag-gray' } : null,
      d.emlak_tip ? { label: d.emlak_tip, variant: 'tag-gray' } : null,
      d.markalar && d.kategori === 'vasita' ? { label: d.markalar, variant: 'tag-gray' } : null,
      d.yil_min && d.yil_max ? { label: d.yil_min + '\u2013' + d.yil_max, variant: 'tag-gray' } : null,
      d.km_max ? { label: 'Max ' + Number(d.km_max).toLocaleString('tr-TR') + ' km', variant: 'tag-gray' } : null,
    ].filter(Boolean),
    kategoriYol: d.kategori_yol || [], konumlar: d.konumlar || [],
    aciklama: d.aciklama || '', tarih: new Date(d.created_at).toLocaleDateString('tr-TR'),
    goruntuleme: d.goruntuleme || 0, telefon: d.kullanici_telefon || '',
    email: d.kullanici_email || '', iletisimTercihi: d.iletisim_tercihi || 'mesaj',
    created_at: d.created_at, emlak_tip: d.emlak_tip, kullanici_pro: d.kullanici_pro,
    onayDurumu: d.onay_durumu || 'onaylandi', durum: d.durum || 'aktif',
    kullanici_email: d.kullanici_email || '', kullanici_ad: d.kullanici_ad || '',
  }
}

export async function getServerSideProps() {
  let ilanlarSSR = []
  let statsSSR = { ilanSayisi: 0, kullaniciSayisi: 0 }
  try {
    const { ilanListele: listele } = await import('../lib/db')
    const { supabase: sb } = await import('../lib/supabase')
    const { data } = await listele({ limit: 20 })
    ilanlarSSR = data || []
    if (sb) {
      const { count: ilanCount } = await sb.from('ilanlar').select('*', { count: 'exact', head: true }).eq('durum', 'aktif')
      const { count: kullaniciCount } = await sb.from('kullanicilar').select('*', { count: 'exact', head: true })
      statsSSR = { ilanSayisi: ilanCount || 0, kullaniciSayisi: kullaniciCount || 0 }
    }
  } catch (e) {}
  return { props: { ilanlarSSR: JSON.parse(JSON.stringify(ilanlarSSR)), statsSSR } }
}

export default function Home({ ilanlarSSR = [], statsSSR = { ilanSayisi: 0, kullaniciSayisi: 0 } }) {
  const { user } = useAuth(); const [anaOkunmamis, setAnaOkunmamis] = useState(0); const [heroYazi, setHeroYazi] = useState(''); useEffect(() => { const kel = ['Araba','Ev','Telefon','\u00d6zel ders','Hasta bak\u0131c\u0131','Boya badana','Trak\u00f6r','Yavru k\u00f6pek','Laptop','Daire']; let ki = 0, h = 0, sil = false, t; function adim() { const k = kel[ki]; if (!sil) { h++; setHeroYazi(k.slice(0, h)); if (h === k.length) { sil = true; t = setTimeout(adim, 1400); return; } } else { h--; setHeroYazi(k.slice(0, h)); if (h === 0) { sil = false; ki = (ki + 1) % kel.length; } } t = setTimeout(adim, sil ? 45 : 95); } adim(); return () => clearTimeout(t); }, []); useEffect(() => { let aktif = true; async function say() { if (!user?.email) { setAnaOkunmamis(0); return; } try { const { supabase } = await import('../lib/supabase'); if (!supabase) return; const { data: a } = await supabase.from('konusmalar').select('okunmamis_alici').eq('alici_email', user.email); const { data: s } = await supabase.from('konusmalar').select('okunmamis_satici').eq('satici_email', user.email); const t = (a||[]).reduce((x,k)=>x+(k.okunmamis_alici||0),0) + (s||[]).reduce((x,k)=>x+(k.okunmamis_satici||0),0); if (aktif) setAnaOkunmamis(t); } catch (e) {} } say(); const z = setInterval(say, 60000); return () => { aktif = false; clearInterval(z); }; }, [user]);
  const [formOpen, setFormOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [aktifFiltre, setAktifFiltre] = useState(null)
  const [katSeviye, setKatSeviye] = useState(1)
  const [yenile, setYenile] = useState(0)
  const [filterSehir, setFilterSehir] = useState('')
  const [filterIlce, setFilterIlce] = useState('')
  const [filterTarih, setFilterTarih] = useState('')
  const [ilanlar, setIlanlar] = useState(ilanlarSSR.length > 0 ? ilanlarSSR.map(ilanDonustur) : demoIlanlar)
  const [sort, setSort] = useState('yeni')
  const [mesajHaklari, setMesajHaklari] = useState({})
  const [kalanGenel, setKalanGenel] = useState(0)
  const [telefonYetkisi, setTelefonYetkisi] = useState(false)
  const [paketModal, setPaketModal] = useState(false)
  const [limitUyari, setLimitUyari] = useState(null)
  const [misafirIlanSayisi, setMisafirIlanSayisi] = useState(0)

  async function formAc() {
    if (!user?.email) {
      const verilen = Number(localStorage.getItem('misafir_ilan') || 0)
      if (verilen >= 1) {
        setLimitUyari({ tip: 'misafir', mesaj: 'Misafir olarak 1 ilan verebilirsiniz. Daha fazla ilan i\u00e7in \u00fccretsiz \u00fcye olun (mail onay\u0131 ile g\u00fcnde 3 ilan).' })
        return
      }
      setFormOpen(true)
      return
    }
    const sonuc = await ilanHakkiVarMi(user)
    if (!sonuc.izin) {
      setLimitUyari({ tip: sonuc.sebep, mesaj: sonuc.mesaj, paket: sonuc.paket })
      return
    }
    setFormOpen(true)
  }
  const [stats, setStats] = useState(statsSSR)
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

  const yukle = useCallback(async () => {
    const anaKategoriler = ['emlak','vasita','alisveris','is-makineleri','hizmetler','ozel-ders','is-ilanlari','hayvanlar','yedek-parca']
    const isAltKat = activeCategory && !anaKategoriler.includes(activeCategory)
    const vasitaMarkaArama = (katSeviye >= 3) && (aktifFiltre?.tip === 'marka' || aktifFiltre?.deger)
    const markaFiltre = vasitaMarkaArama ? (aktifFiltre?.deger || null) : undefined
    const { data } = await ilanListele({
      kategori: isAltKat ? undefined : (activeCategory || undefined),
      emlakTip: aktifFiltre?.tip === 'emlak_tip' ? aktifFiltre.deger : undefined,
      marka: markaFiltre || undefined,
      sehir: filterSehir || undefined,
      ilce: filterIlce || undefined,
      kullaniciEmail: user?.email || undefined,
    })
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
        ad: (d.kullanici_ad || 'Kullan\u0131c\u0131') + ' ' + (d.kullanici_soyad || ''),
        sehir: d.sehir || '', ilce: d.ilce || '',
        baslik: (() => {
          const ilkKonum = (d.konumlar && d.konumlar.length > 0) ? d.konumlar[0] : null
          const bsehir = ilkKonum ? ilkKonum.sehir : d.sehir
          const bilce = ilkKonum ? ilkKonum.ilce : d.ilce
          if (d.kategori_yol && d.kategori_yol.length > 0) {
            const enAlt = d.kategori_yol[d.kategori_yol.length - 1]?.label || ''
            const yer = bilce || bsehir || ''
            if (enAlt) return `${yer ? yer + "'" + lokEk(yer) + " " : ''}${enAlt} ar\u0131yorum`
          }
          const s = [bsehir, bilce].filter(Boolean).join(' ')
          if (d.kategori === 'emlak') { const yer = bilce || bsehir || ''; return `${yer ? yer + "'" + lokEk(yer) + " " : ''}${d.emlak_tip || 'Emlak'} ar\u0131yorum` }
          if (d.kategori === 'vasita') return `${d.markalar || 'Ara\u00e7'} ar\u0131yorum`
          return (s ? s + ' \u2013 ' : '') + (d.aciklama?.slice(0, 50) || d.kategori + ' ar\u0131yorum')
        })(),
        fiyatMin: d.fiyat_min, fiyatMax: d.fiyat_max,
        tags: [
          d.oda ? { label: d.oda, variant: 'tag-gray' } : null,
          d.m2_min && d.m2_max ? { label: d.m2_min + '\u2013' + d.m2_max + ' m\u00b2', variant: 'tag-gray' } : null,
          d.emlak_tip ? { label: d.emlak_tip, variant: 'tag-gray' } : null,
          d.markalar && d.kategori === 'vasita' ? { label: d.markalar, variant: 'tag-gray' } : null,
          d.yil_min && d.yil_max ? { label: d.yil_min + '\u2013' + d.yil_max, variant: 'tag-gray' } : null,
          d.km_max ? { label: 'Max ' + Number(d.km_max).toLocaleString('tr-TR') + ' km', variant: 'tag-gray' } : null,
        ].filter(Boolean),
        kategoriYol: d.kategori_yol || [], konumlar: d.konumlar || [],
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
    if (!user?.email) {
      const v = Number(localStorage.getItem('misafir_ilan') || 0) + 1
      localStorage.setItem('misafir_ilan', String(v))
    }
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
        <title>AlmakIstiyor.com \u2013 Ne Ar\u0131yorsunuz? S\u00f6yleyin, Sat\u0131c\u0131lar Bulsun</title>
        <meta name="description" content="Ne almak istiyorsunuz? S\u00f6yleyin, sat\u0131c\u0131lar bulsun. T\u00fcrkiye'nin ters ilan platformu - ev, araba, telefon, her \u015fey i\u00e7in al\u0131c\u0131 ilan\u0131 verin." />
        <meta name="keywords" content="almak istiyorum, ilan ver, al\u0131c\u0131 ilan\u0131, emlak, vas\u0131ta, ikinci el" />
        <link rel="canonical" href="https://almakistiyor.com" />
        <meta property="og:title" content="AlmakIstiyor.com \u2013 Ne Ar\u0131yorsunuz? S\u00f6yleyin, Sat\u0131c\u0131lar Bulsun" />
        <meta property="og:description" content="Ne almak istiyorsunuz? S\u00f6yleyin, sat\u0131c\u0131lar bulsun. T\u00fcrkiye'nin ters ilan platformu." />
        <meta property="og:url" content="https://almakistiyor.com" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"WebSite","name":"AlmakIstiyor.com","url":"https://almakistiyor.com","description":"Al\u0131c\u0131lar\u0131n ilan a\u00e7t\u0131\u011f\u0131 T\u00fcrkiye'nin ters ilan platformu","potentialAction":{"@type":"SearchAction","target":"https://almakistiyor.com/?q={search_term_string}","query-input":"required name=search_term_string"}}) }} />
      </Head>

      <Navbar activeCategory={activeCategory} onCategoryChange={handleKatChange} onIlanVer={formAc} kategoriAgaci={kategoriAgaci} />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroH1}>
            <span className={styles.heroUst}>NE ALMAK \u0130ST\u0130YORSUN?</span><span className={styles.heroSatir}><span className={styles.heroKelime}>{heroYazi}</span><span className={styles.heroImlec}>|</span> <strong>almak</strong><span className={styles.heroIstiyor}>istiyor</span></span>
          </h1>
          <p className={styles.heroSub}>
            Ne almak istedi\u011finizi yaz\u0131n; ev, araba, telefon ne olursa. Sat\u0131c\u0131lar size \u00f6zel teklif g\u00f6ndersin.
          </p>
          <button className={styles.heroArama} onClick={formAc}>
            <span className={styles.heroAramaSol}>
              <strong>Almak</strong><span className={styles.heroAramaPlaceholder}>istiyor</span>
            </span>
            <span className={styles.heroAramaBtn}>+ Talep Olu\u015ftur</span>
          </button>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{stats.ilanSayisi > 0 ? stats.ilanSayisi.toLocaleString('tr-TR') : '2.854'}</span>
              <span className={styles.statLabel}>aktif talep</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>{stats.kullaniciSayisi > 0 ? stats.kullaniciSayisi.toLocaleString('tr-TR') : '1.426'}</span>
              <span className={styles.statLabel}>kullan\u0131c\u0131</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>%94</span>
              <span className={styles.statLabel}>e\u015fle\u015fme</span>
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
            { icon: '\ud83d\udce2', text: '\u0130lan\u0131 siz verin, sat\u0131c\u0131lar size gelsin' },
            { icon: '\ud83d\udd0d', text: 'Aramakla vakit kaybetmeyin' },
            { icon: '\ud83d\udcb0', text: 'Sat\u0131c\u0131lar yar\u0131\u015fs\u0131n, en iyi fiyat\u0131 siz se\u00e7in' },
            { icon: '\ud83d\udd35', text: 'Numaran\u0131z gizli kal\u0131r' },
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
              <a href="/panel" className={styles.welcomeBtnPrimary}>\ud83d\udccb \u0130lanlar\u0131m</a>
              <a href="/panel?tab=mesajlar" className={styles.welcomeBtnSecondary}>\ud83d\udcac Mesajlar\u0131m{anaOkunmamis > 0 && <span style={{marginLeft:5,background:'#E53E3E',color:'white',borderRadius:9,padding:'1px 7px',fontSize:11,fontWeight:700}}>{anaOkunmamis}</span>}</a>
            </div>
          </div>
        </div>
      )}

      <div className={`container ${styles.main}`}>
        <aside className={styles.sidebar}>
          <div className={styles.ctaCard}>
            <h4>Talep ver, sat\u0131c\u0131lar seni bulsun</h4>
            <p className={styles.ctaCardAlt}>\u00dccretsiz ilan olu\u015ftur, teklifler gelsin.</p>
            <button className={styles.ctaWhite} onClick={formAc}>+ \u0130lan Olu\u015ftur</button>
          </div>

          <div className={styles.filterCard}>
            <div className={styles.filterTitle}>\ud83d\udd0d Filtrele</div>

            <div className={styles.filterGroup}>
              <label className="form-label">\ud83d\udccd \u015eehir</label>
              <select className="form-select" value={filterSehir}
                onChange={e => { setFilterSehir(e.target.value); setFilterIlce('') }}>
                <option value="">T\u00fcm \u015fehirler</option>
                {sehirler.map(s => <option key={s.il} value={s.il}>{s.il}</option>)}
              </select>
            </div>
            {filterSehir && (
              <div className={styles.filterGroup}>
                <label className="form-label">\ud83d\udccd \u0130l\u00e7e</label>
                <select className="form-select" value={filterIlce} onChange={e => setFilterIlce(e.target.value)}>
                  <option value="">T\u00fcm il\u00e7eler</option>
                  {(sehirler.find(s => s.il === filterSehir)?.ilceler || []).map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            )}

            <div className={styles.filterGroup}>
              <label className="form-label">\ud83d\udcc5 Tarih</label>
              <div className={styles.chips}>
                {[{ v: '', l: 'T\u00fcm\u00fc' }, { v: 'bugun', l: 'Bug\u00fcn' }, { v: 'hafta', l: 'Bu hafta' }].map(d => (
                  <button key={d.v} className={`${styles.chip} ${filterTarih === d.v ? styles.chipActive : ''}`}
                    onClick={() => setFilterTarih(d.v)}>{d.l}</button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className="form-label">\ud83d\uddc2\ufe0f Kategori</label>
              {(activeCategory || aktifFiltre) && (
                <button className={styles.filtreTemizle} onClick={() => handleKatChange('', null)}>
                  \u2715 Filtreyi temizle
                </button>
              )}
              <div className={styles.kategoriDogal}>
                <SidebarKategoriler KATEGORILER={kategoriAgaci} activeCategory={activeCategory} onKatChange={handleKatChange} />
              </div>
            </div>
          </div>
        </aside>

        <main className={styles.listings} id="ilan-listesi">
          <div className={styles.mobilFiltre}>
            <select className={styles.mobilFiltreSelect} value={filterSehir}
              onChange={e => { setFilterSehir(e.target.value); setFilterIlce('') }}>
              <option value="">\ud83d\udccd T\u00fcm \u015fehirler</option>
              {sehirler.map(s => <option key={s.il} value={s.il}>{s.il}</option>)}
            </select>
          </div>
          <div className={styles.listHeader}>
            <div className={styles.listCount}><strong>{filtered.length.toLocaleString('tr-TR')}</strong> talep ilan\u0131</div>
            <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
              <option value="yeni">En yeni</option>
              <option value="cok-goruntulenen">En \u00e7ok g\u00f6r\u00fcnt\u00fclenen</option>
            </select>
          </div>
          <div className={styles.listGrid}>
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <p>Bu kriterlere uygun ilan bulunamad\u0131.</p>
                <button className="btn-primary" onClick={formAc}>\u0130lk ilan\u0131 siz verin \u2192</button>
              </div>
            ) : (
              filtered.map(ilan => (
                <IlanKarti key={ilan.id} ilan={ilan} user={user} proUye={!!ilan.kullanici_pro}
                  mesajHaklari={{ kalanGenel, gonderilenBuKisiye: mesajHaklari[ilan.id]?.gonderilenBuKisiye || 0 }}
                  onMesajGonder={async ({ ilan: il, mesaj }) => {
                    const kontrol = await mesajHakkiVarMi(user)
                    if (!kontrol.izin) {
                      setLimitUyari({ tip: kontrol.sebep === 'limit' ? 'mesaj-limit' : kontrol.sebep, mesaj: kontrol.mesaj, paket: kontrol.paket })
                      return false
                    }
                    const { konusmaBaslatVeyaGetir: kBVG, konusmaMesajGonder: kMG } = await import('../lib/db')
                    const { data: konusma } = await kBVG({ ilanId: il.id, ilanBaslik: il.baslik, ilanKategori: il.kategori, aliciEmail: il.kullanici_email || il.email || '', aliciAd: il.kullanici_ad || il.ad || '', saticiEmail: user?.email || 'anonim', saticiAd: user ? `${user.ad || ''} ${user.soyad || ''}`.trim() : 'Anonim', saticiIfirma: user?.firma || null })
                    if (konusma) await kMG({ konusmaId: konusma.id, gonderenEmail: user?.email || 'anonim', gonderenAd: user ? `${user.ad || ''} ${user.soyad || ''}`.trim() : 'Anonim', metin: mesaj, gonderenAliciMi: false })
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
              {['\u2190', '1', '2', '3', '...', '\u2192'].map((p, i) => (
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
            <div style={{ fontSize: 44, marginBottom: 10 }}>{limitUyari.tip === 'misafir' ? '\ud83d\udce7' : '\u23f3'}</div>
            <h3 style={{ fontFamily: 'Sora,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              {limitUyari.tip === 'misafir' ? '\u00dcye Olun' : limitUyari.tip === 'engelli' ? 'Hesap Ask\u0131da' : limitUyari.tip === 'mesaj-limit' ? 'Mesaj Hakk\u0131n\u0131z Doldu' : 'G\u00fcnl\u00fck Limit Doldu'}
            </h3>
            <p style={{ fontSize: 14, color: '#4a5568', marginBottom: 18, lineHeight: 1.6 }}>{limitUyari.mesaj}</p>
            {limitUyari.tip === 'misafir' ? (
              <>
                <a href="/kayit" style={{ display: 'block', padding: '12px', borderRadius: 9, background: '#0D7A6B', color: 'white', fontWeight: 600, fontSize: 15, marginBottom: 8, textDecoration: 'none' }}>\u00dccretsiz \u00dcye Ol \u2192</a>
                <a href="/giris" style={{ display: 'block', padding: '10px', borderRadius: 9, border: '1.5px solid #e2e8f0', color: '#4a5568', fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>Zaten \u00fcyeyim, Giri\u015f yap</a>
              </>
            ) : limitUyari.paket === 'ucretsiz' && (limitUyari.tip === 'limit' || limitUyari.tip === 'mesaj-limit') ? (
              <a href="/pro" style={{ display: 'block', padding: '12px', borderRadius: 9, background: '#0D7A6B', color: 'white', fontWeight: 600, fontSize: 15, marginBottom: 8, textDecoration: 'none' }}>\ud83c\udf1f Pro \u00dcyeli\u011fe Ge\u00e7 \u2192</a>
            ) : null}
            <button onClick={() => setLimitUyari(null)} style={{ background: 'none', border: 'none', color: '#8a95a3', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>Kapat</button>
          </div>
        </div>
      )}

      {paketModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => e.target === e.currentTarget && setPaketModal(false)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, width: 360, maxWidth: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>\ud83d\udd12</div>
            <h3 style={{ fontFamily: 'Sora,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Telefon i\u00e7in paket gerekli</h3>
            <p style={{ fontSize: 14, color: '#4a5568', marginBottom: 18, lineHeight: 1.6 }}>Al\u0131c\u0131n\u0131n numaras\u0131n\u0131 g\u00f6rmek i\u00e7in Starter paketi gerekiyor.</p>
            <a href="/pro" style={{ display: 'block', padding: '12px', borderRadius: 9, background: '#0D7A6B', color: 'white', fontWeight: 600, fontSize: 15, marginBottom: 10 }}>Paketlere Bak \u2192</a>
            <button onClick={() => setPaketModal(false)} style={{ background: 'none', border: 'none', color: '#8a95a3', fontSize: 13, cursor: 'pointer' }}>\u015eimdilik ge\u00e7</button>
          </div>
        </div>
      )}

      <IlanForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} user={user} kategoriAgaci={kategoriAgaci} />
    </>
  )
}
