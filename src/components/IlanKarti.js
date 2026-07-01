import { useState } from 'react'
import TelefonGosterButon from './TelefonGosterButon'
import styles from './IlanKarti.module.css'

// D3 tasarımı: her ANA kategori için renk şeması (tag, ikon, sol şerit)
const ANA_KAT_RENK = {
  emlak:                        { renk:'#16A34A', bg:'#DCFCE7', text:'#15803D', border:'#86EFAC', ikon:'🏠', ad:'EMLAK' },
  vasita:                       { renk:'#EA580C', bg:'#FFEDD5', text:'#9A3412', border:'#FED7AA', ikon:'🚗', ad:'VASITA' },
  hayvanlar:                    { renk:'#D97706', bg:'#FEF3C7', text:'#92400E', border:'#FCD34D', ikon:'🐾', ad:'HAYVAN' },
  'ikinci-el-sifir-alisveris':  { renk:'#9333EA', bg:'#F3E8FF', text:'#6B21A8', border:'#E9D5FF', ikon:'🛍️', ad:'ALIŞVERİŞ' },
  'is-makineleri':              { renk:'#0891B2', bg:'#CFFAFE', text:'#155E75', border:'#A5F3FC', ikon:'🚜', ad:'İŞ MAK.' },
  hizmetler:                    { renk:'#2563EB', bg:'#DBEAFE', text:'#1E40AF', border:'#BFDBFE', ikon:'🔧', ad:'HİZMET' },
  'ozel-ders':                  { renk:'#7C3AED', bg:'#EDE9FE', text:'#5B21B6', border:'#DDD6FE', ikon:'📚', ad:'DERS' },
  'is-ilanlari':                { renk:'#059669', bg:'#D1FAE5', text:'#065F46', border:'#6EE7B7', ikon:'💼', ad:'İŞ İLANI' },
  'yedek-parca-aksesuar-donanim-tuning': { renk:'#475569', bg:'#E2E8F0', text:'#334155', border:'#CBD5E1', ikon:'🔩', ad:'PARÇA' },
}
const VARSAYILAN_RENK = { renk:'#475569', bg:'#E2E8F0', text:'#334155', border:'#CBD5E1', ikon:'📋', ad:'İLAN' }

function anaKatBul(ilan) {
  const yolKok = ilan?.kategoriYol?.[0]?.slug
  return ANA_KAT_RENK[yolKok] || ANA_KAT_RENK[ilan?.kategori] || VARSAYILAN_RENK
}

function islemRozetBul(ilan) {
  // Satılık/Kiralık rozeti: emlak ve iş makineleri kategorilerinde
  const rozetliKategoriler = ['emlak', 'is-makineleri']
  if (!rozetliKategoriler.includes(ilan?.kategori) || !ilan?.islemTuru) return null
  const makine = ilan.kategori === 'is-makineleri'
  if (ilan.islemTuru === 'kirala')   return { etiket:'KİRALIK', renk:'#EA580C', bg:'#FFEDD5', text:'#9A3412', ikon: makine ? '🚜' : '🔑' }
  if (ilan.islemTuru === 'satin-al') return { etiket:'SATILIK', renk:'#16A34A', bg:'#DCFCE7', text:'#15803D', ikon: makine ? '🚜' : '🏠' }
  return null
}


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

export default function IlanKarti({ ilan, user, mesajHaklari, onMesajGonder, proUye, onKatTikla }) {
  const renk = getIlanRenk(ilan)
  const kat = getKatConfig(ilan)
  const anaRenk = anaKatBul(ilan)          // D3: ana kategori renk şeması
  const islemRozet = islemRozetBul(ilan)   // D3: satılık/kiralık rozeti
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
  const [aciklamaAcik, setAciklamaAcik] = useState(false)

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
        background: beklemede ? '#FEF2F2' : '#ffffff',
        borderColor: beklemede ? '#FCA5A5' : '#e5e7eb',
        borderLeft: `5px solid ${beklemede ? '#DC2626' : (islemRozet ? islemRozet.renk : anaRenk.renk)}`,
        '--kat-renk': anaRenk.renk,
        '--kat-bg': anaRenk.bg,
      }}
    >
      {/* Tıkla ok animasyonu */}
      {!beklemede && <div className={styles.hoverOk}>→</div>}

      {/* Sağ üst köşe — Öncelikli şeridi */}
      {proOncelikli && !beklemede && (
        <div style={{
          position:'absolute', top:0, right:0,
          background:'#1D9E75', color:'#E1F5EE',
          fontSize:9, fontWeight:500,
          padding:'3px 8px',
          borderRadius:'0 12px 0 8px',
          zIndex:3, pointerEvents:'none',
          display:'flex', alignItems:'center', gap:3,
        }}>
          🚀 Öncelikli
        </div>
      )}

      {!beklemede && <a href={`/ilan/${ilan?.id}`} className={styles.cardLink} aria-label="İlan detayını gör" />}

      {/* V2: Header — ikon (sol) | başlık+konum (orta) | kullanıcı üst + fiyat orta (sağ) */}
      <div style={{display:'flex', gap:11, padding:'12px 13px 0'}}>
        <div style={{
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          width:44, height:44, borderRadius:8,
          background: islemRozet ? islemRozet.renk : anaRenk.renk,
          flexShrink:0,
        }}>
          <span style={{fontSize:18, lineHeight:1}}>{islemRozet ? islemRozet.ikon : anaRenk.ikon}</span>
          <span style={{fontSize:7, fontWeight:700, color:'#fff', marginTop:2, letterSpacing:0.2, textAlign:'center'}}>
            {islemRozet ? islemRozet.etiket : anaRenk.ad}
          </span>
        </div>

        {/* Orta — başlık + konum/tarih */}
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:14, fontWeight:700, lineHeight:1.25, color:'#0f172a', paddingRight: proOncelikli ? 70 : 0}}>{ilanBaslik}</div>
          <div style={{fontSize:10.5, color:'#94a3b8', marginTop:4, display:'flex', alignItems:'center', gap:5, flexWrap:'wrap'}}>
            <span>📍 {konumKisa}</span>
            {ilan?.tarih && <><span>·</span><span>{ilan.tarih}</span></>}
            <span>·</span>
            <span>👁 {ilan.goruntuleme||0}</span>
          </div>
        </div>

        {/* Sağ blok — üstte kullanıcı (öncelikli rozetinin altında), ortada fiyat */}
        <div style={{flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, paddingTop: proOncelikli ? 22 : 0, maxWidth:'42%'}}>
          {/* Kullanıcı + Onaylı rozeti — aynı satırda */}
          <div style={{display:'flex', alignItems:'center', gap:5, position:'relative', zIndex:2, flexWrap:'nowrap'}}>
            {proOnayli && (
              <span style={{
                display:'inline-flex', alignItems:'center', gap:2,
                padding:'1px 7px', borderRadius:20,
                fontSize:9, fontWeight:500,
                background:'#E1F5EE', color:'#085041',
                border:'0.5px solid #5DCAA5', lineHeight:1.4,
                whiteSpace:'nowrap', flexShrink:0,
              }}>
                ✅ Onaylı
              </span>
            )}
            <span style={{fontSize:11.5, fontWeight:600, color:'#475569', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:80}}>{maskedName(ilanAd)}</span>
            <div className={styles.avatar} style={{background:anaRenk.bg, color:anaRenk.text, width:24, height:24, fontSize:10}}>
              {initials(ilanAd)}
            </div>
          </div>
          {/* Fiyat — sağ orta */}
          {ilan.fiyatMax > 0 && (
            <div style={{textAlign:'right', marginTop:2}}>
              {ilan.fiyatMin > 0 ? (
                <div style={{fontSize:14, fontWeight:800, color:anaRenk.renk, lineHeight:1.3}}>
                  ₺{Number(ilan.fiyatMin).toLocaleString('tr-TR')} – ₺{Number(ilan.fiyatMax).toLocaleString('tr-TR')}
                  <span style={{fontSize:11, fontWeight:700, color:anaRenk.renk}}> arasında</span>
                  {ilan.kategori==='is-ilanlari' && <span style={{fontSize:10,fontWeight:500,color:'#94a3b8'}}>/ay</span>}
                </div>
              ) : (
                <div style={{fontSize:15, fontWeight:800, color:anaRenk.renk, lineHeight:1.3}}>
                  <span style={{fontSize:11, fontWeight:700, color:anaRenk.renk}}>{ilan.kategori==='is-ilanlari' ? 'Maaş ' : 'en fazla '}</span>
                  ₺{Number(ilan.fiyatMax).toLocaleString('tr-TR')}
                  {ilan.kategori==='is-ilanlari' && <span style={{fontSize:10,fontWeight:500,color:'#94a3b8'}}>/ay</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Gövde */}
      <div className={styles.govde} style={{padding:'10px 13px 12px'}}>
        {beklemede && (
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#DC2626',color:'white',padding:'8px 12px',borderRadius:'8px',marginBottom:10,fontSize:12,fontWeight:600,position:'relative',zIndex:1}}>
            ⏳ Yönetici onayı bekliyor — yalnızca siz görüyorsunuz
          </div>
        )}

        {/* D3: Tıklanabilir renkli kategori tag'leri */}
        {ilan.kategoriYol && ilan.kategoriYol.length > 0 && (
          <div style={{display:'flex',alignItems:'center',gap:5,flexWrap:'wrap',marginBottom:8, position:'relative', zIndex:2}}>
            {ilan.kategoriYol.map((k, i) => {
              const sonSeviye = i === ilan.kategoriYol.length - 1
              return (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onKatTikla?.(k.slug, null, i + 1) }}
                  style={{
                    fontSize:10.5, fontWeight: sonSeviye ? 600 : 500,
                    color: sonSeviye ? '#fff' : anaRenk.text,
                    background: sonSeviye ? anaRenk.renk : 'transparent',
                    border: sonSeviye ? 'none' : `0.5px solid ${anaRenk.border}`,
                    padding:'2px 8px', borderRadius:5, cursor:'pointer',
                    fontFamily:'inherit', transition:'all 0.12s', whiteSpace:'nowrap',
                  }}
                  title={`${k.label} kategorisindeki ilanları gör`}
                >
                  {k.label}
                </button>
              )
            })}
          </div>
        )}

        {/* Açıklama — tek satır + devamını oku */}
        {ilan.aciklama && (
          <p style={{
            fontSize:12.5, color:'#64748b', fontWeight:400,
            margin:'0 0 8px', lineHeight:1.45,
            ...(aciklamaAcik ? {} : {
              display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical',
              overflow:'hidden',
            }),
          }}>
            {ilan.aciklama}
            {!aciklamaAcik && ilan.aciklama.length > 40 && (
              <button
                onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); setAciklamaAcik(true) }}
                style={{ background:'none', border:'none', color:anaRenk.renk, fontWeight:600, fontSize:12.5, cursor:'pointer', padding:0, marginLeft:4, fontFamily:'inherit', position:'relative', zIndex:2 }}
              >devamını oku</button>
            )}
          </p>
        )}
        {ilan.aciklama && aciklamaAcik && (
          <button
            onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); setAciklamaAcik(false) }}
            style={{ background:'none', border:'none', color:'#94a3b8', fontWeight:600, fontSize:11.5, cursor:'pointer', padding:0, marginBottom:8, fontFamily:'inherit', position:'relative', zIndex:2, display:'block' }}
          >↑ kapat</button>
        )}

        {/* Özellik etiketleri — küçük */}
        {ilan.tags && ilan.tags.length > 0 && (
          <div style={{display:'flex', gap:5, flexWrap:'wrap', marginBottom:8}}>
            {ilan.tags.map((t,i) => (
              <span key={i} style={{
                fontSize:10, color:'#64748b', background:'#f1f5f9',
                padding:'2px 8px', borderRadius:5, whiteSpace:'nowrap',
              }}>{t.label}</span>
            ))}
          </div>
        )}

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

        {/* Footer — sadece butonlar, sağa hizalı */}
        <div style={{display:'flex', justifyContent:'flex-end', alignItems:'center', gap:6, marginTop:4, position:'relative', zIndex:3, pointerEvents:'auto'}}>
          {beklemede ? (
            <span style={{fontSize:11,color:'#DC2626',fontWeight:600}}>Onay sonrası satıcılar görecek</span>
          ) : (
            <>
              {telefonGoster && !mesajAcik && (
                <div style={{position:'relative',zIndex:3,pointerEvents:'auto'}} onClick={e=>e.stopPropagation()}>
                  <TelefonGosterButon ilanId={ilan.id} kullaniciEmail={user?.email} />
                </div>
              )}
              {!mesajAcik && (
                <button style={{
                  background:anaRenk.renk, color:'#fff', border:'none',
                  borderRadius:999, padding:'9px 18px', fontSize:13.5, fontWeight:700,
                  cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
                  display:'flex', alignItems:'center', gap:8,
                  position:'relative', zIndex:3, pointerEvents:'auto',
                }} onClick={(e)=>{ e.stopPropagation(); handleMesajAc() }}>
                  <span style={{fontSize:15}}>💬</span> Mesaj Gönder
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}