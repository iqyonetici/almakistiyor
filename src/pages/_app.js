import '../styles/globals.css'
import Head from 'next/head'
import { AuthProvider } from '../context/AuthContext'

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="icon" type="image/png" href="/icon-32.png?v=3" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#085549" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
