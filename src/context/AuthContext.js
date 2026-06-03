import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [yuklendi, setYuklendi] = useState(false)

  useEffect(() => {
    // Supabase Auth varsa onu kullan, yoksa localStorage fallback
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          // Supabase oturumu var — users tablosundan profil al
          fetchProfile(session.user.id, session.user.email)
        } else {
          // localStorage fallback
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
      // Supabase yok — sadece localStorage
      try {
        const k = localStorage.getItem('ait_user')
        if (k) setUser(JSON.parse(k))
      } catch(e) {}
      setYuklendi(true)
    }
  }, [])

  async function fetchProfile(supabaseId, email) {
    if (!supabase) return
    const { data } = await supabase
      .from('kullanicilar')
      .select('*')
      .eq('supabase_id', supabaseId)
      .single()
    if (data) {
      setUser({ ...data, email })
    } else {
      setUser({ supabase_id: supabaseId, email })
    }
    setYuklendi(true)
  }

  async function girisYap(email, sifre) {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: sifre })
      if (error) return { error: error.message }
      return { data }
    } else {
      // Demo fallback
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
      // Kullanıcı profilini kaydet
      if (data.user) {
        await supabase.from('kullanicilar').insert([{
          supabase_id: data.user.id,
          email, ad, soyad,
          telefon: telefon || null,
          sehir: sehir || null,
          ilce: ilce || null,
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

  // Demo giriş — Supabase olmadan
  function demoGiris(userData) {
    setUser(userData)
    try { localStorage.setItem('ait_user', JSON.stringify(userData)) } catch(e) {}
  }

  return (
    <AuthContext.Provider value={{ user, girisYap, kayitOl, cikisYap, demoGiris, yuklendi }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
