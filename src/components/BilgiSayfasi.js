// src/components/BilgiSayfasi.js
// Ortak bilgi/yasal sayfa düzeni. Tüm statik sayfalar bunu kullanır.
import Head from 'next/head'
import Link from 'next/link'
import Footer from './Footer'

export default function BilgiSayfasi({ baslik, aciklama, children }) {
  return (
    <>
      <Head>
        <title>{baslik} — almakistiyor.com</title>
        {aciklama && <meta name="description" content={aciklama} />}
      </Head>

      {/* Üst bar — basit, sadece logo + geri dön */}
      <header style={{
        background:'#085549', padding:'14px 16px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <Link href="/" style={{display:'inline-flex', alignItems:'center', gap:9, textDecoration:'none'}}>
          <img src="/almakistiyor-icon.png" alt="almakistiyor.com" width={34} height={34}
            style={{width:34, height:34, borderRadius:9}} />
          <span style={{fontSize:18, color:'#fff', fontWeight:700}}>
            almak<span style={{color:'rgba(255,255,255,0.8)', fontWeight:400}}>istiyor</span><span style={{color:'#F5A623'}}>.com</span>
          </span>
        </Link>
        <Link href="/" style={{
          color:'#E6F5F2', fontSize:13, fontWeight:500, textDecoration:'none',
          padding:'7px 14px', borderRadius:8, border:'1px solid rgba(255,255,255,0.25)',
        }}>← Ana sayfa</Link>
      </header>

      {/* İçerik */}
      <main style={{maxWidth:760, margin:'0 auto', padding:'32px 20px 56px'}}>
        <h1 style={{
          fontFamily:'Sora, sans-serif', fontSize:28, fontWeight:700,
          color:'#1a1d23', marginBottom:8, lineHeight:1.25,
        }}>{baslik}</h1>
        {aciklama && <p style={{fontSize:15, color:'#64748b', marginBottom:28, lineHeight:1.6}}>{aciklama}</p>}
        <div style={{fontSize:15, color:'#334155', lineHeight:1.8}}>
          {children}
        </div>
      </main>

      <Footer />
    </>
  )
}

// Ortak stil yardımcıları (sayfalarda kullanmak için)
export const h2Style = {
  fontFamily:'Sora, sans-serif', fontSize:19, fontWeight:600,
  color:'#0D7A6B', margin:'28px 0 10px',
}
export const pStyle = { marginBottom:14, lineHeight:1.8 }
export const liStyle = { marginBottom:8, lineHeight:1.7 }
export const kutuStyle = {
  background:'#f0f9f5', border:'1px solid #c8e6d4', borderRadius:12,
  padding:'16px 18px', margin:'18px 0',
}
