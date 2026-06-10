import '../styles/globals.css'
import Head from 'next/head'
import { AuthProvider } from '../context/AuthContext'

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <link rel="icon" href="/icon-32.png" sizes="32x32" />
        <link rel="icon" href="/icon-192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#085549" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
