import '../styles/globals.css'
import Head from 'next/head'
import { AuthProvider } from '../context/AuthContext'

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <link rel="icon" href="/almakistiyor-icon.png" />
        
        <link rel="apple-touch-icon" href="/almakistiyor-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#085549" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
