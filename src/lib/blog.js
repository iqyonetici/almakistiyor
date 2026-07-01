// src/lib/blog.js
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export function tumYazilariGetir() {
  if (!fs.existsSync(BLOG_DIR)) return []
  const dosyalar = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
  const yazilar = dosyalar.map(dosya => {
    const slug = dosya.replace(/\.(md|mdx)$/, '')
    const dosyaYolu = path.join(BLOG_DIR, dosya)
    const icerik = fs.readFileSync(dosyaYolu, 'utf8')
    const { data: frontmatter, content } = matter(icerik)
    const okumaSuresi = readingTime(content)
    return {
      slug,
      baslik: frontmatter.baslik || '',
      ozet: frontmatter.ozet || '',
      tarih: frontmatter.tarih || '',
      kategori: frontmatter.kategori || 'Genel',
      etiketler: frontmatter.etiketler || [],
      kapakGorseli: frontmatter.kapakGorseli || null,
      yayinda: frontmatter.yayinda !== false,
      okumaSuresi: Math.ceil(okumaSuresi.minutes),
    }
  })
  return yazilar.filter(y => y.yayinda).sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
}

export function yaziGetir(slug) {
  const mdxYolu = path.join(BLOG_DIR, `${slug}.mdx`)
  const mdYolu = path.join(BLOG_DIR, `${slug}.md`)
  const dosyaYolu = fs.existsSync(mdxYolu) ? mdxYolu : mdYolu
  if (!fs.existsSync(dosyaYolu)) return null
  const icerik = fs.readFileSync(dosyaYolu, 'utf8')
  const { data: frontmatter, content } = matter(icerik)
  const okumaSuresi = readingTime(content)
  return {
    slug,
    baslik: frontmatter.baslik || '',
    ozet: frontmatter.ozet || '',
    tarih: frontmatter.tarih || '',
    kategori: frontmatter.kategori || 'Genel',
    etiketler: frontmatter.etiketler || [],
    kapakGorseli: frontmatter.kapakGorseli || null,
    yayinda: frontmatter.yayinda !== false,
    okumaSuresi: Math.ceil(okumaSuresi.minutes),
    icerik,
  }
}

export function tumSluglar() {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
    .map(f => f.replace(/\.(md|mdx)$/, ''))
}
