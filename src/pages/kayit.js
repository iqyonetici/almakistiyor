import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { sehirler, getIlceler } from '../data/sehirler'
import styles from './kayit.module.css'

const SARI = '#F5A623'

const YASAK_KELIMELER = [
  'sik','orospu','piç','pic','göt','got','amk','bok','oç','oc',
  'salak','aptal','gerizekalı','gerizekal','kahpe','sürtük',
  'siktir','amına','amina','ibne',
]

function adFormatla(deger) {
  if (!deger) return deger
  return deger.toLocaleLowerCase('tr-TR').replace(/(^|[\s-])\p{L}/gu, h => h.toLocaleUpperCase('tr-TR'))
}

function adGecerliMi(ad) {
  if (!ad || ad.trim().length < 2) return false
  const v = ad.trim().toLowerCase()
  if (YASAK_KELIMELER.some(k => v.includes(k))) return false
  if (!/^[a-zçğıöşüA-ZÇĞIİÖŞÜ\s-]+$/.test(ad.trim())) return false
  if (/(.)\1\1/.test(v)) return false
  return true
}

const YAYGIN_MAIL_SAGLAYICILAR = [
  'gmail.com','hotmail.com','outlook.com','yahoo.com','icloud.com',
  'msn.com','live.com','yandex.com','hotmail.com.tr','outlook.com.tr',
  'mail.com','protonmail.com','gmx.com',
]

function emailFormatGecerliMi(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')
}

function emailYayginMi(email) {
  if (!email || !email.includes('@')) return true
  const alan = email.split('@')[1]?.toLowerCase().trim()
  return YAYGIN_MAIL_SAGLAYICILAR.includes(alan)
}
function randomCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1
  const b = Math.floor(Math.random() * 9) + 1
  return { a, b, answer: a + b }
}

function formatTel(val) {
  const digits = val.replace(/\D/g,'').replace(/^0+/,'')
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return digits.slice(0,3) + ' ' + digits.slice(3)
  if (digits.length <= 8) return digits.slice(0,3) + ' ' + digits.slice(3,6) + ' ' + digits.slice(6)
  return digits.slice(0,3) + ' ' + digits.slice(3,6) + ' ' + digits.slice(6,8) + ' ' + digits.slice(8,10)
}

// Zorunlu alan etiketi — sarı yıldızlı
function ZLabel({ children, not }) {
  return (
    <label className="form-label">
      {children} <span style={{color:SARI,fontWeight:700}}>*</span>
      {not && <span style={{fontWeight:400,color:'var(--text-3)',fontSize:11}}> {not}</span>}
    </label>
  )
}

export default function Kayit() {
  const { kayitOl } = useAuth()
  const router = useRouter()

  const [hatalar, setHatalar] = useState({})
  const [captcha] = useState(randomCaptcha())
  const [captchaInput, setCaptchaInput] = useState('')
  const [kayitHata, setKayitHata] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)
  const [basarili, setBasarili] = useState(false)

  const [ad, setAd] = useState('')
  const [soyad, setSoyad] = useState('')
  const [email, setEmail] = useState('')
  const [telefon, setTelefon] = useState('')
  const [sifre, setSifre] = useState('')
  const [sifre2, setSifre2] = useState('')
  const [sehir, setSehir] = useState('')
  const [ilce, setIlce] = useState('')
  const [kvkk, setKvkk] = useState(false)
  const [sozlesme, setSozlesme] = useState(false)

  const ilceler = getIlceler(sehir)

  // Zorunlu alan stili — hata yoksa sarı çerçeve
  const zorunluStil = (alan, doluMu) => hatalar[alan] ? undefined : doluMu ? { borderColor: '#86efac' } : { borderColor: SARI }

  function canliKontrolEt(alanlar) {
    setHatalar(h => {
      const yeni = {...h}
      if ('ad' in alanlar) { if (adGecerliMi(alanlar.ad)) delete yeni.ad; else if (!alanlar.ad.trim()) delete yeni.ad; else yeni.ad = 'Geçerli bir ad girin' }
      if ('soyad' in alanlar) { if (adGecerliMi(alanlar.soyad)) delete yeni.soyad; else if (!alanlar.soyad.trim()) delete yeni.soyad; else yeni.soyad = 'Geçerli bir soyad girin' }
      if ('email' in alanlar) { if (!alanlar.email.trim() || emailFormatGecerliMi(alanlar.email)) delete yeni.email; else yeni.email = 'Geçerli e-posta girin' }
      return yeni
    })
  }

  function validate() {
    const h = {}
    if (!adGecerliMi(ad)) h.ad = ad.trim() ? 'Geçerli bir ad girin' : 'Zorunlu'
    if (!adGecerliMi(soyad)) h.soyad = soyad.trim() ? 'Geçerli bir soyad girin' : 'Zorunlu'
    if (!emailFormatGecerliMi(email)) h.email = 'Geçerli e-posta girin'
    if (telefon.replace(/\D/g,'').length < 10) h.telefon = 'En az 10 rakam'
    if (sifre.length < 6) h.sifre = 'En az 6 karakter'
    if (sifre !== sifre2) h.sifre2 = 'Şifreler eşleşmiyor'
    if (!sehir) h.sehir = 'Şehir seçin'
    if (parseInt(captchaInput) !== captcha.answer) h.captcha = 'Yanlış cevap'
    if (!kvkk || !sozlesme) h.sozlesme = 'Sözleşmeleri onaylayın'
    setHatalar(h)
    return Object.keys(h).length === 0
  }

  async function kayitTamamla() {
    if (!validate()) return
    setYukleniyor(true)
    setKayitHata('')

    const { data, error } = await kayitOl({
      email, sifre, ad, soyad,
      telefon: telefon.replace(/\D/g,''),
      sehir, ilce,
    })

    setYukleniyor(false)
    if (error) {
      setKayitHata(error)
      return
    }

    // Hoş geldin maili (hata olsa kaydı engellemez)
    fetch('/api/hosgeldin-mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ad }),
    }).catch(() => {})

    // Başarılı — Supabase doğrulama maili gönderdi
    if (data && data.session) { router.push('/panel') } else { setBasarili(true) }
  }

  const Logo = () => (
    <a href="/" className={styles.logo} style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
      <img src="/almakistiyor-icon.png" alt="almakistiyor.com" width="36" height="36" style={{borderRadius:8}} />
      <span style={{fontSize:18,fontFamily:'Sora,sans-serif',color:'#1A1D23',letterSpacing:'-0.3px'}}>
        <strong>almak</strong>istiyor<span style={{color:'#F5A623'}}>.com</span>
      </span>
    </a>
  )

  // BAŞARILI — e-posta doğrulama bekleniyor
  if (basarili) return (
    <>
      <Head><title>E-posta Doğrulama — AlmakIstiyor.com</title></Head>
      <div className={styles.wrap}>
        <div className={styles.boxSm}>
          <Logo />
          <div className={styles.dogrulamaIcon}>📧</div>
          <h2 className={styles.stepTitle}>E-postanızı kontrol edin</h2>
          <p className={styles.stepSub}>
            <strong>{email}</strong> adresine bir doğrulama bağlantısı gönderdik.
            Bağlantıya tıklayarak hesabınızı aktifleştirin.
          </p>
          <div className={styles.demoBox} style={{marginBottom:20}}>
            💡 E-posta birkaç dakika içinde gelmezse spam/gereksiz klasörünü kontrol edin.
          </div>
          <button className="btn-primary" style={{width:'100%',justifyContent:'center',padding:13,marginBottom:12}}
            onClick={() => router.push('/giris')}>
            Giriş Sayfasına Git →
          </button>
          <p style={{fontSize:12,color:'var(--text-3)',textAlign:'center'}}>
            E-postanızı doğruladıktan sonra giriş yapabilirsiniz.
          </p>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Head><title>Kayıt Ol — AlmakIstiyor.com</title></Head>
      <div className={styles.wrap}>
        <div className={styles.boxFull}>
          <div className={styles.boxHeader}>
            <Logo />
          </div>

          <div className={styles.boxBody}>
            <h2 className={styles.stepTitle}>Hesap oluşturun</h2>
            <div style={{display:'flex',alignItems:'center',gap:8,background:'#F0FBF8',border:'1px solid #B2DDD7',borderRadius:8,padding:'8px 12px',marginBottom:16,fontSize:12,color:'#085549',lineHeight:1.4}}>
              <span style={{fontSize:15,flexShrink:0}}>🔒</span>
              <span>Bilgileriniz güvenle saklanır, paylaşılmaz. <strong style={{color:SARI}}>Sarı alanlar zorunludur.</strong></span>
            </div>

            <div className={styles.kompaktGrid}>
              <div className={styles.fg}>
                <ZLabel>Ad</ZLabel>
                <input className={`form-input ${styles.kompaktInput} ${hatalar.ad?styles.inputHata:''}`}
                  style={zorunluStil('ad', adGecerliMi(ad))}
                  placeholder="Adınız" value={ad} onChange={e => { const v = adFormatla(e.target.value); setAd(v); canliKontrolEt({ad: v}) }} />
                {hatalar.ad && <span className={styles.hata}>{hatalar.ad}</span>}
              </div>
              <div className={styles.fg}>
                <ZLabel>Soyad</ZLabel>
                <input className={`form-input ${styles.kompaktInput} ${hatalar.soyad?styles.inputHata:''}`}
                  style={zorunluStil('soyad', adGecerliMi(soyad))}
                  placeholder="Soyadınız" value={soyad} onChange={e => { const v = adFormatla(e.target.value); setSoyad(v); canliKontrolEt({soyad: v}) }} />
                {hatalar.soyad && <span className={styles.hata}>{hatalar.soyad}</span>}
                {(ad.trim() || soyad.trim()) && <span style={{fontSize:11,color:'var(--teal-dark)',fontWeight:600,display:'block',marginTop:4}}>Profilde böyle görünecek: <strong>{(ad.trim()||'Adınız')} {soyad.trim() ? soyad.trim()[0].toUpperCase()+'.' : ''}</strong></span>}
              </div>
              <div className={styles.fg}>
                <ZLabel>E-posta</ZLabel>
                <input className={`form-input ${styles.kompaktInput} ${hatalar.email?styles.inputHata:''}`}
                  style={zorunluStil('email', emailFormatGecerliMi(email))}
                  type="email" placeholder="ornek@email.com" value={email}
                  onChange={e => { setEmail(e.target.value); canliKontrolEt({email: e.target.value}) }} />
                {hatalar.email && <span className={styles.hata}>{hatalar.email}</span>}
                {!hatalar.email && email.trim() && emailFormatGecerliMi(email) && !emailYayginMi(email) && <span style={{fontSize:11,color:'#dc2626',display:'block',marginTop:3}}>Bu adresi az kullanılan bir sağlayıcıdan giriyorsunuz, doğru yazdığınızdan emin olun</span>}
              </div>
              <div className={styles.fg}>
                <ZLabel not="(başında 0 olmadan)">Telefon</ZLabel>
                <div className={styles.telWrap}>
                  <span className={styles.telPrefiks}>+90</span>
                  <input className={`form-input ${styles.kompaktInput} ${hatalar.telefon?styles.inputHata:''}`}
                    style={{borderRadius:'0 8px 8px 0',borderLeft:'none',...(hatalar.telefon?{}:{borderColor:SARI})}}
                    placeholder="532 111 22 33" value={telefon}
                    onChange={e => setTelefon(formatTel(e.target.value))} maxLength={13} />
                </div>
                {hatalar.telefon && <span className={styles.hata}>{hatalar.telefon}</span>}
              </div>
              <div className={styles.fg}>
                <ZLabel>Şehir</ZLabel>
                <select className={`form-select ${styles.kompaktInput} ${hatalar.sehir?styles.inputHata:''}`}
                  style={zorunluStil('sehir', !!sehir)}
                  value={sehir} onChange={e => { setSehir(e.target.value); setIlce('') }}>
                  <option value="">Şehir seçin</option>
                  {sehirler.map(s => <option key={s.il} value={s.il}>{s.il}</option>)}
                </select>
                {hatalar.sehir && <span className={styles.hata}>{hatalar.sehir}</span>}
              </div>
              <div className={styles.fg}>
                <label className="form-label">İlçe <span style={{fontWeight:400,color:'var(--text-3)',fontSize:11}}>(isteğe bağlı)</span></label>
                <select className={`form-select ${styles.kompaktInput}`} value={ilce}
                  onChange={e => setIlce(e.target.value)} disabled={!sehir}>
                  <option value="">İlçe seçin</option>
                  {ilceler.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className={styles.fg}>
                <ZLabel not="(en az 6 karakter)">Şifre</ZLabel>
                <input className={`form-input ${styles.kompaktInput} ${hatalar.sifre?styles.inputHata:''}`}
                  style={zorunluStil('sifre', sifre.length >= 6)}
                  type="password" placeholder="••••••••" value={sifre}
                  onChange={e => setSifre(e.target.value)} />
                {hatalar.sifre && <span className={styles.hata}>{hatalar.sifre}</span>}
              </div>
              <div className={styles.fg}>
                <ZLabel>Şifre Tekrar</ZLabel>
                <input className={`form-input ${styles.kompaktInput} ${hatalar.sifre2?styles.inputHata:''}`}
                  style={zorunluStil('sifre2', sifre2.length >= 6 && sifre === sifre2)}
                  type="password" placeholder="••••••••" value={sifre2}
                  onChange={e => { const v = e.target.value; setSifre2(v); setHatalar(h => { const y = {...h}; if (v && sifre !== v) y.sifre2 = 'Şifreler eşleşmiyor'; else delete y.sifre2; return y }) }} />
                {hatalar.sifre2 && <span className={styles.hata}>{hatalar.sifre2}</span>}
              </div>
            </div>

            {/* CAPTCHA */}
            <div className={styles.captchaBox} style={{borderColor:SARI}}>
              <span style={{fontSize:13,fontWeight:500,color:'var(--text-2)'}}>🤖 Robot doğrulama <span style={{color:SARI,fontWeight:700}}>*</span></span>
              <span className={styles.captchaSoru}>{captcha.a} + {captcha.b} =</span>
              <input className={`form-input ${hatalar.captcha?styles.inputHata:''}`}
                style={{width:64,textAlign:'center',padding:'8px 4px',...(hatalar.captcha?{}:{borderColor:SARI})}}
                placeholder="?" value={captchaInput}
                onChange={e => setCaptchaInput(e.target.value)} />
              {hatalar.captcha && <span className={styles.hata}>{hatalar.captcha}</span>}
            </div>

            {/* SÖZLEŞMELER */}
            <div className={styles.sozlesmeBox}>
              <label className={styles.checkRow}>
                <input type="checkbox" checked={kvkk} onChange={e => setKvkk(e.target.checked)} />
                <span><a href="/kvkk" target="_blank">KVKK Aydınlatma Metni</a>'ni okudum, onaylıyorum <span style={{color:SARI,fontWeight:700}}>*</span></span>
              </label>
              <label className={styles.checkRow}>
                <input type="checkbox" checked={sozlesme} onChange={e => setSozlesme(e.target.checked)} />
                <span><a href="/kullanim-sartlari" target="_blank">Kullanım Şartları</a>'nı okudum, kabul ediyorum <span style={{color:SARI,fontWeight:700}}>*</span></span>
              </label>
              {hatalar.sozlesme && <p className={styles.hata}>{hatalar.sozlesme}</p>}
            </div>

            {kayitHata && (
              <div style={{background:'#FEE2E2',color:'#B91C1C',padding:'10px 14px',borderRadius:8,fontSize:13,marginBottom:12}}>
                ⚠️ {kayitHata}
              </div>
            )}

            <div className={styles.navBtns}>
              <button className="btn-primary" style={{flex:1,justifyContent:'center'}}
                onClick={kayitTamamla} disabled={yukleniyor}>
                {yukleniyor ? 'Kaydediliyor...' : 'Kaydı Tamamla →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
