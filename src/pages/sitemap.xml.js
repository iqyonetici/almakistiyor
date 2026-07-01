import { createClient } from '@supabase/supabase-js'
import { sehirIsimdenSlugBul } from '../lib/sehirler'

const BASE_URL = 'https://almakistiyor.com'

function url(loc, lastmod, priority = '0.7', changefreq = 'weekly') {
  return `
  <url>
    <loc>${BASE_URL}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export async function getServerSideProps({ res }) {
  const bugun = new Date().toISOString().split('T')[0]

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

  const statikSayfalar = [
    url('/', bugun, '1.0', 'daily'),
    url('/yardim', bugun, '0.5', 'monthly'),
  ]

  let kategoriSatirlari = []
  let sehirKategoriSatirlari = []
  let ilanSatirlari = []

  if (supabase) {
    try {
      const { data: kategoriler } = await supabase
        .from('kategoriler')
        .select('slug')
        .eq('aktif', true)

      if (kategoriler) {
        kategoriSatirlari = kategoriler.map(k =>
          url(`/kategori/${k.slug}`, bugun, '0.8', 'daily')
        )
      }
    } catch (e) {
      console.error('Kategori exception:', e)
    }

    // Şehir×kategori: thin-content engeli sayfa tarafıyla aynı mantık —
    // sadece ilan sayısı > 0 olan kombinasyonlar sitemap'e girer. Bunu
    // ilanlar_pro üzerinden distinct (kategori, sehir) çiftlerini çekerek
    // sağlıyoruz; sayfa kategori/[slug]/[sehir].js zaten her birinde
    // gerçek içerik döndüreceği için garanti 404 üretmez.
    try {
      const { data: kombinler } = await supabase
        .from('ilanlar_pro')
        .select('kategori, sehir')
        .eq('durum', 'aktif')
        .eq('onay_durumu', 'onaylandi')
        .not('kategori', 'is', null)
        .not('sehir', 'is', null)

      if (kombinler) {
        const gorulen = new Set()
        for (const k of kombinler) {
          const sehirSlug = sehirIsimdenSlugBul(k.sehir)
          if (!sehirSlug) continue // 81 il listesinde olmayan/bilinmeyen şehir adı -> atla
          const anahtar = `${k.kategori}/${sehirSlug}`
          if (gorulen.has(anahtar)) continue
          gorulen.add(anahtar)
          sehirKategoriSatirlari.push(
            url(`/kategori/${k.kategori}/${sehirSlug}`, bugun, '0.7', 'weekly')
          )
        }
      }
    } catch (e) {
      console.error('Sehir-kategori exception:', e)
    }

    try {
      const { data: ilanlar, error: iErr } = await supabase
        .from('ilanlar_pro')
        .select('id, created_at')
        .eq('durum', 'aktif')
        .eq('onay_durumu', 'onaylandi')
        .limit(10000)

      if (iErr) console.error('Ilan hatasi:', iErr.message)
      if (ilanlar) {
        ilanSatirlari = ilanlar.map(i => {
          const tarih = i.created_at ? i.created_at.split('T')[0] : bugun
          return url(`/ilan/${i.id}`, tarih, '0.6', 'weekly')
        })
      }
    } catch (e) {
      console.error('Ilan exception:', e)
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${statikSayfalar.join('')}
${kategoriSatirlari.join('')}
${sehirKategoriSatirlari.join('')}
${ilanSatirlari.join('')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.write(xml)
  res.end()

  return { props: {} }
}

export default function Sitemap() {
  return null
}
