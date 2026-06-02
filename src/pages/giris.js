import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import styles from './giris.module.css'

// Demo kullanıcılar
const DEMO_USERS = [
  // Alıcı hesapları (ücretsiz)
  { email: 'alici1@demo.com', sifre: 'Alici123!', ad: 'Mehmet', soyad: 'Arslan', telefon: '0532 111 22 33', sehir: 'İstanbul', tur: 'alici' },
  { email: 'alici2@demo.com', sifre: 'Alici123!', ad: 'Zeynep', soyad: 'Koçak', telefon: '0541 333 44 55', sehir: 'Ankara', tur: 'alici' },
  // Pro satıcı hesabı
  { email: 'satici@demo.com', sifre: 'Satici123!', ad: 'Emre', soyad: 'Yıldız', telefon: '0212 555 66 77', sehir: 'İstanbul', firma: 'Yıldız Emlak & Danışmanlık', paket: 'Pro', kalanHak: 999, tur: 'satici' },
  // Starter satıcı hesabı
  { email: 'galeri@demo.com', sifre: 'Galeri123!', ad: 'Burak', soyad: 'Demir', telefon: '0216 888 99 00', sehir: 'İstanbul', firma: 'Demir Oto Galerisi', paket: 'Starter', kalanHak: 7, tur: 'satici' },
]

function randomCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1
  const b = Math.floor(Math.random() * 9) + 1
  return { a, b, answer: a + b }
}

export default function Giris() {
  const { girisYap } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [captcha] = useState(randomCaptcha())
  const [captchaInput, setCaptchaInput] = useState('')
  const [hata, setHata] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setHata('')

    if (parseInt(captchaInput) !== captcha.answer) {
      setHata('Robot doğrulaması hatalı. ' + captcha.a + ' + ' + captcha.b + ' = ' + captcha.answer)
      return
    }

    const emailTemiz = email.trim().toLowerCase()
    const sifreTemiz = sifre.trim()

    setYukleniyor(true)
    setTimeout(() => {
      const user = DEMO_USERS.find(u =>
        u.email.toLowerCase() === emailTemiz && u.sifre === sifreTemiz
      )
      if (user) {
        girisYap(user)
        // Satıcı hesabı ise satıcı paneline, alıcı ise kullanıcı paneline
        router.push(user.tur === 'satici' ? '/satici' : '/panel')
      } else {
        setHata('E-posta veya şifre hatalı. Demo: ali@test.com / test123')
        setYukleniyor(false)
      }
    }, 500)
  }

  return (
    <>
      <Head><title>Giriş Yap — AlmakIstiyor.com</title></Head>
      <div className={styles.wrap}>
        <div className={styles.box}>
          <a href="/" className={styles.logo}>
            <svg width="148" height="36" viewBox="0 0 300 72" fill="none">
              <path d="M20 8 L36 4 L52 8 L52 30 C52 42 36 50 36 50 C36 50 20 42 20 30 Z" fill="#0D7A6B"/>
              <path d="M27 27 L33 33 L46 20" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              <text x="62" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="#0D7A6B">almak</text>
              <text x="163" y="44" fontFamily="Sora,sans-serif" fontWeight="400" fontSize="28" fill="#1A1D23">istiyor</text>
              <text x="277" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="#F5A623">.</text>
            </svg>
          </a>

          <h2 className={styles.title}>Hoş geldiniz</h2>
          <p className={styles.sub}>Hesabınıza giriş yapın</p>

          <div className={styles.demoBox}>
            <strong>🔧 Demo hesaplar:</strong><br/><br/>
            <strong>👤 Alıcı hesabı:</strong><br/>
            alici1@demo.com / Alici123!<br/><br/>
            <strong>🏢 Pro Satıcı (Yıldız Emlak):</strong><br/>
            satici@demo.com / Satici123!<br/><br/>
            <strong>🚗 Starter Satıcı (Demir Oto):</strong><br/>
            galeri@demo.com / Galeri123!
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fg}>
              <label className="form-label">E-posta</label>
              <input className="form-input" type="email" placeholder="email@adresiniz.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className={styles.fg}>
              <label className="form-label">Şifre</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={sifre} onChange={e => setSifre(e.target.value)} required />
              <a href="/sifre-sifirla" className={styles.sifreSifirla}>Şifremi unuttum</a>
            </div>

            <div className={styles.captchaBox}>
              <span className={styles.captchaLabel}>🤖 Robot değilim:</span>
              <span className={styles.captchaSoru}>{captcha.a} + {captcha.b} =</span>
              <input className="form-input" style={{width:70,textAlign:'center'}}
                placeholder="?" value={captchaInput}
                onChange={e => setCaptchaInput(e.target.value)} />
            </div>

            {hata && <div className={styles.hataBox}>{hata}</div>}

            <button type="submit" className="btn-primary"
              style={{width:'100%',justifyContent:'center',padding:13}}
              disabled={yukleniyor}>
              {yukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
            </button>
          </form>

          <p className={styles.altLink}>
            Hesabınız yok mu? <a href="/kayit">Ücretsiz kayıt olun</a>
          </p>
          <p className={styles.altLink} style={{marginTop:6}}>
            Profesyonel erişim mi istiyorsunuz? <a href="/pro">Paketlere bakın →</a>
          </p>
        </div>
      </div>
    </>
  )
}
