import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { adminMi, tumKategorileriGetir, kategoriEkle, kategoriGuncelle, kategoriSil } from '../lib/kategoriDB'
import styles from './admin.module.css'

export default function AdminPanel() {
  const { user, yuklendi } = useAuth()
  const router = useRouter()
  const [yetkili, setYetkili] = useState(null) // null=kontrol ediliyor, true/false
  const [sekme, setSekme] = useState('onaylar')

  const [bekleyenIlanlar, setBekleyenIlanlar] = useState([])
  const [tumIlanlar, setTumIlanlar] = useState([])
  const [kategoriler, setKategoriler] = useState([])
  const [yukleniyor, setYukleniyor] = useState(false)

  // Yetki kontrolü
  useEffect(() => {
    if (!yuklendi) return
    if (!user?.email) { setYetkili(false); return }
    adminMi(user.email).then(setYetkili)
  }, [user, yuklendi])

  // Veri yükle
  useEffect(() => {
    if (yetkili !== true) return
    veriYukle()
  }, [yetkili, sekme])

  async function veriYukle() {
    setYukleniyor(true)
    if (sekme === 'onaylar') {
      const { data } = await supabase.from('ilanlar').select('*')
        .eq('onay_durumu', 'beklemede').order('created_at', { ascending: false })
      setBekleyenIlanlar(data || [])
    } else if (sekme === 'ilanlar') {
      const { data } = await supabase.from('ilanlar').select('*')
        .order('created_at', { ascending: false }).limit(200)
      setTumIlanlar(data || [])
    } else if (sekme === 'kategoriler') {
      setKategoriler(await tumKategorileriGetir())
    }
    setYukleniyor(false)
  }

  // İlan onayla / reddet
  async function ilanOnayla(id) {
    await supabase.from('ilanlar').update({ onay_durumu: 'onaylandi', durum: 'aktif' }).eq('id', id)
    veriYukle()
  }
  async function ilanReddet(id) {
    await supabase.from('ilanlar').update({ onay_durumu: 'reddedildi', durum: 'pasif' }).eq('id', id)
    veriYukle()
  }
  async function ilanDurdur(id) {
    await supabase.from('ilanlar').update({ durum: 'pasif' }).eq('id', id)
    veriYukle()
  }
  async function ilanYayinla(id) {
    await supabase.from('ilanlar').update({ durum: 'aktif', onay_durumu: 'onaylandi' }).eq('id', id)
    veriYukle()
  }
  async function ilanSilKalici(id) {
    if (!confirm('Bu ilan kalıcı olarak silinecek. Emin misiniz?')) return
    await supabase.from('ilanlar').delete().eq('id', id)
    veriYukle()
  }

  if (yetkili === null) {
    return <div className={styles.merkez}><div className={styles.spinner} /> Yetki kontrol ediliyor...</div>
  }
  if (yetkili === false) {
    return (
      <div className={styles.merkez}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <h2>Erişim Reddedildi</h2>
        <p>Bu sayfaya yalnızca yöneticiler erişebilir.</p>
        <button className={styles.btn} onClick={() => router.push('/')}>Ana Sayfaya Dön</button>
      </div>
    )
  }

  return (
    <>
      <Head><title>Admin Panel | AlmakIstiyor</title></Head>
      <div className={styles.wrap}>
        <header className={styles.header}>
          <h1>⚙️ Admin Panel</h1>
          <button className={styles.cikis} onClick={() => router.push('/')}>← Siteye Dön</button>
        </header>

        <div className={styles.sekmeler}>
          <button className={`${styles.sekme} ${sekme==='onaylar'?styles.sekmeAktif:''}`} onClick={() => setSekme('onaylar')}>
            ⏳ İlan Onayları {bekleyenIlanlar.length > 0 && <span className={styles.rozet}>{bekleyenIlanlar.length}</span>}
          </button>
          <button className={`${styles.sekme} ${sekme==='ilanlar'?styles.sekmeAktif:''}`} onClick={() => setSekme('ilanlar')}>
            📋 Tüm İlanlar
          </button>
          <button className={`${styles.sekme} ${sekme==='kategoriler'?styles.sekmeAktif:''}`} onClick={() => setSekme('kategoriler')}>
            🗂️ Kategoriler
          </button>
        </div>

        <div className={styles.icerik}>
          {yukleniyor && <div className={styles.yukleniyor}>Yükleniyor...</div>}

          {/* ONAY BEKLEYEN İLANLAR */}
          {sekme === 'onaylar' && !yukleniyor && (
            bekleyenIlanlar.length === 0 ? (
              <div className={styles.bos}>✓ Onay bekleyen ilan yok</div>
            ) : (
              bekleyenIlanlar.map(ilan => (
                <div key={ilan.id} className={styles.ilanKart}>
                  <div className={styles.ilanBilgi}>
                    <div className={styles.ilanBaslik}>
                      {ilan.kategori} {ilan.alt_kategori ? `› ${ilan.alt_kategori}` : ''}
                      {ilan.emlak_tip && ` › ${ilan.emlak_tip}`}
                    </div>
                    <div className={styles.ilanDetay}>
                      👤 {ilan.kullanici_ad} {ilan.kullanici_soyad} • 📍 {ilan.sehir} {ilan.ilce || ''}
                      {ilan.fiyat_min && ` • ₺${Number(ilan.fiyat_min).toLocaleString('tr-TR')}-${Number(ilan.fiyat_max).toLocaleString('tr-TR')}`}
                    </div>
                    {ilan.aciklama && <div className={styles.ilanAciklama}>{ilan.aciklama}</div>}
                    <div className={styles.ilanTarih}>{new Date(ilan.created_at).toLocaleString('tr-TR')}</div>
                  </div>
                  <div className={styles.ilanAksiyon}>
                    <button className={styles.btnOnay} onClick={() => ilanOnayla(ilan.id)}>✓ Onayla</button>
                    <button className={styles.btnRed} onClick={() => ilanReddet(ilan.id)}>✕ Reddet</button>
                  </div>
                </div>
              ))
            )
          )}

          {/* TÜM İLANLAR */}
          {sekme === 'ilanlar' && !yukleniyor && (
            tumIlanlar.length === 0 ? (
              <div className={styles.bos}>İlan yok</div>
            ) : (
              tumIlanlar.map(ilan => (
                <div key={ilan.id} className={styles.ilanKart}>
                  <div className={styles.ilanBilgi}>
                    <div className={styles.ilanBaslik}>
                      {ilan.kategori} {ilan.alt_kategori ? `› ${ilan.alt_kategori}` : ''}
                      <span className={`${styles.durum} ${ilan.durum==='aktif'?styles.durumAktif:styles.durumPasif}`}>
                        {ilan.durum === 'aktif' ? 'Yayında' : 'Pasif'}
                      </span>
                      {ilan.onay_durumu === 'beklemede' && <span className={styles.durumBekle}>Beklemede</span>}
                    </div>
                    <div className={styles.ilanDetay}>
                      👤 {ilan.kullanici_ad} • 📍 {ilan.sehir} • 👁 {ilan.goruntuleme || 0}
                    </div>
                  </div>
                  <div className={styles.ilanAksiyon}>
                    {ilan.durum === 'aktif' ? (
                      <button className={styles.btnDurdur} onClick={() => ilanDurdur(ilan.id)}>⏸ Durdur</button>
                    ) : (
                      <button className={styles.btnOnay} onClick={() => ilanYayinla(ilan.id)}>▶ Yayınla</button>
                    )}
                    <button className={styles.btnSil} onClick={() => ilanSilKalici(ilan.id)}>🗑 Sil</button>
                  </div>
                </div>
              ))
            )
          )}

          {/* KATEGORİ YÖNETİMİ */}
          {sekme === 'kategoriler' && !yukleniyor && (
            <KategoriYonetimi kategoriler={kategoriler} onDegisim={veriYukle} />
          )}
        </div>
      </div>
    </>
  )
}

// ============ KATEGORİ YÖNETİM BİLEŞENİ ============
function KategoriYonetimi({ kategoriler, onDegisim }) {
  const [ekleModal, setEkleModal] = useState(null) // {parentId, seviye}
  const [yeniLabel, setYeniLabel] = useState('')
  const [yeniSlug, setYeniSlug] = useState('')
  const [yeniIcon, setYeniIcon] = useState('')
  const [yeniFiltreTip, setYeniFiltreTip] = useState('')
  const [yeniFiltreDeger, setYeniFiltreDeger] = useState('')

  async function ekle() {
    if (!yeniLabel || !yeniSlug) { alert('İsim ve slug zorunlu'); return }
    await kategoriEkle({
      parentId: ekleModal.parentId,
      label: yeniLabel, slug: yeniSlug, icon: yeniIcon,
      seviye: ekleModal.seviye,
      sira: 99,
      filtreTip: yeniFiltreTip || null,
      filtreDeger: yeniFiltreDeger || null,
    })
    setEkleModal(null); setYeniLabel(''); setYeniSlug(''); setYeniIcon(''); setYeniFiltreTip(''); setYeniFiltreDeger('')
    onDegisim()
  }

  async function aktiflikDegistir(kat) {
    await kategoriGuncelle(kat.id, { aktif: !kat.aktif })
    onDegisim()
  }

  async function sil(kat) {
    if (!confirm(`"${kat.label}" ve tüm alt kategorileri silinecek. Emin misiniz?`)) return
    await kategoriSil(kat.id)
    onDegisim()
  }

  // Recursive kategori satırı
  function KatSatir({ kat, derinlik }) {
    return (
      <div>
        <div className={styles.katSatir} style={{ paddingLeft: 12 + derinlik * 24 }}>
          <div className={styles.katBilgi}>
            <span style={{ opacity: kat.aktif ? 1 : 0.4 }}>
              {kat.icon} {kat.label}
              <span className={styles.katSlug}>({kat.slug})</span>
              {kat.filtre_tip && <span className={styles.katFiltre}>{kat.filtre_tip}={kat.filtre_deger}</span>}
            </span>
          </div>
          <div className={styles.katAksiyon}>
            {derinlik < 3 && (
              <button className={styles.miniBtn} title="Alt ekle"
                onClick={() => setEkleModal({ parentId: kat.id, seviye: kat.seviye + 1 })}>+ Alt</button>
            )}
            <button className={`${styles.miniBtn} ${kat.aktif ? styles.acik : styles.kapali}`}
              onClick={() => aktiflikDegistir(kat)}>
              {kat.aktif ? '👁 Açık' : '🚫 Kapalı'}
            </button>
            <button className={styles.miniBtnSil} onClick={() => sil(kat)}>🗑</button>
          </div>
        </div>
        {kat.altKategoriler?.map(alt => (
          <KatSatir key={alt.id} kat={alt} derinlik={derinlik + 1} />
        ))}
      </div>
    )
  }

  return (
    <div>
      <button className={styles.btnYeniAna} onClick={() => setEkleModal({ parentId: null, seviye: 1 })}>
        + Yeni Ana Kategori
      </button>

      <div className={styles.katListe}>
        {kategoriler.map(kat => <KatSatir key={kat.id} kat={kat} derinlik={0} />)}
      </div>

      {/* EKLEME MODAL */}
      {ekleModal && (
        <div className={styles.modalArka} onClick={e => e.target === e.currentTarget && setEkleModal(null)}>
          <div className={styles.modal}>
            <h3>{ekleModal.seviye}. Seviye Kategori Ekle</h3>
            <label>İsim *</label>
            <input value={yeniLabel} onChange={e => {
              setYeniLabel(e.target.value)
              setYeniSlug(e.target.value.toLowerCase().replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''))
            }} placeholder="Örn: Daire" />
            <label>Slug (otomatik)</label>
            <input value={yeniSlug} onChange={e => setYeniSlug(e.target.value)} placeholder="daire" />
            <label>İkon (emoji, opsiyonel)</label>
            <input value={yeniIcon} onChange={e => setYeniIcon(e.target.value)} placeholder="🏠" />
            {ekleModal.seviye >= 3 && (
              <>
                <label>Filtre Tipi (3. seviye için)</label>
                <select value={yeniFiltreTip} onChange={e => setYeniFiltreTip(e.target.value)}>
                  <option value="">Yok (alt_kategori ile filtrele)</option>
                  <option value="emlak_tip">emlak_tip</option>
                  <option value="marka">marka</option>
                </select>
                {yeniFiltreTip && (
                  <>
                    <label>Filtre Değeri</label>
                    <input value={yeniFiltreDeger} onChange={e => setYeniFiltreDeger(e.target.value)} placeholder="Daire / BMW" />
                  </>
                )}
              </>
            )}
            <div className={styles.modalBtnler}>
              <button className={styles.btnIptal} onClick={() => setEkleModal(null)}>İptal</button>
              <button className={styles.btnEkle} onClick={ekle}>Ekle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
