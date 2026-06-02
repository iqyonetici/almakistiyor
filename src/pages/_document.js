import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <meta name="description" content="Almak İstiyor — Ne arıyorsunuz? Söyleyin, satıcılar sizi bulsun. Türkiye'nin güvenli talep platformu." />
        <meta property="og:title" content="AlmakIstiyor.com — Güvenli Talep Platformu" />
        <meta property="og:description" content="Gayrimenkul, araç ve ikinci el ürün talepleri. Alıcıya tamamen ücretsiz." />
        <meta name="theme-color" content="#0D7A6B" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
