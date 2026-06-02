import { useState, useRef, useEffect } from 'react'
import { sehirler, getIlceler } from '../data/sehirler'
import styles from './IlanForm.module.css'

const STEPS_GIRIS  = ['Kategori','Konum','Fiyat & Özellikler','Açıklama','Onay']
const STEPS_MISAFIR= ['Kategori','Konum','Fiyat & Özellikler','Açıklama','İletişim','Onay']

const kategoriler = [
  {slug:'emlak',    icon:'🏠', label:'Emlak',      sub:'Daire, villa, arsa…'},
  {slug:'vasita',   icon:'🚗', label:'Vasıta',     sub:'Otomobil, SUV, motosiklet…'},
  {slug:'ikinci-el',icon:'📦', label:'İkinci El',  sub:'Genel eşya, ürün…'},
  {slug:'mobilya',  icon:'🛋️', label:'Mobilya',    sub:'Koltuk, masa, yatak…'},
  {slug:'elektronik',icon:'📱',label:'Elektronik', sub:'Telefon, bilgisayar…'},
  {slug:'is-makinasi',icon:'🔧',label:'İş Makinası',sub:'Traktör, forklift…'},
]
const emlakTipler   = ['Daire','Villa','Müstakil Ev','Arsa','İşyeri','Depo','Tarla']
const odaSayilari   = ['1+0','1+1','2+1','3+1','4+1','4+1 ve üzeri','Fark etmez']
const emlakOzellikleri=['Asansör','Otopark','Balkon','Bahçe','Güvenlik','Eşyalı','Site içi','Deniz manzarası']
const vasitaMarkalar=['Audi','BMW','Citroen','Fiat','Ford','Honda','Hyundai','Kia','Mercedes','Nissan','Opel','Peugeot','Renault','Seat','Skoda','Toyota','Volkswagen','Volvo','Diğer']
const yakitTipleri  = ['Benzin','Dizel','LPG','Hibrit','Elektrikli','Fark etmez']
const vitesTipleri  = ['Otomatik','Manuel','Yarı Otomatik','Fark etmez']
const katLabels     = {emlak:'Emlak',vasita:'Vasıta','ikinci-el':'İkinci El',mobilya:'Mobilya',elektronik:'Elektronik','is-makinasi':'İş Makinası'}

// Sadece sayı kabul et
function sadeceRakam(val) { return val.replace(/[^0-9]/g,'') }
// Sayıyı formatlı göster: 1500000 → 1.500.000
function formatSayi(val) {
  const n = val.replace(/[^0-9]/g,'')
  return n ? Number(n).toLocaleString('tr-TR') : ''
}
// Formatlı değerden ham sayıya dön
function sadeRakam(val) { return val.replace(/[^0-9]/g,'') }

function validate(step, data, giris) {
  switch(step) {
    case 1: return !!data.kategori
    case 2: return !!data.sehir
    case 3: return true // isteğe bağlı
    case 4: return true
    case 5:
      if (giris) return true
      return !!(data.ad && data.telefon && data.telefon.replace(/\D/g,'').length >= 10)
    default: return true
  }
}

export default function IlanForm({ open, onClose, onSubmit, user }) {
  const giris = !!user
  const STEPS = giris ? STEPS_GIRIS : STEPS_MISAFIR
  const TOPLAM = STEPS.length

  const bodyRef = useRef(null)
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [data, setData] = useState({
    kategori:'', islemTuru:'satin-al', sehir:'', ilce:'',
    fiyatMin:'', fiyatMax:'',
    emlakTip:'', m2Min:'', m2Max:'', oda:[], tercihler:[],
    markalar:[], yilMin:'', yilMax:'', kmMin:'', kmMax:'', yakit:[], vites:[],
    aciklama:'', ad:'', soyad:'', telefon:'',
  })

  const set = (k,v) => setData(d => ({...d,[k]:v}))
  const toggle = (k,v) => setData(d => ({...d,[k]: d[k].includes(v)?d[k].filter(x=>x!==v):[...d[k],v]}))

  // Adım değişince scroll'u en üste al
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [step])

  function ileri() {
    if (!validate(step, data, giris)) return
    if (step < TOPLAM) setStep(s => s+1)
  }

  function geri() { if (step > 1) setStep(s => s-1) }

  function handleSubmit() {
    const final = giris ? {...data, ad:user.ad, soyad:user.soyad, telefon:user.telefon} : data
    onSubmit && onSubmit(final)
    setDone(true)
  }

  function reset() {
    setStep(1); setDone(false)
    setData({kategori:'',islemTuru:'satin-al',sehir:'',ilce:'',fiyatMin:'',fiyatMax:'',
      emlakTip:'',m2Min:'',m2Max:'',oda:[],tercihler:[],
      markalar:[],yilMin:'',yilMax:'',kmMin:'',kmMax:'',yakit:[],vites:[],
      aciklama:'',ad:'',soyad:'',telefon:''})
  }

  function ozetSatirlar() {
    const s=[]
    s.push({l:'Kategori', v:katLabels[data.kategori]||data.kategori})
    s.push({l:'İşlem', v:data.islemTuru==='satin-al'?'Satın almak':'Kiralamak'})
    if (data.sehir) s.push({l:'Konum', v:data.sehir+(data.ilce?' / '+data.ilce:'')})
    if (data.fiyatMin||data.fiyatMax) s.push({l:'Bütçe',
      v:(data.fiyatMin?'₺'+formatSayi(data.fiyatMin):'—')+' – '+(data.fiyatMax?'₺'+formatSayi(data.fiyatMax):'—')})
    if (data.kategori==='emlak') {
      if (data.emlakTip) s.push({l:'Tür',v:data.emlakTip})
      if (data.m2Min||data.m2Max) s.push({l:'m²',v:(data.m2Min||'?')+' – '+(data.m2Max||'?')+' m²'})
      if (data.oda.length) s.push({l:'Oda',v:data.oda.join(', ')})
      if (data.tercihler.length) s.push({l:'Özellikler',v:data.tercihler.join(', ')})
    }
    if (data.kategori==='vasita') {
      if (data.markalar.length) s.push({l:'Marka',v:data.markalar.join(', ')})
      if (data.yilMin||data.yilMax) s.push({l:'Yıl',v:(data.yilMin||'?')+' – '+(data.yilMax||'?')})
      if (data.kmMin||data.kmMax) s.push({l:'KM',v:(data.kmMin?formatSayi(data.kmMin):'')+' – '+(data.kmMax?formatSayi(data.kmMax)+' km':'')})
      if (data.yakit.length) s.push({l:'Yakıt',v:data.yakit.join(', ')})
      if (data.vites.length) s.push({l:'Vites',v:data.vites.join(', ')})
    }
    if (data.aciklama) s.push({l:'Açıklama',v:data.aciklama})
    return s
  }

  if (!open) return null

  const gecerli = validate(step, data, giris)
  const onayAdimi = (giris && step===5) || (!giris && step===6)

  return (
    // OVERLAY — tıklanınca kapanmasın, sadece X ile kapanır
    <div className={styles.overlay}>
      <div className={styles.box}>

        {/* SABİT HEADER */}
        <div className={styles.boxTop}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
            <div>
              <h2 className={styles.title}>
                {done ? 'İlanınız yayında! 🎉' : STEPS[step-1]}
              </h2>
              {!done && <p className={styles.sub}>Adım {step} / {TOPLAM}</p>}
            </div>
            <button className={styles.close} onClick={() => { reset(); onClose() }}>✕</button>
          </div>
          {!done && (
            <div className={styles.progress}>
              {STEPS.map((_,i) => (
                <div key={i} className={`${styles.prog} ${step>i+1?styles.progDone:''} ${step===i+1?styles.progActive:''}`} />
              ))}
            </div>
          )}
        </div>

        {/* SCROLL'LANABİLİR BODY */}
        <div className={styles.boxBody} ref={bodyRef}>

          {done ? (
            <div className={styles.success}>
              <div className={styles.successIcon}>🎉</div>
              <h3>İlanınız yayında!</h3>
              <p>Talebiniz satıcılara ulaştı.</p>
              <div className={styles.successInfo}>
                <p>🔒 Telefon numaranız gizlidir</p>
                <p>👤 Yalnızca adınız ve soyad baş harfiniz görünür</p>
              </div>
              <button className="btn-primary" style={{width:'100%',justifyContent:'center'}}
                onClick={() => { reset(); onClose() }}>
                Tamam ✓
              </button>
            </div>
          ) : (

            <>
              {/* ADIM 1: KATEGORİ */}
              {step===1 && (
                <div>
                  <div className={styles.optGrid}>
                    {kategoriler.map(k => (
                      <button key={k.slug}
                        className={`${styles.optBtn} ${data.kategori===k.slug?styles.optSel:''}`}
                        onClick={() => set('kategori',k.slug)}>
                        <span className={styles.optIcon}>{k.icon}</span>
                        <span className={styles.optLabel}>{k.label}</span>
                        <span className={styles.optSub}>{k.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ADIM 2: KONUM */}
              {step===2 && (
                <div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">İşlem türü</label>
                    <div className={styles.optGrid2}>
                      {[{v:'satin-al',i:'🔑',l:'Satın almak'},{v:'kirala',i:'📋',l:'Kiralamak'}].map(o => (
                        <button key={o.v} className={`${styles.optBtn} ${data.islemTuru===o.v?styles.optSel:''}`}
                          onClick={() => set('islemTuru',o.v)}>
                          <span className={styles.optIcon}>{o.i}</span>
                          <span className={styles.optLabel}>{o.l}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Şehir *</label>
                    <select className="form-select" value={data.sehir}
                      onChange={e => { set('sehir',e.target.value); set('ilce','') }}>
                      <option value="">Şehir seçin</option>
                      {sehirler.map(s => <option key={s.il} value={s.il}>{s.il}</option>)}
                    </select>
                  </div>
                  {data.sehir && (
                    <div className={styles.fieldGroup}>
                      <label className="form-label">İlçe (isteğe bağlı)</label>
                      <select className="form-select" value={data.ilce} onChange={e => set('ilce',e.target.value)}>
                        <option value="">Tüm ilçeler</option>
                        {getIlceler(data.sehir).map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* ADIM 3: FİYAT & ÖZELLİKLER */}
              {step===3 && (
                <div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Bütçe aralığı (₺) — isteğe bağlı</label>
                    <div className={styles.rangeRow}>
                      <div className={styles.rangeInput}>
                        <span className={styles.rangePrefix}>₺</span>
                        <input type="text" inputMode="numeric" placeholder="En az (örn: 500.000)"
                          value={formatSayi(data.fiyatMin)}
                          onChange={e => set('fiyatMin', sadeRakam(e.target.value))} />
                      </div>
                      <span className={styles.rangeSep}>—</span>
                      <div className={styles.rangeInput}>
                        <span className={styles.rangePrefix}>₺</span>
                        <input type="text" inputMode="numeric" placeholder="En fazla (örn: 1.500.000)"
                          value={formatSayi(data.fiyatMax)}
                          onChange={e => set('fiyatMax', sadeRakam(e.target.value))} />
                      </div>
                    </div>
                    {data.fiyatMin && data.fiyatMax && Number(data.fiyatMin) > Number(data.fiyatMax) && (
                      <p style={{color:'var(--red)',fontSize:11,marginTop:4}}>⚠️ Minimum değer maksimumdan büyük olamaz</p>
                    )}
                  </div>

                  {data.kategori==='emlak' && <>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Emlak tipi</label>
                      <div className={styles.chipGroup}>
                        {emlakTipler.map(t => (
                          <button key={t} className={`${styles.chip} ${data.emlakTip===t?styles.chipSel:''}`}
                            onClick={() => set('emlakTip',t)}>{t}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Metrekare aralığı (m²)</label>
                      <div className={styles.rangeRow}>
                        <div className={styles.rangeInput}>
                          <input type="text" inputMode="numeric" placeholder="En az m² (örn: 80)"
                            value={sadeceRakam(data.m2Min)}
                            onChange={e => set('m2Min', sadeceRakam(e.target.value))} />
                          <span className={styles.rangeSuffix}>m²</span>
                        </div>
                        <span className={styles.rangeSep}>—</span>
                        <div className={styles.rangeInput}>
                          <input type="text" inputMode="numeric" placeholder="En fazla m² (örn: 150)"
                            value={sadeceRakam(data.m2Max)}
                            onChange={e => set('m2Max', sadeceRakam(e.target.value))} />
                          <span className={styles.rangeSuffix}>m²</span>
                        </div>
                      </div>
                      {data.m2Min && data.m2Max && Number(data.m2Min) > Number(data.m2Max) && (
                        <p style={{color:'var(--red)',fontSize:11,marginTop:4}}>⚠️ Min değer maksimumdan büyük olamaz</p>
                      )}
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Oda sayısı</label>
                      <div className={styles.chipGroup}>
                        {odaSayilari.map(o => (
                          <button key={o} className={`${styles.chip} ${data.oda.includes(o)?styles.chipSel:''}`}
                            onClick={() => toggle('oda',o)}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Özellikler (birden fazla seçebilirsiniz)</label>
                      <div className={styles.chipGroup}>
                        {emlakOzellikleri.map(t => (
                          <button key={t} className={`${styles.chip} ${data.tercihler.includes(t)?styles.chipSel:''}`}
                            onClick={() => toggle('tercihler',t)}>{t}</button>
                        ))}
                      </div>
                    </div>
                  </>}

                  {data.kategori==='vasita' && <>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Marka tercihleri</label>
                      <div className={styles.chipGroup}>
                        {vasitaMarkalar.map(m => (
                          <button key={m} className={`${styles.chip} ${data.markalar.includes(m)?styles.chipSel:''}`}
                            onClick={() => toggle('markalar',m)}>{m}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Model yılı aralığı</label>
                      <div className={styles.rangeRow}>
                        <div className={styles.rangeInput}>
                          <input type="text" inputMode="numeric" placeholder="En eski (örn: 2018)"
                            maxLength={4}
                            value={sadeceRakam(data.yilMin)}
                            onChange={e => set('yilMin', sadeceRakam(e.target.value))} />
                        </div>
                        <span className={styles.rangeSep}>—</span>
                        <div className={styles.rangeInput}>
                          <input type="text" inputMode="numeric" placeholder="En yeni (örn: 2024)"
                            maxLength={4}
                            value={sadeceRakam(data.yilMax)}
                            onChange={e => set('yilMax', sadeceRakam(e.target.value))} />
                        </div>
                      </div>
                      {data.yilMin && data.yilMax && Number(data.yilMin) > Number(data.yilMax) && (
                        <p style={{color:'var(--red)',fontSize:11,marginTop:4}}>⚠️ Başlangıç yılı bitiş yılından büyük olamaz</p>
                      )}
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">KM aralığı</label>
                      <div className={styles.rangeRow}>
                        <div className={styles.rangeInput}>
                          <input type="text" inputMode="numeric" placeholder="Min km (örn: 0)"
                            value={formatSayi(data.kmMin)}
                            onChange={e => set('kmMin', sadeRakam(e.target.value))} />
                          <span className={styles.rangeSuffix}>km</span>
                        </div>
                        <span className={styles.rangeSep}>—</span>
                        <div className={styles.rangeInput}>
                          <input type="text" inputMode="numeric" placeholder="Max km (örn: 100.000)"
                            value={formatSayi(data.kmMax)}
                            onChange={e => set('kmMax', sadeRakam(e.target.value))} />
                          <span className={styles.rangeSuffix}>km</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Yakıt tipi</label>
                      <div className={styles.chipGroup}>
                        {yakitTipleri.map(y => (
                          <button key={y} className={`${styles.chip} ${data.yakit.includes(y)?styles.chipSel:''}`}
                            onClick={() => toggle('yakit',y)}>{y}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Vites tipi</label>
                      <div className={styles.chipGroup}>
                        {vitesTipleri.map(v => (
                          <button key={v} className={`${styles.chip} ${data.vites.includes(v)?styles.chipSel:''}`}
                            onClick={() => toggle('vites',v)}>{v}</button>
                        ))}
                      </div>
                    </div>
                  </>}

                  {!['emlak','vasita'].includes(data.kategori) && (
                    <p className={styles.hint}>Fiyat aralığı yeterli — diğer kategoriler için ek alan gerekmez.</p>
                  )}
                </div>
              )}

              {/* ADIM 4: AÇIKLAMA */}
              {step===4 && (
                <div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Açıklama (isteğe bağlı)</label>
                    <textarea className="form-input" rows={5}
                      placeholder="Örn: Ocak ayına kadar taşınmam gerekiyor. Balkon ve asansör şart. Hafta sonu görüşmeye uygunum."
                      style={{resize:'vertical',lineHeight:1.6}}
                      value={data.aciklama} onChange={e => set('aciklama',e.target.value)} />
                    <p className={styles.hint}>Detay verdikçe daha doğru eşleşme sağlanır.</p>
                  </div>
                </div>
              )}

              {/* ADIM 5 MİSAFİR: İLETİŞİM */}
              {step===5 && !giris && (
                <div>
                  <div className={styles.privacyBox}>
                    <div className={styles.privacyIcon}>🔒</div>
                    <div>
                      <strong>Bilgileriniz korunuyor</strong>
                      <p>Telefon gizlidir. Yalnızca adınız ve soyad baş harfiniz görünür.</p>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                    <div>
                      <label className="form-label">Adınız *</label>
                      <input className="form-input" type="text" placeholder="Mehmet"
                        value={data.ad} onChange={e => set('ad',e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">Soyadınız</label>
                      <input className="form-input" type="text" placeholder="Yılmaz"
                        value={data.soyad} onChange={e => set('soyad',e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Telefon *</label>
                    <div style={{display:'flex'}}>
                      <span style={{display:'flex',alignItems:'center',padding:'0 10px',background:'var(--bg)',border:'1.5px solid var(--border)',borderRight:'none',borderRadius:'9px 0 0 9px',fontSize:13,color:'var(--text-2)',fontWeight:500}}>+90</span>
                      <input className="form-input" type="tel"
                        style={{borderRadius:'0 9px 9px 0',borderLeft:'none'}}
                        placeholder="532 000 00 00" value={data.telefon}
                        onChange={e => set('telefon',e.target.value.replace(/[^0-9 ]/g,'').replace(/^0/,''))} />
                    </div>
                    <p className={styles.hint}>Başında 0 olmadan girin.</p>
                  </div>
                  <p style={{fontSize:12,color:'var(--text-3)',marginTop:4}}>
                    <a href="/giris" style={{color:'var(--teal)',fontWeight:500}}>Giriş yapın</a> veya <a href="/kayit" style={{color:'var(--teal)',fontWeight:500}}>kayıt olun</a> — bilgileriniz otomatik gelir.
                  </p>
                </div>
              )}

              {/* ONAY ADIMI */}
              {onayAdimi && (
                <div>
                  {giris && (
                    <div className={styles.kullaniciBilgi}>
                      <div className={styles.kullaniciAvatar}>
                        {(user.ad?.[0]||'')+(user.soyad?.[0]||'')}
                      </div>
                      <div>
                        <div className={styles.kullaniciAd}>{user.ad} {user.soyad}</div>
                        <div className={styles.kullaniciAlt}>
                          <span>📧 {user.email}</span>
                          {user.telefon && <span>📞 +90 {user.telefon}</span>}
                        </div>
                      </div>
                      <div className={styles.gizliTag}>🔒 İletişim gizli</div>
                    </div>
                  )}
                  <div className={styles.ozetBaslik}>İlan özeti</div>
                  <div className={styles.ozetKart}>
                    {ozetSatirlar().map((s,i) => (
                      <div key={i} className={styles.ozetSatir}>
                        <span className={styles.ozetLabel}>{s.l}</span>
                        <span className={styles.ozetVal}>{s.v}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.ozetNot}>
                    ✓ İstediğiniz zaman silebilir veya pasife alabilirsiniz
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* SABİT FOOTER — butonlar HER ZAMAN görünür */}
        {!done && (
          <div className={styles.boxFooter}>
            {step > 1 ? (
              <button className="btn-ghost" onClick={geri}>← Geri</button>
            ) : (
              <div />
            )}
            {onayAdimi ? (
              <button className="btn-primary" style={{flex:1,justifyContent:'center'}} onClick={handleSubmit}>
                ✓ İlanı Yayınla
              </button>
            ) : (
              <button
                className="btn-primary"
                style={{flex:1,justifyContent:'center', opacity: gecerli?1:0.45, cursor: gecerli?'pointer':'not-allowed'}}
                onClick={gecerli ? ileri : undefined}
                disabled={!gecerli}
              >
                Devam et →
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
