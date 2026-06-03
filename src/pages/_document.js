import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="description" content="Ne arıyorsunuz? Söyleyin, satıcılar sizi bulsun. Gayrimenkul, araç ve ikinci el talep platformu." />
        <meta property="og:title" content="AlmakIstiyor.com — Güvenli Talep Platformu" />
        <meta property="og:description" content="Gayrimenkul, araç ve ikinci el ürün talepleri. Alıcıya tamamen ücretsiz." />
        <meta property="og:image" content="https://almakistiyor.com/logo.svg" />
        <meta name="theme-color" content="#0D7A6B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AlmakIstiyor" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
