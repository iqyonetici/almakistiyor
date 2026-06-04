import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { sehirler, getIlceler } from '../data/sehirler'
import styles from './kayit.module.css'

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

export default function Kayit() {
  const { kayitOl } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState(1)
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
  const [dogumYili, setDogumYili] = useState('')
  const [cinsiyet, setCinsiyet] = useState('')
  const [iletisimTercihi, setIletisimTercihi] = useState('ikisi')
  const [kvkk, setKvkk] = useState(false)
  const [sozlesme, setSozlesme] = useState(false)

  const ilceler = getIlceler(sehir)

  function validate1() {
    const h = {}
    if (!ad.trim()) h.ad = 'Zorunlu'
    if (!soyad.trim()) h.soyad = 'Zorunlu'
    if (!email.includes('@')) h.email = 'Geçerli e-posta girin'
    if (telefon.replace(/\D/g,'').length < 10) h.telefon = 'En az 10 rakam'
    if (sifre.length < 6) h.sifre = 'En az 6 karakter'
    if (sifre !== sifre2) h.sifre2 = 'Şifreler eşleşmiyor'
    if (!sehir) h.sehir = 'Şehir seçin'
    setHatalar(h)
    return Object.keys(h).length === 0
  }

  function validate2() {
    const h = {}
    if (parseInt(captchaInput) !== captcha.answer) h.captcha = 'Yanlış cevap'
    if (!kvkk || !sozlesme) h.sozlesme = 'Sözleşmeleri onaylayın'
    setHatalar(h)
    return Object.keys(h).length === 0
  }

  function ileri() {
    setHatalar({})
    if (step === 1) { if (validate1()) setStep(2) }
  }

  async function kayitTamamla() {
    if (!validate2()) return
    setYukleniyor(true)
    setKayitHata('')

    const { error } = await kayitOl({
      email, sifre, ad, soyad,
      telefon: telefon.replace(/\D/g,''),
      sehir, ilce, iletisimTercihi,
    })

    setYukleniyor(false)
    if (error) {
      setKayitHata(error)
      return
    }
    // Başarılı — Supabase doğrulama maili gönderdi
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
      <div className={styles.wrap}>
        <div className={styles.boxFull}>
          <div className={styles.boxHeader}>
            <Logo />
            <div className={styles.progRow}>
              {['Kişisel Bilgiler','Onay & Doğrulama'].map((s,i) => (
                <div key={i} className={styles.progItem}>
                  <div className={`${styles.progDot} ${step > i+1?styles.progDone:''} ${step===i+1?styles.progActive:''}`}>
                    {step > i+1 ? '✓' : i+1}
                  </div>
                  <span className={styles.progLabel}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.boxBody}>
            {/* ADIM 1 — KİŞİSEL BİLGİLER */}
            {step === 1 && (
              <div>
                <h2 className={styles.stepTitle}>Hesap oluşturun</h2>
                <p className={styles.stepSub2}>Bilgileriniz güvenle saklanır, üçüncü taraflarla paylaşılmaz</p>
                <div className={styles.kompaktGrid}>
                  <div className={styles.fg}>
                    <label className="form-label">Ad *</label>
                    <input className={`form-input ${styles.kompaktInput} ${hatalar.ad?styles.inputHata:''}`}
                      placeholder="Adınız" value={ad} onChange={e => setAd(e.target.value)} />
                    {hatalar.ad && <span className={styles.hata}>{hatalar.ad}</span>}
                  </div>
                  <div className={styles.fg}>
                    <label className="form-label">Soyad *</label>
                    <input className={`form-input ${styles.kompaktInput} ${hatalar.soyad?styles.inputHata:''}`}
                      placeholder="Soyadınız" value={soyad} onChange={e => setSoyad(e.target.value)} />
                    {hatalar.soyad && <span className={styles.hata}>{hatalar.soyad}</span>}
                  </div>
                  <div className={styles.fg}>
                    <label className="form-label">E-posta *</label>
                    <input className={`form-input ${styles.kompaktInput} ${hatalar.email?styles.inputHata:''}`}
                      type="email" placeholder="ornek@email.com" value={email}
                      onChange={e => setEmail(e.target.value)} />
                    {hatalar.email && <span className={styles.hata}>{hatalar.email}</span>}
                  </div>
                  <div className={styles.fg}>
                    <label className="form-label">Telefon * <span style={{fontWeight:400,color:'var(--text-3)',fontSize:11}}>(başında 0 olmadan)</span></label>
                    <div className={styles.telWrap}>
                      <span className={styles.telPrefiks}>+90</span>
                      <input className={`form-input ${styles.kompaktInput} ${hatalar.telefon?styles.inputHata:''}`}
                        style={{borderRadius:'0 8px 8px 0',borderLeft:'none'}}
                        placeholder="532 111 22 33" value={telefon}
                        onChange={e => setTelefon(formatTel(e.target.value))} maxLength={13} />
                    </div>
                    {hatalar.telefon && <span className={styles.hata}>{hatalar.telefon}</span>}
                  </div>
                  <div className={styles.fg}>
                    <label className="form-label">Şehir *</label>
                    <select className={`form-select ${styles.kompaktInput} ${hatalar.sehir?styles.inputHata:''}`}
                      value={sehir} onChange={e => { setSehir(e.target.value); setIlce('') }}>
                      <option value="">Şehir seçin</option>
                      {sehirler.map(s => <option key={s.il} value={s.il}>{s.il}</option>)}
                    </select>
                    {hatalar.sehir && <span className={styles.hata}>{hatalar.sehir}</span>}
                  </div>
                  <div className={styles.fg}>
                    <label className="form-label">İlçe</label>
                    <select className={`form-select ${styles.kompaktInput}`} value={ilce}
                      onChange={e => setIlce(e.target.value)} disabled={!sehir}>
                      <option value="">İlçe seçin</option>
                      {ilceler.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className={styles.fg}>
                    <label className="form-label">Şifre * <span style={{fontWeight:400,color:'var(--text-3)',fontSize:11}}>(en az 6 karakter)</span></label>
                    <input className={`form-input ${styles.kompaktInput} ${hatalar.sifre?styles.inputHata:''}`}
                      type="password" placeholder="••••••••" value={sifre}
                      onChange={e => setSifre(e.target.value)} />
                    {hatalar.sifre && <span className={styles.hata}>{hatalar.sifre}</span>}
                  </div>
                  <div className={styles.fg}>
                    <label className="form-label">Şifre Tekrar *</label>
                    <input className={`form-input ${styles.kompaktInput} ${hatalar.sifre2?styles.inputHata:''}`}
                      type="password" placeholder="••••••••" value={sifre2}
                      onChange={e => setSifre2(e.target.value)} />
                    {hatalar.sifre2 && <span className={styles.hata}>{hatalar.sifre2}</span>}
                  </div>
                  <div className={styles.fg}>
                    <label className="form-label">Doğum Yılı <span style={{fontWeight:400,color:'var(--text-3)',fontSize:11}}>(isteğe bağlı)</span></label>
                    <input className={`form-input ${styles.kompaktInput}`} type="number"
                      placeholder="1990" min="1940" max="2006"
                      value={dogumYili} onChange={e => setDogumYili(e.target.value)} />
                  </div>
                  <div className={styles.fg}>
                    <label className="form-label">Cinsiyet <span style={{fontWeight:400,color:'var(--text-3)',fontSize:11}}>(isteğe bağlı)</span></label>
                    <select className={`form-select ${styles.kompaktInput}`} value={cinsiyet}
                      onChange={e => setCinsiyet(e.target.value)}>
                      <option value="">Belirtmek istemiyorum</option>
                      <option value="erkek">Erkek</option>
                      <option value="kadin">Kadın</option>
                    </select>
                  </div>
                </div>
                <div className={styles.navBtns}>
                  <button className="btn-primary" style={{flex:1,justifyContent:'center'}} onClick={ileri}>Devam et →</button>
                </div>
              </div>
            )}

            {/* ADIM 2 — İLETİŞİM TERCİHİ + CAPTCHA + ONAY */}
            {step === 2 && (
              <div>
                <h2 className={styles.stepTitle}>Tercihler ve onay</h2>

                <div className={styles.fgFull}>
                  <label className="form-label">Satıcılar size nasıl ulaşsın?</label>
                  <div className={styles.iletisimGrid}>
                    {[
                      {v:'mesaj',icon:'💬',l:'Sadece Mesaj',a:'Telefon gizli kalır'},
                      {v:'telefon',icon:'📞',l:'Sadece Telefon',a:'Tel görünür, mesaj kapalı'},
                      {v:'ikisi',icon:'✉️',l:'Mesaj ve Telefon',a:'Her ikisi açık'},
                    ].map(o => (
                      <button key={o.v}
                        className={`${styles.iletisimBtn} ${iletisimTercihi===o.v?styles.iletisimSel:''}`}
                        onClick={() => setIletisimTercihi(o.v)}>
                        <span style={{fontSize:18}}>{o.icon}</span>
                        <span style={{fontWeight:500,fontSize:13}}>{o.l}</span>
                        <span style={{fontSize:11,color:'var(--text-3)'}}>{o.a}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CAPTCHA */}
                <div className={styles.captchaBox}>
                  <span style={{fontSize:13,fontWeight:500,color:'var(--text-2)'}}>🤖 Robot doğrulama:</span>
                  <span className={styles.captchaSoru}>{captcha.a} + {captcha.b} =</span>
                  <input className={`form-input ${hatalar.captcha?styles.inputHata:''}`}
                    style={{width:64,textAlign:'center',padding:'8px 4px'}}
                    placeholder="?" value={captchaInput}
                    onChange={e => setCaptchaInput(e.target.value)} />
                  {hatalar.captcha && <span className={styles.hata}>{hatalar.captcha}</span>}
                </div>

                {/* SÖZLEŞMELER */}
                <div className={styles.sozlesmeBox}>
                  <label className={styles.checkRow}>
                    <input type="checkbox" checked={kvkk} onChange={e => setKvkk(e.target.checked)} />
                    <span><a href="/kvkk" target="_blank">KVKK Aydınlatma Metni</a>'ni okudum, onaylıyorum *</span>
                  </label>
                  <label className={styles.checkRow}>
                    <input type="checkbox" checked={sozlesme} onChange={e => setSozlesme(e.target.checked)} />
                    <span><a href="/kullanim-sartlari" target="_blank">Kullanım Şartları</a>'nı okudum, kabul ediyorum *</span>
                  </label>
                  {hatalar.sozlesme && <p className={styles.hata}>{hatalar.sozlesme}</p>}
                </div>

                {kayitHata && (
                  <div style={{background:'#FEE2E2',color:'#B91C1C',padding:'10px 14px',borderRadius:8,fontSize:13,marginBottom:12}}>
                    ⚠️ {kayitHata}
                  </div>
                )}

                <div className={styles.navBtns}>
                  <button className="btn-ghost" onClick={() => setStep(1)}>← Geri</button>
                  <button className="btn-primary" style={{flex:1,justifyContent:'center'}}
                    onClick={kayitTamamla} disabled={yukleniyor}>
                    {yukleniyor ? 'Kaydediliyor...' : 'Kaydı Tamamla →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
