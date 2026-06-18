/**
 * İlan detay sayfası için Schema.org yapısal verisi
 *
 * Google'ın ilanı daha iyi anlamasını sağlar.
 * ilan/[id].js içinde SeoMeta'ya structuredData prop olarak geçin.
 *
 * Kullanım:
 *   import { ilanStructuredData } from '../lib/seoHelpers';
 *   ...
 *   <SeoMeta structuredData={ilanStructuredData(ilan)} ... />
 */

const SITE_URL = 'https://almakistiyor.com';
const SITE_NAME = 'AlmakIstiyor.com';

/**
 * İlan detayı için WantedAd schema'sı üretir.
 * @param {object} ilan - ilanlar_pro'dan gelen ilan nesnesi
 */
export function ilanStructuredData(ilan) {
  if (!ilan) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'WantedAd',
    name: ilan.baslik || 'İlan',
    description: ilan.aciklama || '',
    url: `${SITE_URL}/ilan/${ilan.id}`,
    datePosted: ilan.created_at,
    validThrough: ilan.bitis_tarihi || undefined,
    jobLocation: ilan.sehir
      ? {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: ilan.sehir,
            addressCountry: 'TR',
          },
        }
      : undefined,
    hiringOrganization: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * Kategori sayfası için BreadcrumbList üretir.
 * @param {string[]} slugs - ['emlak'] veya ['vasita', 'otomobil']
 * @param {string[]} labels - ['Emlak'] veya ['Vasıta', 'Otomobil']
 */
export function breadcrumbStructuredData(slugs, labels) {
  const items = [
    { name: 'Ana Sayfa', url: SITE_URL },
    ...slugs.map((slug, i) => ({
      name: labels[i] || slug,
      url: `${SITE_URL}/kategori/${slugs.slice(0, i + 1).join('/')}`,
    })),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Ana sayfa için WebSite schema'sı — sitelink search box sağlar.
 * _app.js veya index.js'e bir kere ekleyin.
 */
export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};