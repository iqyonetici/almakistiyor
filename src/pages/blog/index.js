// src/pages/blog/index.js
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import SeoMeta from '../../components/SeoMeta'
import { tumYazilariGetir } from '../../lib/blog'

export async function getStaticProps() {
  const yazilar = tumYazilariGetir()
  return { props: { yazilar } }
}

export default function Blog({ yazilar }) {
  return (
    <>
      <SeoMeta
        title="Blog | AlmakIstiyor.com"
        description="Emlak, araç ve ikinci el alım satım hakkında rehberler, ipuçları ve güncel bilgiler."
        canonical="/blog"
      />
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <nav style={{ fontSize: 13, color: '#8A95A3', marginBottom: 24 }}>
          <Link href="/">Ana Sayfa</Link> <span>›</span> <span>Blog</span>
        </nav>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 28, fontWeight: 700, color: '#1A1D23', marginBottom: 8 }}>
          Blog
        </h1>
        <p style={{ color: '#4A5568', marginBottom: 40, fontSize: 15 }}>
          Alım satım süreçleri hakkında rehberler ve ipuçları.
        </p>

        {yazilar.length === 0 ? (
          <p style={{ color: '#8A95A3' }}>Henüz yazı yok.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {yazilar.map(yazi => (
              <Link key={yazi.slug} href={`/blog/${yazi.slug}`}
                style={{ display: 'block', background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: '24px 28px', textDecoration: 'none', color: 'inherit', transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 500, background: '#E6F5F2', color: '#0D7A6B', padding: '3px 10px', borderRadius: 6 }}>
                    {yazi.kategori}
                  </span>
                  <span style={{ fontSize: 12, color: '#8A95A3' }}>{yazi.okumaSuresi} dk okuma</span>
                </div>
                <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 600, color: '#1A1D23', marginBottom: 8 }}>
                  {yazi.baslik}
                </h2>
                {yazi.ozet && (
                  <p style={{ fontSize: 14, color: '#4A5568', lineHeight: 1.6, marginBottom: 12 }}>
                    {yazi.ozet}
                  </p>
                )}
                <div style={{ fontSize: 12, color: '#8A95A3' }}>
                  {yazi.tarih ? new Date(yazi.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
