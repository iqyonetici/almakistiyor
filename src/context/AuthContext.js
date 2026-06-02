import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [yuklendi, setYuklendi] = useState(false)

  // Sayfa yenilenince localStorage'dan kullanıcıyı geri yükle
  useEffect(() => {
    try {
      const kayitli = localStorage.getItem('ait_user')
      if (kayitli) setUser(JSON.parse(kayitli))
    } catch(e) {}
    setYuklendi(true)
  }, [])

  function girisYap(userData) {
    setUser(userData)
    try { localStorage.setItem('ait_user', JSON.stringify(userData)) } catch(e) {}
  }

  function cikisYap() {
    setUser(null)
    try { localStorage.removeItem('ait_user') } catch(e) {}
  }

  return (
    <AuthContext.Provider value={{ user, girisYap, cikisYap, yuklendi }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
