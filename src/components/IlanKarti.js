import { useState } from 'react'
import TelefonGosterButon from './TelefonGosterButon'
import styles from './IlanKarti.module.css'

const vasitaMarkalar = ['Volkswagen','BMW','Mercedes','Toyota','Honda','Renault','Ford','Hyundai','Kia','Fiat','Opel','Peugeot','Audi','Skoda','Seat','Volvo']

// Her kategori için ikon, renk, etiket, arka plan rengi
const KAT_CONFIG = {
  // Emlak alt tipleri
  'emlak-daire':       { ikon:'🏢', renk:'#2563EB', bg:'rgba(37,99,235,0.1)',  etiket:'Daire Arıyor' },
  'emlak-villa':       { ikon:'🏡', renk:'#16A34A', bg:'rgba(22,163,74,0.1)',  etiket:'Villa Arıyor' },
  'emlak-arsa':        { ikon:'🌿', renk:'#D97706', bg:'rgba(217,119,6,0.1)',  etiket:'Arsa Arıyor' },
  'emlak-isyeri':      { ikon:'🏬', renk:'#7C3AED', bg:'rgba(124,58,237,0.1)', etiket:'İşyeri Arıyor' },
  'emlak-mustakil':    { ikon:'🏠', renk:'#E11D48', bg:'rgba(225,29,72,0.1)',  etiket:'Müstakil Arıyor' },
  'emlak-mustakil ev': { ikon:'🏠', renk:'#E11D48', bg:'rgba(225,29,72,0.1)',  etiket:'Müstakil Arıyor' },
  'emlak-depo':        { ikon:'🏭', renk:'#475569', bg:'rgba(71,85,105,0.1)',  etiket:'Depo Arıyor' },
  'emlak-tarla':       { ikon:'🌾', renk:'#15803D', bg:'rgba(21,128,61,0.1)',  etiket:'Tarla Arıyor' },
  'emlak':             { ikon:'🏠', renk:'#1D4ED8', bg:'rgba(29,78,216,0.1)',  etiket:'Emlak Arıyor' },
  // Ana kategoriler
  'vasita':            { ikon:'🚗', renk:'#EA580C', bg:'rgba(234,88,12,0.1)',  etiket:'Araç Arıyor' },
  'ikinci-el':         { ikon:'♻️', renk:'#15803D', bg:'rgba(21,128,61,0.1)',  etiket:'İkinci El' },
  'mobilya':           { ikon:'🛋️', renk:'#9333EA', bg:'rgba(147,51,234,0.1)', etiket:'Mobilya Arıyor' },
  'elektronik':        { ikon:'💻', renk:'#1D4ED8', bg:'rgba(29,78,216,0.1)',  etiket:'Elektronik Arıyor' },
  'sanayi':            { ikon:'⚙️', renk:'#475569', bg:'rgba(71,85,105,0.1)',  etiket:'Sanayi' },
  'alisveris':         { ikon:'🛍️', renk:'#9333EA', bg:'rgba(147,51,234,0.1)', etiket:'Alışveriş' },
  'hizmetler':         { ikon:'🔧', renk:'#1D4ED8', bg:'rgba(29,78,216,0.1)',  etiket:'Hizmet Arıyor' },
  'is-ilanlari':       { ikon:'💼', renk:'#059669', bg:'rgba(5,150,105,0.1)',  etiket:'İş İlanı' },
  'hayvanlar':         { ikon:'🐾', renk:'#EA580C', bg:'rgba(234,88,12,0.1)',  etiket:'Hayvan Arıyor' },
  'ozel-ders':         { ikon:'📚', renk:'#7C3AED', bg:'rgba(124,58,237,0.1)', etiket:'Özel Ders Arıyor' },
  'yedek-parca':       { ikon:'🔩', renk:'#334155', bg:'rgba(51,65,85,0.1)',   etiket:'Yedek Parça' },
  'is-makineleri':     { ikon:'🚜', renk:'#92400E', bg:'rgba(146,64,14,0.1)',  etiket:'İş Makinesi Arıyor' },
}

function getKatConfig(ilan) {
  if (ilan.kategori === 'emlak') {
    const tipTag = ilan.tags?.find(t =>
      ['Daire','Villa','Arsa','İşyeri','Müstakil Ev','Müstakil','Depo','Tarla'].includes(t.label)
    )
    const tip = (tipTag?.label || '').toLowerCase()
    const key = `emlak-${tip}`
    return KAT_CONFIG[key] || KAT_CONFIG['emlak']
  }
  return KAT_CONFIG[ilan.kategori] || { ikon:'📋', renk:'#475569', bg:'rgba(71,85,105,0.1)', etiket:'İlan' }
}

function getIlanRenk(ilan) {
  if (ilan.kategori === 'emlak') {
    const tipTag = ilan.tags?.find(t => ['Daire','Villa','Arsa','İşyeri','Müstakil Ev','Depo','Tarla'].includes(t.label))
    const tip = tipTag?.label || ''
    if (tip === 'Daire')       return { bg:'#F0F7FF', border:'#C5DCF8', badge:'#2563EB', badgeBg:'#DBEAFE' }
    if (tip === 'Villa')       return { bg:'#F0FDF4', border:'#86EFAC', badge:'#16A34A', badgeBg:'#DCFCE7' }
    if (tip === 'Arsa')        return { bg:'#FFFBEB', border:'#FCD34D', badge:'#D97706', badgeBg:'#FEF3C7' }
    if (tip === 'İşyeri')      return { bg:'#FDF4FF', border:'#E9D5FF', badge:'#7C3AED', badgeBg:'#EDE9FE' }
    if (tip === 'Müstakil Ev') return { bg:'#FFF1F2', border:'#FECDD3', badge:'#E11D48', badgeBg:'#FFE4E6' }
    if (tip === 'Depo')        return { bg:'#F8FAFC', border:'#CBD5E1', badge:'#475569', badgeBg:'#E2E8F0' }
    if (tip === 'Tarla')       return { bg:'#F0FDF4', border:'#BBF7D0', badge:'#15803D', badgeBg:'#DCFCE7' }
    return { bg:'#EFF6FF', border:'#BFDBFE', badge:'#1D4ED8', badgeBg:'#DBEAFE' }
  }
  if (ilan.kategori === 'vasita') {
    return { bg:'#FFF7ED', border:'#FED7AA', badge:'#EA580C', badgeBg:'#FFEDD5' }
  }
  const renk = {
    'ikinci-el':    { bg:'#F0FDF4', border:'#BBF7D0', badge:'#15803D', badgeBg:'#DCFCE7' },
    'mobilya':      { bg:'#FDF4FF', border:'#E9D5FF', badge:'#9333EA', badgeBg:'#F3E8FF' },
    'elektronik':   { bg:'#EFF6FF', border:'#BFDBFE', badge:'#1D4ED8', badgeBg:'#DBEAFE' },
    'sanayi':       { bg:'#F8FAFC', border:'#CBD5E1', badge:'#475569', badgeBg:'#E2E8F0' },
    'alisveris':    { bg:'#FDF4FF', border:'#E9D5FF', badge:'#9333EA', badgeBg:'#F3E8FF' },
    'hizmetler':    { bg:'#EFF6FF', border:'#BFDBFE', badge:'#1D4ED8', badgeBg:'#DBEAFE' },
    'is-ilanlari':  { bg:'#ECFDF5', border:'#6EE7B7', badge:'#059669', badgeBg:'#D1FAE5' },
    'hayvanlar':    { bg:'#FFF7ED', border:'#FED7AA', badge:'#EA580C', badgeBg:'#FFEDD5' },
    'ozel-ders':    { bg:'#FDF4FF', border:'#E9D5FF', badge:'#7C3AED', badgeBg:'#EDE9FE' },
    'yedek-parca':  { bg:'#F8FAFC', border:'#CBD5E1', badge:'#334155', badgeBg:'#E2E8F0' },
    'is-makineleri':{ bg:'#FFFBEB', border:'#FCD34D', badge:'#92400E', badgeBg:'#FEF3C7' },
  }
  return renk[ilan.kategori] || { bg:'#F8FAFC', border:'#E2E8F0', badge:'#475569', badgeBg:'#E2E8F0' }
}

function initials(name) {
  if (!name || typeof name !== 'string') return '?'
  return name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)
}
function maskedName(name) {
  if (!name || typeof name !== 'string') return 'Kullanıcı'
  const p = name.trim().split(' ')
  return p.length === 1 ? p[0] : p[0] + ' ' + (p[p.length-1][0]||'') + '.'
}

export default function IlanKarti({ ilan, user, mesajHaklari, onMesajGonder, proUye }) {
  const renk = getIlanRenk(ilan)
  const kat = getKatConfig(ilan)
  const ilanAd     = ilan?.ad || 'Kullanıcı'
  const ilanBaslik = ilan?.baslik || 'Talep ilanı'
  const ilanSehir  = ilan?.sehir || ''
  const ilanIlce   = ilan?.ilce || ''
  // Çoklu konum metni: "İzmir: Gaziemir · Güzelbahçe" veya tek konum
  const konumListe = (ilan?.konumlar && ilan.konumlar.length > 0) ? ilan.konumlar : null
  const konumKisa = konumListe
    ? (() => {
        const sehirler = [...new Set(konumListe.map(k => k.sehir))]
        if (sehirler.length === 1) {
          const ilceler = konumListe.map(k => k.ilce).filter(Boolean)
          return ilceler.length > 0 ? `${sehirler[0]}: ${ilceler.join(' · ')}` : sehirler[0]
        }
        return konumListe.map(k => k.ilce ? `${k.sehir}/${k.ilce}` : k.sehir).join(' · ')
      })()
    : `${ilanSehir}${ilanIlce ? ` / ${ilanIlce}` : ''}`
  const konumUzun = konumListe
    ? konumListe.map(k => k.ilce ? `${k.sehir} — ${k.ilce}` : k.sehir).join(' · ')
    : `${ilanSehir}${ilanIlce ? ` — ${ilanIlce}` : ''}`

  const [mesajAcik, setMesajAcik] = useState(false)
  const [mesajMetni, setMesajMetni] = useState('')
  const [mesajGonderildi, setMesajGonderildi] = useState(false)
  const [gonderiliyor, setGonderiliyor] = useState(false)

  const kalanGenel = mesajHaklari?.kalanGenel
  const beklemede = ilan?.onayDurumu === 'beklemede'
  const telefonGoster = ilan?.iletisimTercihi === 'telefon' || ilan?.iletisimTercihi === 'her_ikisi'
  const proOncelikli = proUye === true
  const proOnayli = proUye === true

  function handleMesajAc() {
    if (!user) { window.location.href = '/giris'; return }
    setMesajAcik(true); setMesajGonderildi(false); setMesajMetni('')
  }

  async function handleMesajGonder() {
    if (!mesajMetni.trim() || gonderiliyor) return
    setGonderiliyor(true)
    const sonuc = await onMesajGonder?.({ ilan, mesaj: mesajMetni })
    setGonderiliyor(false)
    if (sonuc === false) { setMesajAcik(false); return }
    setMesajGonderildi(true); setMesajMetni('')
    setTimeout(() => setMesajAcik(false), 2000)
  }

  const azKaldi = typeof kalanGenel === 'number' && kalanGenel <= 5
  const kalanRenk = kalanGenel===1?'#E53E3E':kalanGenel<=3?'#D97706':'#0D7A6B'

  return (
    <div
      className={styles.card}
      style={{
        background: beklemede ? '#FEF2F2' : renk.bg,
        borderColor: beklemede ? '#FCA5A5' : proOncelikli ? '#1D9E75' : renk.border,
        border: proOncelikli && !beklemede ? '2px solid #1D9E75' : undefined,
        '--kat-renk': kat.renk,
        '--kat-bg': kat.bg,
      }}
    >
      {/* Tıkla ok animasyonu */}
      {!beklemede && <div className={styles.hoverOk}>→</div>}

      {/* Sağ üst köşe — Öncelikli şeridi */}
      {proOncelikli && !beklemede && (
        <div style={{
          position:'absolute', top:0, right:0,
          background:'#1D9E75', color:'#E1F5EE',
          fontSize:10, fontWeight:500,
          padding:'4px 10px',
          borderRadius:'0 16px 0 10px',
          zIndex:3, pointerEvents:'none',
          display:'flex', alignItems:'center', gap:4,
        }}>
          🚀 Öncelikli
        </div>
      )}

      {!beklemede && <a href={`/ilan/${ilan?.id}`} className={styles.cardLink} aria-label="İlan detayını gör" />}

      {/* Kategori header bandı */}
      <div className={styles.katHeader} style={{ background: kat.bg }}>
        <div className={styles.katIkonWrap}>
          <span style={{fontSize:20}}>{kat.ikon}</span>
        </div>
        <span className={styles.katEtiket}>{kat.etiket}</span>
        <span className={styles.katAlt}>
          {konumKisa}
        </span>
      </div>

      {/* Gövde */}
      <div className={styles.govde}>
        {beklemede && (
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#DC2626',color:'white',padding:'8px 12px',borderRadius:'8px',marginBottom:10,fontSize:12,fontWeight:600,position:'relative',zIndex:1}}>
            ⏳ Yönetici onayı bekliyor — yalnızca siz görüyorsunuz
          </div>
        )}

        {/* Kullanıcı satırı */}
        <div className={styles.top}>
          <div className={styles.left}>
            <div className={styles.avatar} style={{background:renk.badgeBg, color:renk.badge}}>
              {initials(ilanAd)}
            </div>
            <div style={{minWidth:0}}>
              <div className={styles.name} style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
              {maskedName(ilanAd)}
              {proOnayli && (
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:3,
                  padding:'2px 7px', borderRadius:20,
                  fontSize:10, fontWeight:500,
                  background:'#E1F5EE', color:'#085041',
                  border:'0.5px solid #5DCAA5',
                  lineHeight:1.4,
                }}>
                  ✅ Onaylı
                </span>
              )}
            </div>
              <div className={styles.location}>📍 {konumUzun}</div>
            </div>
          </div>
          <div className={styles.metaRight}>
            <div className={styles.date}>{ilan?.tarih||''}</div>
          </div>
          {/* Mobilde tarih */}
          <div className={styles.metaMobil}>
            <span style={{fontSize:10,color:'var(--text-3)'}}>{ilan?.tarih||''}</span>
          </div>
        </div>

        {/* Başlık */}
        <div className={styles.title} style={{fontWeight:700}}>{ilanBaslik}</div>

        {/* Kategori yolu — ne aradığı net görünsün */}
        {ilan.kategoriYol && ilan.kategoriYol.length > 0 && (
          <div style={{display:'flex',alignItems:'center',gap:5,flexWrap:'wrap',margin:'4px 0 8px'}}>
            {ilan.kategoriYol.map((k, i) => (
              <span key={i} style={{display:'inline-flex',alignItems:'center',gap:5}}>
                {i > 0 && <span style={{color:renk.badge,fontSize:11,opacity:0.6}}>›</span>}
                <span style={{
                  fontSize:11.5, fontWeight: i === ilan.kategoriYol.length-1 ? 700 : 500,
                  color: i === ilan.kategoriYol.length-1 ? renk.badge : '#64748b',
                  background: i === ilan.kategoriYol.length-1 ? renk.badgeBg : 'transparent',
                  padding: i === ilan.kategoriYol.length-1 ? '2px 8px' : '0',
                  borderRadius: 6,
                }}>{k.label}</span>
              </span>
            ))}
          </div>
        )}

        {/* Açıklama — ön planda, belirgin */}
        {ilan.aciklama && <p className={styles.desc} style={{fontSize:14,color:'#1e293b',fontWeight:500,margin:'8px 0',lineHeight:1.5}}>{ilan.aciklama}</p>}

        {/* Fiyat + etiketler */}
        <div className={styles.tags}>
          {ilan.fiyatMin && ilan.fiyatMax && (
            <span className="tag tag-price">
              ₺{Number(ilan.fiyatMin).toLocaleString('tr-TR')} — ₺{Number(ilan.fiyatMax).toLocaleString('tr-TR')}
            </span>
          )}
          {ilan.tags?.map((t,i) => <span key={i} className={`tag ${t.variant||'tag-gray'}`}>{t.label}</span>)}
        </div>

        {/* Mesaj kutusu */}
        {mesajAcik && (
          <div className={styles.mesajKutu} style={{borderColor:renk.border}}>
            {mesajGonderildi ? (
              <div className={styles.mesajBasarili}>✅ Mesajınız gönderildi!</div>
            ) : (
              <>
                <div className={styles.mesajHeader}>
                  <span className={styles.mesajBaslik}>{maskedName(ilanAd)} adlı alıcıya mesaj</span>
                  {azKaldi && <span style={{fontSize:11,fontWeight:600,color:kalanRenk}}>{kalanGenel} mesaj hakkı kaldı</span>}
                </div>
                <textarea className={styles.mesajInput} rows={3} placeholder="Mesajınızı yazın..."
                  value={mesajMetni} onChange={e=>setMesajMetni(e.target.value)} autoFocus />
                <div className={styles.mesajAlt}>
                  <button className={styles.iptalBtn} onClick={()=>setMesajAcik(false)}>İptal</button>
                  <button className={styles.gonderBtn} disabled={!mesajMetni.trim()||gonderiliyor} onClick={handleMesajGonder}>
                    {gonderiliyor ? 'Gönderiliyor...' : 'Gönder →'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.views}>👁 {ilan.goruntuleme||0} satıcı baktı</div>
          <div className={styles.butonlar}>
            {beklemede ? (
              <span style={{fontSize:12,color:'#DC2626',fontWeight:600}}>Onay sonrası satıcılar görecek</span>
            ) : (
              <>
                {telefonGoster && !mesajAcik && (
                  <div style={{position:'relative',zIndex:2}} onClick={e=>e.preventDefault()}>
                    <TelefonGosterButon ilanId={ilan.id} kullaniciEmail={user?.email} />
                  </div>
                )}
                {!mesajAcik && (
                  <button className={styles.btnMesaj} style={{background:kat.renk}} onClick={handleMesajAc}>
                    💬 Mesaj Gönder
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
