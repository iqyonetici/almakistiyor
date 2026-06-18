import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { sehirler, getIlceler } from '../data/sehirler'
import styles from './kayit.module.css'

const SARI = '#F5A623'

// ─── Kabul edilen e-posta domainleri ───────────────────────────────────────
const GECERLI_DOMAINLER = [
  'gmail.com','googlemail.com',
  'hotmail.com','hotmail.com.tr','outlook.com','outlook.com.tr','live.com','live.com.tr','msn.com','passport.com',
  'yahoo.com','yahoo.com.tr','ymail.com',
  'icloud.com','me.com','mac.com',
  'yandex.com','yandex.ru','yandex.com.tr',
  'protonmail.com','proton.me',
  'zoho.com',
  'aol.com',
  'mail.com','email.com','gmx.com','gmx.net',
  'turk.net','ttnet.com.tr','superonline.com','superonline.net','mynet.com',
  'windowslive.com',
]

// ─── Saçma ad tespiti ──────────────────────────────────────────────────────
// Sadece harflerden oluşan, en az 2 karakter gereken isimler için:
// 1. Çok fazla ünsüz arka arkaya (≥4) = saçma
// 2. Aynı harf üst üste (≥3) = saçma
// 3. Çok kısa tekrar eden blok (örn. abab, xyzxyz) = saçma
function sacmaAdMi(deger) {
  const d = deger.trim().toLowerCase()
  if (d.length < 2) return false
  // Sadece harflerden oluşmuyor (rakam vs içeriyorsa zaten başka hata alır)
  if (!/^[a-zçğıöşüâîû\s'-]+$/i.test(d)) return false

  const unsuzDizi = /[bcdfghjklmnpqrstvwxyzçğşz]{4,}/i
  if (unsuzDizi.test(d.replace(/\s/g,''))) return true

  // Aynı harf 3 kez üst üste
  if (/(.)(\1){2}/i.test(d)) return true

  // Kısa tekrar eden blok: minimum 2 karakterlik blok en az 2 kez art arda
  const tekrarBlok = /^(.{2,4})\1+$/i
  if (tekrarBlok.test(d.replace(/\s/g,''))) return true

  // Rastgele harf görünümü: sesli/ünsüz oranı çok bozuk
  const sesliSayisi = (d.match(/[aeıioöuüâîû]/gi) || []).length
  const harfSayisi = (d.match(/[a-zçğıöşü]/gi) || []).length
  if (harfSayisi >= 4 && sesliSayisi / harfSayisi < 0.1) return true

  return false
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
  const { kayitOl, girisYap } = useAuth()
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

  // ─── Uyarı modalı state'leri ────────────────────────────────────────────
  const [uyariModal, setUyariModal] = useState(null) // { mesaj, onDevam }
  const [israrKayitDevam, setIsrarKayitDevam] = useState(false)

  const ilceler = getIlceler(sehir)

  // Zorunlu alan stili — hata yoksa sarı çerçeve
  const zorunluStil = (alan) => hatalar[alan] ? undefined : { borderColor: SARI }

  // ─── Supabase hata mesajlarını Türkçeye çevir ───────────────────────────
  function hataZevir(mesaj) {
    if (!mesaj) return 'Bir hata oluştu, lütfen tekrar deneyin.'
    const m = mesaj.toLowerCase()

    if (m.includes('rate limit') || m.includes('over_email_send_rate_limit') || m.includes('email rate limit'))
      return '⏳ Çok fazla deneme yapıldı. Lütfen birkaç dakika bekleyip tekrar deneyin. (E-posta gönderim limiti aşıldı)'

    if (m.includes('already registered') || m.includes('user already exists') || m.includes('email address is already'))
      return '📧 Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin ya da "Şifremi Unuttum" seçeneğini kullanın.'

    if (m.includes('invalid email') || m.includes('unable to validate email'))
      return '📧 Geçersiz e-posta adresi. Lütfen doğru bir adres girin.'

    if (m.includes('password should be') || m.includes('weak password') || m.includes('password is too short'))
      return '🔒 Şifreniz çok zayıf. En az 6 karakter, harf ve rakam içermelidir.'

    if (m.includes('signup is disabled') || m.includes('signups not allowed'))
      return '🚫 Şu an yeni kayıtlar kapalı. Lütfen daha sonra tekrar deneyin.'

    if (m.includes('network') || m.includes('failed to fetch') || m.includes('connection'))
      return '🌐 İnternet bağlantınızı kontrol edip tekrar deneyin.'

    if (m.includes('timeout'))
      return '⏱️ Sunucu yanıt vermedi. Lütfen birkaç saniye bekleyip tekrar deneyin.'

    // Bilinmeyen hata — ham mesajı gösterme, genel mesaj ver
    return 'Kayıt sırasında bir sorun oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.'
  }

  // ─── E-posta domain kontrol ────────────────────────────────────────────
  function emailDomainGecerliMi(eposta) {
    const parca = eposta.toLowerCase().split('@')
    if (parca.length !== 2) return false
    const domain = parca[1].trim()
    return GECERLI_DOMAINLER.includes(domain)
  }

  function validate() {
    const h = {}
    if (!ad.trim()) h.ad = 'Zorunlu'
    if (!soyad.trim()) h.soyad = 'Zorunlu'
    if (!email.includes('@')) h.email = 'Geçerli e-posta girin'
    if (telefon.replace(/\D/g,'').length < 10) h.telefon = 'En az 10 rakam'
    if (sifre.length < 6) h.sifre = 'En az 6 karakter'
    if (sifre !== sifre2) h.sifre2 = 'Şifreler eşleşmiyor'
    if (!sehir) h.sehir = 'Şehir seçin'
    if (parseInt(captchaInput) !== captcha.answer) h.captcha = 'Yanlış cevap'
    if (!kvkk || !sozlesme) h.sozlesme = 'Sözleşmeleri onaylayın'
    setHatalar(h)
    return Object.keys(h).length === 0
  }

  // ─── Uyarı kontrolü (israr yoksa modal göster) ─────────────────────────
  function uyariKontrol() {
    if (israrKayitDevam) return null // Kullanıcı zaten ısrar etti

    const uyarilar = []

    if (sacmaAdMi(ad)) uyarilar.push('Ad alanı gerçek bir isim gibi görünmüyor (örn: "Ahmet").')
    if (sacmaAdMi(soyad)) uyarilar.push('Soyad alanı gerçek bir soyad gibi görünmüyor (örn: "Yılmaz").')

    if (email.includes('@') && !emailDomainGecerliMi(email)) {
      const domain = email.split('@')[1]
      uyarilar.push(`"@${domain}" yaygın bir e-posta sağlayıcısı değil. Lütfen @gmail.com, @hotmail.com gibi geçerli bir adres kullandığınızdan emin olun.`)
    }

    if (uyarilar.length > 0) {
      return uyarilar
    }
    return null
  }

  async function kayitTamamla() {
    if (!validate()) return

    // Uyarı kontrolü — israr yoksa modal göster
    const uyarilar = uyariKontrol()
    if (uyarilar) {
      setUyariModal({
        mesajlar: uyarilar,
        onDevam: () => {
          setIsrarKayitDevam(true)
          setUyariModal(null)
          // Direkt devam et (israr state'i set edildi)
          setTimeout(() => devamEt(), 0)
        },
        onIptal: () => setUyariModal(null),
      })
      return
    }

    await devamEt()
  }

  async function devamEt() {
    setYukleniyor(true)
    setKayitHata('')

    const { error, data } = await kayitOl({
      email, sifre, ad, soyad,
      telefon: telefon.replace(/\D/g,''),
      sehir, ilce,
    })

    setYukleniyor(false)
    if (error) {
      setKayitHata(hataZevir(error))
      return
    }

    // Hoş geldin maili (hata olsa kaydı engellemez)
    fetch('/api/hosgeldin-mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ad }),
    }).catch(() => {})

    // ─── Otomatik giriş ─────────────────────────────────────────
    // 1. signUp zaten session döndürdüyse (email onayı kapalı) → direkt yönlendir
    if (data?.session) {
      router.push('/')
      return
    }

    // 2. Session yoksa signIn dene (başarılı olursa email onayı kapalı ama session dönmedi)
    const { error: girisHata } = await girisYap(email, sifre)
    if (!girisHata) {
      router.push('/')
      return
    }

    // 3. Her ikisi de başarısız → email onayı gerekiyor, doğrulama ekranı göster
    setBasarili(true)
  }

  const Logo = () => (
    <a href="/" className={styles.logo}>
      <svg width="130" height="32" viewBox="0 0 300 72" fill="none">
        <path d="M20 8 L36 4 L52 8 L52 30 C52 42 36 50 36 50 C36 50 20 42 20 30 Z" fill="#0D7A6B"/>
        <path d="M27 27 L33 33 L46 20" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="62" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="#0D7A6B">almak</text>
        <text x="163" y="44" fontFamily="Sora,sans-serif" fontWeight="400" fontSize="28" fill="#1A1D23">istiyor</text>
        <text x="277" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="#F5A623">.</text>
      </svg>
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

      {/* ─── UYARI MODALI ─────────────────────────────────────── */}
      {uyariModal && (
        <div style={{
          position:'fixed',inset:0,zIndex:9999,
          background:'rgba(0,0,0,0.55)',
          display:'flex',alignItems:'center',justifyContent:'center',
          padding:'20px',
        }}>
          <div style={{
            background:'#fff',borderRadius:16,padding:'28px 28px 24px',
            maxWidth:440,width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,0.25)',
          }}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
              <span style={{fontSize:28}}>⚠️</span>
              <h3 style={{margin:0,fontSize:17,fontWeight:700,color:'#1A1D23'}}>Bilgi Uyarısı</h3>
            </div>
            <p style={{margin:'0 0 12px',fontSize:13.5,color:'#444',lineHeight:1.6}}>
              Girdiğiniz bilgilerde aşağıdaki sorunlar tespit edildi:
            </p>
            <ul style={{margin:'0 0 18px',paddingLeft:20,fontSize:13,color:'#555',lineHeight:1.7}}>
              {uyariModal.mesajlar.map((m,i) => <li key={i}>{m}</li>)}
            </ul>
            <p style={{margin:'0 0 20px',fontSize:13,color:'#666',background:'#FFF7ED',borderRadius:8,padding:'10px 14px',border:'1px solid #FDE68A'}}>
              💡 Gerçek bilgilerinizle kaydolursanız satıcılarla iletişiminiz daha kolay olur.
            </p>
            <div style={{display:'flex',gap:10}}>
              <button
                onClick={uyariModal.onIptal}
                style={{
                  flex:1,padding:'11px 0',borderRadius:9,border:'1.5px solid #ddd',
                  background:'#fff',cursor:'pointer',fontSize:14,fontWeight:600,color:'#444',
                }}
              >
                ← Düzelt
              </button>
              <button
                onClick={uyariModal.onDevam}
                style={{
                  flex:1,padding:'11px 0',borderRadius:9,border:'none',
                  background:'#0D7A6B',cursor:'pointer',fontSize:14,fontWeight:700,color:'#fff',
                }}
              >
                Yine de Devam Et
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.wrap}>
        <div className={styles.boxFull}>
          <div className={styles.boxHeader}>
            <Logo />
          </div>

          <div className={styles.boxBody}>
            <h2 className={styles.stepTitle}>Hesap oluşturun</h2>
            <p className={styles.stepSub2}>
              Bilgileriniz güvenle saklanır, üçüncü taraflarla paylaşılmaz.
              <span style={{color:SARI,fontWeight:600}}> Sarı alanlar zorunludur.</span>
            </p>

            <div className={styles.kompaktGrid}>
              <div className={styles.fg}>
                <ZLabel>Ad</ZLabel>
                <input className={`form-input ${styles.kompaktInput} ${hatalar.ad?styles.inputHata:''}`}
                  style={zorunluStil('ad')}
                  placeholder="Adınız" value={ad} onChange={e => setAd(e.target.value)} />
                {hatalar.ad && <span className={styles.hata}>{hatalar.ad}</span>}
              </div>
              <div className={styles.fg}>
                <ZLabel>Soyad</ZLabel>
                <input className={`form-input ${styles.kompaktInput} ${hatalar.soyad?styles.inputHata:''}`}
                  style={zorunluStil('soyad')}
                  placeholder="Soyadınız" value={soyad} onChange={e => setSoyad(e.target.value)} />
                {hatalar.soyad && <span className={styles.hata}>{hatalar.soyad}</span>}
              </div>
              <div className={styles.fg}>
                <ZLabel>E-posta</ZLabel>
                <input className={`form-input ${styles.kompaktInput} ${hatalar.email?styles.inputHata:''}`}
                  style={zorunluStil('email')}
                  type="email" placeholder="ornek@email.com" value={email}
                  onChange={e => setEmail(e.target.value)} />
                {hatalar.email && <span className={styles.hata}>{hatalar.email}</span>}
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
                  style={zorunluStil('sehir')}
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
                  style={zorunluStil('sifre')}
                  type="password" placeholder="••••••••" value={sifre}
                  onChange={e => setSifre(e.target.value)} />
                {hatalar.sifre && <span className={styles.hata}>{hatalar.sifre}</span>}
              </div>
              <div className={styles.fg}>
                <ZLabel>Şifre Tekrar</ZLabel>
                <input className={`form-input ${styles.kompaktInput} ${hatalar.sifre2?styles.inputHata:''}`}
                  style={zorunluStil('sifre2')}
                  type="password" placeholder="••••••••" value={sifre2}
                  onChange={e => setSifre2(e.target.value)} />
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
