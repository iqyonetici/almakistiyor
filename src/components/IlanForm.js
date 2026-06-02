import { useState } from 'react'
import { sehirler, getIlceler } from '../data/sehirler'
import styles from './IlanForm.module.css'

// Giriş yapmış kullanıcı varsa 4 adım, yoksa 5 adım (iletişim bilgileri)
const STEPS_GIRIS = [
  { id: 1, title: 'Ne arıyorsunuz?' },
  { id: 2, title: 'Konum ve işlem türü' },
  { id: 3, title: 'Fiyat ve özellikler' },
  { id: 4, title: 'Açıklama' },
  { id: 5, title: 'İlanı Onayla' },
]
const STEPS_MISAFIR = [
  { id: 1, title: 'Ne arıyorsunuz?' },
  { id: 2, title: 'Konum ve işlem türü' },
  { id: 3, title: 'Fiyat ve özellikler' },
  { id: 4, title: 'Açıklama' },
  { id: 5, title: 'İletişim bilgileri' },
  { id: 6, title: 'İlanı Onayla' },
]

const kategoriler = [
  { slug: 'emlak', icon: '🏠', label: 'Emlak', sub: 'Daire, villa, arsa…' },
  { slug: 'vasita', icon: '🚗', label: 'Vasıta', sub: 'Otomobil, SUV, motosiklet…' },
  { slug: 'ikinci-el', icon: '📦', label: 'İkinci El', sub: 'Genel eşya, ürün…' },
  { slug: 'mobilya', icon: '🛋️', label: 'Mobilya', sub: 'Koltuk, masa, yatak…' },
  { slug: 'elektronik', icon: '📱', label: 'Elektronik', sub: 'Telefon, bilgisayar…' },
  { slug: 'is-makinasi', icon: '🔧', label: 'İş Makinası', sub: 'Traktör, forklift…' },
]

const emlakTipler = ['Daire','Villa','Müstakil Ev','Arsa','İşyeri','Depo','Tarla']
const odaSayilari = ['1+0','1+1','2+1','3+1','4+1','4+1 ve üzeri','Fark etmez']
const emlakTercihler = ['Asansör','Otopark','Balkon','Bahçe','Güvenlik','Eşyalı','Site içi','Deniz manzarası']
const vasitaMarkalar = ['Audi','BMW','Citroen','Fiat','Ford','Honda','Hyundai','Kia','Mercedes','Nissan','Opel','Peugeot','Renault','Seat','Skoda','Toyota','Volkswagen','Volvo','Diğer']
const yakitTipleri = ['Benzin','Dizel','LPG','Hibrit','Elektrikli','Fark etmez']
const vitesTipleri = ['Otomatik','Manuel','Yarı Otomatik','Fark etmez']

const katLabels = { emlak:'Emlak', vasita:'Vasıta', 'ikinci-el':'İkinci El', mobilya:'Mobilya', elektronik:'Elektronik', 'is-makinasi':'İş Makinası' }

export default function IlanForm({ open, onClose, onSubmit, user }) {
  const girisYapilmis = !!user
  const STEPS = girisYapilmis ? STEPS_GIRIS : STEPS_MISAFIR
  const TOPLAM = STEPS.length
  const ONAY_STEP = TOPLAM // son adım her zaman onay

  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [data, setData] = useState({
    kategori: '', islemTuru: 'satin-al',
    sehir: '', ilce: '',
    fiyatMin: '', fiyatMax: '',
    emlakTip: '', m2Min: '', m2Max: '', oda: [], tercihler: [],
    markalar: [], yilMin: '', yilMax: '', kmMin: '', kmMax: '', yakit: [], vites: [],
    aciklama: '',
    // misafir için
    ad: '', soyad: '', telefon: '',
  })

  const set = (key, val) => setData(d => ({ ...d, [key]: val }))
  const toggle = (key, val) => setData(d => {
    const arr = d[key] || []
    return { ...d, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] }
  })

  function handleSubmit() {
    const finalData = girisYapilmis
      ? { ...data, ad: user.ad, soyad: user.soyad, telefon: user.telefon }
      : data
    onSubmit && onSubmit(finalData)
    setDone(true)
  }

  function reset() {
    setStep(1); setDone(false)
    setData({ kategori:'', islemTuru:'satin-al', sehir:'', ilce:'', fiyatMin:'', fiyatMax:'',
      emlakTip:'', m2Min:'', m2Max:'', oda:[], tercihler:[],
      markalar:[], yilMin:'', yilMax:'', kmMin:'', kmMax:'', yakit:[], vites:[],
      aciklama:'', ad:'', soyad:'', telefon:'' })
  }

  if (!open) return null

  // Onay sayfasında gösterilecek özet satırları
  function ozetSatirlar() {
    const satırlar = []
    const kat = katLabels[data.kategori] || data.kategori
    satırlar.push({ label: 'Kategori', val: kat })
    satırlar.push({ label: 'İşlem', val: data.islemTuru === 'satin-al' ? 'Satın almak' : 'Kiralamak' })
    if (data.sehir) satırlar.push({ label: 'Konum', val: data.sehir + (data.ilce ? ' / ' + data.ilce : '') })
    if (data.fiyatMin || data.fiyatMax) {
      const min = data.fiyatMin ? '₺' + Number(data.fiyatMin.replace(/\D/g,'')).toLocaleString('tr-TR') : '—'
      const max = data.fiyatMax ? '₺' + Number(data.fiyatMax.replace(/\D/g,'')).toLocaleString('tr-TR') : '—'
      satırlar.push({ label: 'Bütçe', val: min + ' – ' + max })
    }
    if (data.kategori === 'emlak') {
      if (data.emlakTip) satırlar.push({ label: 'Tür', val: data.emlakTip })
      if (data.m2Min || data.m2Max) satırlar.push({ label: 'Metrekare', val: (data.m2Min||'?') + ' – ' + (data.m2Max||'?') + ' m²' })
      if (data.oda.length) satırlar.push({ label: 'Oda', val: data.oda.join(', ') })
      if (data.tercihler.length) satırlar.push({ label: 'Özellikler', val: data.tercihler.join(', ') })
    }
    if (data.kategori === 'vasita') {
      if (data.markalar.length) satırlar.push({ label: 'Marka', val: data.markalar.join(', ') })
      if (data.yilMin || data.yilMax) satırlar.push({ label: 'Yıl', val: (data.yilMin||'?') + ' – ' + (data.yilMax||'?') })
      if (data.kmMax) satırlar.push({ label: 'Max KM', val: Number(data.kmMax).toLocaleString('tr-TR') + ' km' })
      if (data.yakit.length) satırlar.push({ label: 'Yakıt', val: data.yakit.join(', ') })
      if (data.vites.length) satırlar.push({ label: 'Vites', val: data.vites.join(', ') })
    }
    if (data.aciklama) satırlar.push({ label: 'Açıklama', val: data.aciklama })
    return satırlar
  }

  const stepBaslik = done ? 'İlanınız yayında!' : STEPS[step-1]?.title

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.box}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{stepBaslik}</h2>
            {!done && <p className={styles.sub}>Adım {step} / {TOPLAM}</p>}
          </div>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        {!done && (
          <div className={styles.progress}>
            {STEPS.map(s => (
              <div key={s.id} className={`${styles.prog} ${step > s.id ? styles.progDone : ''} ${step === s.id ? styles.progActive : ''}`} />
            ))}
          </div>
        )}

        {done ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>🎉</div>
            <h3>İlanınız yayında!</h3>
            <p>Talebiniz satıcılara ulaştı. Uygun biri size mesaj gönderecek.</p>
            <div className={styles.successInfo}>
              <p>🔒 Telefon numaranız sadece siz onay verince açılır</p>
              <p>👤 Yalnızca adınız ve soyad baş harfiniz görünür</p>
              <p>📩 İlanınıza satıcılar baktığında bildirim alacaksınız</p>
            </div>
            <button className="btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={() => { reset(); onClose(); }}>
              Tamam, harika!
            </button>
          </div>
        ) : (
          <>
            {/* STEP 1: KATEGORİ */}
            {step === 1 && (
              <div>
                <div className={styles.optGrid}>
                  {kategoriler.map(k => (
                    <button key={k.slug}
                      className={`${styles.optBtn} ${data.kategori === k.slug ? styles.optSel : ''}`}
                      onClick={() => set('kategori', k.slug)}>
                      <span className={styles.optIcon}>{k.icon}</span>
                      <span className={styles.optLabel}>{k.label}</span>
                      <span className={styles.optSub}>{k.sub}</span>
                    </button>
                  ))}
                </div>
                <div className={styles.footer}>
                  <button className="btn-primary" style={{flex:1,justifyContent:'center'}}
                    disabled={!data.kategori} onClick={() => setStep(2)}>
                    Devam et →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: KONUM */}
            {step === 2 && (
              <div>
                <div className={styles.fieldGroup}>
                  <label className="form-label">İşlem türü</label>
                  <div className={styles.optGrid2}>
                    {[{v:'satin-al',icon:'🔑',l:'Satın almak'},{v:'kirala',icon:'📋',l:'Kiralamak'}].map(o => (
                      <button key={o.v} className={`${styles.optBtn} ${data.islemTuru === o.v ? styles.optSel : ''}`}
                        onClick={() => set('islemTuru', o.v)}>
                        <span className={styles.optIcon}>{o.icon}</span>
                        <span className={styles.optLabel}>{o.l}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <label className="form-label">Şehir</label>
                  <select className="form-select" value={data.sehir}
                    onChange={e => { set('sehir', e.target.value); set('ilce', '') }}>
                    <option value="">Şehir seçin</option>
                    {sehirler.map(s => <option key={s.il} value={s.il}>{s.il}</option>)}
                  </select>
                </div>
                {data.sehir && (
                  <div className={styles.fieldGroup}>
                    <label className="form-label">İlçe (isteğe bağlı)</label>
                    <select className="form-select" value={data.ilce} onChange={e => set('ilce', e.target.value)}>
                      <option value="">Tüm ilçeler</option>
                      {getIlceler(data.sehir).map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                )}
                <div className={styles.footer}>
                  <button className="btn-ghost" onClick={() => setStep(1)}>← Geri</button>
                  <button className="btn-primary" style={{flex:1,justifyContent:'center'}}
                    disabled={!data.sehir} onClick={() => setStep(3)}>Devam et →</button>
                </div>
              </div>
            )}

            {/* STEP 3: FİYAT & ÖZELLİKLER */}
            {step === 3 && (
              <div>
                <div className={styles.fieldGroup}>
                  <label className="form-label">Bütçe aralığı (₺)</label>
                  <div className={styles.rangeRow}>
                    <input className="form-input" placeholder="En az" value={data.fiyatMin} onChange={e => set('fiyatMin', e.target.value)} />
                    <span className={styles.rangeSep}>—</span>
                    <input className="form-input" placeholder="En fazla" value={data.fiyatMax} onChange={e => set('fiyatMax', e.target.value)} />
                  </div>
                </div>
                {data.kategori === 'emlak' && <>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Emlak tipi</label>
                    <div className={styles.chipGroup}>
                      {emlakTipler.map(t => (
                        <button key={t} className={`${styles.chip} ${data.emlakTip === t ? styles.chipSel : ''}`}
                          onClick={() => set('emlakTip', t)}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Metrekare aralığı</label>
                    <div className={styles.rangeRow}>
                      <input className="form-input" placeholder="En az m²" value={data.m2Min} onChange={e => set('m2Min', e.target.value)} />
                      <span className={styles.rangeSep}>—</span>
                      <input className="form-input" placeholder="En fazla m²" value={data.m2Max} onChange={e => set('m2Max', e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Oda sayısı</label>
                    <div className={styles.chipGroup}>
                      {odaSayilari.map(o => (
                        <button key={o} className={`${styles.chip} ${data.oda.includes(o) ? styles.chipSel : ''}`}
                          onClick={() => toggle('oda', o)}>{o}</button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Özellikler</label>
                    <div className={styles.chipGroup}>
                      {emlakTercihler.map(t => (
                        <button key={t} className={`${styles.chip} ${data.tercihler.includes(t) ? styles.chipSel : ''}`}
                          onClick={() => toggle('tercihler', t)}>{t}</button>
                      ))}
                    </div>
                  </div>
                </>}
                {data.kategori === 'vasita' && <>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Marka tercihleri</label>
                    <div className={styles.chipGroup}>
                      {vasitaMarkalar.map(m => (
                        <button key={m} className={`${styles.chip} ${data.markalar.includes(m) ? styles.chipSel : ''}`}
                          onClick={() => toggle('markalar', m)}>{m}</button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Model yılı</label>
                    <div className={styles.rangeRow}>
                      <input className="form-input" placeholder="En eski (2018)" value={data.yilMin} onChange={e => set('yilMin', e.target.value)} />
                      <span className={styles.rangeSep}>—</span>
                      <input className="form-input" placeholder="En yeni (2024)" value={data.yilMax} onChange={e => set('yilMax', e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">KM aralığı</label>
                    <div className={styles.rangeRow}>
                      <input className="form-input" placeholder="En az km" value={data.kmMin} onChange={e => set('kmMin', e.target.value)} />
                      <span className={styles.rangeSep}>—</span>
                      <input className="form-input" placeholder="En fazla km" value={data.kmMax} onChange={e => set('kmMax', e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Yakıt tipi</label>
                    <div className={styles.chipGroup}>
                      {yakitTipleri.map(y => (
                        <button key={y} className={`${styles.chip} ${data.yakit.includes(y) ? styles.chipSel : ''}`}
                          onClick={() => toggle('yakit', y)}>{y}</button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Vites tipi</label>
                    <div className={styles.chipGroup}>
                      {vitesTipleri.map(v => (
                        <button key={v} className={`${styles.chip} ${data.vites.includes(v) ? styles.chipSel : ''}`}
                          onClick={() => toggle('vites', v)}>{v}</button>
                      ))}
                    </div>
                  </div>
                </>}
                <div className={styles.footer}>
                  <button className="btn-ghost" onClick={() => setStep(2)}>← Geri</button>
                  <button className="btn-primary" style={{flex:1,justifyContent:'center'}} onClick={() => setStep(4)}>Devam et →</button>
                </div>
              </div>
            )}

            {/* STEP 4: AÇIKLAMA */}
            {step === 4 && (
              <div>
                <div className={styles.fieldGroup}>
                  <label className="form-label">Açıklama (isteğe bağlı)</label>
                  <textarea className="form-input" rows="5"
                    placeholder="Örn: Ocak ayına kadar taşınmam gerekiyor. Hafta sonu görüşmeye uygunum."
                    style={{resize:'vertical',lineHeight:1.6}}
                    value={data.aciklama} onChange={e => set('aciklama', e.target.value)} />
                  <p className={styles.hint}>Ne kadar detay verirseniz o kadar doğru eşleşirsiniz.</p>
                </div>
                <div className={styles.footer}>
                  <button className="btn-ghost" onClick={() => setStep(3)}>← Geri</button>
                  <button className="btn-primary" style={{flex:1,justifyContent:'center'}} onClick={() => setStep(5)}>Devam et →</button>
                </div>
              </div>
            )}

            {/* STEP 5 MİSAFİR: İLETİŞİM */}
            {step === 5 && !girisYapilmis && (
              <div>
                <div className={styles.privacyBox}>
                  <div className={styles.privacyIcon}>🔒</div>
                  <div>
                    <strong>Bilgileriniz korunuyor</strong>
                    <p>Telefon numaranız satıcılara gizlidir. Yalnızca adınız ve soyad baş harfiniz görünür.</p>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Adınız</label>
                    <input className="form-input" type="text" placeholder="Mehmet"
                      value={data.ad} onChange={e => set('ad', e.target.value)} />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Soyadınız</label>
                    <input className="form-input" type="text" placeholder="Yılmaz"
                      value={data.soyad} onChange={e => set('soyad', e.target.value)} />
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <label className="form-label">Telefon numaranız</label>
                  <input className="form-input" type="tel" placeholder="0532 000 00 00"
                    value={data.telefon} onChange={e => set('telefon', e.target.value)} />
                  <p className={styles.hint}>Satıcılar bu numarayı göremez — sadece siz onay verince açılır.</p>
                </div>
                <p className={styles.hint} style={{marginTop:8}}>
                  <a href="/giris" style={{color:'var(--teal)',fontWeight:500}}>Giriş yapın</a> veya <a href="/kayit" style={{color:'var(--teal)',fontWeight:500}}>kayıt olun</a> — bilgilerinizi tekrar girmekten kurtulun.
                </p>
                <div className={styles.footer}>
                  <button className="btn-ghost" onClick={() => setStep(4)}>← Geri</button>
                  <button className="btn-primary" style={{flex:1,justifyContent:'center'}}
                    disabled={!data.ad || !data.telefon} onClick={() => setStep(6)}>Devam et →</button>
                </div>
              </div>
            )}

            {/* ONAY ADIMI — giriş yapmışsa step 5, misafirse step 6 */}
            {((girisYapilmis && step === 5) || (!girisYapilmis && step === 6)) && (
              <div>
                {/* Kullanıcı bilgisi */}
                {girisYapilmis && (
                  <div className={styles.kullaniciBilgi}>
                    <div className={styles.kullaniciAvatar}>
                      {(user.ad?.[0]||'') + (user.soyad?.[0]||'')}
                    </div>
                    <div>
                      <div className={styles.kullaniciAd}>{user.ad} {user.soyad}</div>
                      <div className={styles.kullaniciAlt}>
                        <span>📧 {user.email}</span>
                        {user.telefon && <span>📞 {user.telefon}</span>}
                      </div>
                    </div>
                    <div className={styles.gizliTag}>🔒 İletişim bilgileri gizli</div>
                  </div>
                )}

                {/* İlan özeti */}
                <div className={styles.ozetBaslik}>İlan özeti</div>
                <div className={styles.ozetKart}>
                  {ozetSatirlar().map((s, i) => (
                    <div key={i} className={styles.ozetSatir}>
                      <span className={styles.ozetLabel}>{s.label}</span>
                      <span className={styles.ozetVal}>{s.val}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.ozetNot}>
                  ✓ İlanınız yayınlandıktan sonra satıcılar görebilir<br/>
                  ✓ Telefon numaranız sadece siz onay verince açılır<br/>
                  ✓ İstediğiniz zaman ilanınızı silebilir veya pasife alabilirsiniz
                </div>

                <div className={styles.footer}>
                  <button className="btn-ghost" onClick={() => setStep(girisYapilmis ? 4 : 5)}>← Geri Dön</button>
                  <button className="btn-primary" style={{flex:1,justifyContent:'center'}} onClick={handleSubmit}>
                    ✓ İlanı Yayınla
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
