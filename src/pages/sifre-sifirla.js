import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import styles from './giris.module.css'

const Logo = () => (
  <a href="/" className={styles.logo}>
    <svg width="148" height="36" viewBox="0 0 300 72" fill="none">
      <path d="M20 8 L36 4 L52 8 L52 30 C52 42 36 50 36 50 C36 50 20 42 20 30 Z" fill="#0D7A6B"/>
      <path d="M27 27 L33 33 L46 20" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="62" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="#0D7A6B">almak</text>
      <text x="163" y="44" fontFamily="Sora,sans-serif" fontWeight="400" fontSize="28" fill="#1A1D23">istiyor</text>
      <text x="277" y="44" fontFamily="Sora,sans-serif" fontWeight="700" fontSize="28" fill="#F5A623">.</text>
    </svg>
  </a>
)

export default function SifreSifirla() {
  const router = useRouter()
  const [sifre, setSifre] = useState('')
  const [sifre2, setSifre2] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hata, setHata] = useState('')
  const [basarili, setBasarili] = useState(false)
  const [durum, setDurum] = useState('bekliyor')

  useEffect(() => {
    const hash = window.location.hash

    // Hata varsa yakala
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace('#', ''))
      const errorCode = params.get('error_code')
      setHata(
        errorCode === 'otp_expired'
          ? 'Bu sifre sifirlama baglantisinin suresi dolmus. Lutfen yeni bir baglanti isteyin.'
          : 'Gecersiz veya suresi dolmus baglanti. Lutfen tekrar deneyin.'
      )
      setDurum('hatali')
      return
    }

    // Yontem 1: Mevcut session kontrolu (Supabase bazen onceden session kurar)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setDurum('hazir')
        return
      }

      // Yontem 2: onAuthStateChange ile bekle
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
          setDurum('hazir')
        }
      })

      // Yontem 3: 5 saniye sonra hala bekliyor durumdaysa hata goster
      const timeout = setTimeout(() => {
        setDurum(d => {
          if (d === 'bekliyor') {
            setHata('Baglanti dogrulanamadi. Lutfen yeni bir sifirlama baglantisi isteyin.')
            return 'hatali'
          }
          return d
        })
      }, 5000)

      return () => {
        subscription.unsubscribe()
        clearTimeout(timeout)
      }
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setHata('')
    if (sifre.length < 6) { setHata('Sifre en az 6 karakter olmali.'); return }
    if (sifre !== sifre2) { setHata('Sifreler eslesmiyor.'); return }
    setYukleniyor(true)
    const { error } = await supabase.auth.updateUser({ password: sifre })
    setYukleniyor(false)
    if (error) { setHata('Sifre guncellenemedi. Lutfen tekrar deneyin.'); return }
    setBasarili(true)
    setTimeout(() => router.push('/giris'), 2500)
  }

  if (basarili) return (
    <>
      <Head><title>Sifre Guncellendi — AlmakIstiyor.com</title></Head>
      <div className={styles.wrap}><div className={styles.box}>
        <Logo />
        <div style={{fontSize:40,textAlign:'center',margin:'16px 0 8px'}}>✅</div>
        <h2 className={styles.title}>Şifreniz güncellendi</h2>
        <p className={styles.sub} style={{textAlign:'center'}}>Giriş sayfasına yönlendiriliyorsunuz...</p>
      </div></div>
    </>
  )

  if (durum === 'hatali') return (
    <>
      <Head><title>Gecersiz Baglanti — AlmakIstiyor.com</title></Head>
      <div className={styles.wrap}><div className={styles.box}>
        <Logo />
        <div style={{fontSize:40,textAlign:'center',margin:'16px 0 8px'}}>⚠️</div>
        <h2 className={styles.title}>Bağlantı geçersiz</h2>
        <p className={styles.sub} style={{textAlign:'center',lineHeight:1.6}}>{hata}</p>
        <button className="btn-primary"
          style={{width:'100%',justifyContent:'center',padding:13,marginBottom:12}}
          onClick={() => router.push('/sifremi-unuttum')}>
          Yeni Bağlantı İste →
        </button>
        <p className={styles.altLink} style={{textAlign:'center'}}>
          <a href="/giris">← Giriş sayfasına dön</a>
        </p>
      </div></div>
    </>
  )

  if (durum === 'bekliyor') return (
    <>
      <Head><title>Sifre Sifirlama — AlmakIstiyor.com</title></Head>
      <div className={styles.wrap}><div className={styles.box}>
        <Logo />
        <div style={{fontSize:40,textAlign:'center',margin:'16px 0 8px'}}>⏳</div>
        <h2 className={styles.title}>Bağlantı doğrulanıyor</h2>
        <p className={styles.sub} style={{textAlign:'center'}}>Lütfen bekleyin...</p>
        <p style={{textAlign:'center',fontSize:12,color:'var(--text-3)',marginTop:16}}>
          Bu sayfa açılmadıysa <a href="/sifremi-unuttum">tekrar deneyin →</a>
        </p>
      </div></div>
    </>
  )

  return (
    <>
      <Head><title>Yeni Sifre Belirle — AlmakIstiyor.com</title></Head>
      <div className={styles.wrap}><div className={styles.box}>
        <Logo />
        <h2 className={styles.title}>Yeni Şifre Belirle</h2>
        <p className={styles.sub}>En az 6 karakter olmalı.</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fg}>
            <label className="form-label">Yeni Şifre</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={sifre} onChange={e => setSifre(e.target.value)} required autoFocus />
          </div>
          <div className={styles.fg}>
            <label className="form-label">Yeni Şifre (Tekrar)</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={sifre2} onChange={e => setSifre2(e.target.value)} required />
          </div>
          {hata && <div className={styles.hataBox}>{hata}</div>}
          <button type="submit" className="btn-primary"
            style={{width:'100%',justifyContent:'center',padding:13}}
            disabled={yukleniyor}>
            {yukleniyor ? 'Güncelleniyor...' : 'Şifremi Güncelle →'}
          </button>
        </form>
      </div></div>
    </>
  )
}
