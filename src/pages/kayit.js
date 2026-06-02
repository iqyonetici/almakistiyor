import { useState } from 'react'
import Head from 'next/head'
import { sehirler, getIlceler } from '../data/sehirler'
import styles from './kayit.module.css'

// Basit math captcha
function randomCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1
  const b = Math.floor(Math.random() * 9) + 1
  return { a, b, answer: a + b }
}

// Sahte e-posta doğrulama kodu (gerçekte Nodemailer/Resend ile gönderilir)
function fakeCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

const STEPS_ALICI = ['Hesap Türü', 'Kişisel Bilgiler', 'İletişim Tercihi', 'E-posta Doğrulama']
const STEPS_SATICI = ['Hesap Türü', 'Kişisel Bilgiler', 'Firma Bilgileri', 'E-posta Doğrulama']

export default function Kayit() {
  const [tur, setTur] = useState('') // 'alici' | 'satici'
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)

  // Ortak alanlar
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

  // Alıcı
  const [iletisimTercihi, setIletisimTercihi] = useState('') // 'mesaj' | 'telefon' | 'ikisi'

  // Satıcı
  const [firmaTur, setFirmaTur] = useState('') // 'bireysel' | 'emlak' | 'galeri' | 'diger'
  const [firmaAd, setFirmaAd] = useState('')
  const [vergiNo, setVergiNo] = useState('')
  const [vergiDairesi, setVergiDairesi] = useState('')
  const [firmaAdres, setFirmaAdres] = useState('')
  const [firmaWeb, setFirmaWeb] = useState('')
  const [firmaTelefon, setFirmaTelefon] = useState('')
  const [kvkk, setKvkk] = useState(false)
  const [sozlesme, setSozlesme] = useState(false)

  // Captcha
  const [captcha] = useState(randomCaptcha())
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaHata, setCaptchaHata] = useState(false)

  // E-posta doğrulama
  const [gonderildi, setGonderildi] = useState(false)
  const [dogrulamaKodu] = useState(fakeCode())
  const [girilen, setGirilen] = useState('')
  const [kodHata, setKodHata] = useState('')

  // Form hataları
  const [hatalar, setHatalar] = useState({})

  const steps = tur === 'satici' ? STEPS_SATICI : STEPS_ALICI
  const toplamStep = steps.length

  function validate1() {
    const h = {}
    if (!ad.trim()) h.ad = 'Ad zorunlu'
    if (!soyad.trim()) h.soyad = 'Soyad zorunlu'
    if (!email.includes('@')) h.email = 'Geçerli e-posta girin'
    if (telefon.replace(/\D/g,'').length < 10) h.telefon = 'Geçerli telefon girin'
    if (sifre.length < 6) h.sifre = 'En az 6 karakter'
    if (sifre !== sifre2) h.sifre2 = 'Şifreler eşleşmiyor'
    if (!sehir) h.sehir = 'Şehir seçin'
    setHatalar(h)
    return Object.keys(h).length === 0
  }

  function validate2Alici() {
    if (!iletisimTercihi) { setHatalar({iletisim:'İletişim tercihi seçin'}); return false }
    const captchaOk = parseInt(captchaInput) === captcha.answer
    if (!captchaOk) { setCaptchaHata(true); return false }
    if (!kvkk || !sozlesme) { setHatalar({sozlesme:'Lütfen sözleşmeleri onaylayın'}); return false }
    return true
  }

  function validate2Satici() {
    const h = {}
    if (!firmaTur) h.firmaTur = 'Firma türü seçin'
    if (firmaTur !== 'bireysel' && !firmaAd.trim()) h.firmaAd = 'Firma adı zorunlu'
    if (firmaTur !== 'bireysel' && vergiNo.replace(/\D/g,'').length < 10) h.vergiNo = 'Geçerli vergi no girin'
    setHatalar(h)
    if (Object.keys(h).length > 0) return false
    const captchaOk = parseInt(captchaInput) === captcha.answer
    if (!captchaOk) { setCaptchaHata(true); return false }
    if (!kvkk || !sozlesme) { setHatalar({sozlesme:'Lütfen sözleşmeleri onaylayın'}); return false }
    return true
  }

  function ileri() {
    setHatalar({})
    if (step === 1 && !tur) { setHatalar({tur:'Hesap türü seçin'}); return }
    if (step === 1) { setStep(2); return }
    if (step === 2) {
      if (!validate1()) return
      setStep(3); return
    }
    if (step === 3) {
      const ok = tur === 'alici' ? validate2Alici() : validate2Satici()
      if (!ok) return
      // Kod gönder (demo)
      setGonderildi(true)
      setStep(4); return
    }
  }

  function dogrula() {
    if (girilen === dogrulamaKodu) {
      setDone(true)
    } else {
      setKodHata('Kod hatalı. Tekrar deneyin.')
    }
  }

  function tekrarGonder() {
    setGirilen('')
    setKodHata('')
    alert(`Demo: Doğrulama kodunuz: ${dogrulamaKodu}`)
  }

  const ilceler = getIlceler(sehir)

  if (done) {
    return (
      <>
        <Head><title>Kayıt Başarılı — AlmakIstiyor.com</title></Head>
        <div className={styles.wrap}>
          <div className={styles.box}>
            <div className={styles.successIcon}>🎉</div>
            <h2 className={styles.successTitle}>Hesabınız oluşturuldu!</h2>
            <p className={styles.successSub}>
              {tur === 'alici'
                ? 'Artık talep ilanı verebilir ve satıcılarla iletişime geçebilirsiniz.'
                : 'Satıcı hesabınız aktif. Talep ilanlarına erişmek için giriş yapın.'}
            </p>
            <div className={styles.successInfo}>
              {tur === 'satici' && (
                <p>💡 <strong>3 ücretsiz hakkınız</strong> tanımlandı. Her alıcıya ücretsiz olarak <strong>1 mesaj</strong> gönderebilirsiniz. Daha fazlası için paket satın alın.</p>
              )}
              {tur === 'alici' && (
                <p>🔒 İletişim tercihiniz: <strong>{iletisimTercihi === 'mesaj' ? 'Sadece mesaj' : iletisimTercihi === 'telefon' ? 'Sadece telefon' : 'Mesaj ve telefon'}</strong>. Bunu istediğiniz zaman profilden değiştirebilirsiniz.</p>
              )}
            </div>
            <a href={tur === 'satici' ? '/satici' : '/'} className="btn-primary" style={{display:'flex',justifyContent:'center',padding:13}}>
              {tur === 'satici' ? 'Satıcı Paneline Git →' : 'Ana Sayfaya Git →'}
            </a>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head><title>Kayıt Ol — AlmakIstiyor.com</title></Head>
      <div className={styles.wrap}>
        <div className={styles.box}>

          {/* LOGO */}
          <a href="/" className={styles.logo}>
            <svg width="140" height="34" viewBox="0 0 300 72" fill="none">
              <path d="M20 8 L36 4 L52 8 L52 30 C52 42 36 50 36 50 C36 50 20 42 20 30 Z" fill="#0D7A6B"/>
              <path d="M27 27 L33 33 L46 20" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              <text x="62" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="#0D7A6B">almak</text>
              <text x="163" y="44" fontFamily="Sora,sans-serif" fontWeight="400" fontSize="28" fill="#1A1D23">istiyor</text>
              <text x="277" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="#F5A623">.</text>
            </svg>
          </a>

          {/* PROGRESS */}
          <div className={styles.progress}>
            {(tur ? steps : STEPS_ALICI).map((s, i) => (
              <div key={i} className={styles.progStep}>
                <div className={`${styles.progDot} ${step > i+1 ? styles.progDone : ''} ${step === i+1 ? styles.progActive : ''}`}>
                  {step > i+1 ? '✓' : i+1}
                </div>
                <span className={styles.progLabel}>{s}</span>
              </div>
            ))}
          </div>
          <div className={styles.progBar}>
            <div className={styles.progFill} style={{width:`${((step-1)/(toplamStep-1))*100}%`}} />
          </div>

          {/* STEP 1: HESAP TÜRÜ */}
          {step === 1 && (
            <div>
              <h2 className={styles.stepTitle}>Hesap türünüzü seçin</h2>
              <p className={styles.stepSub}>Almak mı istiyorsunuz, satmak mı?</p>
              <div className={styles.turGrid}>
                <button className={`${styles.turBtn} ${tur === 'alici' ? styles.turSel : ''}`}
                  onClick={() => setTur('alici')}>
                  <span className={styles.turIcon}>🛒</span>
                  <span className={styles.turAd}>Alıcı</span>
                  <span className={styles.turAcik}>Ne aradığınızı yazın,<br/>satıcılar sizi bulsun</span>
                  <span className={styles.turUcret}>Tamamen ücretsiz</span>
                </button>
                <button className={`${styles.turBtn} ${tur === 'satici' ? styles.turSel : ''}`}
                  onClick={() => setTur('satici')}>
                  <span className={styles.turIcon}>🏢</span>
                  <span className={styles.turAd}>Satıcı</span>
                  <span className={styles.turAcik}>Emlakçı veya galericiyseniz<br/>alıcı taleplerine erişin</span>
                  <span className={styles.turUcret2}>3 ücretsiz hak ile başla</span>
                </button>
              </div>
              {hatalar.tur && <p className={styles.hata}>{hatalar.tur}</p>}
              <button className="btn-primary" style={{width:'100%',justifyContent:'center',padding:13,marginTop:20}}
                onClick={ileri} disabled={!tur}>
                Devam et →
              </button>
              <p className={styles.girisLink}>Zaten hesabınız var mı? <a href="/satici">Giriş yapın</a></p>
            </div>
          )}

          {/* STEP 2: KİŞİSEL BİLGİLER */}
          {step === 2 && (
            <div>
              <h2 className={styles.stepTitle}>Kişisel bilgileriniz</h2>
              <p className={styles.stepSub}>Bilgileriniz güvenle saklanır, üçüncü taraflarla paylaşılmaz</p>

              <div className={styles.formGrid2}>
                <div className={styles.fg}>
                  <label className="form-label">Ad *</label>
                  <input className={`form-input ${hatalar.ad ? styles.inputHata : ''}`} placeholder="Adınız"
                    value={ad} onChange={e => setAd(e.target.value)} />
                  {hatalar.ad && <span className={styles.hata}>{hatalar.ad}</span>}
                </div>
                <div className={styles.fg}>
                  <label className="form-label">Soyad *</label>
                  <input className={`form-input ${hatalar.soyad ? styles.inputHata : ''}`} placeholder="Soyadınız"
                    value={soyad} onChange={e => setSoyad(e.target.value)} />
                  {hatalar.soyad && <span className={styles.hata}>{hatalar.soyad}</span>}
                </div>
                <div className={styles.fg}>
                  <label className="form-label">E-posta *</label>
                  <input className={`form-input ${hatalar.email ? styles.inputHata : ''}`} type="email" placeholder="email@adresiniz.com"
                    value={email} onChange={e => setEmail(e.target.value)} />
                  {hatalar.email && <span className={styles.hata}>{hatalar.email}</span>}
                </div>
                <div className={styles.fg}>
                  <label className="form-label">Telefon *</label>
                  <input className={`form-input ${hatalar.telefon ? styles.inputHata : ''}`} type="tel" placeholder="0532 000 00 00"
                    value={telefon} onChange={e => setTelefon(e.target.value)} />
                  {hatalar.telefon && <span className={styles.hata}>{hatalar.telefon}</span>}
                </div>
                <div className={styles.fg}>
                  <label className="form-label">Doğum Yılı</label>
                  <input className="form-input" type="number" placeholder="1990" min="1940" max="2006"
                    value={dogumYili} onChange={e => setDogumYili(e.target.value)} />
                </div>
                <div className={styles.fg}>
                  <label className="form-label">Cinsiyet</label>
                  <select className="form-select" value={cinsiyet} onChange={e => setCinsiyet(e.target.value)}>
                    <option value="">Belirtmek istemiyorum</option>
                    <option value="erkek">Erkek</option>
                    <option value="kadin">Kadın</option>
                  </select>
                </div>
                <div className={styles.fg}>
                  <label className="form-label">Şehir *</label>
                  <select className={`form-select ${hatalar.sehir ? styles.inputHata : ''}`} value={sehir}
                    onChange={e => { setSehir(e.target.value); setIlce('') }}>
                    <option value="">Şehir seçin</option>
                    {sehirler.map(s => <option key={s.il} value={s.il}>{s.il}</option>)}
                  </select>
                  {hatalar.sehir && <span className={styles.hata}>{hatalar.sehir}</span>}
                </div>
                <div className={styles.fg}>
                  <label className="form-label">İlçe</label>
                  <select className="form-select" value={ilce} onChange={e => setIlce(e.target.value)} disabled={!sehir}>
                    <option value="">İlçe seçin</option>
                    {ilceler.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className={styles.fg}>
                  <label className="form-label">Şifre * <span style={{fontWeight:400,color:'var(--text-3)'}}>(en az 6 karakter)</span></label>
                  <input className={`form-input ${hatalar.sifre ? styles.inputHata : ''}`} type="password" placeholder="••••••••"
                    value={sifre} onChange={e => setSifre(e.target.value)} />
                  {hatalar.sifre && <span className={styles.hata}>{hatalar.sifre}</span>}
                </div>
                <div className={styles.fg}>
                  <label className="form-label">Şifre Tekrar *</label>
                  <input className={`form-input ${hatalar.sifre2 ? styles.inputHata : ''}`} type="password" placeholder="••••••••"
                    value={sifre2} onChange={e => setSifre2(e.target.value)} />
                  {hatalar.sifre2 && <span className={styles.hata}>{hatalar.sifre2}</span>}
                </div>
              </div>

              <div className={styles.navBtns}>
                <button className="btn-ghost" onClick={() => setStep(1)}>← Geri</button>
                <button className="btn-primary" style={{flex:1,justifyContent:'center'}} onClick={ileri}>Devam et →</button>
              </div>
            </div>
          )}

          {/* STEP 3 ALICI: İLETİŞİM TERCİHİ */}
          {step === 3 && tur === 'alici' && (
            <div>
              <h2 className={styles.stepTitle}>İletişim tercihiniz</h2>
              <p className={styles.stepSub}>Satıcılar size nasıl ulaşabilsin?</p>

              <div className={styles.iletisimGrid}>
                {[
                  { v:'mesaj', icon:'💬', ad:'Sadece Mesaj', acik:'Satıcılar yalnızca platform üzerinden mesaj gönderebilir. Telefon numaranız gizli kalır.' },
                  { v:'telefon', icon:'📞', ad:'Sadece Telefon', acik:'Telefon numaranız görünür, satıcılar sizi arayabilir. Mesaj kapalı.' },
                  { v:'ikisi', icon:'✉️📞', ad:'Mesaj ve Telefon', acik:'Hem mesaj hem de telefon ile ulaşabilirler. En fazla iletişim seçeneği.' },
                ].map(o => (
                  <button key={o.v}
                    className={`${styles.iletisimBtn} ${iletisimTercihi === o.v ? styles.iletisimSel : ''}`}
                    onClick={() => setIletisimTercihi(o.v)}>
                    <span className={styles.iletisimIcon}>{o.icon}</span>
                    <span className={styles.iletisimAd}>{o.ad}</span>
                    <span className={styles.iletisimAcik}>{o.acik}</span>
                  </button>
                ))}
              </div>
              {hatalar.iletisim && <p className={styles.hata}>{hatalar.iletisim}</p>}

              {/* CAPTCHA */}
              <div className={styles.captchaBox}>
                <div className={styles.captchaBaslik}>🤖 Robot doğrulaması</div>
                <div className={styles.captchaIcerik}>
                  <span className={styles.captchaSoru}>{captcha.a} + {captcha.b} = ?</span>
                  <input className={`form-input ${captchaHata ? styles.inputHata : ''}`}
                    style={{width:80,textAlign:'center'}} placeholder="?"
                    value={captchaInput} onChange={e => { setCaptchaInput(e.target.value); setCaptchaHata(false) }} />
                </div>
                {captchaHata && <p className={styles.hata}>Yanlış cevap, tekrar deneyin.</p>}
              </div>

              {/* SÖZLEŞMELER */}
              <div className={styles.sozlesmeBox}>
                <label className={styles.checkRow}>
                  <input type="checkbox" checked={kvkk} onChange={e => setKvkk(e.target.checked)} />
                  <span><a href="/kvkk" target="_blank">KVKK Aydınlatma Metni</a>'ni okudum ve onaylıyorum *</span>
                </label>
                <label className={styles.checkRow}>
                  <input type="checkbox" checked={sozlesme} onChange={e => setSozlesme(e.target.checked)} />
                  <span><a href="/kullanim-sartlari" target="_blank">Kullanım Şartları</a>'nı okudum ve kabul ediyorum *</span>
                </label>
                {hatalar.sozlesme && <p className={styles.hata}>{hatalar.sozlesme}</p>}
              </div>

              <div className={styles.navBtns}>
                <button className="btn-ghost" onClick={() => setStep(2)}>← Geri</button>
                <button className="btn-primary" style={{flex:1,justifyContent:'center'}} onClick={ileri}>
                  Doğrulama Kodu Gönder →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 SATICI: FİRMA BİLGİLERİ */}
          {step === 3 && tur === 'satici' && (
            <div>
              <h2 className={styles.stepTitle}>Firma bilgileriniz</h2>
              <p className={styles.stepSub}>Profesyonel satıcı hesabı için firma bilgilerinizi girin</p>

              <div className={styles.fg} style={{marginBottom:16}}>
                <label className="form-label">Firma Türü *</label>
                <div className={styles.firmaTurGrid}>
                  {[
                    {v:'bireysel', icon:'👤', l:'Bireysel'},
                    {v:'emlak', icon:'🏠', l:'Emlak Ofisi'},
                    {v:'galeri', icon:'🚗', l:'Oto Galerisi'},
                    {v:'diger', icon:'🏢', l:'Diğer'},
                  ].map(f => (
                    <button key={f.v}
                      className={`${styles.firmaTurBtn} ${firmaTur === f.v ? styles.firmaTurSel : ''}`}
                      onClick={() => setFirmaTur(f.v)}>
                      <span>{f.icon}</span> {f.l}
                    </button>
                  ))}
                </div>
                {hatalar.firmaTur && <p className={styles.hata}>{hatalar.firmaTur}</p>}
              </div>

              {firmaTur && firmaTur !== 'bireysel' && (
                <div className={styles.formGrid2}>
                  <div className={styles.fg}>
                    <label className="form-label">Firma / Ofis Adı *</label>
                    <input className={`form-input ${hatalar.firmaAd ? styles.inputHata : ''}`} placeholder="Firma adınız"
                      value={firmaAd} onChange={e => setFirmaAd(e.target.value)} />
                    {hatalar.firmaAd && <span className={styles.hata}>{hatalar.firmaAd}</span>}
                  </div>
                  <div className={styles.fg}>
                    <label className="form-label">Firma Telefonu</label>
                    <input className="form-input" placeholder="0212 000 00 00"
                      value={firmaTelefon} onChange={e => setFirmaTelefon(e.target.value)} />
                  </div>
                  <div className={styles.fg}>
                    <label className="form-label">Vergi Numarası *</label>
                    <input className={`form-input ${hatalar.vergiNo ? styles.inputHata : ''}`} placeholder="1234567890"
                      value={vergiNo} onChange={e => setVergiNo(e.target.value)} />
                    {hatalar.vergiNo && <span className={styles.hata}>{hatalar.vergiNo}</span>}
                  </div>
                  <div className={styles.fg}>
                    <label className="form-label">Vergi Dairesi</label>
                    <input className="form-input" placeholder="Vergi dairesi adı"
                      value={vergiDairesi} onChange={e => setVergiDairesi(e.target.value)} />
                  </div>
                  <div className={styles.fg} style={{gridColumn:'1/-1'}}>
                    <label className="form-label">Firma Adresi</label>
                    <input className="form-input" placeholder="Mahalle, cadde, bina no, ilçe, şehir"
                      value={firmaAdres} onChange={e => setFirmaAdres(e.target.value)} />
                  </div>
                  <div className={styles.fg} style={{gridColumn:'1/-1'}}>
                    <label className="form-label">Web Sitesi</label>
                    <input className="form-input" placeholder="www.firmaniz.com (isteğe bağlı)"
                      value={firmaWeb} onChange={e => setFirmaWeb(e.target.value)} />
                  </div>
                </div>
              )}

              {/* ÜCRET UYARISI */}
              <div className={styles.uyariBox}>
                <span className={styles.uyariIcon}>💡</span>
                <div>
                  <strong>Ücretsiz mesaj hakkı:</strong> Her alıcıya ücret ödemeden <strong>1 mesaj</strong> gönderebilirsiniz. Telefon numarasını görmek ve daha fazla mesaj göndermek için paket satın almanız gerekir.
                </div>
              </div>

              {/* CAPTCHA */}
              <div className={styles.captchaBox}>
                <div className={styles.captchaBaslik}>🤖 Robot doğrulaması</div>
                <div className={styles.captchaIcerik}>
                  <span className={styles.captchaSoru}>{captcha.a} + {captcha.b} = ?</span>
                  <input className={`form-input ${captchaHata ? styles.inputHata : ''}`}
                    style={{width:80,textAlign:'center'}} placeholder="?"
                    value={captchaInput} onChange={e => { setCaptchaInput(e.target.value); setCaptchaHata(false) }} />
                </div>
                {captchaHata && <p className={styles.hata}>Yanlış cevap, tekrar deneyin.</p>}
              </div>

              {/* SÖZLEŞMELER */}
              <div className={styles.sozlesmeBox}>
                <label className={styles.checkRow}>
                  <input type="checkbox" checked={kvkk} onChange={e => setKvkk(e.target.checked)} />
                  <span><a href="/kvkk" target="_blank">KVKK Aydınlatma Metni</a>'ni okudum ve onaylıyorum *</span>
                </label>
                <label className={styles.checkRow}>
                  <input type="checkbox" checked={sozlesme} onChange={e => setSozlesme(e.target.checked)} />
                  <span><a href="/kullanim-sartlari" target="_blank">Kullanım Şartları</a>'nı okudum ve kabul ediyorum *</span>
                </label>
                {hatalar.sozlesme && <p className={styles.hata}>{hatalar.sozlesme}</p>}
              </div>

              <div className={styles.navBtns}>
                <button className="btn-ghost" onClick={() => setStep(2)}>← Geri</button>
                <button className="btn-primary" style={{flex:1,justifyContent:'center'}} onClick={ileri}>
                  Doğrulama Kodu Gönder →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: E-POSTA DOĞRULAMA */}
          {step === 4 && (
            <div className={styles.dogrulamaWrap}>
              <div className={styles.dogrulamaIcon}>📧</div>
              <h2 className={styles.stepTitle}>E-postanızı doğrulayın</h2>
              <p className={styles.stepSub}>
                <strong>{email}</strong> adresine 6 haneli doğrulama kodu gönderdik.
              </p>

              {/* DEMO UYARISI */}
              <div className={styles.demoBox}>
                <strong>🔧 Demo modu:</strong> Gerçek e-posta gönderimi için Resend veya Nodemailer entegrasyonu gerekir.<br/>
                Şu an için kod: <strong className={styles.demoKod}>{dogrulamaKodu}</strong>
              </div>

              <div className={styles.kodInputWrap}>
                <label className="form-label" style={{textAlign:'center'}}>Doğrulama Kodu</label>
                <input className={`form-input ${kodHata ? styles.inputHata : ''}`}
                  style={{textAlign:'center',fontSize:24,letterSpacing:8,fontFamily:'Sora,sans-serif',fontWeight:700}}
                  placeholder="000000" maxLength={6}
                  value={girilen} onChange={e => { setGirilen(e.target.value); setKodHata('') }} />
                {kodHata && <p className={styles.hata} style={{textAlign:'center'}}>{kodHata}</p>}
              </div>

              <button className="btn-primary" style={{width:'100%',justifyContent:'center',padding:13,marginBottom:12}}
                onClick={dogrula} disabled={girilen.length !== 6}>
                Hesabı Onayla ✓
              </button>

              <button className={styles.tekrarBtn} onClick={tekrarGonder}>
                Kodu tekrar gönder
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
