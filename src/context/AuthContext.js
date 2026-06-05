import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [yuklendi, setYuklendi] = useState(false)

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchProfile(session.user.id, session.user.email)
        } else {
          try {
            const k = localStorage.getItem('ait_user')
            if (k) setUser(JSON.parse(k))
          } catch(e) {}
          setYuklendi(true)
        }
      })
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchProfile(session.user.id, session.user.email)
        } else {
          setUser(null)
          setYuklendi(true)
        }
      })
      return () => subscription.unsubscribe()
    } else {
      try {
        const k = localStorage.getItem('ait_user')
        if (k) setUser(JSON.parse(k))
      } catch(e) {}
      setYuklendi(true)
    }
  }, [])

  async function fetchProfile(supabaseId, email) {
    if (!supabase) return
    // 1. Önce supabase_id ile dene (limit 1 — çift kayıtta çökmez)
    let { data: bySupaId } = await supabase
      .from('kullanicilar')
      .select('*')
      .eq('supabase_id', supabaseId)
      .order('created_at', { ascending: true })
      .limit(1)

    let profil = bySupaId && bySupaId.length ? bySupaId[0] : null

    // 2. Bulamazsa email ile dene (eski kayıtlarda supabase_id boş olabilir)
    if (!profil && email) {
      const { data: byEmail } = await supabase
        .from('kullanicilar')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: true })
        .limit(1)
      profil = byEmail && byEmail.length ? byEmail[0] : null

      // Email ile bulduysa ve supabase_id boşsa, bağla (gelecekte hızlı bulunur)
      if (profil && !profil.supabase_id) {
        await supabase.from('kullanicilar').update({ supabase_id: supabaseId }).eq('id', profil.id)
      }
    }

    if (profil) {
      setUser({ ...profil, email })
    } else {
      setUser({ supabase_id: supabaseId, email, paket: 'ucretsiz' })
    }
    setYuklendi(true)
  }

  async function girisYap(email, sifre) {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: sifre })
      if (error) return { error: error.message }
      return { data }
    } else {
      return { error: 'Supabase bağlı değil' }
    }
  }

  async function kayitOl({ email, sifre, ad, soyad, telefon, sehir, ilce }) {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email, password: sifre,
        options: { data: { ad, soyad } }
      })
      if (error) return { error: error.message }
      if (data.user) {
        await supabase.from('kullanicilar').insert([{
          supabase_id: data.user.id,
          email, ad, soyad,
          telefon: telefon || null,
          sehir: sehir || null,
          ilce: ilce || null,
          paket: 'ucretsiz',
        }])
      }
      return { data }
    }
    return { error: 'Supabase bağlı değil' }
  }

  async function cikisYap() {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    try { localStorage.removeItem('ait_user') } catch(e) {}
  }

  function demoGiris(userData) {
    setUser(userData)
    try { localStorage.setItem('ait_user', JSON.stringify(userData)) } catch(e) {}
  }

  // Profili yeniden yükle (paket değişince çağrılabilir)
  async function profilYenile() {
    if (supabase && user?.email) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) await fetchProfile(session.user.id, session.user.email)
    }
  }

  return (
    <AuthContext.Provider value={{ user, girisYap, kayitOl, cikisYap, demoGiris, profilYenile, yuklendi }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
