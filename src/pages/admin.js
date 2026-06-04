import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { adminMi, tumKategorileriGetir, kategoriEkle, kategoriGuncelle, kategoriSil } from '../lib/kategoriDB'
import { dashboardStats, son7GunIlan, kullanicilariGetir, kullaniciEngelle, kullaniciPaketDegistir, sikayetleriGetir, sikayetDurumGuncelle, paketleriGetir, paketGuncelle } from '../lib/adminDB'
import styles from './admin.module.css'

const SEKMELER = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'onaylar', label: '⏳ İlan Onayları' },
  { id: 'ilanlar', label: '📋 Tüm İlanlar' },
  { id: 'kullanicilar', label: '👥 Kullanıcılar' },
  { id: 'sikayetler', label: '🚩 Şikayetler' },
  { id: 'paketler', label: '💎 Pro Üyelikler' },
  { id: 'kategoriler', label: '🗂️ Kategoriler' },
]

export default function AdminPanel() {
  const { user, yuklendi } = useAuth()
  const router = useRouter()
  const [yetkili, setYetkili] = useState(null)
  const [sekme, setSekme] = useState('dashboard')

  useEffect(() => {
    if (!yuklendi) return
    if (!user?.email) { setYetkili(false); return }
    adminMi(user.email).then(setYetkili)
  }, [user, yuklendi])

  if (yetkili === null) return <div className={styles.merkez}><div className={styles.spinner} /> Yetki kontrol ediliyor...</div>
  if (yetkili === false) return (
    <div className={styles.merkez}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <h2>Erişim Reddedildi</h2>
      <p>Bu sayfaya yalnızca yöneticiler erişebilir.</p>
      <button className={styles.btn} onClick={() => router.push('/')}>Ana Sayfaya Dön</button>
    </div>
  )

  return (
    <>
      <Head><title>Admin Panel | AlmakIstiyor</title></Head>
      <div className={styles.layout}>
        {/* SOL MENÜ */}
        <aside className={styles.yanMenu}>
          <div className={styles.yanLogo}>⚙️ Admin</div>
          {SEKMELER.map(s => (
            <button key={s.id}
              className={`${styles.yanBtn} ${sekme===s.id?styles.yanAktif:''}`}
              onClick={() => setSekme(s.id)}>
              {s.label}
            </button>
          ))}
          <button className={styles.yanCikis} onClick={() => router.push('/')}>← Siteye Dön</button>
        </aside>

        {/* İÇERİK */}
        <main className={styles.anaIcerik}>
          {sekme === 'dashboard' && <Dashboard />}
          {sekme === 'onaylar' && <Onaylar />}
          {sekme === 'ilanlar' && <TumIlanlar />}
          {sekme === 'kullanicilar' && <Kullanicilar />}
          {sekme === 'sikayetler' && <Sikayetler />}
          {sekme === 'paketler' && <Paketler />}
          {sekme === 'kategoriler' && <Kategoriler />}
        </main>
      </div>
    </>
  )
}

// ==================== DASHBOARD ====================
function Dashboard() {
  const [stats, setStats] = useState(null)
  const [grafik, setGrafik] = useState([])
  useEffect(() => {
    dashboardStats().then(setStats)
    son7GunIlan().then(setGrafik)
  }, [])
  if (!stats) return <div className={styles.yukleniyor}>Yükleniyor...</div>
  const maxSayi = Math.max(...grafik.map(g => g.sayi), 1)
  const kartlar = [
    { l: 'Aktif İlan', v: stats.ilanAktif, i: '✓', renk: '#0D7A6B' },
    { l: 'Onay Bekleyen', v: stats.ilanBekleyen, i: '⏳', renk: '#F5A623' },
    { l: 'Toplam İlan', v: stats.ilanToplam, i: '📋', renk: '#4a5568' },
    { l: 'Kullanıcı', v: stats.kullanici, i: '👥', renk: '#0D7A6B' },
    { l: 'Bugün İlan', v: stats.bugunIlan, i: '📈', renk: '#0D7A6B' },
    { l: 'Bugün Üye', v: stats.bugunUye, i: '🆕', renk: '#0D7A6B' },
  ]
  return (
    <div>
      <h1 className={styles.baslik}>📊 Dashboard</h1>
      <div className={styles.statGrid}>
        {kartlar.map(k => (
          <div key={k.l} className={styles.statKart}>
            <div className={styles.statIkon} style={{background:k.renk}}>{k.i}</div>
            <div>
              <div className={styles.statSayi}>{k.v.toLocaleString('tr-TR')}</div>
              <div className={styles.statLabel}>{k.l}</div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.grafikKart}>
        <h3>Son 7 Gün — İlan Sayısı</h3>
        <div className={styles.grafik}>
          {grafik.map((g,i) => (
            <div key={i} className={styles.grafikCubukWrap}>
              <div className={styles.grafikSayi}>{g.sayi}</div>
              <div className={styles.grafikCubuk} style={{height:`${(g.sayi/maxSayi)*100}%`}} />
              <div className={styles.grafikGun}>{g.gun}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==================== İLAN ONAYLARI ====================
function Onaylar() {
  const [ilanlar, setIlanlar] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)
  async function yukle() {
    setYukleniyor(true)
    const { data } = await supabase.from('ilanlar').select('*').eq('onay_durumu','beklemede').order('created_at',{ascending:false})
    setIlanlar(data || []); setYukleniyor(false)
  }
  useEffect(() => { yukle() }, [])
  async function onayla(id) { await supabase.from('ilanlar').update({onay_durumu:'onaylandi',durum:'aktif'}).eq('id',id); yukle() }
  async function reddet(id) { await supabase.from('ilanlar').update({onay_durumu:'reddedildi',durum:'pasif'}).eq('id',id); yukle() }

  return (
    <div>
      <h1 className={styles.baslik}>⏳ İlan Onayları {ilanlar.length>0 && <span className={styles.rozet}>{ilanlar.length}</span>}</h1>
      {yukleniyor ? <div className={styles.yukleniyor}>Yükleniyor...</div> :
        ilanlar.length === 0 ? <div className={styles.bos}>✓ Onay bekleyen ilan yok</div> :
        ilanlar.map(ilan => (
          <div key={ilan.id} className={styles.ilanKart}>
            <div className={styles.ilanBilgi}>
              <div className={styles.ilanBaslik}>{ilan.kategori} {ilan.alt_kategori?`› ${ilan.alt_kategori}`:''} {ilan.emlak_tip?`› ${ilan.emlak_tip}`:''}</div>
              <div className={styles.ilanDetay}>👤 {ilan.kullanici_ad} {ilan.kullanici_soyad} • 📍 {ilan.sehir} {ilan.ilce||''} {ilan.fiyat_min?`• ₺${Number(ilan.fiyat_min).toLocaleString('tr-TR')}-${Number(ilan.fiyat_max).toLocaleString('tr-TR')}`:''}</div>
              {ilan.aciklama && <div className={styles.ilanAciklama}>{ilan.aciklama}</div>}
              <div className={styles.ilanTarih}>{new Date(ilan.created_at).toLocaleString('tr-TR')}</div>
            </div>
            <div className={styles.ilanAksiyon}>
              <button className={styles.btnOnay} onClick={() => onayla(ilan.id)}>✓ Onayla</button>
              <button className={styles.btnRed} onClick={() => reddet(ilan.id)}>✕ Reddet</button>
            </div>
          </div>
        ))
      }
    </div>
  )
}

// ==================== TÜM İLANLAR ====================
function TumIlanlar() {
  const [ilanlar, setIlanlar] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [arama, setArama] = useState('')
  async function yukle() {
    setYukleniyor(true)
    const { data } = await supabase.from('ilanlar').select('*').order('created_at',{ascending:false}).limit(200)
    setIlanlar(data || []); setYukleniyor(false)
  }
  useEffect(() => { yukle() }, [])
  async function durdur(id) { await supabase.from('ilanlar').update({durum:'pasif'}).eq('id',id); yukle() }
  async function yayinla(id) { await supabase.from('ilanlar').update({durum:'aktif',onay_durumu:'onaylandi'}).eq('id',id); yukle() }
  async function sil(id) { if(!confirm('Kalıcı silinecek. Emin misiniz?'))return; await supabase.from('ilanlar').delete().eq('id',id); yukle() }
  const filt = ilanlar.filter(i => !arama || (i.kullanici_ad||'').toLowerCase().includes(arama.toLowerCase()) || (i.sehir||'').toLowerCase().includes(arama.toLowerCase()))

  return (
    <div>
      <h1 className={styles.baslik}>📋 Tüm İlanlar</h1>
      <input className={styles.arama} placeholder="🔍 İsim veya şehir ara..." value={arama} onChange={e=>setArama(e.target.value)} />
      {yukleniyor ? <div className={styles.yukleniyor}>Yükleniyor...</div> :
        filt.map(ilan => (
          <div key={ilan.id} className={styles.ilanKart}>
            <div className={styles.ilanBilgi}>
              <div className={styles.ilanBaslik}>
                {ilan.kategori} {ilan.alt_kategori?`› ${ilan.alt_kategori}`:''}
                <span className={`${styles.durum} ${ilan.durum==='aktif'?styles.durumAktif:styles.durumPasif}`}>{ilan.durum==='aktif'?'Yayında':'Pasif'}</span>
                {ilan.onay_durumu==='beklemede' && <span className={styles.durumBekle}>Beklemede</span>}
              </div>
              <div className={styles.ilanDetay}>👤 {ilan.kullanici_ad} • 📍 {ilan.sehir} • 👁 {ilan.goruntuleme||0}</div>
            </div>
            <div className={styles.ilanAksiyon}>
              {ilan.durum==='aktif' ? <button className={styles.btnDurdur} onClick={()=>durdur(ilan.id)}>⏸ Durdur</button>
                : <button className={styles.btnOnay} onClick={()=>yayinla(ilan.id)}>▶ Yayınla</button>}
              <button className={styles.btnSil} onClick={()=>sil(ilan.id)}>🗑 Sil</button>
            </div>
          </div>
        ))
      }
    </div>
  )
}

// ==================== KULLANICILAR ====================
function Kullanicilar() {
  const [liste, setListe] = useState([])
  const [arama, setArama] = useState('')
  const [yukleniyor, setYukleniyor] = useState(true)
  async function yukle() { setYukleniyor(true); setListe(await kullanicilariGetir(arama)); setYukleniyor(false) }
  useEffect(() => { yukle() }, [])
  async function engelleDegistir(k) { await kullaniciEngelle(k.id, !k.engelli); yukle() }
  async function paketYap(k, paket) { await kullaniciPaketDegistir(k.id, paket); yukle() }

  return (
    <div>
      <h1 className={styles.baslik}>👥 Kullanıcılar</h1>
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        <input className={styles.arama} style={{marginBottom:0}} placeholder="🔍 İsim veya email ara..." value={arama} onChange={e=>setArama(e.target.value)} onKeyDown={e=>e.key==='Enter'&&yukle()} />
        <button className={styles.btnOnay} onClick={yukle}>Ara</button>
      </div>
      {yukleniyor ? <div className={styles.yukleniyor}>Yükleniyor...</div> :
        liste.map(k => (
          <div key={k.id} className={styles.ilanKart}>
            <div className={styles.ilanBilgi}>
              <div className={styles.ilanBaslik}>
                {k.ad} {k.soyad}
                {k.paket && k.paket!=='ucretsiz' && <span className={styles.proRozet}>💎 {k.paket}</span>}
                {k.engelli && <span className={styles.durumPasif} style={{marginLeft:6,padding:'2px 8px',borderRadius:6,fontSize:11}}>🚫 Engelli</span>}
              </div>
              <div className={styles.ilanDetay}>📧 {k.email} • 📞 {k.telefon||'-'} • 📍 {k.sehir||'-'}</div>
              <div className={styles.ilanTarih}>Günlük hak: {k.gunluk_ilan_hakki||3} • Üyelik: {new Date(k.created_at).toLocaleDateString('tr-TR')}</div>
            </div>
            <div className={styles.ilanAksiyon}>
              <select className={styles.miniSelect} value={k.paket||'ucretsiz'} onChange={e=>paketYap(k, e.target.value)}>
                <option value="ucretsiz">Ücretsiz (3)</option>
                <option value="pro1">Pro1 (10)</option>
                <option value="pro2">Pro2 (30)</option>
                <option value="pro3">Pro3 (∞)</option>
              </select>
              <button className={k.engelli?styles.btnOnay:styles.btnSil} onClick={()=>engelleDegistir(k)}>
                {k.engelli?'✓ Aç':'🚫 Engelle'}
              </button>
            </div>
          </div>
        ))
      }
    </div>
  )
}

// ==================== ŞİKAYETLER ====================
function Sikayetler() {
  const [liste, setListe] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)
  async function yukle() { setYukleniyor(true); setListe(await sikayetleriGetir()); setYukleniyor(false) }
  useEffect(() => { yukle() }, [])
  async function durum(id, d) { await sikayetDurumGuncelle(id, d); yukle() }
  return (
    <div>
      <h1 className={styles.baslik}>🚩 Şikayetler</h1>
      {yukleniyor ? <div className={styles.yukleniyor}>Yükleniyor...</div> :
        liste.length === 0 ? <div className={styles.bos}>✓ Şikayet yok</div> :
        liste.map(s => (
          <div key={s.id} className={styles.ilanKart}>
            <div className={styles.ilanBilgi}>
              <div className={styles.ilanBaslik}>İlan #{s.ilan_id} <span className={`${styles.durum} ${s.durum==='yeni'?styles.durumBekle:styles.durumAktif}`}>{s.durum}</span></div>
              <div className={styles.ilanDetay}>Sebep: {s.sebep} • {s.sikayet_eden_email}</div>
              {s.aciklama && <div className={styles.ilanAciklama}>{s.aciklama}</div>}
              <div className={styles.ilanTarih}>{new Date(s.created_at).toLocaleString('tr-TR')}</div>
            </div>
            <div className={styles.ilanAksiyon}>
              <button className={styles.btnOnay} onClick={()=>durum(s.id,'incelendi')}>İncelendi</button>
              <button className={styles.btnDurdur} onClick={()=>durum(s.id,'kapatildi')}>Kapat</button>
            </div>
          </div>
        ))
      }
    </div>
  )
}

// ==================== PAKETLER ====================
function Paketler() {
  const [liste, setListe] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)
  async function yukle() { setYukleniyor(true); setListe(await paketleriGetir()); setYukleniyor(false) }
  useEffect(() => { yukle() }, [])
  async function guncelle(id, alan, deger) { await paketGuncelle(id, {[alan]:deger}); yukle() }
  return (
    <div>
      <h1 className={styles.baslik}>💎 Pro Üyelik Paketleri</h1>
      {yukleniyor ? <div className={styles.yukleniyor}>Yükleniyor...</div> :
        liste.map(p => (
          <div key={p.id} className={styles.ilanKart}>
            <div className={styles.ilanBilgi}>
              <div className={styles.ilanBaslik}>{p.ad} <span className={styles.ilanTarih}>({p.kod})</span></div>
              <div className={styles.ilanDetay} style={{display:'flex',gap:16,alignItems:'center',marginTop:8,flexWrap:'wrap'}}>
                <label>Fiyat ₺: <input type="number" className={styles.miniInput} defaultValue={p.fiyat} onBlur={e=>guncelle(p.id,'fiyat',Number(e.target.value))} /></label>
                <label>Günlük ilan: <input type="number" className={styles.miniInput} defaultValue={p.gunluk_ilan} onBlur={e=>guncelle(p.id,'gunluk_ilan',Number(e.target.value))} /></label>
                <label><input type="checkbox" defaultChecked={p.telefon_goster} onChange={e=>guncelle(p.id,'telefon_goster',e.target.checked)} /> Telefon göster</label>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  )
}

// ==================== KATEGORİLER ====================
function Kategoriler() {
  const [kategoriler, setKategoriler] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [ekleModal, setEkleModal] = useState(null)
  const [yLabel, setYLabel] = useState(''); const [ySlug, setYSlug] = useState(''); const [yIcon, setYIcon] = useState('')
  const [yFiltreTip, setYFiltreTip] = useState(''); const [yFiltreDeger, setYFiltreDeger] = useState('')

  async function yukle() { setYukleniyor(true); setKategoriler(await tumKategorileriGetir()); setYukleniyor(false) }
  useEffect(() => { yukle() }, [])

  async function ekle() {
    if (!yLabel || !ySlug) { alert('İsim ve slug zorunlu'); return }
    await kategoriEkle({ parentId: ekleModal.parentId, label: yLabel, slug: ySlug, icon: yIcon, seviye: ekleModal.seviye, sira: 99, filtreTip: yFiltreTip||null, filtreDeger: yFiltreDeger||null })
    setEkleModal(null); setYLabel(''); setYSlug(''); setYIcon(''); setYFiltreTip(''); setYFiltreDeger(''); yukle()
  }
  async function aktiflik(kat) { await kategoriGuncelle(kat.id, {aktif:!kat.aktif}); yukle() }
  async function sil(kat) { if(!confirm(`"${kat.label}" ve alt kategorileri silinecek. Emin misiniz?`))return; await kategoriSil(kat.id); yukle() }

  function KatSatir({ kat, derinlik }) {
    return (
      <div>
        <div className={styles.katSatir} style={{paddingLeft:12+derinlik*24}}>
          <div className={styles.katBilgi}>
            <span style={{opacity:kat.aktif?1:0.4}}>
              {kat.icon} {kat.label}
              <span className={styles.katSlug}>({kat.slug})</span>
              {kat.filtre_tip && <span className={styles.katFiltre}>{kat.filtre_tip}={kat.filtre_deger}</span>}
            </span>
          </div>
          <div className={styles.katAksiyon}>
            {derinlik < 3 && <button className={styles.miniBtn} onClick={()=>setEkleModal({parentId:kat.id,seviye:kat.seviye+1})}>+ Alt</button>}
            <button className={`${styles.miniBtn} ${kat.aktif?styles.acik:styles.kapali}`} onClick={()=>aktiflik(kat)}>{kat.aktif?'👁 Açık':'🚫 Kapalı'}</button>
            <button className={styles.miniBtnSil} onClick={()=>sil(kat)}>🗑</button>
          </div>
        </div>
        {kat.altKategoriler?.map(alt => <KatSatir key={alt.id} kat={alt} derinlik={derinlik+1} />)}
      </div>
    )
  }

  return (
    <div>
      <h1 className={styles.baslik}>🗂️ Kategoriler</h1>
      <button className={styles.btnYeniAna} onClick={()=>setEkleModal({parentId:null,seviye:1})}>+ Yeni Ana Kategori</button>
      {yukleniyor ? <div className={styles.yukleniyor}>Yükleniyor...</div> :
        <div className={styles.katListe}>{kategoriler.map(kat => <KatSatir key={kat.id} kat={kat} derinlik={0} />)}</div>
      }
      {ekleModal && (
        <div className={styles.modalArka} onClick={e=>e.target===e.currentTarget&&setEkleModal(null)}>
          <div className={styles.modal}>
            <h3>{ekleModal.seviye}. Seviye Kategori Ekle</h3>
            <label>İsim *</label>
            <input value={yLabel} onChange={e=>{setYLabel(e.target.value); setYSlug(e.target.value.toLowerCase().replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''))}} placeholder="Örn: Daire" />
            <label>Slug</label>
            <input value={ySlug} onChange={e=>setYSlug(e.target.value)} />
            <label>İkon (emoji, opsiyonel)</label>
            <input value={yIcon} onChange={e=>setYIcon(e.target.value)} placeholder="🏠" />
            {ekleModal.seviye >= 3 && (<>
              <label>Filtre Tipi <span style={{fontWeight:400,color:'#8a95a3'}}>(ilan eşleştirme için)</span></label>
              <select value={yFiltreTip} onChange={e=>setYFiltreTip(e.target.value)}>
                <option value="">Yok</option>
                <option value="emlak_tip">emlak_tip</option>
                <option value="marka">marka</option>
              </select>
              {yFiltreTip && (<>
                <label>Filtre Değeri</label>
                <input value={yFiltreDeger} onChange={e=>setYFiltreDeger(e.target.value)} placeholder="Daire / BMW" />
              </>)}
            </>)}
            <div className={styles.modalBtnler}>
              <button className={styles.btnIptal} onClick={()=>setEkleModal(null)}>İptal</button>
              <button className={styles.btnEkle} onClick={ekle}>Ekle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
