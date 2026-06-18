import Head from 'next/head';

const SITE_NAME = 'AlmakIstiyor.com';
const SITE_URL = 'https://almakistiyor.com';
const DEFAULT_DESCRIPTION =
  'Almak istediğinizi ilan açın, satıcılar sizi bulsun. Türkiye\'nin ters-ilan platformu — emlak, araç, her şey.';
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;

/**
 * Kullanım:
 *   <SeoMeta title="..." description="..." />
 *   <SeoMeta title="..." ogImage="https://..." canonical="/ilan/123" noindex />
 */
export default function SeoMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  noindex = false,
  structuredData = null,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : null;

  return (
    <Head>
      {/* Temel */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="tr_TR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Yapısal veri (isteğe bağlı) */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}