import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import IlanForm from '../components/IlanForm'
import Footer from '../components/Footer'
import styles from './panel.module.css'

const demoTalepler = [
  { id: 1, baslik: 'Kadıköy 3+1 kiralık daire arıyorum', kategori: 'Emlak', tarih: '2 gün önce', durum: 'aktif', goruntuleme: 47, mesajSayisi: 3 },
  { id: 2, baslik: 'BMW 3 Serisi arıyorum', kategori: 'Vasıta', tarih: '5 gün önce', durum: 'aktif', goruntuleme: 89, mesajSayisi: 1 },
]

const demoMesajlar = [
  { id: 1, gonderen: 'Yıldız Emlak', ilan: 'Kadıköy 3+1 kiralık daire arıyorum', mesaj: 'Merhaba, Kadıköy\'de tam aradığınız özelliklerde bir dairemiz mevcut. Görüşmek ister misiniz?', tarih: '3 saat önce', okundu: false },
  { id: 2, gonderen: 'Metropol Gayrimenkul', ilan: 'Kadıköy 3+1 kiralık daire arıyorum', mesaj: 'İyi günler, Üsküdar\'da benzer bir dairemiz var, bütçenize uygun olabilir.', tarih: '1 gün önce', okundu: true },
  { id: 3, gonderen: 'Oto Güven Galeri', ilan: 'BMW 3 Serisi arıyorum', mesaj: '2020 model BMW 320i, 45.000 km, tüm bakımları yapılmış, fiyatımız uygun.', tarih: '2 gün önce', okundu: true },
]

export default function Panel() {
  const { user, cikisYap } = useAuth()
  const router = useRouter()
  const [aktifTab, setAktifTab] = useState('talepler')
  const [formOpen, setFormOpen] = useState(false)
  const [talepler, setTalepler] = useState(demoTalepler)
  const [mesajlar, setMesajlar] = useState(demoMesajlar)
  const [profil, setProfil] = useState({ ad: '', soyad: '', telefon: '', sehir: '', iletisimTercihi: 'ikisi' })

  useEffect(() => {
    if (!user) { router.push('/giris'); return }
    setProfil({ ad: user.ad, soyad: user.soyad, email: user.email, telefon: user.telefon || '', sehir: user.sehir || '', iletisimTercihi: 'ikisi' })
    if (router.query.tab) setAktifTab(router.query.tab)
  }, [user, router.query.tab])

  if (!user) return null

  const okunmamisMesaj = mesajlar.filter(m => !m.okundu).length

  function ilanSil(id) { setTalepler(prev => prev.filter(i => i.id !== id)) }
  function ilanDurumToggle(id) { setTalepler(prev => prev.map(i => i.id === id ? {...i, durum: i.durum === 'aktif' ? 'pasif' : 'aktif'} : i)) }
  function mesajOku(id) { setMesajlar(prev => prev.map(m => m.id === id ? {...m, okundu: true} : m)) }

  return (
    <>
      <Head><title>Panelim — AlmakIstiyor.com</title></Head>
      <Navbar onIlanVer={() => setFormOpen(true)} />

      <div className={styles.wrap}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{(user.ad?.[0]||'') + (user.soyad?.[0]||'')}</div>
            <div>
              <div className={styles.userName}>{user.ad} {user.soyad}</div>
              <div className={styles.userEmail}>{user.email}</div>
            </div>
          </div>

          <nav className={styles.nav}>
            {[
              { id: 'talepler', icon: '📋', label: 'Talep İlanlarım', badge: talepler.length },
              { id: 'mesajlar', icon: '💬', label: 'Mesajlarım', badge: okunmamisMesaj || null },
              { id: 'profil', icon: '👤', label: 'Profilim' },
            ].map(m => (
              <button key={m.id}
                className={`${styles.navItem} ${aktifTab === m.id ? styles.navActive : ''}`}
                onClick={() => setAktifTab(m.id)}>
                <span className={styles.navIcon}>{m.icon}</span>
                <span>{m.label}</span>
                {m.badge ? <span className={styles.badge}>{m.badge}</span> : null}
              </button>
            ))}
          </nav>

          <div className={styles.proKart}>
            <div className={styles.proIcon}>🏢</div>
            <div className={styles.proText}>Emlakçı veya galericiyseniz alıcı ilanlarına erişin</div>
            <a href="/pro" className={styles.proBtn}>Profesyonel Erişim →</a>
          </div>

          <button className={styles.cikisBtn} onClick={() => { cikisYap(); router.push('/') }}>
            ← Çıkış Yap
          </button>
        </aside>

        {/* MAIN */}
        <main className={styles.main}>

          {/* TALEP İLANLARIM */}
          {aktifTab === 'talepler' && (
            <div>
              <div className={styles.pageHeader}>
                <div>
                  <h1 className={styles.pageTitle}>Talep İlanlarım</h1>
                  <p className={styles.pageSub}>Yayınladığınız talepler ve gelen ilgiler</p>
                </div>
                <button className="btn-primary" onClick={() => setFormOpen(true)}>
                  + Yeni Talep Ver
                </button>
              </div>

              {talepler.length === 0 ? (
                <div className={styles.bosKart}>
                  <div className={styles.bosIcon}>📋</div>
                  <h3>Henüz talep ilanınız yok</h3>
                  <p>Ne aradığınızı yazın, satıcılar sizi bulsun.</p>
                  <button className="btn-primary" onClick={() => setFormOpen(true)}>
                    İlk talebinizi verin →
                  </button>
                </div>
              ) : (
                <div className={styles.ilanListesi}>
                  {talepler.map(ilan => (
                    <div key={ilan.id} className={styles.ilanKarti}>
                      <div className={styles.ilanUst}>
                        <div>
                          <span className={styles.ilanKat}>{ilan.kategori}</span>
                          <h3 className={styles.ilanBaslik}>{ilan.baslik}</h3>
                          <div className={styles.ilanMeta}>
                            <span>📅 {ilan.tarih}</span>
                            <span>👁️ {ilan.goruntuleme} satıcı baktı</span>
                            <span>💬 {ilan.mesajSayisi} mesaj</span>
                          </div>
                        </div>
                        <div className={styles.ilanSag}>
                          <span className={`${styles.durumBadge} ${ilan.durum === 'aktif' ? styles.durumAktif : styles.durumPasif}`}>
                            {ilan.durum}
                          </span>
                        </div>
                      </div>
                      <div className={styles.ilanAlt}>
                        <button className={styles.ilanBtn} onClick={() => setAktifTab('mesajlar')}>
                          💬 Mesajları Gör ({ilan.mesajSayisi})
                        </button>
                        <button className={styles.ilanBtn} onClick={() => ilanDurumToggle(ilan.id)}>
                          {ilan.durum === 'aktif' ? '⏸ Pasife Al' : '▶ Aktife Al'}
                        </button>
                        <button className={`${styles.ilanBtn} ${styles.ilanSilBtn}`} onClick={() => ilanSil(ilan.id)}>
                          🗑 Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MESAJLARIM */}
          {aktifTab === 'mesajlar' && (
            <div>
              <div className={styles.pageHeader}>
                <div>
                  <h1 className={styles.pageTitle}>Mesajlarım</h1>
                  <p className={styles.pageSub}>Satıcılardan gelen mesajlar</p>
                </div>
                {okunmamisMesaj > 0 && (
                  <span className={styles.okunmamisBadge}>{okunmamisMesaj} okunmamış</span>
                )}
              </div>

              {mesajlar.length === 0 ? (
                <div className={styles.bosKart}>
                  <div className={styles.bosIcon}>💬</div>
                  <h3>Henüz mesajınız yok</h3>
                  <p>Talep ilanı verdiğinizde satıcılar size mesaj gönderebilir.</p>
                </div>
              ) : (
                <div className={styles.mesajListesi}>
                  {mesajlar.map(m => (
                    <div key={m.id} className={`${styles.mesajKarti} ${!m.okundu ? styles.mesajYeni : ''}`}
                      onClick={() => mesajOku(m.id)}>
                      <div className={styles.mesajUst}>
                        <div className={styles.mesajAvatar}>{m.gonderen[0]}</div>
                        <div className={styles.mesajInfo}>
                          <div className={styles.mesajGonderen}>
                            {m.gonderen}
                            {!m.okundu && <span className={styles.yeniBadge}>Yeni</span>}
                          </div>
                          <div className={styles.mesajIlan}>"{m.ilan}"</div>
                        </div>
                        <div className={styles.mesajTarih}>{m.tarih}</div>
                      </div>
                      <p className={styles.mesajMetin}>{m.mesaj}</p>
                      <div className={styles.mesajAlt}>
                        <button className={styles.ilanBtn}>↩ Yanıtla</button>
                        <button className={`${styles.ilanBtn} ${styles.ilanSilBtn}`}
                          onClick={e => { e.stopPropagation(); setMesajlar(prev => prev.filter(x => x.id !== m.id)) }}>
                          🗑 Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFİLİM */}
          {aktifTab === 'profil' && (
            <div>
              <div className={styles.pageHeader}>
                <div>
                  <h1 className={styles.pageTitle}>Profilim</h1>
                  <p className={styles.pageSub}>Bilgilerinizi güncelleyin</p>
                </div>
              </div>
              <div className={styles.profilForm}>
                <div className={styles.profilGrid}>
                  <div><label className="form-label">Ad</label>
                    <input className="form-input" value={profil.ad} onChange={e => setProfil(p => ({...p, ad: e.target.value}))} /></div>
                  <div><label className="form-label">Soyad</label>
                    <input className="form-input" value={profil.soyad} onChange={e => setProfil(p => ({...p, soyad: e.target.value}))} /></div>
                  <div><label className="form-label">E-posta</label>
                    <input className="form-input" value={profil.email || user.email} disabled style={{opacity:0.6}} /></div>
                  <div><label className="form-label">Telefon</label>
                    <input className="form-input" value={profil.telefon} onChange={e => setProfil(p => ({...p, telefon: e.target.value}))} /></div>
                  <div style={{gridColumn:'1/-1'}}>
                    <label className="form-label">İletişim Tercihi</label>
                    <div className={styles.iletisimSecenekler}>
                      {[
                        {v:'mesaj', l:'💬 Sadece Mesaj', a:'Telefon gizli kalır'},
                        {v:'telefon', l:'📞 Sadece Telefon', a:'Telefon görünür'},
                        {v:'ikisi', l:'✉️ Mesaj ve Telefon', a:'Her ikisi açık'},
                      ].map(o => (
                        <button key={o.v}
                          className={`${styles.iletisimOpt} ${profil.iletisimTercihi === o.v ? styles.iletisimOptSel : ''}`}
                          onClick={() => setProfil(p => ({...p, iletisimTercihi: o.v}))}>
                          <span style={{fontWeight:500}}>{o.l}</span>
                          <span style={{fontSize:11,color:'var(--text-3)'}}>{o.a}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.profilAlt}>
                  <button className="btn-primary" style={{padding:'10px 28px'}}>Kaydet</button>
                  <div className={styles.sifreDegistir}>
                    <h4>Şifre Değiştir</h4>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginTop:10}}>
                      <div><label className="form-label">Mevcut Şifre</label><input className="form-input" type="password" placeholder="••••••" /></div>
                      <div><label className="form-label">Yeni Şifre</label><input className="form-input" type="password" placeholder="••••••" /></div>
                      <div><label className="form-label">Tekrar</label><input className="form-input" type="password" placeholder="••••••" /></div>
                    </div>
                    <button className="btn-ghost" style={{marginTop:10,padding:'8px 20px'}}>Şifreyi Güncelle</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      <Footer />
      <IlanForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={d => {
        const yeni = { id: Date.now(), baslik: `${d.sehir} ${d.kategori} arıyorum`, kategori: d.kategori, tarih: 'Az önce', durum: 'aktif', goruntuleme: 0, mesajSayisi: 0 }
        setTalepler(prev => [yeni, ...prev])
      }} />
    </>
  )
}
