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
function fakeCode() { return String(Math.floor(100000 + Math.random() * 900000)) }

// Telefon formatlama — başında sıfır olmadan, boşluklu: 532 111 22 33
function formatTel(val) {
  const digits = val.replace(/\D/g,'').replace(/^0+/,'') // başındaki sıfırları sil
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return digits.slice(0,3) + ' ' + digits.slice(3)
  if (digits.length <= 8) return digits.slice(0,3) + ' ' + digits.slice(3,6) + ' ' + digits.slice(6)
  return digits.slice(0,3) + ' ' + digits.slice(3,6) + ' ' + digits.slice(6,8) + ' ' + digits.slice(8,10)
}

export default function Kayit() {
  const { girisYap } = useAuth()
  const router = useRouter()

  const [tur, setTur] = useState('')
  const [step, setStep] = useState(1)
  const [hatalar, setHatalar] = useState({})
  const [captcha] = useState(randomCaptcha())
  const [captchaInput, setCaptchaInput] = useState('')
  const [kodGonderildi, setKodGonderildi] = useState(false)
  const [dogrulamaKodu] = useState(fakeCode())
  const [girilenKod, setGirilenKod] = useState('')
  const [kodHata, setKodHata] = useState('')

  // Form alanları
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
  const [firmaTur, setFirmaTur] = useState('')
  const [firmaAd, setFirmaAd] = useState('')
  const [vergiNo, setVergiNo] = useState('')
  const [vergiDairesi, setVergiDairesi] = useState('')
  const [firmaAdres, setFirmaAdres] = useState('')
  const [firmaWeb, setFirmaWeb] = useState('')
  const [firmaTelefon, setFirmaTelefon] = useState('')
  const [kvkk, setKvkk] = useState(false)
  const [sozlesme, setSozlesme] = useState(false)

  const ilceler = getIlceler(sehir)
  const toplamStep = tur === 'satici' ? 3 : 3 // her tur için 3 adım + doğrulama

  function validate2() {
    const h = {}
    if (!ad.trim()) h.ad = 'Zorunlu'
    if (!soyad.trim()) h.soyad = 'Zorunlu'
    if (!email.includes('@')) h.email = 'Geçerli e-posta girin'
    const digits = telefon.replace(/\D/g,'')
    if (digits.length < 10) h.telefon = 'En az 10 rakam'
    if (sifre.length < 6) h.sifre = 'En az 6 karakter'
    if (sifre !== sifre2) h.sifre2 = 'Şifreler eşleşmiyor'
    if (!sehir) h.sehir = 'Şehir seçin'
    setHatalar(h)
    return Object.keys(h).length === 0
  }

  function validate3() {
    const h = {}
    if (parseInt(captchaInput) !== captcha.answer) h.captcha = 'Yanlış cevap'
    if (!kvkk || !sozlesme) h.sozlesme = 'Sözleşmeleri onaylayın'
    if (tur === 'satici' && firmaTur !== 'bireysel') {
      if (!firmaAd.trim()) h.firmaAd = 'Firma adı zorunlu'
      if (vergiNo.replace(/\D/g,'').length < 10) h.vergiNo = 'Geçerli vergi no girin'
    }
    setHatalar(h)
    return Object.keys(h).length === 0
  }

  function ileri() {
    setHatalar({})
    if (step === 1) { if (!tur) { setHatalar({tur:'Seçim yapın'}); return } setStep(2); return }
    if (step === 2) { if (!validate2()) return; setStep(3); return }
    if (step === 3) {
      if (!validate3()) return
      setKodGonderildi(true)
      setStep(4)
    }
  }

  function dogrula() {
    if (girilenKod === dogrulamaKodu) {
      // Kullanıcı oluştur ve giriş yaptır
      const yeniUser = {
        ad, soyad, email,
        telefon: telefon.replace(/\D/g,''),
        sehir, ilce, cinsiyet, dogumYili,
        iletisimTercihi,
        tur,
        firma: firmaTur !== 'bireysel' ? firmaAd : null,
        firmaTur,
        vergiNo: firmaTur !== 'bireysel' ? vergiNo : null,
        paket: 'Ücretsiz',
        kalanHak: 3,
      }
      girisYap(yeniUser)
      // Direk ana sayfaya git
      router.push('/')
    } else {
      setKodHata('Kod hatalı. Tekrar deneyin.')
    }
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

  // ADIM 4 — E-posta doğrulama
  if (step === 4) return (
    <>
      <Head><title>E-posta Doğrulama — AlmakIstiyor.com</title></Head>
      <div className={styles.wrap}>
        <div className={styles.boxSm}>
          <Logo />
          <div className={styles.dogrulamaIcon}>📧</div>
          <h2 className={styles.stepTitle}>E-postanızı doğrulayın</h2>
          <p className={styles.stepSub}><strong>{email}</strong> adresine 6 haneli kod gönderdik.</p>
          <div className={styles.demoBox} style={{marginBottom:20}}>
            <strong>🔧 Demo:</strong> Kod: <strong style={{letterSpacing:3,fontSize:16}}>{dogrulamaKodu}</strong>
          </div>
          <label className="form-label" style={{textAlign:'center',display:'block'}}>Doğrulama Kodu</label>
          <input className={`form-input ${kodHata ? styles.inputHata : ''}`}
            style={{textAlign:'center',fontSize:22,letterSpacing:6,fontFamily:'Sora,sans-serif',fontWeight:700,marginBottom:8}}
            placeholder="000000" maxLength={6}
            value={girilenKod} onChange={e => { setGirilenKod(e.target.value); setKodHata('') }} />
          {kodHata && <p className={styles.hata} style={{textAlign:'center',marginBottom:8}}>{kodHata}</p>}
          <button className="btn-primary" style={{width:'100%',justifyContent:'center',padding:13,marginBottom:12}}
            onClick={dogrula} disabled={girilenKod.length !== 6}>
            Hesabı Onayla ve Giriş Yap ✓
          </button>
          <button className={styles.tekrarBtn} onClick={() => alert(`Demo kod: ${dogrulamaKodu}`)}>
            Kodu tekrar gönder
          </button>
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
            {/* Progress bar */}
            <div className={styles.progRow}>
              {['Hesap Türü','Kişisel Bilgiler', tur==='satici'?'Firma & Onay':'Tercih & Onay'].map((s,i) => (
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

            {/* ADIM 1 — TÜR SEÇİMİ */}
            {step === 1 && (
              <div className={styles.turAdim}>
                <h2 className={styles.stepTitle}>Nasıl kullanacaksınız?</h2>
                <div className={styles.turGrid}>
                  <button className={`${styles.turBtn} ${tur==='alici'?styles.turSel:''}`} onClick={() => setTur('alici')}>
                    <span className={styles.turIcon}>🛒</span>
                    <span className={styles.turAd}>Alıcı</span>
                    <span className={styles.turAcik}>Ne aradığınızı yazın, satıcılar sizi bulsun</span>
                    <span className={styles.turUcret}>✓ Tamamen ücretsiz</span>
                  </button>
                  <button className={`${styles.turBtn} ${tur==='satici'?styles.turSel:''}`} onClick={() => setTur('satici')}>
                    <span className={styles.turIcon}>🏢</span>
                    <span className={styles.turAd}>Satıcı / Profesyonel</span>
                    <span className={styles.turAcik}>Emlakçı veya galericiyseniz alıcı taleplerine erişin</span>
                    <span className={styles.turUcret2}>3 ücretsiz hak ile başla</span>
                  </button>
                </div>
                {hatalar.tur && <p className={styles.hata}>{hatalar.tur}</p>}
                <button className="btn-primary" style={{width:'100%',justifyContent:'center',padding:12,marginTop:16}}
                  onClick={ileri} disabled={!tur}>Devam et →</button>
                <p className={styles.girisLink}>Zaten hesabınız var mı? <a href="/giris">Giriş yapın</a></p>
              </div>
            )}

            {/* ADIM 2 — KİŞİSEL BİLGİLER */}
            {step === 2 && (
              <div>
                <h2 className={styles.stepTitle}>Kişisel bilgileriniz</h2>
                <div className={styles.kompaktGrid}>
                  {/* Satır 1: Ad, Soyad */}
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
                  {/* Satır 2: E-posta, Telefon */}
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
                        onChange={e => setTelefon(formatTel(e.target.value))}
                        maxLength={13} />
                    </div>
                    {hatalar.telefon && <span className={styles.hata}>{hatalar.telefon}</span>}
                  </div>
                  {/* Satır 3: Şehir, İlçe */}
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
                  {/* Satır 4: Şifre, Şifre tekrar */}
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
                  {/* İsteğe bağlı */}
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
                  <button className="btn-ghost" onClick={() => setStep(1)}>← Geri</button>
                  <button className="btn-primary" style={{flex:1,justifyContent:'center'}} onClick={ileri}>Devam et →</button>
                </div>
              </div>
            )}

            {/* ADIM 3 — TERCİH / FİRMA + ONAY */}
            {step === 3 && (
              <div>
                <h2 className={styles.stepTitle}>{tur==='satici'?'Firma bilgileri ve onay':'Tercihler ve onay'}</h2>

                {/* ALICI — iletişim tercihi */}
                {tur === 'alici' && (
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
                )}

                {/* SATICI — firma bilgileri */}
                {tur === 'satici' && (
                  <div className={styles.firmaBlok}>
                    <label className="form-label">Firma türü *</label>
                    <div className={styles.firmaTurGrid}>
                      {[{v:'bireysel',i:'👤',l:'Bireysel'},{v:'emlak',i:'🏠',l:'Emlak Ofisi'},{v:'galeri',i:'🚗',l:'Oto Galerisi'},{v:'diger',i:'🏢',l:'Diğer'}].map(f => (
                        <button key={f.v} className={`${styles.firmaTurBtn} ${firmaTur===f.v?styles.firmaTurSel:''}`}
                          onClick={() => setFirmaTur(f.v)}>
                          {f.i} {f.l}
                        </button>
                      ))}
                    </div>
                    {firmaTur && firmaTur !== 'bireysel' && (
                      <div className={styles.kompaktGrid} style={{marginTop:12}}>
                        <div className={styles.fg}>
                          <label className="form-label">Firma Adı *</label>
                          <input className={`form-input ${styles.kompaktInput} ${hatalar.firmaAd?styles.inputHata:''}`}
                            placeholder="Firma adınız" value={firmaAd} onChange={e => setFirmaAd(e.target.value)} />
                          {hatalar.firmaAd && <span className={styles.hata}>{hatalar.firmaAd}</span>}
                        </div>
                        <div className={styles.fg}>
                          <label className="form-label">Firma Telefonu</label>
                          <div className={styles.telWrap}>
                            <span className={styles.telPrefiks}>+90</span>
                            <input className={`form-input ${styles.kompaktInput}`}
                              style={{borderRadius:'0 8px 8px 0',borderLeft:'none'}}
                              placeholder="212 555 66 77" value={firmaTelefon}
                              onChange={e => setFirmaTelefon(formatTel(e.target.value))} maxLength={13} />
                          </div>
                        </div>
                        <div className={styles.fg}>
                          <label className="form-label">Vergi No *</label>
                          <input className={`form-input ${styles.kompaktInput} ${hatalar.vergiNo?styles.inputHata:''}`}
                            placeholder="1234567890" value={vergiNo}
                            onChange={e => setVergiNo(e.target.value)} />
                          {hatalar.vergiNo && <span className={styles.hata}>{hatalar.vergiNo}</span>}
                        </div>
                        <div className={styles.fg}>
                          <label className="form-label">Vergi Dairesi</label>
                          <input className={`form-input ${styles.kompaktInput}`}
                            placeholder="Vergi dairesi" value={vergiDairesi}
                            onChange={e => setVergiDairesi(e.target.value)} />
                        </div>
                        <div className={styles.fgFull}>
                          <label className="form-label">Firma Adresi</label>
                          <input className={`form-input ${styles.kompaktInput}`}
                            placeholder="Mahalle, cadde, bina no, ilçe, şehir"
                            value={firmaAdres} onChange={e => setFirmaAdres(e.target.value)} />
                        </div>
                      </div>
                    )}
                    <div className={styles.uyariBox}>
                      <span>💡</span>
                      <span>Her alıcıya ücretsiz <strong>1 mesaj</strong> gönderebilirsiniz. Telefon ve daha fazla mesaj için paket gereklidir.</span>
                    </div>
                  </div>
                )}

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

                <div className={styles.navBtns}>
                  <button className="btn-ghost" onClick={() => setStep(2)}>← Geri</button>
                  <button className="btn-primary" style={{flex:1,justifyContent:'center'}} onClick={ileri}>
                    Doğrulama Kodu Gönder →
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
