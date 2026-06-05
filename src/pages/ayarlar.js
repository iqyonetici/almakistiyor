import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { sehirler } from '../data/sehirler'
import { profilGetir, profilGuncelle, sifreDegistir } from '../lib/destekDB'
import styles from './ayarlar.module.css'

export default function Ayarlar() {
  const { user, yuklendi } = useAuth()
  const router = useRouter()

  const [yukleniyor, setYukleniyor] = useState(true)
  const [ad, setAd] = useState('')
  const [soyad, setSoyad] = useState('')
  const [telefon, setTelefon] = useState('')
  const [sehir, setSehir] = useState('')
  const [firma, setFirma] = useState('')
  const [profilKaydedildi, setProfilKaydedildi] = useState(false)
  const [profilKayit, setProfilKayit] = useState(false)

  const [yeniSifre, setYeniSifre] = useState('')
  const [yeniSifre2, setYeniSifre2] = useState('')
  const [sifreMesaj, setSifreMesaj] = useState(null)
  const [sifreKayit, setSifreKayit] = useState(false)

  useEffect(() => {
    if (!yuklendi) return
    if (!user?.email) { router.push('/giris'); return }
    profilGetir(user.email).then(p => {
      if (p) {
        setAd(p.ad || ''); setSoyad(p.soyad || '')
        setTelefon(p.telefon || ''); setSehir(p.sehir || ''); setFirma(p.firma || '')
      }
      setYukleniyor(false)
    })
  }, [user, yuklendi])

  async function profilKaydet() {
    setProfilKayit(true)
    await profilGuncelle(user.email, { ad, soyad, telefon, sehir, firma })
    setProfilKayit(false)
    setProfilKaydedildi(true)
    setTimeout(() => setProfilKaydedildi(false), 3000)
  }

  async function sifreKaydet() {
    setSifreMesaj(null)
    if (yeniSifre.length < 6) { setSifreMesaj({ tip: 'hata', m: 'Şifre en az 6 karakter olmalı.' }); return }
    if (yeniSifre !== yeniSifre2) { setSifreMesaj({ tip: 'hata', m: 'Şifreler eşleşmiyor.' }); return }
    setSifreKayit(true)
    const { error } = await sifreDegistir(yeniSifre)
    setSifreKayit(false)
    if (error) { setSifreMesaj({ tip: 'hata', m: 'Hata: ' + error.message }); return }
    setSifreMesaj({ tip: 'basari', m: '✓ Şifreniz güncellendi.' })
    setYeniSifre(''); setYeniSifre2('')
  }

  if (yukleniyor) return <div className={styles.merkez}><div className={styles.spinner} /></div>

  return (
    <>
      <Head><title>Hesap Ayarları | AlmakIstiyor.com</title></Head>
      <div className={styles.sayfa}>
        <div className={styles.ust}>
          <Link href="/" className={styles.geri}>← Ana Sayfa</Link>
          <h1 className={styles.baslik}>⚙️ Hesap Ayarları</h1>
        </div>

        <div className={styles.icerik}>
          {/* PROFİL BİLGİLERİ */}
          <section className={styles.bolum}>
            <h2 className={styles.bolumBaslik}>Profil Bilgileri</h2>
            {profilKaydedildi && <div className={styles.basari}>✓ Bilgileriniz güncellendi.</div>}
            <div className={styles.ikiSutun}>
              <div>
                <label className={styles.label}>Ad</label>
                <input className={styles.input} value={ad} onChange={e=>setAd(e.target.value)} />
              </div>
              <div>
                <label className={styles.label}>Soyad</label>
                <input className={styles.input} value={soyad} onChange={e=>setSoyad(e.target.value)} />
              </div>
            </div>
            <label className={styles.label}>E-posta (değiştirilemez)</label>
            <input className={styles.input} value={user?.email || ''} disabled style={{opacity:0.6}} />
            <label className={styles.label}>Telefon</label>
            <input className={styles.input} value={telefon} onChange={e=>setTelefon(e.target.value)} placeholder="05XX XXX XX XX" />
            <label className={styles.label}>Şehir</label>
            <select className={styles.input} value={sehir} onChange={e=>setSehir(e.target.value)}>
              <option value="">Seçiniz</option>
              {sehirler.map(s => <option key={s.il} value={s.il}>{s.il}</option>)}
            </select>
            <label className={styles.label}>Firma / Mağaza adı (opsiyonel)</label>
            <input className={styles.input} value={firma} onChange={e=>setFirma(e.target.value)} placeholder="Satıcıysanız firma adınız" />
            <button className={styles.kaydetBtn} onClick={profilKaydet} disabled={profilKayit}>
              {profilKayit ? 'Kaydediliyor...' : 'Bilgileri Kaydet'}
            </button>
          </section>

          {/* ŞİFRE DEĞİŞTİR */}
          <section className={styles.bolum}>
            <h2 className={styles.bolumBaslik}>Şifre Değiştir</h2>
            {sifreMesaj && (
              <div className={sifreMesaj.tip==='hata'?styles.hata:styles.basari}>{sifreMesaj.m}</div>
            )}
            <label className={styles.label}>Yeni şifre</label>
            <input type="password" className={styles.input} value={yeniSifre} onChange={e=>setYeniSifre(e.target.value)} placeholder="En az 6 karakter" />
            <label className={styles.label}>Yeni şifre (tekrar)</label>
            <input type="password" className={styles.input} value={yeniSifre2} onChange={e=>setYeniSifre2(e.target.value)} />
            <button className={styles.kaydetBtn} onClick={sifreKaydet} disabled={sifreKayit}>
              {sifreKayit ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
          </section>

          {/* HESAP İŞLEMLERİ */}
          <section className={styles.bolum}>
            <h2 className={styles.bolumBaslik}>Hesap İşlemleri</h2>
            <Link href="/yardim" className={styles.linkSatir}>❓ Yardım & Destek</Link>
            <a href="/yardim" className={styles.linkSatirTehlike}>🗑️ Hesabımı silmek istiyorum</a>
            <p className={styles.bilgiNot}>Hesap silme talebi için destek ekibimizle iletişime geçin. Talebiniz 48 saat içinde işleme alınır.</p>
          </section>
        </div>
      </div>
    </>
  )
}
