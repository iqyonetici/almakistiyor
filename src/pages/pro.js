import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { paketleriGetir } from '../lib/adminDB'

export default function Pro() {
  const { user } = useAuth()
  const [paketler, setPaketler] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [periyot, setPeriyot] = useState('ay')

  useEffect(() => {
    paketleriGetir().then(p => {
      setPaketler((p || []).filter(x => x.aktif !== false))
      setYukleniyor(false)
    })
  }, [])

  function fiyat(p) { return periyot === 'yil' ? Number(p.yillik_fiyat) || 0 : Number(p.fiyat) || 0 }
  function aylikBaz(p) { return p.yillik_fiyat ? Math.round(Number(p.yillik_fiyat) / 12) : null }
  function tasarrufYuzde(p) {
    const ay = Number(p.fiyat) || 0
    const yil = Number(p.yillik_fiyat) || 0
    if (!ay || !yil) return 0
    return Math.round((1 - yil / (ay * 12)) * 100)
  }

  const proPaketler = paketler.filter(p => p.kod !== 'ucretsiz')
  const ucretsiz = paketler.find(p => p.kod === 'ucretsiz')
  const maxTasarruf = proPaketler.reduce((max, p) => Math.max(max, tasarrufYuzde(p)), 0)

  const s = {
    sayfa: { background: '#f8fafc', minHeight: '100vh' },
    hero: {
      background: '#085041',
      padding: '40px 24px 48px',
      textAlign: 'center',
    },
    heroBadge: {
      display: 'inline-block',
      background: 'rgba(255,255,255,0.15)',
      color: '#9FE1CB',
      fontSize: 11,
      fontWeight: 600,
      padding: '4px 14px',
      borderRadius: 20,
      marginBottom: 14,
      letterSpacing: '.5px',
    },
    heroH1: {
      fontSize: 'clamp(20px,4vw,30px)',
      fontWeight: 600,
      color: 'white',
      marginBottom: 10,
      lineHeight: 1.25,
    },
    heroP: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.7)',
      marginBottom: 24,
      lineHeight: 1.6,
    },
    toggle: {
      display: 'inline-flex',
      background: 'rgba(0,0,0,0.25)',
      borderRadius: 11,
      padding: 3,
      gap: 3,
    },
    tBtnOn: {
      padding: '8px 20px', borderRadius: 9, border: 'none',
      background: 'white', color: '#085041',
      fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    },
    tBtnOff: {
      padding: '8px 20px', borderRadius: 9, border: 'none',
      background: 'transparent', color: 'rgba(255,255,255,0.75)',
      fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
      display: 'flex', alignItems: 'center', gap: 7,
    },
    savePill: {
      background: '#EF9F27', color: '#412402',
      fontSize: 10, fontWeight: 700,
      padding: '2px 7px', borderRadius: 10,
    },
    wrap: { maxWidth: 960, margin: '0 auto', padding: '0 16px' },
    cardsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
      gap: 14,
      marginTop: -28,
      marginBottom: 24,
      position: 'relative',
      zIndex: 2,
    },
    card: {
      background: 'white',
      borderRadius: 16,
      border: '1.5px solid #e2e8f0',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    cardPop: {
      background: 'white',
      borderRadius: 16,
      border: '2px solid #0F6E56',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 20px rgba(15,110,86,0.15)',
      position: 'relative',
    },
    cardBar: { height: 4, background: '#0F6E56' },
    cardBody: { padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' },
    planName: {
      fontSize: 11, fontWeight: 600, color: '#0F6E56',
      textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8,
    },
    priceRow: { display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 2 },
    priceBig: { fontSize: 30, fontWeight: 600, color: '#0f172a' },
    priceUnit: { fontSize: 13, color: '#64748b' },
    priceHint: { fontSize: 11, color: '#94a3b8', marginBottom: 16 },
    feats: { display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20, flex: 1 },
    feat: { display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: '#374151' },
    featIcon: { color: '#0F6E56', fontSize: 15, width: 16, textAlign: 'center', flexShrink: 0 },
    cta: {
      display: 'block', width: '100%', padding: '12px',
      borderRadius: 10, border: 'none',
      background: '#085041', color: 'white',
      fontSize: 14, fontWeight: 600, cursor: 'pointer',
      fontFamily: 'inherit', textAlign: 'center',
    },
    ctaMevcut: {
      display: 'block', width: '100%', padding: '12px',
      borderRadius: 10, border: 'none',
      background: '#E6F5F2', color: '#085041',
      fontSize: 14, fontWeight: 600, cursor: 'default',
      fontFamily: 'inherit', textAlign: 'center',
    },
    popBadge: {
      position: 'absolute', top: 14, right: 14,
      background: '#0F6E56', color: '#E1F5EE',
      fontSize: 10, fontWeight: 700,
      padding: '3px 9px', borderRadius: 10,
    },
    section: { background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 16 },
    cmpHead: {
      display: 'grid',
      background: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
    },
    cmpRow: { borderBottom: '1px solid #f1f5f9' },
    cmpCell: { padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#0F6E56', textAlign: 'center' },
    cmpLabel: { padding: '10px 14px', fontSize: 13, color: '#374151', fontWeight: 500 },
    cmpVal: { padding: '10px 14px', fontSize: 13, color: '#0f172a', textAlign: 'center', fontWeight: 500 },
    faqRow: {
      padding: '14px 18px',
      borderBottom: '1px solid #f1f5f9',
    },
    faqQ: { fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 4 },
    faqA: { fontSize: 12, color: '#64748b', lineHeight: 1.6 },
    altNote: { textAlign: 'center', fontSize: 13, color: '#94a3b8', padding: '16px 0 32px' },
  }

  const FAQS = [
    { s: 'İstediğim zaman iptal edebilir miyim?', c: 'Evet, ek ücret olmadan dilediğiniz zaman iptal edebilirsiniz.' },
    { s: 'Telefon görüntüleme hakkı her gün yenilenir mi?', c: 'Evet, her gece yarısı sıfırlanır. Daha önce gördüğünüz numaralar her zaman erişilebilir kalır.' },
    { s: 'Ödeme nasıl yapılır?', c: 'Kredi/banka kartı ile güvenli ödeme yakında aktif olacak. Şimdilik destek ekibimizle iletişime geçebilirsiniz.' },
    { s: 'Pro üyeliğim ne zaman başlar?', c: 'Ödeme onaylandığı anda tüm özellikler hesabınıza tanımlanır.' },
  ]

  const cols = `1.5fr ${proPaketler.map(() => '1fr').join(' ')}`

  return (
    <>
      <Head><title>Pro Üyelik | AlmakIstiyor.com</title></Head>
      <Navbar />

      <div style={s.sayfa}>
        {/* HERO */}
        <div style={s.hero}>
          <div style={s.heroBadge}>⭐ PRO ÜYELİK</div>
          <h1 style={s.heroH1}>Alıcılara rakiplerinizden önce ulaşın</h1>
          <p style={s.heroP}>Öncelikli sıralama · Onaylı rozet · Telefon görüntüleme</p>
          <div style={s.toggle}>
            <button style={s.tBtnOn} onClick={() => setPeriyot('ay')}
              className={periyot === 'ay' ? '' : ''}
              data-active={periyot === 'ay'}>Aylık</button>
            <button style={periyot === 'yil' ? s.tBtnOn : s.tBtnOff} onClick={() => setPeriyot('yil')}>
              Yıllık
              {maxTasarruf > 0 && <span style={s.savePill}>%{maxTasarruf} İNDİRİM</span>}
            </button>
          </div>
        </div>

        <div style={s.wrap}>
          {/* PAKET KARTLARI */}
          {yukleniyor ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8', marginTop: 32 }}>Yükleniyor...</div>
          ) : (
            <div style={s.cardsGrid}>
              {proPaketler.map(p => {
                const f = fiyat(p)
                const bazFiyat = aylikBaz(p)
                const ozellikler = (p.ozellikler || '').split(',').map(x => x.trim()).filter(Boolean)
                const mevcutPaket = (user?.paket || 'ucretsiz') === p.kod
                const isPopuler = !!p.populer

                return (
                  <div key={p.id} style={isPopuler ? s.cardPop : s.card}>
                    <div style={s.cardBar} />
                    {isPopuler && <div style={s.popBadge}>EN POPÜLER</div>}
                    <div style={s.cardBody}>
                      <div style={s.planName}>{p.ad}</div>
                      <div style={s.priceRow}>
                        <span style={s.priceBig}>{f.toLocaleString('tr-TR')}</span>
                        <span style={s.priceUnit}>₺/{periyot === 'yil' ? 'yıl' : 'ay'}</span>
                      </div>
                      <div style={s.priceHint}>
                        {periyot === 'ay' && bazFiyat
                          ? `Yıllık alırsan ${bazFiyat.toLocaleString('tr-TR')} ₺/ay`
                          : periyot === 'yil' && p.fiyat
                          ? `Aylık ${Number(p.fiyat).toLocaleString('tr-TR')} ₺ yerine`
                          : '\u00a0'}
                      </div>

                      <div style={s.feats}>
                        {[
                          { ikon: '📋', deger: p.gunluk_ilan >= 999 ? 'Sınırsız' : p.gunluk_ilan, label: 'ilan/gün' },
                          { ikon: '💬', deger: p.gunluk_mesaj >= 999 ? 'Sınırsız' : p.gunluk_mesaj, label: 'mesaj/gün' },
                          { ikon: '📞', deger: p.gunluk_telefon >= 999 ? 'Sınırsız' : (p.gunluk_telefon || 0), label: 'telefon/gün' },
                          { ikon: '🚀', deger: 'Öncelikli sıralama', label: null },
                          { ikon: '✅', deger: 'Onaylı satıcı rozeti', label: null },
                        ].map((item, i) => (
                          <div key={i} style={s.feat}>
                            <span style={{ fontSize: 15 }}>{item.ikon}</span>
                            <span>
                              {item.label
                                ? <><strong style={{ fontWeight: 600 }}>{item.deger}</strong> {item.label}</>
                                : item.deger}
                            </span>
                          </div>
                        ))}
                        {ozellikler.map((o, i) => (
                          <div key={`oz-${i}`} style={s.feat}>
                            <span style={{ color: '#0F6E56', fontSize: 14, fontWeight: 700 }}>✓</span>
                            <span>{o}</span>
                          </div>
                        ))}
                      </div>

                      {mevcutPaket ? (
                        <div style={s.ctaMevcut}>✓ Mevcut planınız</div>
                      ) : (
                        <button style={s.cta}
                          onClick={() => alert('Ödeme sistemi yakında! Şimdilik destek ekibimizle iletişime geçin.')}>
                          {user ? "Pro'ya Yükselt" : 'Üye Ol ve Başla'} →
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* KARŞILAŞTIRMA TABLOSU */}
          {!yukleniyor && proPaketler.length > 1 && (
            <div style={s.section}>
              <div style={{ ...s.cmpHead, gridTemplateColumns: cols }}>
                <div style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.4px' }}>Özellik</div>
                {proPaketler.map(p => (
                  <div key={p.id} style={s.cmpCell}>{p.ad}</div>
                ))}
              </div>
              {[
                { label: 'Günlük ilan', key: 'gunluk_ilan' },
                { label: 'Günlük mesaj', key: 'gunluk_mesaj' },
                { label: 'Telefon/gün', key: 'gunluk_telefon' },
                { label: 'Öncelikli sıralama', key: 'oncelik' },
                { label: 'Onaylı rozet', key: 'rozet' },
                { label: 'Telefon gösterme', key: 'telefon_goster' },
              ].map((row, ri) => (
                <div key={ri} style={{ ...s.cmpRow, display: 'grid', gridTemplateColumns: cols, background: ri % 2 === 1 ? '#fafafa' : 'white' }}>
                  <div style={s.cmpLabel}>{row.label}</div>
                  {proPaketler.map(p => {
                    let v
                    if (row.key === 'oncelik' || row.key === 'rozet') v = '✅'
                    else if (row.key === 'telefon_goster') v = p.telefon_goster ? '✅' : '—'
                    else { const n = p[row.key]; v = n >= 999 ? 'Sınırsız' : (n ?? '—') }
                    return (
                      <div key={p.id} style={{ ...s.cmpVal, color: v === '✅' ? '#059669' : v === '—' ? '#cbd5e1' : '#0f172a' }}>
                        {v}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}

          {/* SSS */}
          <div style={s.section}>
            {FAQS.map((q, i) => (
              <div key={i} style={{ ...s.faqRow, borderBottom: i < FAQS.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={s.faqQ}>{q.s}</div>
                <div style={s.faqA}>{q.c}</div>
              </div>
            ))}
          </div>

          {/* ALT NOT */}
          <div style={s.altNote}>
            {ucretsiz && (
              <>Ücretsiz başlamak ister misiniz?{' '}
                <Link href="/kayit" style={{ color: '#0D7A6B', fontWeight: 600, textDecoration: 'none' }}>
                  Ücretsiz üye olun →
                </Link>
                {` (${ucretsiz.gunluk_ilan} ilan/gün, ${ucretsiz.gunluk_mesaj} mesaj/gün)`}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
