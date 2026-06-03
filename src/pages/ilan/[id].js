import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import IlanForm from '../../components/IlanForm'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import styles from './[id].module.css'

function maskedPhone(tel) {
  if (!tel) return '*** *** ** **'
  const d = String(tel).replace(/\D/g,'')
  if (d.length < 10) return tel
  return d.slice(0,3) + ' ' + d.slice(3,6) + ' ** **'
}
function maskedName(ad, soyad) {
  if (!ad) return 'Kullanıcı'
  return ad + (soyad ? ' ' + soyad[0] + '.' : '')
}

export default function IlanDetay() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  const [ilan, setIlan] = useState(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [mesajAcik, setMesajAcik] = useState(false)
  const [mesajMetni, setMesajMetni] = useState('')
  const [mesajGonderildi, setMesajGonderildi] = useState(false)

  useEffect(() => {
    if (!id) return
    async function getIlan() {
      if (supabase) {
        const { data } = await supabase.from('ilanlar').select('*').eq('id', id).single()
        if (data) { setIlan(data); setYukleniyor(false); return }
      }
      setYukleniyor(false)
    }
    getIlan()
  }, [id])

  if (yukleniyor) return (
    <>
      <Navbar onIlanVer={() => setFormOpen(true)} />
      <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{color:'var(--text-3)',fontSize:15}}>İlan yükleniyor...</div>
      </div>
    </>
  )

  if (!ilan) return (
    <>
      <Navbar onIlanVer={() => setFormOpen(true)} />
      <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
        <div style={{fontSize:48}}>🔍</div>
        <h2 style={{fontFamily:'Sora,sans-serif',fontSize:20,color:'var(--text)'}}>İlan bulunamadı</h2>
        <a href="/" className="btn-primary">Ana Sayfaya Dön</a>
      </div>
    </>
  )

  const katLabels = {emlak:'Emlak',vasita:'Vasıta','ikinci-el':'İkinci El',mobilya:'Mobilya',elektronik:'Elektronik','is-makinasi':'İş Makinası'}
  const kat = katLabels[ilan.kategori] || ilan.kategori || 'İlan'
  const sehirIlce = [ilan.sehir, ilan.ilce].filter(Boolean).join(' / ')
  const baslik = `${sehirIlce ? sehirIlce + ' — ' : ''}${kat} arıyorum`
  const fiyat = ilan.fiyat_min && ilan.fiyat_max
    ? `₺${Number(ilan.fiyat_min).toLocaleString('tr-TR')} – ₺${Number(ilan.fiyat_max).toLocaleString('tr-TR')}`
    : null

  const metaTitle = `${baslik} | AlmakIstiyor.com`
  const metaDesc = [fiyat, ilan.aciklama].filter(Boolean).join(' • ').slice(0,160)

  async function mesajGonder() {
    if (!mesajMetni.trim()) return
    if (!user) { router.push('/giris'); return }
    const { konusmaBaslatVeyaGetir, konusmaMesajGonder } = await import('../../lib/db')
    const { data: konusma } = await konusmaBaslatVeyaGetir({
      ilanId: ilan.id,
      ilanBaslik: baslik,
      ilanKategori: kat,
      aliciEmail: ilan.kullanici_email || '',
      aliciAd: ilan.kullanici_ad || '',
      saticiEmail: user.email,
      saticiAd: `${user.ad||''} ${user.soyad||''}`.trim(),
      saticiIfirma: user.firma || null,
    })
    if (konusma) {
      await konusmaMesajGonder({
        konusmaId: konusma.id,
        gonderenEmail: user.email,
        gonderenAd: `${user.ad||''} ${user.soyad||''}`.trim(),
        metin: mesajMetni,
        gonderenAliciMi: false,
      })
    }
    setMesajGonderildi(true)
    setMesajMetni('')
  }

  const tags = [
    fiyat,
    ilan.m2_min && ilan.m2_max ? `${ilan.m2_min}–${ilan.m2_max} m²` : null,
    ilan.oda,
    ilan.emlak_tip,
    ilan.markalar,
    ilan.yil_min && ilan.yil_max ? `${ilan.yil_min}–${ilan.yil_max}` : null,
    ilan.km_min !== null && ilan.km_max !== null ? `${Number(ilan.km_min||0).toLocaleString('tr-TR')}–${Number(ilan.km_max||0).toLocaleString('tr-TR')} km` : null,
    ilan.yakit,
    ilan.vites,
    ilan.tercihler,
  ].filter(Boolean)

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content={`https://almakistiyor.com/ilan/${ilan.id}`} />
      </Head>

      <Navbar onIlanVer={() => setFormOpen(true)} />

      <div className={styles.wrap}>
        <div className={styles.inner}>

          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <a href="/">Ana Sayfa</a>
            <span>›</span>
            <a href={`/?kategori=${ilan.kategori}`}>{kat}</a>
            <span>›</span>
            <span>{sehirIlce || 'Türkiye'}</span>
          </div>

          <div className={styles.grid}>
            {/* SOL — ilan detayı */}
            <div className={styles.detay}>
              <div className={styles.detayKart}>
                <div className={styles.detayUst}>
                  <span className={styles.katBadge}>{kat}</span>
                  <span className={styles.islemBadge}>
                    {ilan.islem_turu === 'kirala' ? '🔑 Kiralamak' : '💰 Satın Almak'}
                  </span>
                </div>

                <h1 className={styles.baslik}>{baslik}</h1>

                {fiyat && (
                  <div className={styles.fiyat}>{fiyat}</div>
                )}

                <div className={styles.taglar}>
                  {tags.map((t,i) => (
                    <span key={i} className={styles.tag}>{t}</span>
                  ))}
                </div>

                {ilan.aciklama && (
                  <div className={styles.aciklama}>
                    <h3>Açıklama</h3>
                    <p>{ilan.aciklama}</p>
                  </div>
                )}

                <div className={styles.detayler}>
                  <h3>Detaylar</h3>
                  <div className={styles.detayGrid}>
                    {ilan.sehir && <div className={styles.detayItem}><span>📍 Konum</span><span>{sehirIlce}</span></div>}
                    {ilan.kategori && <div className={styles.detayItem}><span>🏷️ Kategori</span><span>{kat}</span></div>}
                    {ilan.islem_turu && <div className={styles.detayItem}><span>🔑 İşlem</span><span>{ilan.islem_turu === 'kirala' ? 'Kiralamak' : 'Satın Almak'}</span></div>}
                    {ilan.emlak_tip && <div className={styles.detayItem}><span>🏠 Tür</span><span>{ilan.emlak_tip}</span></div>}
                    {ilan.oda && <div className={styles.detayItem}><span>🛏️ Oda</span><span>{ilan.oda}</span></div>}
                    {ilan.m2_min && <div className={styles.detayItem}><span>📐 m²</span><span>{ilan.m2_min}–{ilan.m2_max} m²</span></div>}
                    {ilan.markalar && <div className={styles.detayItem}><span>🚗 Marka</span><span>{ilan.markalar}</span></div>}
                    {ilan.yil_min && <div className={styles.detayItem}><span>📅 Yıl</span><span>{ilan.yil_min}–{ilan.yil_max}</span></div>}
                    {ilan.km_max !== null && ilan.km_max !== undefined && <div className={styles.detayItem}><span>🛣️ KM</span><span>Max {Number(ilan.km_max).toLocaleString('tr-TR')} km</span></div>}
                    {ilan.yakit && <div className={styles.detayItem}><span>⛽ Yakıt</span><span>{ilan.yakit}</span></div>}
                    {ilan.vites && <div className={styles.detayItem}><span>⚙️ Vites</span><span>{ilan.vites}</span></div>}
                  </div>
                </div>

                <div className={styles.ilanTarih}>
                  📅 {new Date(ilan.created_at).toLocaleDateString('tr-TR', {day:'numeric',month:'long',year:'numeric'})} tarihinde yayınlandı
                </div>
              </div>
            </div>

            {/* SAĞ — iletişim */}
            <div className={styles.sidebar}>
              {/* Alıcı kartı */}
              <div className={styles.aliciKart}>
                <div className={styles.aliciBaslik}>İlan Sahibi</div>
                <div className={styles.aliciInfo}>
                  <div className={styles.aliciAvatar}>
                    {(ilan.kullanici_ad||'K')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.aliciAd}>{maskedName(ilan.kullanici_ad, ilan.kullanici_soyad)}</div>
                    <div className={styles.aliciGizli}>🔒 Tel: {maskedPhone(ilan.kullanici_telefon)}</div>
                  </div>
                </div>

                {/* Mesaj kutusu */}
                {mesajGonderildi ? (
                  <div className={styles.mesajBasarili}>
                    ✅ Mesajınız gönderildi! Alıcı size yanıt verdiğinde <a href="/panel?tab=mesajlar">mesajlarınızda</a> göreceksiniz.
                  </div>
                ) : mesajAcik ? (
                  <div className={styles.mesajKutu}>
                    <label className="form-label">Mesajınız</label>
                    <textarea className="form-input" rows={4}
                      placeholder="Merhaba, ilanınızla ilgileniyorum..."
                      style={{resize:'vertical',lineHeight:1.6,marginBottom:10}}
                      value={mesajMetni} onChange={e => setMesajMetni(e.target.value)} autoFocus />
                    <div style={{display:'flex',gap:8}}>
                      <button className="btn-ghost" style={{padding:'10px 14px'}} onClick={() => setMesajAcik(false)}>İptal</button>
                      <button className="btn-primary" style={{flex:1,justifyContent:'center'}}
                        disabled={!mesajMetni.trim()} onClick={mesajGonder}>
                        Gönder →
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className={styles.mesajBtn} onClick={() => {
                    if (!user) router.push('/giris')
                    else setMesajAcik(true)
                  }}>
                    💬 Mesaj Gönder
                  </button>
                )}

                <div className={styles.gizliNot}>
                  🔒 Telefon numarası ücretli üyelere gösterilir
                </div>
              </div>

              {/* Benzer ilanlar linki */}
              <div className={styles.benzerKart}>
                <h4>Benzer İlanlar</h4>
                <a href={`/?kategori=${ilan.kategori}&sehir=${ilan.sehir||''}`}>
                  {sehirIlce} bölgesindeki {kat} ilanlarını gör →
                </a>
              </div>

              {/* Paylaş */}
              <div className={styles.paylasKart}>
                <h4>Bu ilanı paylaş</h4>
                <div className={styles.paylasButonlar}>
                  <button onClick={() => {
                    if (navigator.share) navigator.share({ title: baslik, url: window.location.href })
                    else navigator.clipboard.writeText(window.location.href)
                  }} className={styles.paylasBtn}>
                    🔗 Linki Kopyala
                  </button>
                  <a href={`https://wa.me/?text=${encodeURIComponent(baslik + ' ' + window.location?.href)}`}
                    target="_blank" rel="noopener" className={styles.paylasBtn}>
                    📱 WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <IlanForm open={formOpen} onClose={() => setFormOpen(false)} user={user} />
    </>
  )
}
