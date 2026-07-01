// src/pages/blog/[slug].js
import Link from 'next/link'
import Head from 'next/head'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import SeoMeta from '../../components/SeoMeta'
import { tumSluglar, yaziGetir } from '../../lib/blog'

export async function getStaticPaths() {
  const sluglar = tumSluglar()
  return {
    paths: sluglar.map(slug => ({ params: { slug } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const yazi = yaziGetir(params.slug)
  if (!yazi || !yazi.yayinda) return { notFound: true }
  return { props: { yazi } }
}

export default function BlogYazisi({ yazi }) {
  // Markdown'ı basit HTML'e çevir (bağımlılıksız, sadece temel formatlar)
  function mdToHtml(md) {
    return md
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#0D7A6B">$1</a>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hul])(.+)$/gm, '$1')
      .replace(/^<\/p><p>(<[hul])/gm, '$1')
  }

  const icerikHtml = mdToHtml(yazi.icerik)

  return (
    <>
      <SeoMeta
        title={`${yazi.baslik} | AlmakIstiyor Blog`}
        description={yazi.ozet}
        canonical={`/blog/${yazi.slug}`}
        ogType="article"
      />
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: yazi.baslik,
          description: yazi.ozet,
          datePublished: yazi.tarih,
          author: { '@type': 'Organization', name: 'AlmakIstiyor.com' },
          publisher: { '@type': 'Organization', name: 'AlmakIstiyor.com', url: 'https://almakistiyor.com' },
        })}} />
      </Head>
      <Navbar />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
        <nav style={{ fontSize: 13, color: '#8A95A3', marginBottom: 32 }}>
          <Link href="/">Ana Sayfa</Link> <span>›</span>{' '}
          <Link href="/blog">Blog</Link> <span>›</span>{' '}
          <span>{yazi.baslik}</span>
        </nav>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 500, background: '#E6F5F2', color: '#0D7A6B', padding: '3px 10px', borderRadius: 6 }}>
            {yazi.kategori}
          </span>
          <span style={{ fontSize: 12, color: '#8A95A3' }}>{yazi.okumaSuresi} dk okuma</span>
          {yazi.tarih && (
            <span style={{ fontSize: 12, color: '#8A95A3' }}>
              {new Date(yazi.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>

        <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 700, color: '#1A1D23', marginBottom: 16, lineHeight: 1.35 }}>
          {yazi.baslik}
        </h1>

        {yazi.ozet && (
          <p style={{ fontSize: 16, color: '#4A5568', lineHeight: 1.7, marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid #E2E8F0' }}>
            {yazi.ozet}
          </p>
        )}

        <div
          style={{ fontSize: 15, lineHeight: 1.8, color: '#1A1D23' }}
          dangerouslySetInnerHTML={{ __html: `<p>${icerikHtml}</p>` }}
        />

        <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #E2E8F0' }}>
          <Link href="/blog" style={{ color: '#0D7A6B', fontSize: 14, fontWeight: 500 }}>
            ← Tüm yazılara dön
          </Link>
        </div>
      </div>
      <Footer />
    </>
  )
}
