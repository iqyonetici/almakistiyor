import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import styles from './giris.module.css'

function randomCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1
  const b = Math.floor(Math.random() * 9) + 1
  return { a, b, answer: a + b }
}

// Demo kullanıcılar — Supabase Auth kurulmadan önce
const DEMO_USERS = [
  { email: 'alici1@demo.com', sifre: 'Alici123!', ad: 'Mehmet', soyad: 'Arslan', telefon: '5321112233', sehir: 'İstanbul', tur: 'alici' },
  { email: 'alici2@demo.com', sifre: 'Alici123!', ad: 'Zeynep', soyad: 'Koçak', telefon: '5413334455', sehir: 'Ankara', tur: 'alici' },
  { email: 'satici@demo.com', sifre: 'Satici123!', ad: 'Emre', soyad: 'Yıldız', telefon: '5255566677', sehir: 'İstanbul', firma: 'Yıldız Emlak', paket: 'Pro', tur: 'satici' },
  { email: 'galeri@demo.com', sifre: 'Galeri123!', ad: 'Burak', soyad: 'Demir', telefon: '5168889900', sehir: 'İstanbul', firma: 'Demir Oto Galerisi', paket: 'Starter', tur: 'satici' },
]

export default function Giris() {
  const { girisYap, demoGiris } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [captcha, setCaptcha] = useState(randomCaptcha())
  const [captchaInput, setCaptchaInput] = useState('')
  const [hata, setHata] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setHata('')
    if (parseInt(captchaInput) !== captcha.answer) {
      setHata('Robot doğrulaması hatalı. Lütfen yeni soruyu cevaplayın.')
      setCaptcha(randomCaptcha())
      setCaptchaInput('')
      return
    }
    setYukleniyor(true)
    const emailTemiz = email.trim().toLowerCase()

    // Önce Supabase Auth dene
    const { error } = await girisYap(emailTemiz, sifre.trim())
    if (!error) {
      router.push('/')
      return
    }

    // @iq.com kullanıcıları — Supabase kullanicilar tablosundan kontrol
    if (emailTemiz.endsWith('@iq.com') && sifre.trim() === '12344321') {
      const { supabase } = await import('../lib/supabase')
      if (supabase) {
        const { data: kullanici } = await supabase
          .from('kullanicilar')
          .select('*')
          .eq('email', emailTemiz)
          .single()
        if (kullanici) {
          demoGiris({ ...kullanici, sifre: '12344321' })
          router.push('/')
          return
        }
      }
    }

    // Sabit demo kullanıcıları
    const demo = DEMO_USERS.find(u => u.email === emailTemiz && u.sifre === sifre.trim())
    if (demo) {
      demoGiris(demo)
      router.push('/')
      return
    }

    setHata('E-posta veya şifre hatalı.')
    setYukleniyor(false)
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
              <a href="#" className={styles.sifreSifirla}>Şifremi unuttum</a>
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
          <p className={styles.altLink}>Hesabınız yok mu? <a href="/kayit">Ücretsiz kayıt olun</a></p>
          <p className={styles.altLink} style={{marginTop:6}}>
            Profesyonel erişim? <a href="/pro">Paketlere bakın →</a>
          </p>
        </div>
      </div>
    </>
  )
}
