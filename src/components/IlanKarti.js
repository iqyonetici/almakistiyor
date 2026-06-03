import { useState } from 'react'
import styles from './IlanKarti.module.css'

// Her ilan tipi için farklı soft kart rengi
const ilanRenkleri = {
  emlak_daire:    { bg:'#F0F7FF', border:'#C5DCF8', avatar:'#2563EB', avatarBg:'#DBEAFE', label:'Daire' },
  emlak_villa:    { bg:'#F0FDF4', border:'#86EFAC', avatar:'#16A34A', avatarBg:'#DCFCE7', label:'Villa' },
  emlak_arsa:     { bg:'#FFFBEB', border:'#FCD34D', avatar:'#D97706', avatarBg:'#FEF3C7', label:'Arsa' },
  emlak_isyeri:   { bg:'#FDF4FF', border:'#E9D5FF', avatar:'#7C3AED', avatarBg:'#EDE9FE', label:'İşyeri' },
  emlak_mustakil: { bg:'#FFF1F2', border:'#FECDD3', avatar:'#E11D48', avatarBg:'#FFE4E6', label:'Müstakil' },
  emlak_diger:    { bg:'#F0F9FF', border:'#BAE6FD', avatar:'#0369A1', avatarBg:'#E0F2FE', label:'Emlak' },
  vasita:         { bg:'#FFF7ED', border:'#FED7AA', avatar:'#EA580C', avatarBg:'#FFEDD5', label:'Vasıta' },
  'ikinci-el':    { bg:'#F0FDF4', border:'#BBF7D0', avatar:'#15803D', avatarBg:'#DCFCE7', label:'İkinci El' },
  mobilya:        { bg:'#FDF4FF', border:'#E9D5FF', avatar:'#9333EA', avatarBg:'#F3E8FF', label:'Mobilya' },
  elektronik:     { bg:'#EFF6FF', border:'#BFDBFE', avatar:'#1D4ED8', avatarBg:'#DBEAFE', label:'Elektronik' },
  sanayi:         { bg:'#F8FAFC', border:'#CBD5E1', avatar:'#475569', avatarBg:'#E2E8F0', label:'Sanayi' },
}

function getIlanRenk(ilan) {
  if (ilan.kategori === 'emlak') {
    const tip = (ilan.emlak_tip || ilan.tags?.find(t=>t.label)?.[0] || '').toLowerCase()
    if (tip.includes('daire')) return ilanRenkleri.emlak_daire
    if (tip.includes('villa')) return ilanRenkleri.emlak_villa
    if (tip.includes('arsa')) return ilanRenkleri.emlak_arsa
    if (tip.includes('işyeri') || tip.includes('isyeri')) return ilanRenkleri.emlak_isyeri
    if (tip.includes('müstakil') || tip.includes('mustakil')) return ilanRenkleri.emlak_mustakil
    // tags içinden bul
    const tagTip = ilan.tags?.find(t => ['Daire','Villa','Arsa','İşyeri','Müstakil Ev','Depo'].some(x=>t.label===x))
    if (tagTip) {
      if (tagTip.label === 'Daire') return ilanRenkleri.emlak_daire
      if (tagTip.label === 'Villa') return ilanRenkleri.emlak_villa
      if (tagTip.label === 'Arsa') return ilanRenkleri.emlak_arsa
      if (tagTip.label === 'İşyeri') return ilanRenkleri.emlak_isyeri
      if (tagTip.label === 'Müstakil Ev') return ilanRenkleri.emlak_mustakil
    }
    return ilanRenkleri.emlak_diger
  }
  return ilanRenkleri[ilan.kategori] || ilanRenkleri['ikinci-el']
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
function maskedPhone(tel) {
  if (!tel || typeof tel !== 'string') return '*** *** ** **'
  const d = String(tel).replace(/\D/g,'')
  if (d.length < 10) return tel
  return d.slice(0,3) + ' ' + d.slice(3,6) + ' ** **'
}

export default function IlanKarti({ ilan, user, mesajHaklari, onMesajGonder, onTelefonGoster }) {
  const renk = getIlanRenk(ilan)
  const ilanAd       = ilan?.ad || 'Kullanıcı'
  const ilanBaslik   = ilan?.baslik || 'Talep ilanı'
  const ilanSehir    = ilan?.sehir || ''
  const ilanIlce     = ilan?.ilce || ''
  const ilanTelefon  = ilan?.telefon || ''
  // Telefon tercihine göre: 'mesaj' = sadece mesaj, 'telefon' = ikisi de
  const telefonGoster = ilan?.iletisimTercihi === 'telefon'

  const [mesajAcik, setMesajAcik] = useState(false)
  const [mesajMetni, setMesajMetni] = useState('')
  const [mesajGonderildi, setMesajGonderildi] = useState(false)
  const [telefonAcik, setTelefonAcik] = useState(false)
  const [uyari, setUyari] = useState('')

  const kalanGenel  = mesajHaklari?.kalanGenel ?? 3
  const gonderilenBuKisiye = mesajHaklari?.gonderilenBuKisiye ?? 0
  const MAX_BU_KISIYE = 5

  function handleMesajAc() {
    if (!user) { window.location.href = '/giris'; return }
    if (kalanGenel <= 0) {
      setUyari('⚠️ Ücretsiz mesaj hakkınız doldu. Devam etmek için paket satın alın.')
      setTimeout(()=>setUyari(''),4000); return
    }
    if (gonderilenBuKisiye >= MAX_BU_KISIYE) {
      setUyari(`⚠️ Bu alıcıya en fazla ${MAX_BU_KISIYE} mesaj gönderebilirsiniz.`)
      setTimeout(()=>setUyari(''),4000); return
    }
    setMesajAcik(true); setMesajGonderildi(false); setMesajMetni('')
  }

  function handleMesajGonder() {
    if (!mesajMetni.trim()) return
    onMesajGonder && onMesajGonder({ ilan, mesaj: mesajMetni })
    setMesajGonderildi(true); setMesajMetni('')
    setTimeout(() => setMesajAcik(false), 2000)
  }

  function handleTelefon() {
    if (!user) { window.location.href = '/giris'; return }
    const paketliMi = user?.paket && user.paket !== 'Ücretsiz'
    if (!paketliMi) { onTelefonGoster && onTelefonGoster(ilan); return }
    setTelefonAcik(true)
  }

  const kalanRenk = kalanGenel === 1 ? '#E53E3E' : kalanGenel === 2 ? '#D97706' : '#0D7A6B'

  return (
    <div className={styles.card} style={{background:renk.bg, borderColor:renk.border}}>
      <a href={`/ilan/${ilan?.id}`} className={styles.cardLink} aria-label="İlan detayını gör" />

      {/* ÜST: avatar + isim + konum + kategori */}
      <div className={styles.top}>
        <div className={styles.left}>
          <div className={styles.avatar} style={{background:renk.avatarBg, color:renk.avatar}}>
            {initials(ilanAd)}
          </div>
          <div>
            <div className={styles.name}>
              {maskedName(ilanAd)}
              {/* Sadece mesaj ise kilit, telefon açıksa farklı badge */}
              {telefonGoster
                ? <span className={styles.telAcikBadge}>📞 İletişime açık</span>
                : <span className={styles.lockBadge}>🔒 Tel gizli</span>
              }
            </div>
            <div className={styles.location}>📍 {ilanSehir}{ilanIlce ? ` — ${ilanIlce}` : ''}</div>
          </div>
        </div>
        <div className={styles.metaRight}>
          <div className={styles.date}>{ilan?.tarih || ''}</div>
          <span className={styles.catBadge} style={{background:renk.avatarBg, color:renk.avatar}}>{renk.label}</span>
        </div>
      </div>

      <div className={styles.title}>{ilanBaslik}</div>

      {/* Taglar */}
      <div className={styles.tags}>
        {ilan.fiyatMin && ilan.fiyatMax && (
          <span className="tag tag-price">
            ₺{Number(ilan.fiyatMin).toLocaleString('tr-TR')} – ₺{Number(ilan.fiyatMax).toLocaleString('tr-TR')}
          </span>
        )}
        {ilan.tags?.map((t,i) => (
          <span key={i} className={`tag ${t.variant||'tag-gray'}`}>{t.label}</span>
        ))}
      </div>

      {ilan.aciklama && <p className={styles.desc}>{ilan.aciklama}</p>}
      {uyari && <div className={styles.uyariBox}>{uyari}</div>}

      {/* Mesaj kutusu */}
      {mesajAcik && (
        <div className={styles.mesajKutu} style={{borderColor:renk.border}}>
          {mesajGonderildi ? (
            <div className={styles.mesajBasarili}>✅ Mesajınız gönderildi!</div>
          ) : (
            <>
              <div className={styles.mesajHeader}>
                <span className={styles.mesajBaslik}>{maskedName(ilanAd)} adlı alıcıya mesaj</span>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  {kalanGenel <= 3 && (
                    <span style={{fontSize:11,fontWeight:600,color:kalanRenk,background:kalanGenel===1?'#FEF2F2':kalanGenel===2?'#FFFBEB':'#E6F5F2',padding:'2px 8px',borderRadius:10}}>
                      {kalanGenel} hak kaldı
                    </span>
                  )}
                </div>
              </div>
              <textarea className={styles.mesajInput} rows={3}
                placeholder="Mesajınızı yazın..."
                value={mesajMetni} onChange={e=>setMesajMetni(e.target.value)} autoFocus />
              <div className={styles.mesajAlt}>
                <button className={styles.iptalBtn} onClick={()=>setMesajAcik(false)}>İptal</button>
                <button className={styles.gonderBtn} disabled={!mesajMetni.trim()} onClick={handleMesajGonder}>Gönder →</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ALT: görüntülenme + butonlar */}
      <div className={styles.footer}>
        <div className={styles.views}>👁 {ilan.goruntuleme||0} satıcı baktı</div>
        <div className={styles.butonlar}>

          {/* Telefon — sadece iletisimTercihi 'telefon' ise göster */}
          {telefonGoster && (
            telefonAcik ? (
              <span className={styles.telefonAcik}>📞 {ilanTelefon || 'Bilgi yok'}</span>
            ) : (
              <button className={styles.btnTelefon} onClick={handleTelefon}>
                📞 {maskedPhone(ilanTelefon)}
                <span className={styles.kilidAc}>Göster</span>
              </button>
            )
          )}

          {/* Mesaj — her zaman göster */}
          {!mesajAcik && (
            <button className={styles.btnMesaj} style={{background:renk.avatar}} onClick={handleMesajAc}>
              💬 Mesaj Gönder
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
