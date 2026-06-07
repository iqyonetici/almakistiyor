import { useState } from 'react'
import styles from './IlanKarti.module.css'

const vasitaMarkalar = ['Volkswagen','BMW','Mercedes','Toyota','Honda','Renault','Ford','Hyundai','Kia','Fiat','Opel','Peugeot','Audi','Skoda','Seat','Volvo']

function getIlanRenk(ilan) {
  if (ilan.kategori === 'emlak') {
    const tipTag = ilan.tags?.find(t => ['Daire','Villa','Arsa','Ä°ÅŸyeri','MÃ¼stakil Ev','Depo','Tarla'].includes(t.label))
    const tip = tipTag?.label || ''
    if (tip === 'Daire')       return { bg:'#F0F7FF', border:'#C5DCF8', badge:'#2563EB', badgeBg:'#DBEAFE', label:'Daire' }
    if (tip === 'Villa')       return { bg:'#F0FDF4', border:'#86EFAC', badge:'#16A34A', badgeBg:'#DCFCE7', label:'Villa' }
    if (tip === 'Arsa')        return { bg:'#FFFBEB', border:'#FCD34D', badge:'#D97706', badgeBg:'#FEF3C7', label:'Arsa' }
    if (tip === 'Ä°ÅŸyeri')      return { bg:'#FDF4FF', border:'#E9D5FF', badge:'#7C3AED', badgeBg:'#EDE9FE', label:'Ä°ÅŸyeri' }
    if (tip === 'MÃ¼stakil Ev') return { bg:'#FFF1F2', border:'#FECDD3', badge:'#E11D48', badgeBg:'#FFE4E6', label:'MÃ¼stakil' }
    if (tip === 'Depo')        return { bg:'#F8FAFC', border:'#CBD5E1', badge:'#475569', badgeBg:'#E2E8F0', label:'Depo' }
    if (tip === 'Tarla')       return { bg:'#F0FDF4', border:'#BBF7D0', badge:'#15803D', badgeBg:'#DCFCE7', label:'Tarla' }
    return { bg:'#EFF6FF', border:'#BFDBFE', badge:'#1D4ED8', badgeBg:'#DBEAFE', label:'Emlak' }
  }
  if (ilan.kategori === 'vasita') {
    const markaTag = ilan.tags?.find(t => vasitaMarkalar.some(m => t.label?.includes(m)))
    const marka = (markaTag?.label||'').toUpperCase()
    if (marka.includes('BMW') || marka.includes('MERCEDES') || marka.includes('AUDI'))
      return { bg:'#F8FAFC', border:'#94A3B8', badge:'#1E293B', badgeBg:'#E2E8F0', label: markaTag?.label||'VasÄ±ta' }
    if (marka.includes('TOYOTA') || marka.includes('HONDA'))
      return { bg:'#ECFDF5', border:'#6EE7B7', badge:'#059669', badgeBg:'#D1FAE5', label: markaTag?.label||'VasÄ±ta' }
    return { bg:'#FFF7ED', border:'#FED7AA', badge:'#EA580C', badgeBg:'#FFEDD5', label: markaTag?.label||'VasÄ±ta' }
  }
  const renk = {
    'ikinci-el':  { bg:'#F0FDF4', border:'#BBF7D0', badge:'#15803D', badgeBg:'#DCFCE7', label:'Ä°kinci El' },
    'mobilya':    { bg:'#FDF4FF', border:'#E9D5FF', badge:'#9333EA', badgeBg:'#F3E8FF', label:'Mobilya' },
    'elektronik': { bg:'#EFF6FF', border:'#BFDBFE', badge:'#1D4ED8', badgeBg:'#DBEAFE', label:'Elektronik' },
    'sanayi':     { bg:'#F8FAFC', border:'#CBD5E1', badge:'#475569', badgeBg:'#E2E8F0', label:'Sanayi' },
    'alisveris':  { bg:'#FDF4FF', border:'#E9D5FF', badge:'#9333EA', badgeBg:'#F3E8FF', label:'AlÄ±ÅŸveriÅŸ' },
    'hizmetler':  { bg:'#EFF6FF', border:'#BFDBFE', badge:'#1D4ED8', badgeBg:'#DBEAFE', label:'Hizmet' },
    'is-ilanlari':{ bg:'#ECFDF5', border:'#6EE7B7', badge:'#059669', badgeBg:'#D1FAE5', label:'Ä°ÅŸ Ä°lanÄ±' },
    'hayvanlar':  { bg:'#FFF7ED', border:'#FED7AA', badge:'#EA580C', badgeBg:'#FFEDD5', label:'Hayvanlar' },
    'ozel-ders':  { bg:'#FDF4FF', border:'#E9D5FF', badge:'#7C3AED', badgeBg:'#EDE9FE', label:'Ã–zel Ders' },
    'yedek-parca':{ bg:'#F8FAFC', border:'#CBD5E1', badge:'#334155', badgeBg:'#E2E8F0', label:'Yedek ParÃ§a' },
    'is-makineleri':{ bg:'#FFFBEB', border:'#FCD34D', badge:'#92400E', badgeBg:'#FEF3C7', label:'Ä°ÅŸ Mak.' },
  }
  return renk[ilan.kategori] || { bg:'#F8FAFC', border:'#E2E8F0', badge:'#475569', badgeBg:'#E2E8F0', label:'Ä°lan' }
}

function initials(name) {
  if (!name || typeof name !== 'string') return '?'
  return name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)
}
function maskedName(name) {
  if (!name || typeof name !== 'string') return 'KullanÄ±cÄ±'
  const p = name.trim().split(' ')
  return p.length === 1 ? p[0] : p[0] + ' ' + (p[p.length-1][0]||'') + '.'
}

export default function IlanKarti({ ilan, user, mesajHaklari, onMesajGonder, onTelefonGoster }) {
  const renk = getIlanRenk(ilan)
  const ilanAd     = ilan?.ad || 'KullanÄ±cÄ±'
  const ilanBaslik = ilan?.baslik || 'Talep ilanÄ±'
  const ilanSehir  = ilan?.sehir || ''
  const ilanIlce   = ilan?.ilce || ''

  const [mesajAcik, setMesajAcik] = useState(false)
  const [mesajMetni, setMesajMetni] = useState('')
  const [mesajGonderildi, setMesajGonderildi] = useState(false)
  const [gonderiliyor, setGonderiliyor] = useState(false)

  const kalanGenel = mesajHaklari?.kalanGenel
  const beklemede = ilan?.onayDurumu === 'beklemede'

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
    <div className={styles.card} style={{background: beklemede ? '#FEF2F2' : renk.bg, borderColor: beklemede ? '#FCA5A5' : renk.border}}>
      {beklemede && (
        <div style={{display:'flex',alignItems:'center',gap:8,background:'#DC2626',color:'white',padding:'8px 14px',borderRadius:'10px',marginBottom:12,fontSize:13,fontWeight:600}}>
          <span style={{fontSize:16}}>â³</span>
          YÃ¶netici onayÄ± bekliyor â€” yalnÄ±zca siz gÃ¶rÃ¼yorsunuz
        </div>
      )}
      {!beklemede && <a href={`/ilan/${ilan?.id}`} className={styles.cardLink} aria-label="Ä°lan detayÄ±nÄ± gÃ¶r" />}

      <div className={styles.top}>
        <div className={styles.left}>
          <div className={styles.avatar} style={{background:renk.badgeBg, color:renk.badge}}>
            {initials(ilanAd)}
          </div>
          <div>
            <div className={styles.name}>
              {maskedName(ilanAd)}
            </div>
            <div className={styles.location}>ğŸ“ {ilanSehir}{ilanIlce?` â€” ${ilanIlce}`:''}</div>
          </div>
        </div>
        <div className={styles.metaRight}>
          <div className={styles.date}>{ilan?.tarih||''}</div>
          <span className={styles.catBadge} style={{background:renk.badgeBg, color:renk.badge}}>
            {renk.label}
          </span>
        </div>
      </div>

      <div className={styles.title}>{ilanBaslik}</div>

      <div className={styles.tags}>
        {ilan.fiyatMin && ilan.fiyatMax && (
          <span className="tag tag-price">
            â‚º{Number(ilan.fiyatMin).toLocaleString('tr-TR')} â€” â‚º{Number(ilan.fiyatMax).toLocaleString('tr-TR')}
          </span>
        )}
        {ilan.tags?.map((t,i) => <span key={i} className={`tag ${t.variant||'tag-gray'}`}>{t.label}</span>)}
      </div>

      {ilan.aciklama && <p className={styles.desc}>{ilan.aciklama}</p>}

      {mesajAcik && (
        <div className={styles.mesajKutu} style={{borderColor:renk.border}}>
          {mesajGonderildi ? (
            <div className={styles.mesajBasarili}>âœ… MesajÄ±nÄ±z gÃ¶nderildi!</div>
          ) : (
            <>
              <div className={styles.mesajHeader}>
                <span className={styles.mesajBaslik}>{maskedName(ilanAd)} adlÄ± alÄ±cÄ±ya mesaj</span>
                {azKaldi && <span style={{fontSize:11,fontWeight:600,color:kalanRenk}}>{kalanGenel} mesaj hakkÄ± kaldÄ±</span>}
              </div>
              <textarea className={styles.mesajInput} rows={3} placeholder="MesajÄ±nÄ±zÄ± yazÄ±n..."
                value={mesajMetni} onChange={e=>setMesajMetni(e.target.value)} autoFocus />
              <div className={styles.mesajAlt}>
                <button className={styles.iptalBtn} onClick={()=>setMesajAcik(false)}>Ä°ptal</button>
                <button className={styles.gonderBtn} disabled={!mesajMetni.trim()||gonderiliyor} onClick={handleMesajGonder}>
                  {gonderiliyor ? 'GÃ¶nderiliyor...' : 'GÃ¶nder â†’'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className={styles.footer}>
        <div className={styles.views}>ğŸ‘ {ilan.goruntuleme||0} satÄ±cÄ± baktÄ±</div>
        <div className={styles.butonlar}>
          {beklemede ? (
            <span style={{fontSize:13,color:'#DC2626',fontWeight:600}}>Onay sonrasÄ± satÄ±cÄ±lar gÃ¶recek</span>
          ) : (
            <>
              {!mesajAcik && (
                <button className={styles.btnMesaj} style={{background:renk.badge}} onClick={handleMesajAc}>
                  ğŸ’¬ Mesaj GÃ¶nder
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
