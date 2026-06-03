import { useState } from 'react'
import styles from './IlanKarti.module.css'

const catColors = {
  emlak:        { bg: '#EBF4FF', color: '#1A4A8A', label: 'Emlak' },
  vasita:       { bg: '#FFF5EB', color: '#7A3C00', label: 'Vasıta' },
  'ikinci-el':  { bg: '#F0FBF6', color: '#1A5C35', label: 'İkinci El' },
  mobilya:      { bg: '#F5F0FB', color: '#4A1A8A', label: 'Mobilya' },
  elektronik:   { bg: '#EBF4FF', color: '#1A4A8A', label: 'Elektronik' },
  'is-makinasi':{ bg: '#FFF5EB', color: '#7A3C00', label: 'İş Makinası' },
}
const avatarColors = [
  { bg:'#E6F5F2', color:'#0D7A6B' },
  { bg:'#EBF4FF', color:'#1A4A8A' },
  { bg:'#FFF5EB', color:'#7A3C00' },
  { bg:'#F0FBF6', color:'#1A5C35' },
  { bg:'#FEF3DC', color:'#7A4F01' },
]

function initials(name) {
  if (!name || typeof name !== 'string') return '?'
  return name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)
}
function maskedName(name) {
  if (!name || typeof name !== 'string') return 'Kullanıcı'
  const p = name.trim().split(' ')
  return p.length === 1 ? p[0] : p[0] + ' ' + (p[p.length-1][0] || '') + '.'
}
function maskedPhone(tel) {
  if (!tel || typeof tel !== 'string') return '*** *** ** **'
  const d = tel.replace(/\D/g,'')
  if (d.length < 10) return tel
  return d.slice(0,3) + ' ' + d.slice(3,6) + ' ** **'
}

// user: giriş yapan kullanıcı, mesajHaklari: {kalan, gonderilenBuKisiye}
export default function IlanKarti({ ilan, user, mesajHaklari, onMesajGonder, onTelefonGoster }) {
  const cat = catColors[ilan?.kategori] || catColors['ikinci-el']
  const idStr = String(ilan?.id || '')
  const idHash = idStr.split('').reduce((a,c) => a + c.charCodeAt(0), 0)
  const av = avatarColors[idHash % avatarColors.length] || avatarColors[0]
  const ilanAd = ilan?.ad || 'Kullanıcı'
  const ilanBaslik = ilan?.baslik || 'Talep ilanı'
  const ilanSehir = ilan?.sehir || ''
  const ilanIlce = ilan?.ilce || ''
  const ilanTelefon = ilan?.telefon || ''

  const [mesajAcik, setMesajAcik] = useState(false)
  const [mesajMetni, setMesajMetni] = useState('')
  const [mesajGonderildi, setMesajGonderildi] = useState(false)
  const [telefonAcik, setTelefonAcik] = useState(false)
  const [uyari, setUyari] = useState('')

  // Kullanıcı giriş yapmamış
  const girisYok = !user

  // Kalan mesaj hakkı
  const kalanGenel  = mesajHaklari?.kalanGenel  ?? 3
  const gonderilenBuKisiye = mesajHaklari?.gonderilenBuKisiye ?? 0
  const MAX_BU_KISIYE = 5

  function handleMesajAc() {
    if (girisYok) { window.location.href = '/giris'; return }
    if (kalanGenel <= 0) {
      setUyari('⚠️ Ücretsiz mesaj hakkınız doldu. Devam etmek için paket satın alın.')
      setTimeout(()=>setUyari(''),4000)
      return
    }
    if (gonderilenBuKisiye >= MAX_BU_KISIYE) {
      setUyari(`⚠️ Bu alıcıya en fazla ${MAX_BU_KISIYE} mesaj gönderebilirsiniz. Limitinize ulaştınız.`)
      setTimeout(()=>setUyari(''),4000)
      return
    }
    setMesajAcik(true)
    setMesajGonderildi(false)
    setMesajMetni('')
  }

  function handleMesajGonder() {
    if (!mesajMetni.trim()) return
    onMesajGonder && onMesajGonder({ ilan, mesaj: mesajMetni })
    setMesajGonderildi(true)
    setMesajMetni('')
    setTimeout(() => setMesajAcik(false), 2000)
  }

  function handleTelefon() {
    if (girisYok) { window.location.href = '/giris'; return }
    const paketliMi = user?.paket && user.paket !== 'Ücretsiz'
    if (!paketliMi) {
      onTelefonGoster && onTelefonGoster(ilan)
      return
    }
    setTelefonAcik(true)
  }

  // Uyarı mesajı rengi
  const kalanRenk = kalanGenel === 1 ? '#E53E3E' : kalanGenel === 2 ? '#D97706' : '#0D7A6B'

  return (
    <div className={styles.card}>
      <a href={`/ilan/${ilan?.id}`} className={styles.cardLink} aria-label="İlan detayını gör" />
      <div className={styles.top}>
        <div className={styles.left}>
          <div className={styles.avatar} style={{background:av.bg, color:av.color}}>
            {initials(ilanAd)}
          </div>
          <div>
            <div className={styles.name}>
              {maskedName(ilanAd)}
              <span className={styles.lockBadge}>🔒 Tel gizli</span>
            </div>
            <div className={styles.location}>
              📍 {ilanSehir}{ilanIlce ? ` — ${ilanIlce}` : ''}
            </div>
          </div>
        </div>
        <div className={styles.metaRight}>
          <div className={styles.date}>{ilan?.tarih || ''}</div>
          <span className={styles.catBadge} style={{background:cat.bg, color:cat.color}}>{cat.label}</span>
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

      {/* Uyarı */}
      {uyari && <div className={styles.uyariBox}>{uyari}</div>}

      {/* Mesaj gönderme kutusu */}
      {mesajAcik && (
        <div className={styles.mesajKutu}>
          {mesajGonderildi ? (
            <div className={styles.mesajBasarili}>✅ Mesajınız gönderildi! Alıcı yanıt verdiğinde bildirim alacaksınız.</div>
          ) : (
            <>
              <div className={styles.mesajHeader}>
                <span className={styles.mesajBaslik}>{maskedName(ilan.ad)} adlı alıcıya mesaj</span>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  {kalanGenel <= 3 && (
                    <span style={{fontSize:11, fontWeight:600, color:kalanRenk, background: kalanGenel===1?'#FEF2F2':kalanGenel===2?'#FFFBEB':'#E6F5F2', padding:'2px 8px', borderRadius:10}}>
                      {kalanGenel} mesaj hakkı kaldı
                    </span>
                  )}
                  {gonderilenBuKisiye > 0 && (
                    <span style={{fontSize:11, color:'var(--text-3)'}}>
                      Bu kişiye: {gonderilenBuKisiye}/{MAX_BU_KISIYE}
                    </span>
                  )}
                </div>
              </div>
              <textarea className={styles.mesajInput}
                rows={3} placeholder="Mesajınızı yazın... (örn: Merhaba, ilanınızla ilgileniyorum)"
                value={mesajMetni} onChange={e => setMesajMetni(e.target.value)} autoFocus />
              <div className={styles.mesajAlt}>
                <button className={styles.iptalBtn} onClick={() => setMesajAcik(false)}>İptal</button>
                <button className={styles.gonderBtn} disabled={!mesajMetni.trim()} onClick={handleMesajGonder}>
                  Gönder →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Alt butonlar */}
      <div className={styles.footer}>
        <div className={styles.views}>
          👁 {ilan.goruntuleme || 0} satıcı baktı
        </div>
        <div className={styles.butonlar}>
          {/* Telefon butonu */}
          {telefonAcik ? (
            <span className={styles.telefonAcik}>
              📞 {ilanTelefon || 'Bilgi yok'}
            </span>
          ) : (
            <button className={styles.btnTelefon} onClick={handleTelefon}>
              📞 {maskedPhone(ilanTelefon)}
              <span className={styles.kilidAc}>Göster</span>
            </button>
          )}

          {/* Mesaj butonu */}
          {!mesajAcik && (
            <button className={styles.btnMesaj} onClick={handleMesajAc}>
              💬 Mesaj Gönder
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
