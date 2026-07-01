import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import styles from './giris.module.css'

export default function SifremiUnuttum() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hata, setHata] = useState('')
  const [gonderildi, setGonderildi] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setHata('')
    const emailTemiz = email.trim().toLowerCase()
    if (!emailTemiz || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTemiz)) {
      setHata('Geçerli bir e-posta adresi girin.')
      return
    }
    setYukleniyor(true)
    const { error } = await supabase.auth.resetPasswordForEmail(emailTemiz, {
      redirectTo: `${window.location.origin}/sifre-sifirla`,
    })
    setYukleniyor(false)
    if (error) {
      setHata('Bir hata oluştu. Lütfen tekrar deneyin.')
      return
    }
    setGonderildi(true)
  }

  if (gonderildi) return (
    <>
      <Head><title>Şifre Sıfırlama — AlmakIstiyor.com</title></Head>
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
          <div style={{fontSize:40,textAlign:'center',margin:'16px 0 8px'}}>📧</div>
          <h2 className={styles.title}>E-postanızı kontrol edin</h2>
          <p className={styles.sub} style={{textAlign:'center',lineHeight:1.6}}>
            <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
            Bağlantıya tıklayarak yeni şifrenizi belirleyin.
          </p>
          <div style={{background:'#F0FBF8',border:'1px solid #B2DDD7',borderRadius:8,padding:'10px 14px',fontSize:12,color:'#085549',marginBottom:20,lineHeight:1.5}}>
            💡 E-posta birkaç dakika içinde gelmezse spam/gereksiz klasörünü kontrol edin.
          </div>
          <button className="btn-primary"
            style={{width:'100%',justifyContent:'center',padding:13}}
            onClick={() => router.push('/giris')}>
            Giriş Sayfasına Dön →
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Head><title>Şifremi Unuttum — AlmakIstiyor.com</title></Head>
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
          <h2 className={styles.title}>Şifremi Unuttum</h2>
          <p className={styles.sub}>E-posta adresinizi girin, sıfırlama bağlantısı gönderelim.</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fg}>
              <label className="form-label">E-posta</label>
              <input
                className="form-input"
                type="email"
                placeholder="email@adresiniz.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            {hata && <div className={styles.hataBox}>{hata}</div>}
            <button
              type="submit"
              className="btn-primary"
              style={{width:'100%',justifyContent:'center',padding:13}}
              disabled={yukleniyor}>
              {yukleniyor ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder →'}
            </button>
          </form>

          <p className={styles.altLink}>
            <a href="/giris">← Giriş sayfasına dön</a>
          </p>
        </div>
      </div>
    </>
  )
}
