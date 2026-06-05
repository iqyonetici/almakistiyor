import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { paketleriGetir } from '../lib/adminDB'
import styles from './pro.module.css'

export default function Pro() {
  const { user } = useAuth()
  const [paketler, setPaketler] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [periyot, setPeriyot] = useState('ay')  // ay / yil

  useEffect(() => {
    paketleriGetir().then(p => {
      // Sadece aktif ve ücretsiz olmayan paketleri pro sayfasında göster
      setPaketler((p || []).filter(x => x.aktif !== false))
      setYukleniyor(false)
    })
  }, [])

  // Yıllık ödemede %20 indirim (2 ay bedava mantığı)
  function fiyatHesapla(p) {
    const aylik = Number(p.fiyat) || 0
    if (periyot === 'yil') return Math.round(aylik * 12 * 0.8)  // yıllık %20 indirim
    return aylik
  }
  function eskiFiyatHesapla(p) {
    if (periyot === 'yil') return Math.round((Number(p.fiyat) || 0) * 12)
    return p.eski_fiyat ? Number(p.eski_fiyat) : null
  }

  return (
    <>
      <Head><title>Pro Üyelik | AlmakIstiyor.com</title></Head>
      <div className={styles.sayfa}>
        {/* HERO */}
        <div className={styles.hero}>
          <Link href="/" className={styles.geri}>← Ana Sayfa</Link>
          <div className={styles.rozet}>💎 PRO ÜYELİK</div>
          <h1 className={styles.baslik}>Daha fazla satış, daha fazla teklif</h1>
          <p className={styles.altBaslik}>
            Pro üyelikle alıcılara öncelikli ulaşın, telefon numaralarını görün, daha fazla teklif gönderin.
          </p>

          {/* Periyot seçici */}
          <div className={styles.periyotSecici}>
            <button className={`${styles.periyotBtn} ${periyot==='ay'?styles.periyotAktif:''}`} onClick={()=>setPeriyot('ay')}>
              Aylık
            </button>
            <button className={`${styles.periyotBtn} ${periyot==='yil'?styles.periyotAktif:''}`} onClick={()=>setPeriyot('yil')}>
              Yıllık <span className={styles.indirimEtiket}>%20 indirim</span>
            </button>
          </div>
        </div>

        {/* PAKET KARTLARI */}
        <div className={styles.paketler}>
          {yukleniyor ? (
            <div className={styles.yukleniyor}>Paketler yükleniyor...</div>
          ) : (
            paketler.map(p => {
              const fiyat = fiyatHesapla(p)
              const eski = eskiFiyatHesapla(p)
              const ozellikler = (p.ozellikler || '').split(',').map(x => x.trim()).filter(Boolean)
              const ucretsiz = p.kod === 'ucretsiz' || fiyat === 0
              return (
                <div key={p.id} className={`${styles.kart} ${p.populer?styles.kartPopuler:''}`}
                  style={p.populer ? { borderColor: p.renk || '#7C3AED' } : {}}>
                  {p.populer && <div className={styles.populerBant} style={{background:p.renk||'#7C3AED'}}>⭐ EN POPÜLER</div>}
                  <div className={styles.kartBaslik} style={{color:p.renk||'#0D7A6B'}}>{p.ad}</div>
                  {p.aciklama && <div className={styles.kartAciklama}>{p.aciklama}</div>}

                  <div className={styles.fiyatAlan}>
                    {eski && eski > fiyat && <span className={styles.eskiFiyat}>{eski.toLocaleString('tr-TR')} ₺</span>}
                    <div className={styles.fiyat}>
                      {ucretsiz ? 'Ücretsiz' : <>{fiyat.toLocaleString('tr-TR')} <span className={styles.fiyatBirim}>₺/{periyot==='yil'?'yıl':'ay'}</span></>}
                    </div>
                  </div>

                  <div className={styles.limitler}>
                    <div className={styles.limitItem}>📋 <strong>{p.gunluk_ilan >= 999 ? 'Sınırsız' : p.gunluk_ilan}</strong> ilan/gün</div>
                    <div className={styles.limitItem}>💬 <strong>{p.gunluk_mesaj >= 999 ? 'Sınırsız' : p.gunluk_mesaj}</strong> mesaj/gün</div>
                  </div>

                  <ul className={styles.ozellikListe}>
                    {ozellikler.map((o, i) => (
                      <li key={i}><span className={styles.tik} style={{color:p.renk||'#0D7A6B'}}>✓</span> {o}</li>
                    ))}
                  </ul>

                  {ucretsiz ? (
                    <div className={styles.mevcutPlan}>Mevcut planınız</div>
                  ) : (
                    <button className={styles.secBtn} style={{background:p.renk||'#0D7A6B'}}
                      onClick={() => alert('Ödeme sistemi yakında! Şimdilik destek ekibiyle iletişime geçin.')}>
                      {user ? 'Pro\'ya Yükselt' : 'Üye Ol ve Başla'} →
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* NEDEN PRO */}
        <div className={styles.nedenPro}>
          <h2 className={styles.nedenBaslik}>Neden Pro Üye olmalısınız?</h2>
          <div className={styles.nedenGrid}>
            {[
              { i: '📞', b: 'İletişim Avantajı', a: 'Alıcıların telefon numaralarını görün, doğrudan iletişim kurun.' },
              { i: '🚀', b: 'Öncelikli Sıralama', a: 'Teklifleriniz listede üst sıralarda görünür, daha çok fark edilir.' },
              { i: '✅', b: 'Onaylı Satıcı Rozeti', a: 'Güven veren rozet ile alıcıların gözünde öne çıkın.' },
              { i: '💬', b: 'Daha Fazla Mesaj', a: 'Günlük mesaj limitiniz artar, daha çok alıcıya ulaşırsınız.' },
            ].map(n => (
              <div key={n.b} className={styles.nedenKart}>
                <div className={styles.nedenIkon}>{n.i}</div>
                <div className={styles.nedenKartBaslik}>{n.b}</div>
                <div className={styles.nedenKartAciklama}>{n.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SSS */}
        <div className={styles.sss}>
          <h2 className={styles.nedenBaslik}>Sıkça Sorulan Sorular</h2>
          {[
            { s: 'İstediğim zaman iptal edebilir miyim?', c: 'Evet, dilediğiniz zaman iptal edebilirsiniz. Ek ücret alınmaz.' },
            { s: 'Yıllık ödemede ne kadar tasarruf ederim?', c: 'Yıllık ödemede %20 indirim ile yaklaşık 2 ay bedava kullanım kazanırsınız.' },
            { s: 'Ödeme nasıl yapılır?', c: 'Kredi/banka kartı ile güvenli ödeme yakında aktif olacak. Şu an için destek ekibimizle iletişime geçebilirsiniz.' },
            { s: 'Pro üyeliğim ne zaman başlar?', c: 'Ödeme onaylandığı anda tüm Pro özellikleri hesabınıza tanımlanır.' },
          ].map((q, i) => (
            <details key={i} className={styles.sssItem}>
              <summary className={styles.sssSoru}>{q.s}</summary>
              <div className={styles.sssCevap}>{q.c}</div>
            </details>
          ))}
        </div>

        <div className={styles.altCta}>
          <p>Sorularınız mı var?</p>
          <Link href="/yardim" className={styles.altCtaBtn}>Destek ekibimize yazın →</Link>
        </div>
      </div>
    </>
  )
}
